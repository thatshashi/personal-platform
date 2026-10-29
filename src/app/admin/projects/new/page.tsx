import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import ProjectEditor from '../ProjectEditor';

export const revalidate = 0;

export default async function NewProjectPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Add New Project Case Study</h1>
      <ProjectEditor />
    </div>
  );
}
