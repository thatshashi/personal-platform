import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import OrderManagerClient from './OrderManagerClient';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Customer Orders &amp; Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track payment authorizations, customer requirements, and fulfillment milestones.
          </p>
        </div>
      </div>

      <OrderManagerClient initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
