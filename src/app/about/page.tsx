import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ArrowRight, CheckCircle2, ShieldAlert, Cpu, Terminal, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default function AboutPage() {
  const db = getDb();
  const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  const techStack = [
    { category: 'Languages & Core', items: ['TypeScript', 'JavaScript', 'Node.js', 'Python', 'SQL (SQLite/PostgreSQL)'] },
    { category: 'Frameworks & Frontend', items: ['Next.js (App Router)', 'React 19', 'Vanilla CSS', 'Web Standards', 'REST APIs'] },
    { category: 'Architecture & Automation', items: ['Modular Monoliths', 'Data Transformation Pipelines', 'Webhook Automations', 'Custom Scrapers'] },
    { category: 'Infrastructure & Tools', items: ['Linux / Unix', 'Git', 'Docker', 'SQLite / WAL mode', 'Secure Session Cryptography'] },
  ];

  return (
    <div className="section-padding">
      <div className="container-prose">
        <span className="section-eyebrow">About the Builder</span>
        <h1 style={{ marginBottom: '1.5rem' }}>A pragmatic approach to software, systems, and client work.</h1>

        <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
          <p style={{ marginBottom: '1.25rem' }}>
            I am a full-stack engineer and digital systems builder. I work with founders, independent operators, and businesses who need dependable web applications, automated workflows, and honest technical guidance.
          </p>
          <p style={{ marginBottom: '1.25rem' }}>
            I don&apos;t run a 50-person agency, and I don&apos;t outsource my client communication to account managers. When you hire me for a service, you work directly with the person architecting, writing, and deploying the software.
          </p>
        </div>

        {/* Core Working Philosophy */}
        <div className="card" style={{ marginBottom: '3rem', background: 'var(--bg-surface-elevated)' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            My Working Rules
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong>Scope Clarity:</strong> I define exact deliverables and explicit exclusions before accepting payment. You will always know what is in scope.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong>Zero Vendor Lock-in:</strong> You own 100% of the code, data, and configurations. Systems are engineered using open standards so any capable developer can maintain them.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong>No Manufactured Hype:</strong> I do not push unnecessary AI models, microservices, or expensive cloud subscriptions when a straightforward relational database and clean code will do the job better.
              </div>
            </li>
          </ul>
        </div>

        {/* Verified Tech Stack */}
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Verified Technical Capabilities</h2>
        <p style={{ marginBottom: '1.75rem', color: 'var(--text-secondary)' }}>
          I only offer services in technologies and domains where I have hands-on production experience.
        </p>

        <div className="grid-2" style={{ marginBottom: '3rem' }}>
          {techStack.map((group) => (
            <div key={group.category} className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                {group.category}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                {group.items.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Operating & Privacy Terms */}
        <div id="privacy" className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-subtle)', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.85rem' }}>Transparency, Privacy &amp; Terms</h2>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.7 }}>
            <strong>Client Confidentiality:</strong> All technical specifications, business metrics, and code repositories shared during engagements are held in strict confidence.
          </p>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.7 }}>
            <strong>Payment Terms:</strong> For fixed-price projects, a 50% initiation deposit is required prior to sprint commencement, with the balance due upon delivery of agreed acceptance criteria.
          </p>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong>Data Handling:</strong> This website collects only the information necessary to fulfill your enquiries and orders. We do not sell data, use tracking beacons, or load third-party ad networks.
          </p>
        </div>

        {/* Action Link */}
        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <Link href="/services" className="btn btn-primary btn-lg">
            <span>Explore Services &amp; Packages</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
