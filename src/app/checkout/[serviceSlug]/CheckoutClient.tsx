'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  CreditCard, 
  Lock,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';

interface CheckoutClientProps {
  service: any;
}

export default function CheckoutClient({ service }: CheckoutClientProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [requirements, setRequirements] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment modal state
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const deliverables = JSON.parse(service.deliverables_json || '[]');

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMsg('Please provide your name and contact email.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('Please confirm agreement to the scope and terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: service.slug,
          customerName,
          customerEmail,
          requirements
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize order');
      }

      setActiveOrder(data);

      // If it's a custom quote request, redirect immediately
      if (service.pricing_model === 'custom_quote') {
        router.push(`/orders/${data.orderNumber}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePayment = async (outcome: 'success' | 'failure') => {
    if (!activeOrder) return;
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: activeOrder.orderNumber,
          simulateOutcome: outcome,
          paymentReference: `mock_ref_${Date.now()}`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment simulation failed');
      }

      router.push(`/orders/${activeOrder.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment simulation failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {/* Left: Checkout Form */}
        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
              {service.pricing_model === 'custom_quote' ? 'Submit Project Requirements' : 'Customer & Order Information'}
            </h2>

            {errorMsg && (
              <div className="notice notice-warning">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label className="form-label">Full Name or Company *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Maya Chen"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
                <div className="form-help">Order confirmations, invoices, and deliverables will be sent here.</div>
              </div>

              <div className="form-group">
                <label className="form-label">Project Goals &amp; Specific Requirements</label>
                <textarea
                  className="input-textarea"
                  rows={4}
                  placeholder={service.required_info_prompt || 'Briefly describe your objectives, existing stack, and key timelines...'}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="terms-check"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                />
                <label htmlFor="terms-check" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  I have reviewed the deliverables, estimated timeline ({service.estimated_days} days), and terms. I understand that work begins upon requirement confirmation.
                </label>
              </div>

              {!activeOrder && (
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Processing Order...'
                  ) : service.pricing_model === 'custom_quote' ? (
                    'Submit Request for Quotation'
                  ) : (
                    <span>Proceed to Payment ({formatCurrency(service.price_cents, service.currency)})</span>
                  )}
                </button>
              )}
            </form>

            {/* Payment Modal / Sandbox Gateway Container */}
            {activeOrder && service.pricing_model !== 'custom_quote' && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <div className="notice notice-info" style={{ marginBottom: '1.25rem' }}>
                  <Lock size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Secure Checkout Session:</strong> Order <code>{activeOrder.orderNumber}</code> generated.
                  </div>
                </div>

                <div className="card" style={{ background: 'var(--bg-surface-elevated)', border: '1px dashed var(--accent-cyan)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="badge badge-warning">GATEWAY TEST SANDBOX ACTIVE</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zero Real Charges</span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    The platform payment abstraction is in <strong>Mock Sandbox Mode</strong>. You can simulate an end-to-end verified transaction without configuring external merchant API keys:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSimulatePayment('success')}
                      disabled={isVerifying}
                    >
                      {isVerifying ? 'Verifying Transaction...' : 'Simulate Successful Payment (Instant Confirm)'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSimulatePayment('failure')}
                      disabled={isVerifying}
                    >
                      Simulate Declined Card (Test Failure Handler)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div>
          <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '2rem', position: 'sticky', top: '100px' }}>
            <span className="badge badge-brand" style={{ marginBottom: '1rem' }}>Order Summary</span>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{service.name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {service.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '1rem 0', margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pricing Model:</span>
                <strong style={{ textTransform: 'capitalize' }}>{service.pricing_model.replace('_', ' ')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Turnaround:</span>
                <strong>{service.estimated_days} business days</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {service.pricing_model === 'custom_quote'
                    ? 'Pending Quote'
                    : formatCurrency(service.price_cents, service.currency)}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Included Deliverables:</strong>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {deliverables.slice(0, 4).map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
