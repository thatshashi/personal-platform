import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export const revalidate = 0;

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const db = getDb();

  const guide = db.prepare('SELECT * FROM buying_guides WHERE slug = ?').get(slug) as any;
  if (!guide) {
    notFound();
  }

  const criteria = JSON.parse(guide.criteria_json || '[]');
  const recommendations = JSON.parse(guide.recommendations_json || '[]');
  const avoidList = JSON.parse(guide.avoid_list_json || '[]');

  return (
    <div className="section-padding">
      <div className="container-prose">
        <Link href="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} />
          <span>Back to all buying guides</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-brand">{guide.category}</span>
          <span className="badge badge-success">Last Verified: {formatDate(guide.last_verified_date)}</span>
        </div>

        <h1 style={{ marginBottom: '1rem' }}>{guide.title}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          {guide.subtitle}
        </p>

        {/* Evaluation Criteria Checklist */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Decision Criteria &amp; Non-Negotiables</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {criteria.map((c: any, i: number) => (
              <div key={i} className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.25rem' }}>
                  {c.title}
                </strong>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {c.requirement}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tested Recommendations */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Tested Recommendations by Category</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {recommendations.map((rec: any, idx: number) => (
              <div key={idx} className="card" style={{ padding: '2rem', border: '1px solid var(--border-medium)' }}>
                <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>{rec.tier}</span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>{rec.model}</h3>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  &ldquo;{rec.verdict}&rdquo;
                </p>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Key Strengths
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                      {rec.pros.map((p: string, i: number) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '3px' }} />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-rose)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Real Limitations
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                      {rec.cons.map((c: string, i: number) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <XCircle size={14} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '3px' }} />
                          <span style={{ color: 'var(--text-muted)' }}>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to Avoid List */}
        {avoidList.length > 0 && (
          <div className="card" style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.25)', padding: '2rem', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} />
              <span>What to Avoid (Unbiased Warning List)</span>
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem' }}>
              {avoidList.map((item: string, i: number) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{ color: 'var(--accent-rose)', fontWeight: 'bold' }}>&bull;</span>
                  <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer CTA */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Need a customized hardware or tool recommendation?</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Get an unbiased, 90-minute architecture and purchasing consultation tailored to your workload.
          </p>
          <Link href="/services/tech-buying-and-architecture-consultation" className="btn btn-primary">
            <span>Book 90-Min Strategy Call</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
