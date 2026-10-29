'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Package, 
  ShoppingBag, 
  Inbox, 
  Compass, 
  Image as ImageIcon, 
  Settings, 
  ShieldAlert, 
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface AdminSidebarProps {
  admin: { username: string; email: string; role: string };
  paymentMode: string;
}

export default function AdminSidebar({ admin, paymentMode }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login or setup page, hide sidebar
  if (pathname === '/admin/login' || pathname === '/admin/setup') {
    return null;
  }

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Blog Posts', href: '/admin/posts', icon: FileText },
    { label: 'Projects', href: '/admin/projects', icon: Briefcase },
    { label: 'Services', href: '/admin/services', icon: Package },
    { label: 'Orders & Bookings', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Enquiries Inbox', href: '/admin/enquiries', icon: Inbox },
    { label: 'Principles', href: '/admin/principles', icon: Compass },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Trail', href: '/admin/logs', icon: ShieldAlert },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--accent-cyan)' }} />
          <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Admin Console</strong>
        </div>
        <Link href="/" target="_blank" title="View Public Website" style={{ color: 'var(--text-muted)' }}>
          <ExternalLink size={16} />
        </Link>
      </div>

      {/* User and Mode Bar */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {admin.username}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {admin.email}
        </div>
        <div>
          <span className={`badge ${paymentMode === 'mock_sandbox' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
            {paymentMode === 'mock_sandbox' ? 'Gateway: Sandbox Test' : `Gateway: ${paymentMode}`}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${active ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
