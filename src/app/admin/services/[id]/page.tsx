import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import ServiceEditor from '../ServiceEditor';

export const revalidate = 0;

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const { id } = await params;
  const db = getDb();

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!service) {
    notFound();
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Edit Service Offering</h1>
      <ServiceEditor initialService={JSON.parse(JSON.stringify(service))} />
    </div>
  );
}
