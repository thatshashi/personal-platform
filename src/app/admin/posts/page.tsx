import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { PlusCircle, Edit3, Trash2, ExternalLink } from 'lucide-react';
import DeletePostButton from './DeletePostButton';

export const revalidate = 0;

export default async function AdminPostsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all() as any[];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Blog &amp; Publishing Manager</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Publish essays, guides, rants, and observations without redeploying code.
          </p>
        </div>

        <Link href="/admin/posts/new" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Write New Article</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No articles published or drafted yet.</p>
            <Link href="/admin/posts/new" className="btn btn-secondary btn-sm">
              Create First Article
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title &amp; Excerpt</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Reading Time</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td style={{ maxWidth: '320px' }}>
                      <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                        {post.title}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.excerpt || post.subtitle || 'No excerpt'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-brand">{post.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${post.status === 'published' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                        {post.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {post.reading_time_min} min
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(post.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link href={`/admin/posts/${post.id}`} className="btn btn-secondary btn-sm" title="Edit Article">
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </Link>
                        {post.status === 'published' && (
                          <Link href={`/blog/${post.slug}`} target="_blank" className="btn btn-outline btn-sm" title="View Live">
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
