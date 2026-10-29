import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, XCircle, Clock, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export const revalidate = 0;

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const db = getDb();

  const service = db.prepare('SELECT * FROM services WHERE slug = ? AND active = 1').get(slug) as any;
  if (!service) {
    notFound();
  }

  const deliverables = JSON.parse(service.deliverables_json || '[]');
  const exclusions = JSON.parse(service.exclusions_json || '[]');

  return (
    <div className="section-padding">
      <div className="container-prose">
        <Link href="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} />
          <span>Back to service catalogue</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-brand">{service.category}</span>
          <span className="badge">{service.pricing_model.replace('_', ' ').toUpperCase()}</span>
        </div>

        <h1 style={{ marginBottom: '1.25rem' }}>{service.name}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          {service.description}
        </p>

        {/* Pricing & Timeline Header Card */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '2rem', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Investment
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {service.pricing_model === 'custom_quote'
                ? 'Custom Scope'
                : formatCurrency(service.price_cents, service.currency)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
            <Clock size={20} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Turnaround</div>
              <strong style={{ color: 'var(--text-primary)' }}>{service.estimated_days} business days</strong>
            </div>
          </div>

          <Link href={`/checkout/${service.slug}`} className="btn btn-primary btn-lg">
            <span>{service.pricing_model === 'custom_quote' ? 'Request Scope Proposal' : 'Proceed to Checkout'}</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Deliverables Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-emerald)' }}>
            What is Included
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {deliverables.map((item: string, i: number) => (
              <li key={i} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--bg-surface)' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.975rem', color: 'var(--text-primary)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions Section */}
        {exclusions.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-rose)' }}>
              What is NOT Included (Explicit Exclusions)
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {exclusions.map((item: string, i: number) => (
                <li key={i} className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(244, 63, 94, 0.03)' }}>
                  <XCircle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements Prompt */}
        {service.required_info_prompt && (
          <div className="card" style={{ background: 'var(--bg-surface-elevated)', marginBottom: '3rem', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Information Required to Start</span>
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {service.required_info_prompt}
            </p>
          </div>
        )}

        {/* Terms & Refund Policy */}
        <div className="notice notice-info" style={{ marginBottom: '3rem' }}>
          <ShieldCheck size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Terms &amp; Cancellation Policy:</strong> {service.terms_notes || 'All project scopes include defined milestone review gates. In the event of scope adjustment, revisions will be quoted transparently prior to work.'}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '2.5rem' }}>
          <Link href={`/checkout/${service.slug}`} className="btn btn-primary btn-lg" style={{ minWidth: '240px' }}>
            <span>{service.pricing_model === 'custom_quote' ? 'Request Scope Proposal' : 'Book / Purchase Now'}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
