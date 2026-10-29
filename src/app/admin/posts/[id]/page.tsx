import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import PostEditor from '../PostEditor';

export const revalidate = 0;

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const { id } = await params;
  const db = getDb();

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Edit Article</h1>
      <PostEditor initialPost={JSON.parse(JSON.stringify(post))} />
    </div>
  );
}
