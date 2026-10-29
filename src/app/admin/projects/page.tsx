import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { PlusCircle, Edit3, ExternalLink } from 'lucide-react';
import DeleteProjectButton from './DeleteProjectButton';

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const projects = db.prepare('SELECT * FROM projects ORDER BY order_index ASC, created_at DESC').all() as any[];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Portfolio &amp; Projects Manager</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Publish verified systems, case studies, technologies used, and outcomes.
          </p>
        </div>

        <Link href="/admin/projects/new" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Add New Project</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Title &amp; Summary</th>
                <th>Category</th>
                <th>Stage</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td style={{ maxWidth: '340px' }}>
                    <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>{p.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.summary}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-brand">{p.category}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">{p.stage}</span>
                  </td>
                  <td>
                    {p.featured === 1 ? (
                      <span className="badge badge-warning">Featured</span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link href={`/admin/projects/${p.id}`} className="btn btn-secondary btn-sm">
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </Link>
                      <Link href={`/portfolio/${p.slug}`} target="_blank" className="btn btn-outline btn-sm">
                        <ExternalLink size={14} />
                      </Link>
                      <DeleteProjectButton projectId={p.id} projectTitle={p.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
