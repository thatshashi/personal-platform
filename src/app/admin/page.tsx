import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin, hasAdminUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ShoppingBag, 
  Inbox, 
  FileText, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PlusCircle,
  Sliders,
  Database,
  ExternalLink
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    if (!hasAdminUser()) {
      redirect('/admin/setup');
    }
    redirect('/admin/login');
  }

  const db = getDb();

  // Metrics
  const orderCountRow = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  const revenueRow = db.prepare("SELECT SUM(amount_cents) as total FROM orders WHERE payment_status = 'completed'").get() as { total: number | null };
  const pendingOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending'").get() as { count: number };

  const servicesCountRow = db.prepare('SELECT COUNT(*) as count FROM services WHERE active = 1').get() as { count: number };
  const postsCountRow = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'").get() as { count: number };
  const draftsCountRow = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'").get() as { count: number };

  const totalEnquiriesRow = db.prepare('SELECT COUNT(*) as count FROM enquiries').get() as { count: number };
  const newEnquiriesRow = db.prepare("SELECT COUNT(*) as count FROM enquiries WHERE status = 'new'").get() as { count: number };

  // Recent Orders
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all() as any[];

  // Recent Enquiries
  const recentEnquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5').all() as any[];

  // Site Settings
  const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  const totalRevenueCents = revenueRow?.total || 0;

  return (
    <div>
      {/* Top Welcome Bar */}
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Platform Operations Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Welcome back, <strong>{admin.username}</strong>. System status: <span style={{ color: 'var(--accent-emerald)' }}>Operational</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/posts/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>New Blog Post</span>
          </Link>
          <Link href="/admin/services/new" className="btn btn-secondary btn-sm">
            <PlusCircle size={15} />
            <span>New Service</span>
          </Link>
          <Link href="/" target="_blank" className="btn btn-outline btn-sm">
            <ExternalLink size={15} />
            <span>View Live Site</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        {/* Total Orders */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Total Orders
            </span>
            <ShoppingBag size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {orderCountRow.count}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {pendingOrdersRow.count} pending processing
          </div>
        </div>

        {/* Verified Revenue */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Verified Revenue
            </span>
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {formatCurrency(totalRevenueCents, settings.currency || 'INR')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Completed transactions
          </div>
        </div>

        {/* Client Enquiries */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Enquiries Inbox
            </span>
            <Inbox size={18} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalEnquiriesRow.count}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', marginTop: '0.25rem', fontWeight: 600 }}>
            {newEnquiriesRow.count} new unreviewed
          </div>
        </div>

        {/* Published Content */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Published Posts
            </span>
            <FileText size={18} style={{ color: 'var(--accent-indigo)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {postsCountRow.count}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {draftsCountRow.count} unpublished drafts
          </div>
        </div>
      </div>

      {/* Main Operations Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Recent Orders Table */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Customer Orders</h2>
            <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              View All Orders &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{o.order_number}</td>
                      <td>{o.customer_name}</td>
                      <td>{o.service_name}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(o.amount_cents, o.currency)}</td>
                      <td>
                        <span className={`badge ${o.payment_status === 'completed' ? 'badge-success' : o.payment_status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ textTransform: 'uppercase' }}>
                          {o.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Enquiries */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Incoming Enquiries</h2>
            <Link href="/admin/enquiries" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              Open Inbox &rarr;
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No enquiries submitted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentEnquiries.map((enq) => (
                <div key={enq.id} style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{enq.name}</strong>
                    <span className={`badge ${enq.status === 'new' ? 'badge-warning' : 'badge-success'}`} style={{ textTransform: 'capitalize' }}>
                      {enq.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                    {enq.category} &bull; {enq.email}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {enq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Health & Status Bar */}
      <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Database size={20} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>SQLite Database Engine (WAL Mode)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              File: <code>platform.db</code> &bull; Zero external server dependencies &bull; ACID Compliant
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/admin/settings" className="btn btn-secondary btn-sm">
            <Sliders size={14} />
            <span>Platform Settings</span>
          </Link>
          <Link href="/admin/logs" className="btn btn-outline btn-sm">
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
