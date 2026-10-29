import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, Edit3, ExternalLink } from 'lucide-react';
import DeleteServiceButton from './DeleteServiceButton';

export const revalidate = 0;

export default async function AdminServicesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const services = db.prepare('SELECT * FROM services ORDER BY order_index ASC').all() as any[];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Services Marketplace Manager</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage pricing, deliverables, exclusions, and availability without code changes.
          </p>
        </div>

        <Link href="/admin/services/new" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Add New Service</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Name &amp; Category</th>
                <th>Pricing Model</th>
                <th>Price</th>
                <th>Turnaround</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>{s.name}</strong>
                    <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{s.category}</span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {s.pricing_model.replace('_', ' ')}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {s.pricing_model === 'custom_quote'
                      ? 'Custom'
                      : formatCurrency(s.price_cents, s.currency)}
                  </td>
                  <td>{s.estimated_days} days</td>
                  <td>
                    <span className={`badge ${s.active === 1 ? 'badge-success' : 'badge-danger'}`}>
                      {s.active === 1 ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link href={`/admin/services/${s.id}`} className="btn btn-secondary btn-sm">
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </Link>
                      <Link href={`/services/${s.slug}`} target="_blank" className="btn btn-outline btn-sm">
                        <ExternalLink size={14} />
                      </Link>
                      <DeleteServiceButton serviceId={s.id} serviceName={s.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
