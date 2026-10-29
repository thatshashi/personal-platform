import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import PostEditor from '../PostEditor';

export const revalidate = 0;

export default async function NewPostPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Compose New Article</h1>
      <PostEditor />
    </div>
  );
}
