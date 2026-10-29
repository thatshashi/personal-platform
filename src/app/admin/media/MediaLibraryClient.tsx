'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Image as ImageIcon, Trash2, Copy, Check, AlertCircle } from 'lucide-react';

interface MediaLibraryClientProps {
  initialMedia: any[];
}

export default function MediaLibraryClient({ initialMedia }: MediaLibraryClientProps) {
  const router = useRouter();
  const [mediaList, setMediaList] = useState(initialMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [altText, setAltText] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', altText);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMediaList((prev) => [data.media, ...prev]);
      setAltText('');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyMarkdown = (item: any) => {
    const md = `![${item.alt_text || item.original_name}](${item.path_or_url})`;
    navigator.clipboard.writeText(md);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media file? If it is referenced in an article or project, the image will disappear.')) return;

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
        router.refresh();
      }
    } catch {
      alert('Error deleting file');
    }
  };

  return (
    <div>
      {/* Upload Panel */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'var(--bg-surface-elevated)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Upload Media to Local Library</h2>

        {errorMsg && (
          <div className="notice notice-warning" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Accessibility Alt Text (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Architecture diagram of the data pipeline"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>

          <div>
            <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <UploadCloud size={16} />
              <span>{isUploading ? 'Uploading Image...' : 'Choose File to Upload'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
            <div className="form-help" style={{ marginTop: '0.4rem' }}>
              Supports JPG, PNG, WebP, GIF, SVG up to 10MB.
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery Grid */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Stored Assets ({mediaList.length})</h2>

        {mediaList.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
            No images uploaded yet. Upload images above to embed in blog posts or projects.
          </p>
        ) : (
          <div className="grid-3">
            {mediaList.map((item) => (
              <div key={item.id} className="card" style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  {item.path_or_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.path_or_url}
                      alt={item.alt_text || item.original_name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <ImageIcon size={32} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.25rem' }}>
                  {item.original_name}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {item.size_bytes ? `${Math.round(item.size_bytes / 1024)} KB` : ''} &bull; <code>{item.path_or_url}</code>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleCopyMarkdown(item)}
                  >
                    {copiedId === item.id ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy MD'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--accent-rose)' }}
                    onClick={() => handleDelete(item.id)}
                    title="Delete Media File"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
