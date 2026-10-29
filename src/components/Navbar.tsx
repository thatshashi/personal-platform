'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  siteTitle?: string;
  hasAdminSession?: boolean;
}

export default function Navbar({ siteTitle = 'Platform', hasAdminSession = false }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Work', href: '/portfolio' },
    { label: 'Services', href: '/services' },
    { label: 'Guides', href: '/guides' },
    { label: 'Writing', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Principles', href: '/principles' },
    { label: 'Playground', href: '/playground' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
          <span className="nav-brand-dot" aria-hidden="true" />
          <span>{siteTitle}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          {hasAdminSession && (
            <Link href="/admin" className="badge badge-brand" title="Admin Dashboard">
              <ShieldCheck size={14} />
              <span>Admin</span>
            </Link>
          )}

          <Link href="/contact" className="btn btn-secondary btn-sm">
            <span>Enquire</span>
            <ArrowUpRight size={14} />
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: isActive(item.href) ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                padding: '0.4rem 0',
              }}
            >
              {item.label}
            </Link>
          ))}
          <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Link
              href="/contact"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Start an Enquiry
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
