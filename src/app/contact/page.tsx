import React, { Suspense } from 'react';
import ContactForm from './ContactForm';
import { Mail, Clock, ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export default function ContactPage() {
  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
          <span className="section-eyebrow">Direct Contact &amp; Enquiries</span>
          <h1 className="section-title">Start a conversation or project enquiry.</h1>
          <p className="section-subtitle">
            Whether you have a specific software project in mind or want to explore an automation idea, you reach me directly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          <div>
            <Suspense fallback={<div className="card" style={{ padding: '2rem' }}>Loading enquiry form...</div>}>
              <ContactForm />
            </Suspense>
          </div>

          <div>
            <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span>Response Time &amp; Boundaries</span>
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                I review all submitted messages personally. For standard business enquiries, you can expect an initial response within <strong>24 to 48 hours</strong> on business days.
              </p>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                If your project is outside my current domain of expertise or availability, I will say so honestly and redirect you if I know a capable colleague.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', background: 'var(--bg-surface-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
                <span>Confidentiality Guarantee</span>
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                All shared project ideas, preliminary architecture diagrams, and company details are treated under strict professional confidence. No marketing newsletters or solicitation emails will be sent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
