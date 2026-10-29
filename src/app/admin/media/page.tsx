import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import MediaLibraryClient from './MediaLibraryClient';

export const revalidate = 0;

export default async function AdminMediaPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const media = db.prepare('SELECT * FROM media ORDER BY created_at DESC').all() as any[];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Media Assets &amp; File Storage</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Upload, preview, and copy embed codes for diagrams, screenshots, and cover images.
          </p>
        </div>
      </div>

      <MediaLibraryClient initialMedia={JSON.parse(JSON.stringify(media))} />
    </div>
  );
}
