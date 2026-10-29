import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import PrinciplesManagerClient from './PrinciplesManagerClient';

export const revalidate = 0;

export default async function AdminPrinciplesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const principles = db.prepare('SELECT * FROM principles ORDER BY order_index ASC').all() as any[];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Operating Principles &amp; Opinions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Maintain living working rules, public opinions, and revision histories.
          </p>
        </div>
      </div>

      <PrinciplesManagerClient initialPrinciples={JSON.parse(JSON.stringify(principles))} />
    </div>
  );
}
