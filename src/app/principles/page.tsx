import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ShieldAlert, History, MessageSquare } from 'lucide-react';

export const revalidate = 0;

export default function PrinciplesPage() {
  const db = getDb();
  const principles = db.prepare('SELECT * FROM principles WHERE active = 1 ORDER BY order_index ASC').all() as any[];

  return (
    <div className="section-padding">
      <div className="container-prose">
        <div className="section-header">
          <span className="section-eyebrow">A Living Document</span>
          <h1 className="section-title">Operating principles, opinions, and observations.</h1>
          <p className="section-subtitle">
            Not motivational platitudes. These are the practical constraints, working rules, and evolving opinions that guide how I choose projects, design software, and interact with people.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {principles.map((item, idx) => (
            <div key={item.id} className="card card-hover" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge badge-brand" style={{ textTransform: 'capitalize' }}>
                  {item.category}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  #{idx + 1}
                </span>
              </div>

              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
                {item.title}
              </h2>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                &ldquo;{item.statement}&rdquo;
              </p>

              {item.rationale && (
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  {item.rationale}
                </p>
              )}

              {item.evolution_notes && (
                <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <History size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--accent-amber)', marginBottom: '0.2rem' }}>
                      Context &amp; How This Evolved
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {item.evolution_notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Note on Disagreements */}
        <div className="notice notice-info" style={{ marginTop: '3.5rem' }}>
          <MessageSquare size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Disagreements Welcome:</strong> Strong opinions should be held loosely when new evidence emerges. If you think any observation here is flawed or outdated, feel free to <Link href="/contact" style={{ textDecoration: 'underline' }}>send a critique</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
