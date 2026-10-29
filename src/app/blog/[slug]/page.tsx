import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from 'lucide-react';

export const revalidate = 0;

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const db = getDb();

  const post = db.prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'").get(slug) as any;
  if (!post) {
    notFound();
  }

  const tags = JSON.parse(post.tags_json || '[]');
  const htmlContent = renderMarkdownToHtml(post.content_markdown);

  return (
    <article className="section-padding">
      <div className="container-prose">
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} />
          <span>Back to all articles</span>
        </Link>

        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-brand">{post.category}</span>
          </div>

          <h1 style={{ marginBottom: '1rem', lineHeight: 1.2 }}>{post.title}</h1>

          {post.subtitle && (
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontStyle: 'italic', lineHeight: 1.5 }}>
              {post.subtitle}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '0.85rem 0', color: 'var(--text-muted)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} />
              <span>{post.reading_time_min} minute read</span>
            </span>
          </div>
        </header>

        {/* Article Body */}
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ marginBottom: '3.5rem' }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '3rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            {tags.map((t: string) => (
              <span key={t} className="badge" style={{ fontSize: '0.8rem' }}>#{t}</span>
            ))}
          </div>
        )}

        {/* Post Footer Callout */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Have thoughts or feedback?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Disagreements and critiques are welcome. Send a direct note.
            </p>
          </div>
          <Link href="/contact" className="btn btn-primary btn-sm">
            <span>Send Feedback</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
