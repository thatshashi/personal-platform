import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import EnquiryInboxClient from './EnquiryInboxClient';

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const enquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all() as any[];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Client Enquiries &amp; Messages Inbox</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Direct messages received through the public contact and scope estimation forms.
          </p>
        </div>
      </div>

      <EnquiryInboxClient initialEnquiries={JSON.parse(JSON.stringify(enquiries))} />
    </div>
  );
}
