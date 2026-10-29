import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, ShieldCheck, ArrowRight, ArrowUpRight } from 'lucide-react';

export const revalidate = 0;

export default function ServicesPage() {
  const db = getDb();
  const services = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY order_index ASC').all() as any[];

  return (
    <div className="section-padding">
      <div className="container">
        <div className="section-header" style={{ maxWidth: '800px' }}>
          <span className="section-eyebrow">Service Catalogue &amp; Engagements</span>
          <h1 className="section-title">Transparent offerings, clear scopes, and fixed pricing.</h1>
          <p className="section-subtitle">
            Every service specifies exact deliverables, exclusions, turnaround timelines, and refund terms before you purchase or submit an inquiry.
          </p>
        </div>

        <div className="grid-2">
          {services.map((service) => {
            const deliverables = JSON.parse(service.deliverables_json || '[]');
            const exclusions = JSON.parse(service.exclusions_json || '[]');

            return (
              <div key={service.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-brand">{service.category}</span>
                    <span className="badge" style={{ textTransform: 'uppercase' }}>{service.pricing_model.replace('_', ' ')}</span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {service.pricing_model === 'custom_quote'
                      ? 'Custom Quotation'
                      : formatCurrency(service.price_cents, service.currency)}
                  </div>
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.85rem' }}>
                  <Link href={`/services/${service.slug}`} style={{ color: 'var(--text-primary)' }}>
                    {service.name}
                  </Link>
                </h2>

                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {service.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                  <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Estimated Delivery: <strong>{service.estimated_days} business days</strong></span>
                </div>

                {/* Deliverables */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Included Deliverables
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                    {deliverables.map((item: string, i: number) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-primary)' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '2px' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusions */}
                {exclusions.length > 0 && (
                  <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--accent-rose)', fontWeight: 600, marginBottom: '0.75rem' }}>
                      Explicit Exclusions
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {exclusions.map((item: string, i: number) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                          <XCircle size={15} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link href={`/services/${service.slug}`} className="btn btn-secondary" style={{ flex: 1 }}>
                    <span>Terms &amp; Details</span>
                  </Link>

                  <Link href={`/checkout/${service.slug}`} className="btn btn-primary" style={{ flex: 1 }}>
                    <span>{service.pricing_model === 'custom_quote' ? 'Request Scope & Quote' : 'Order Service'}</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
