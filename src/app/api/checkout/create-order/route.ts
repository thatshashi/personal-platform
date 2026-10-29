import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceSlug, customerName, customerEmail, requirements } = body;

    if (!serviceSlug || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required checkout information (name, email, or service).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const db = getDb();
    const service = db.prepare('SELECT * FROM services WHERE slug = ? AND active = 1').get(serviceSlug) as any;

    if (!service) {
      return NextResponse.json({ error: 'Service not found or currently unavailable.' }, { status: 404 });
    }

    const orderId = 'ord_' + crypto.randomUUID().slice(0, 10);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const provider = getPaymentProvider();

    // Insert pending order into database
    db.prepare(`
      INSERT INTO orders (
        id, order_number, service_id, service_name, customer_name, customer_email,
        amount_cents, currency, pricing_model, requirements_submitted, payment_status,
        payment_provider, fulfillment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'pending', ?, ?)
    `).run(
      orderId,
      orderNumber,
      service.id,
      service.name,
      customerName.trim(),
      customerEmail.trim().toLowerCase(),
      service.price_cents,
      service.currency,
      service.pricing_model,
      requirements ? requirements.trim() : '',
      provider.id,
      now,
      now
    );

    // Call payment provider to initiate session
    const paymentResult = await provider.createPaymentOrder({
      id: orderId,
      orderNumber,
      serviceId: service.id,
      serviceName: service.name,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      amountCents: service.price_cents,
      currency: service.currency,
      pricingModel: service.pricing_model,
      requirementsSubmitted: requirements || '',
      paymentStatus: 'pending',
      paymentProvider: provider.id,
      fulfillmentStatus: 'pending',
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      amountCents: service.price_cents,
      currency: service.currency,
      pricingModel: service.pricing_model,
      serviceName: service.name,
      paymentResult
    });
  } catch (err: any) {
    console.error('Error in create-order route:', err);
    return NextResponse.json({ error: err.message || 'Server error processing checkout' }, { status: 500 });
  }
}
