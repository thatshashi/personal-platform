'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { ArrowLeft, Save, Eye, Edit3, AlertCircle } from 'lucide-react';

interface PostEditorProps {
  initialPost?: any;
}

export default function PostEditor({ initialPost }: PostEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || '');
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [category, setCategory] = useState(initialPost?.category || 'Architecture');
  const [tags, setTags] = useState(
    initialPost?.tags_json ? JSON.parse(initialPost.tags_json).join(', ') : ''
  );
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [contentMarkdown, setContentMarkdown] = useState(initialPost?.content_markdown || '');
  const [status, setStatus] = useState(initialPost?.status || 'draft');

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !contentMarkdown.trim() || !category.trim()) {
      setErrorMsg('Title, category, and markdown content are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialPost?.id,
          title,
          subtitle,
          slug,
          category,
          tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
          excerpt,
          contentMarkdown,
          status
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save post');
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/admin/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Articles</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'write' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setActiveTab('write')}
            >
              <Edit3 size={14} />
              <span>Write</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'preview' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setActiveTab('preview')}
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : initialPost ? 'Update Article' : 'Publish / Save Article'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="notice notice-warning" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Metadata &amp; Publishing Options</h2>

            <div className="form-group">
              <label className="form-label">Article Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Why Most Products Don't Need Microservices"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subtitle / Deck</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Reflections on operational simplicity and modular monoliths."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="input-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Essay">Personal Essay</option>
                  <option value="Travel">Travel &amp; Experiences</option>
                  <option value="Gaming">Gaming &amp; Hobbies</option>
                  <option value="Opinions">Opinions &amp; Critique</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Publication Status</label>
                <select
                  className="input-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (Comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Software Architecture, Node.js, Monolith"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Short Excerpt</label>
              <textarea
                className="input-textarea"
                rows={2}
                placeholder="A concise 1-2 sentence preview for search results and social cards."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Markdown Cheatsheet */}
          <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Markdown Cheatsheet</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><code># Heading 1</code>, <code>## Heading 2</code>, <code>### Heading 3</code></li>
              <li><code>**Bold text**</code> and <code>*Italic text*</code></li>
              <li><code>&gt; Blockquote note</code></li>
              <li><code>- Bulleted list item</code></li>
              <li><code>1. Numbered list item</code></li>
              <li><code>```ts code block ```</code></li>
              <li><code>[Link Text](https://url)</code></li>
            </ul>
          </div>
        </div>

        {/* Editor vs Preview Tabs */}
        {activeTab === 'write' ? (
          <div className="card" style={{ padding: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              Article Body (Markdown)
            </label>
            <textarea
              className="input-textarea"
              style={{ minHeight: '520px', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', lineHeight: 1.6 }}
              placeholder="Write your article in standard markdown..."
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-surface)' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <span className="badge badge-brand" style={{ marginBottom: '0.5rem' }}>{category}</span>
              <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{title || 'Untitled Article'}</h1>
              {subtitle && <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{subtitle}</p>}
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(contentMarkdown) }}
            />
          </div>
        )}
      </form>
    </div>
  );
}
