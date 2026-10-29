import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { logAuditEvent } from '@/lib/auth';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  pricingModel: string;
  requirementsSubmitted: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentProvider: string;
  paymentReference?: string;
  fulfillmentStatus: 'pending' | 'in_progress' | 'delivered';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentResult {
  success: boolean;
  provider: 'mock_sandbox' | 'razorpay' | 'stripe';
  orderNumber: string;
  amountCents: number;
  currency: string;
  paymentSessionId?: string;
  checkoutUrl?: string;
  clientPayload?: Record<string, unknown>;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderNumber: string;
  paymentReference: string;
  status: 'completed' | 'failed';
  error?: string;
}

export interface PaymentProvider {
  id: 'mock_sandbox' | 'razorpay' | 'stripe';
  name: string;
  isMock: boolean;
  createPaymentOrder(order: OrderRecord): Promise<CreatePaymentResult>;
  verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult>;
}

/**
 * Mock Sandbox Provider
 * Fully functional offline test environment with explicit simulation flags.
 * Allows complete end-to-end purchasing test workflows without external payment accounts.
 */
export class MockSandboxPaymentProvider implements PaymentProvider {
  id = 'mock_sandbox' as const;
  name = 'Mock Sandbox Gateway (Test Mode)';
  isMock = true;

  async createPaymentOrder(order: OrderRecord): Promise<CreatePaymentResult> {
    const sandboxSessionId = `mock_sess_${crypto.randomUUID().slice(0, 12)}`;
    
    // Store mock session in DB orders table
    const db = getDb();
    db.prepare(`
      UPDATE orders 
      SET payment_reference = ?, updated_at = ?
      WHERE order_number = ?
    `).run(sandboxSessionId, new Date().toISOString(), order.orderNumber);

    logAuditEvent('payment_order_created', 'mock_sandbox', {
      orderNumber: order.orderNumber,
      amountCents: order.amountCents,
      currency: order.currency
    });

    return {
      success: true,
      provider: 'mock_sandbox',
      orderNumber: order.orderNumber,
      amountCents: order.amountCents,
      currency: order.currency,
      paymentSessionId: sandboxSessionId,
      clientPayload: {
        isTestMode: true,
        sandboxSessionId,
        testCard: '4111 1111 1111 1111 (Simulation Only)',
        notice: 'Mock Sandbox Active: No real currency will be charged.'
      }
    };
  }

  async verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const orderNumber = String(payload.orderNumber || '');
    const simulateOutcome = String(payload.simulateOutcome || 'success'); // 'success' | 'failure'
    const paymentReference = String(payload.paymentReference || `mock_ref_${Date.now()}`);

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;

    if (!order) {
      return {
        success: false,
        orderNumber,
        paymentReference,
        status: 'failed',
        error: 'Order not found'
      };
    }

