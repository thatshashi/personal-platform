import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin, hasAdminUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import AdminSidebar from './AdminSidebar';

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  const adminExists = hasAdminUser();

  // If no admin user exists, prompt setup
  if (!adminExists) {
    // If not already on setup, allow setup page to render
    return <>{children}</>;
  }

  // If unauthenticated, let login/setup handle rendering or redirect
  if (!admin) {
    return <>{children}</>;
  }

  // Fetch payment mode for status badge
  const db = getDb();
  const paymentModeRow = db.prepare("SELECT value FROM settings WHERE key = 'payment_mode'").get() as { value: string } | undefined;
  const paymentMode = paymentModeRow?.value || 'mock_sandbox';

  return (
    <div className="admin-layout">
      <AdminSidebar admin={admin} paymentMode={paymentMode} />
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
