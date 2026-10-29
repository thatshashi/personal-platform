import React from 'react';
import Link from 'next/link';

interface FooterProps {
  siteTitle?: string;
  tagline?: string;
  contactEmail?: string;
}

export default function Footer({
  siteTitle = 'Personal Platform & Studio',
  tagline = 'Practical software engineering, system architecture, and technology guidance.',
  contactEmail = 'contact@example.com',
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <span className="nav-brand-dot" aria-hidden="true" />
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{siteTitle}</strong>
            </div>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', maxWidth: '360px', marginBottom: '1.25rem' }}>
              {tagline}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-brand">Vanilla CSS</span>
              <span className="badge badge-success">Self-Hosted</span>
              <span className="badge">No Third-Party Trackers</span>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Portfolio & Work</div>
            <ul className="footer-links">
              <li><Link href="/portfolio">Selected Projects</Link></li>
              <li><Link href="/services">Services Marketplace</Link></li>
              <li><Link href="/guides">Hardware & Buying Guides</Link></li>
              <li><Link href="/playground">Interactive Estimator</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Writing & Ideas</div>
            <ul className="footer-links">
              <li><Link href="/blog">Articles & Essays</Link></li>
              <li><Link href="/principles">Operating Principles</Link></li>
              <li><Link href="/interests">Tools & Games</Link></li>
              <li><Link href="/about">Background & Story</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Operations & Admin</div>
            <ul className="footer-links">
              <li><Link href="/contact">Direct Enquiry</Link></li>
              <li><a href={`mailto:${contactEmail}`}>Email Directly</a></li>
              <li><Link href="/admin">Administrative Portal</Link></li>
              <li><Link href="/about#privacy">Privacy & Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {currentYear} {siteTitle}. All rights reserved. Content can be updated without code redeployment.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Engineered with TypeScript &amp; SQLite
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