    const now = new Date().toISOString();
    if (simulateOutcome === 'failure') {
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'failed', payment_reference = ?, updated_at = ?
        WHERE order_number = ?
      `).run(paymentReference, now, orderNumber);

      logAuditEvent('payment_failed', 'mock_sandbox', { orderNumber, reason: 'Simulated customer failure' });

      return {
        success: false,
        orderNumber,
        paymentReference,
        status: 'failed',
        error: 'Simulated payment rejection'
      };
    }

    db.prepare(`
      UPDATE orders 
      SET payment_status = 'completed', payment_reference = ?, updated_at = ?
      WHERE order_number = ?
    `).run(paymentReference, now, orderNumber);

    logAuditEvent('payment_completed', 'mock_sandbox', {
      orderNumber,
      amountCents: order.amount_cents,
      currency: order.currency,
      provider: 'mock_sandbox'
    });

    return {
      success: true,
      orderNumber,
      paymentReference,
      status: 'completed'
    };
  }
}

/**
 * Razorpay Payment Provider (Prepared for India and Global UPI/Card payments)
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  id = 'razorpay' as const;
  name = 'Razorpay Payments';
  isMock = false;

  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  async createPaymentOrder(order: OrderRecord): Promise<CreatePaymentResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: 'razorpay',
        orderNumber: order.orderNumber,
        amountCents: order.amountCents,
        currency: order.currency,
        error: 'Razorpay API credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) not configured in environment.'
      };
    }

    try {
      // Calls Razorpay Orders API
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: order.amountCents, // Razorpay expects subunits (paise)
          currency: order.currency || 'INR',
          receipt: order.orderNumber,
          notes: {
            serviceName: order.serviceName,
            customerEmail: order.customerEmail
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          success: false,
          provider: 'razorpay',
          orderNumber: order.orderNumber,
          amountCents: order.amountCents,
          currency: order.currency,
          error: `Razorpay API error: ${errText}`
        };
      }

      const rzOrder = (await response.json()) as any;
      
      const db = getDb();
      db.prepare('UPDATE orders SET payment_reference = ?, updated_at = ? WHERE order_number = ?')
        .run(rzOrder.id, new Date().toISOString(), order.orderNumber);

      return {
        success: true,
        provider: 'razorpay',
        orderNumber: order.orderNumber,
        amountCents: order.amountCents,
        currency: order.currency,
        paymentSessionId: rzOrder.id,
        clientPayload: {
          key: this.keyId,
          razorpayOrderId: rzOrder.id,
          amount: order.amountCents,
          currency: order.currency,
          name: 'Platform Service',
          description: order.serviceName
        }
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'razorpay',
        orderNumber: order.orderNumber,
        amountCents: order.amountCents,
        currency: order.currency,
        error: err.message || 'Network exception communicating with Razorpay'
      };
    }
  }

  async verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const razorpayOrderId = String(payload.razorpayOrderId || '');
    const razorpayPaymentId = String(payload.razorpayPaymentId || '');
    const razorpaySignature = String(payload.razorpaySignature || '');
    const orderNumber = String(payload.orderNumber || '');

    if (!this.isConfigured()) {
      return {
        success: false,
        orderNumber,
        paymentReference: razorpayPaymentId,
        status: 'failed',
        error: 'Razorpay secret key not configured.'
      };
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        logAuditEvent('razorpay_signature_mismatch', 'security', { orderNumber, razorpayOrderId });
        return {
          success: false,
          orderNumber,
          paymentReference: razorpayPaymentId,
          status: 'failed',
          error: 'Invalid Razorpay cryptographic signature'
        };
      }

      const db = getDb();
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'completed', payment_reference = ?, updated_at = ?
        WHERE order_number = ?
      `).run(razorpayPaymentId, new Date().toISOString(), orderNumber);

      logAuditEvent('payment_completed', 'razorpay', { orderNumber, razorpayPaymentId });

      return {
        success: true,
        orderNumber,
        paymentReference: razorpayPaymentId,
        status: 'completed'
      };
    } catch (err: any) {
      return {
        success: false,
        orderNumber,
        paymentReference: razorpayPaymentId,
        status: 'failed',
        error: err.message || 'Signature verification failure'
      };
    }
  }
}

/**
 * Stripe Payment Provider
 */
export class StripePaymentProvider implements PaymentProvider {
  id = 'stripe' as const;
  name = 'Stripe Payments';
  isMock = false;

  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
  }

  async createPaymentOrder(order: OrderRecord): Promise<CreatePaymentResult> {
    if (!this.secretKey) {
      return {
        success: false,
        provider: 'stripe',
        orderNumber: order.orderNumber,
        amountCents: order.amountCents,
        currency: order.currency,
        error: 'STRIPE_SECRET_KEY is not configured in environment.'
      };
    }

    // Standard Stripe Checkout Session creation can be invoked here
    return {
      success: false,
      provider: 'stripe',
      orderNumber: order.orderNumber,
      amountCents: order.amountCents,
      currency: order.currency,
      error: 'Stripe webhook listener requires external public URL. Use Mock Sandbox for local development.'
    };
  }

  async verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    return {
      success: false,
      orderNumber: String(payload.orderNumber || ''),
      paymentReference: '',
      status: 'failed',
      error: 'Stripe webhook verification pending webhook configuration.'
    };
  }
}

/**
 * Get active payment provider based on application settings or environment
 */
export function getPaymentProvider(): PaymentProvider {
  try {
    const db = getDb();
    const setting = db.prepare("SELECT value FROM settings WHERE key = 'payment_mode'").get() as { value: string } | undefined;
    const mode = setting?.value || process.env.PAYMENT_PROVIDER || 'mock_sandbox';

    if (mode === 'razorpay') {
      return new RazorpayPaymentProvider();
    }
    if (mode === 'stripe') {
      return new StripePaymentProvider();
    }
  } catch (err) {
    console.error('Error reading payment mode setting:', err);
  }

  return new MockSandboxPaymentProvider();
}
