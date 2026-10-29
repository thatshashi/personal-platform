import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import ServiceEditor from '../ServiceEditor';

export const revalidate = 0;

export default async function NewServicePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Create New Service Offering</h1>
      <ServiceEditor />
    </div>
  );
}
