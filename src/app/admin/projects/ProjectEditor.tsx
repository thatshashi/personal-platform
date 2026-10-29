'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface ProjectEditorProps {
  initialProject?: any;
}

export default function ProjectEditor({ initialProject }: ProjectEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialProject?.title || '');
  const [slug, setSlug] = useState(initialProject?.slug || '');
  const [summary, setSummary] = useState(initialProject?.summary || '');
  const [problem, setProblem] = useState(initialProject?.problem || '');
  const [contribution, setContribution] = useState(initialProject?.contribution || '');
  const [techStack, setTechStack] = useState(
    initialProject?.tech_stack_json ? JSON.parse(initialProject.tech_stack_json).join(', ') : ''
  );
  const [outcomes, setOutcomes] = useState(initialProject?.outcomes || '');
  const [liveUrl, setLiveUrl] = useState(initialProject?.live_url || '');
  const [repoUrl, setRepoUrl] = useState(initialProject?.repo_url || '');
  const [category, setCategory] = useState(initialProject?.category || 'Web Applications');
  const [tags, setTags] = useState(
    initialProject?.tags_json ? JSON.parse(initialProject.tags_json).join(', ') : ''
  );
  const [stage, setStage] = useState(initialProject?.stage || 'completed');
  const [featured, setFeatured] = useState(initialProject ? Boolean(initialProject.featured) : false);
  const [orderIndex, setOrderIndex] = useState(initialProject?.order_index?.toString() || '0');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !summary.trim() || !contribution.trim() || !category.trim()) {
      setErrorMsg('Title, summary, contribution, and category are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialProject?.id,
          title,
          slug,
          summary,
          problem,
          contribution,
          techStack: techStack.split(',').map((t: string) => t.trim()).filter(Boolean),
          outcomes,
          liveUrl,
          repoUrl,
          category,
          tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
          stage,
          featured,
          orderIndex: Number(orderIndex) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save project');
      }

      router.push('/admin/projects');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/admin/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary"
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : initialProject ? 'Update Project' : 'Create Project'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="notice notice-warning" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Project Details &amp; Links</h2>

            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Unified Personal Platform & Digital Business Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Custom Slug (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. unified-personal-business-platform"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Web Applications, Automation, Interactive Tools"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lifecycle Stage</label>
                <select
                  className="input-select"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="completed">Completed in Production</option>
                  <option value="in_progress">Active in Progress</option>
                  <option value="experiment">Exploratory Experiment</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Live URL (Optional)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Source Code Repository URL (Optional)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://github.com/username/project"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technologies (Comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="TypeScript, Next.js, Node.js, SQLite, Vanilla CSS"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Feature on Homepage</span>
              </label>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Case Study Content</h2>

            <div className="form-group">
              <label className="form-label">Short Summary *</label>
              <textarea
                className="input-textarea"
                rows={2}
                placeholder="A clear 1-2 sentence description of what the project does."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">The Problem / Challenge *</label>
              <textarea
                className="input-textarea"
                rows={3}
                placeholder="What was broken, slow, or missing before this project was built?"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">My Actual Contribution *</label>
              <textarea
                className="input-textarea"
                rows={3}
                placeholder="Exactly what you built, architected, and deployed."
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Measured Outcomes &amp; Metrics</label>
              <textarea
                className="input-textarea"
                rows={2}
                placeholder="e.g. Sub-50ms query response times, zero server crashes, 80% reduction in reconciliation time."
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
