import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ShieldAlert, Terminal, Eye } from 'lucide-react';

export const revalidate = 0;

export default async function AdminLogsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const db = getDb();
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50').all() as any[];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Security &amp; Operational Audit Trail</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Immutable chronological record of logins, orders, payments, and administrative mutations.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No audit events recorded yet.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>IP Address</th>
                  <th>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  let parsedDetails = {};
                  try {
                    parsedDetails = JSON.parse(log.details_json || '{}');
                  } catch {}

                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(log.created_at)} {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className="badge badge-brand" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.85rem' }}>{log.actor}</strong>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {log.ip_address}
                      </td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '350px' }}>
                        <code style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {JSON.stringify(parsedDetails)}
                        </code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
