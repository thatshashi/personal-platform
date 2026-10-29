'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Mail, CheckCircle2, Clock, Trash2, ArrowUpRight } from 'lucide-react';

interface EnquiryInboxClientProps {
  initialEnquiries: any[];
}

export default function EnquiryInboxClient({ initialEnquiries }: EnquiryInboxClientProps) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all');

  const filteredEnquiries = enquiries.filter((e) => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e))
        );
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry((prev: any) => ({ ...prev, status }));
        }
        router.refresh();
      }
    } catch {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this enquiry?')) return;
    try {
      const res = await fetch(`/api/admin/enquiries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
        if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
        router.refresh();
      }
    } catch {
      alert('Error deleting enquiry');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['all', 'new', 'replied', 'archived'].map((f) => (
          <button
            key={f}
            type="button"
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f as any)}
            style={{ textTransform: 'capitalize' }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedEnquiry ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* Enquiry List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          {filteredEnquiries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem' }}>
              No messages found in this view.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => setSelectedEnquiry(enq)}
                  style={{
                    background: selectedEnquiry?.id === enq.id ? 'var(--bg-subtle)' : 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>{enq.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{enq.category}</span>
                    </div>
                    <span className={`badge ${enq.status === 'new' ? 'badge-warning' : enq.status === 'replied' ? 'badge-success' : ''}`} style={{ textTransform: 'capitalize' }}>
                      {enq.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.5rem' }}>
                    {enq.message}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Received: {formatDate(enq.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Enquiry Detail */}
        {selectedEnquiry && (
          <div className="card" style={{ padding: '2rem', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className="badge badge-brand">{selectedEnquiry.category}</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedEnquiry(null)}
              >
                Close
              </button>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{selectedEnquiry.name}</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '1.25rem' }}>
              <a href={`mailto:${selectedEnquiry.email}`} style={{ textDecoration: 'underline' }}>{selectedEnquiry.email}</a>
            </div>

            {(selectedEnquiry.budget_range || selectedEnquiry.timeline) && (
              <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {selectedEnquiry.budget_range && <div><strong>Budget:</strong> {selectedEnquiry.budget_range}</div>}
                {selectedEnquiry.timeline && <div><strong>Timeline:</strong> {selectedEnquiry.timeline}</div>}
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Full Message:
              </div>
              <p style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', whiteSpace: 'pre-wrap' }}>
                {selectedEnquiry.message}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Re: ${encodeURIComponent(selectedEnquiry.category)} Enquiry`}
                  className="btn btn-primary btn-sm"
                >
                  <Mail size={14} />
                  <span>Reply via Email</span>
                </a>

                {selectedEnquiry.status === 'new' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUpdateStatus(selectedEnquiry.id, 'replied')}
                  >
                    Mark Replied
                  </button>
                )}

                {selectedEnquiry.status !== 'archived' && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleUpdateStatus(selectedEnquiry.id, 'archived')}
                  >
                    Archive
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--accent-rose)' }}
                onClick={() => handleDelete(selectedEnquiry.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
