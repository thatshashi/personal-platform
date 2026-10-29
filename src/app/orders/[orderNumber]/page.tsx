import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export const revalidate = 0;

interface OrderStatusPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderStatusPage({ params }: OrderStatusPageProps) {
  const { orderNumber } = await params;
  const db = getDb();

  const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;
  if (!order) {
    notFound();
  }

  const isCompleted = order.payment_status === 'completed';
  const isPending = order.payment_status === 'pending';
  const isFailed = order.payment_status === 'failed';

  return (
    <div className="section-padding">
      <div className="container-prose">
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2.5rem' }}>
          {isCompleted && (
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', marginBottom: '1rem' }}>
              <CheckCircle2 size={40} />
            </div>
          )}
          {isPending && (
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', marginBottom: '1rem' }}>
              <Clock size={40} />
            </div>
          )}
          {isFailed && (
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', marginBottom: '1rem' }}>
              <AlertTriangle size={40} />
            </div>
          )}

          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>
            {isCompleted
              ? 'Order & Payment Confirmed'
              : isPending
              ? 'Order Request Received'
              : 'Payment Attempt Incomplete'}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            {isCompleted
              ? 'Your payment was verified. Requirements have been logged into our operational tracking pipeline.'
              : isPending
              ? 'Your order and scope requirements were successfully submitted. We will review and follow up shortly.'
              : 'The payment transaction could not be verified. You may retry checkout or contact us directly.'}
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
            <strong style={{ color: 'var(--accent-cyan)' }}>{order.order_number}</strong>
          </div>
        </div>

        {/* Order Details Breakdown Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            Transaction Receipt
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Service Ordered:</span>
              <strong>{order.service_name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Customer Name:</span>
              <span>{order.customer_name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Notification Email:</span>
              <span>{order.customer_email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
              <span className={`badge ${isCompleted ? 'badge-success' : isPending ? 'badge-warning' : 'badge-danger'}`} style={{ textTransform: 'uppercase' }}>
                {order.payment_status}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Reference:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {order.payment_reference || 'N/A'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fulfillment Status:</span>
              <span className="badge" style={{ textTransform: 'capitalize' }}>
                {order.fulfillment_status.replace('_', ' ')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '0.5rem', fontSize: '1.15rem' }}>
              <span>Total Amount:</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>
                {order.pricing_model === 'custom_quote'
                  ? 'Quotation Pending'
                  : formatCurrency(order.amount_cents, order.currency)}
              </strong>
            </div>
          </div>

          {order.requirements_submitted && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Submitted Project Requirements:
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                {order.requirements_submitted}
              </p>
            </div>
          )}
        </div>

        {/* What Happens Next Guidance */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '1.75rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>Next Steps &amp; Delivery Process</span>
          </h3>
          <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.925rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>An automated notification was dispatched to our operational queue.</li>
            <li>We review requirements to confirm technical specifications and timelines.</li>
            <li>You will receive a kick-off message at <code>{order.customer_email}</code> with milestone checkpoint links.</li>
          </ol>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link href="/" className="btn btn-secondary">
            <span>Return to Homepage</span>
          </Link>
          <Link href="/contact" className="btn btn-outline">
            <Mail size={16} />
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
