import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import SettingsManagerClient from './SettingsManagerClient';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div>
      <SettingsManagerClient initialSettings={settings} />
    </div>
  );
}
