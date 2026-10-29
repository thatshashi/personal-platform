import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, CheckCircle2, ArrowRight, ArrowUpRight, HelpCircle, AlertOctagon } from 'lucide-react';

export const revalidate = 0;

export default function GuidesPage() {
  const db = getDb();
  const guides = db.prepare('SELECT * FROM buying_guides ORDER BY created_at DESC').all() as any[];

  return (
    <div className="section-padding">
      <div className="container">
        <div className="section-header" style={{ maxWidth: '820px' }}>
          <span className="section-eyebrow">Technology &amp; Buying Guides</span>
          <h1 className="section-title">Unbiased, research-backed hardware and software guidance.</h1>
          <p className="section-subtitle">
            Cut through marketing hype and sponsored review spam. Tested criteria, thermal observations, and real developer workload benchmarks without affiliate kickbacks.
          </p>
        </div>

        {/* Guides Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {guides.map((guide) => {
            const criteria = JSON.parse(guide.criteria_json || '[]');
            const recommendations = JSON.parse(guide.recommendations_json || '[]');
            const avoidList = JSON.parse(guide.avoid_list_json || '[]');

            return (
              <div key={guide.id} className="card card-hover" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-brand">{guide.category}</span>
                    <span className="badge badge-success">Verified: {formatDate(guide.last_verified_date)}</span>
                  </div>
                  <Link href={`/guides/${guide.slug}`} className="btn btn-primary btn-sm">
                    <span>Read Complete Analysis</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
                  <Link href={`/guides/${guide.slug}`} style={{ color: 'var(--text-primary)' }}>
                    {guide.title}
                  </Link>
                </h2>

                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  {guide.subtitle}
                </p>

                {/* Key Decision Criteria */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
                    Core Evaluation Criteria
                  </div>
                  <div className="grid-2">
                    {criteria.map((c: any, i: number) => (
                      <div key={i} style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                          {c.title}
                        </strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {c.requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Picks Preview */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Top Tested Recommendation:</strong> {recommendations[0]?.model || 'View recommendations'}
                  </div>
                  <Link href={`/guides/${guide.slug}`} style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>View full pros, cons &amp; avoid list</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Personalized Guidance Call-out */}
        <div className="card" style={{ marginTop: '4rem', background: 'var(--bg-surface-elevated)', padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ maxWidth: '620px' }}>
            <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>Personalized Technical Advice</span>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Need specific recommendations for your budget?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              We offer focused 1-on-1 strategy sessions to review hardware procurement specs, team workstations, or software subscriptions before you commit budget.
            </p>
          </div>
          <Link href="/services/tech-buying-and-architecture-consultation" className="btn btn-primary">
            <span>Book 90-Min Consultation</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
