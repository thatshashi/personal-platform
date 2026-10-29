'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Edit3, Trash2, CheckCircle2, History } from 'lucide-react';

interface PrinciplesManagerClientProps {
  initialPrinciples: any[];
}

export default function PrinciplesManagerClient({ initialPrinciples }: PrinciplesManagerClientProps) {
  const router = useRouter();
  const [principles, setPrinciples] = useState(initialPrinciples);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('principle');
  const [statement, setStatement] = useState('');
  const [rationale, setRationale] = useState('');
  const [evolutionNotes, setEvolutionNotes] = useState('');
  const [active, setActive] = useState(true);

  const startEdit = (item: any) => {
    setEditingItem(item);
    setIsCreating(false);
    setTitle(item.title);
    setCategory(item.category);
    setStatement(item.statement);
    setRationale(item.rationale || '');
    setEvolutionNotes(item.evolution_notes || '');
    setActive(Boolean(item.active));
  };

  const startCreate = () => {
    setEditingItem(null);
    setIsCreating(true);
    setTitle('');
    setCategory('principle');
    setStatement('');
    setRationale('');
    setEvolutionNotes('');
    setActive(true);
  };

  const cancelForm = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/principles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem?.id,
          title,
          category,
          statement,
          rationale,
          evolutionNotes,
          active
        })
      });

      if (res.ok) {
        cancelForm();
        router.refresh();
      } else {
        alert('Failed to save principle');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this principle?')) return;
    try {
      const res = await fetch(`/api/admin/principles?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPrinciples((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      }
    } catch {
      alert('Error deleting');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        {!isCreating && !editingItem && (
          <button type="button" className="btn btn-primary" onClick={startCreate}>
            <PlusCircle size={16} />
            <span>Add New Principle / Opinion</span>
          </button>
        )}
      </div>

      {(isCreating || editingItem) && (
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'var(--bg-surface-elevated)' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
            {editingItem ? 'Edit Principle / Evolution Notes' : 'New Principle or Observation'}
          </h2>

          <form onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Title / Label *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Respect User Agency & Time"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="input-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="principle">Operating Principle</option>
                  <option value="opinion">Strong Opinion</option>
                  <option value="observation">Societal / Industry Observation</option>
                  <option value="critique">Architecture Critique</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Core Statement *</label>
              <textarea
                className="input-textarea"
                rows={2}
                placeholder="The concise, memorable rule or principle..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rationale &amp; Explanation</label>
              <textarea
                className="input-textarea"
                rows={3}
                placeholder="Why do you believe this? What evidence supports it?"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Revision History &amp; How This Evolved</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Originally formulated in 2023. Updated after observing overengineering in microservices."
                value={evolutionNotes}
                onChange={(e) => setEvolutionNotes(e.target.value)}
              />
              <div className="form-help">Documenting how your thinking changes adds genuine authenticity.</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary">
                Save Principle
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Principles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {principles.map((item) => (
          <div key={item.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="badge badge-brand" style={{ textTransform: 'capitalize' }}>{item.category}</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{item.title}</strong>
              </div>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                &ldquo;{item.statement}&rdquo;
              </p>
              {item.evolution_notes && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <History size={13} />
                  <span>{item.evolution_notes}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => startEdit(item)}
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--accent-rose)' }}
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
