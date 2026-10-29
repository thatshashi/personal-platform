import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { Gamepad2, Wrench, Sparkles, Compass } from 'lucide-react';

export const revalidate = 0;

export default function InterestsPage() {
  const db = getDb();
  const interests = db.prepare('SELECT * FROM interests ORDER BY order_index ASC').all() as any[];

  // Group by category
  const groups: Record<string, any[]> = {};
  for (const item of interests) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }

  const categoryTitles: Record<string, string> = {
    gaming: 'Games & Simulations',
    tech_stack: 'Hardware & Daily Drivers',
    curiosities: 'Explorations & Research Curiosities',
    books: 'Books & Reference Material'
  };

  return (
    <div className="section-padding">
      <div className="container">
        <div className="section-header" style={{ maxWidth: '780px' }}>
          <span className="section-eyebrow">Personal Collections</span>
          <h1 className="section-title">Games, tools, and technical curiosities.</h1>
          <p className="section-subtitle">
            Beyond client work: the games I return to, the physical tools I rely on, and experimental software paradigms I am actively investigating.
          </p>
        </div>

        {Object.entries(groups).map(([catKey, items]) => (
          <div key={catKey} style={{ marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-brand">{categoryTitles[catKey] || catKey}</span>
            </h2>

            <div className="grid-3">
              {items.map((item) => (
                <div key={item.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <h3 style={{ fontSize: '1.15rem' }}>{item.title}</h3>
                    {item.status_tag && (
                      <span className="badge badge-success">{item.status_tag}</span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1, lineHeight: 1.6 }}>
                    {item.description}
                  </p>

                  {item.rating_or_experience && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <strong>Experience / Notes:</strong> {item.rating_or_experience}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
