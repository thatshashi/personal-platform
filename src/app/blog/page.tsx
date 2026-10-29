import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';

export const revalidate = 0;

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const db = getDb();

  let query = "SELECT * FROM posts WHERE status = 'published'";
  const params: string[] = [];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY published_at DESC, created_at DESC';
  const posts = db.prepare(query).all(...params) as any[];

  // Get distinct categories
  const catRows = db.prepare("SELECT DISTINCT category FROM posts WHERE status = 'published'").all() as { category: string }[];
  const categories = ['all', ...catRows.map((c) => c.category)];

  return (
    <div className="section-padding">
      <div className="container-prose">
        <div className="section-header">
          <span className="section-eyebrow">Writing &amp; Reflections</span>
          <h1 className="section-title">Articles, technical guides, and personal observations.</h1>
          <p className="section-subtitle">
            Long-form essays, architecture notes, and honest thoughts written without SEO keyword stuffing or manufactured corporate polish.
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {categories.map((cat) => {
            const isSelected = (!category && cat === 'all') || category === cat;
            return (
              <Link
                key={cat}
                href={cat === 'all' ? '/blog' : `/blog?category=${encodeURIComponent(cat)}`}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {posts.map((post) => {
            const tags = JSON.parse(post.tags_json || '[]');

            return (
              <article key={post.id} className="card card-hover" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-brand">{post.category}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                  </div>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} />
                    <span>{post.reading_time_min} min read</span>
                  </span>
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'var(--text-primary)' }}>
                    {post.title}
                  </Link>
                </h2>

                {post.subtitle && (
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontStyle: 'italic' }}>
                    {post.subtitle}
                  </p>
                )}

                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {tags.map((t: string) => (
                      <span key={t} className="badge" style={{ fontSize: '0.75rem' }}>#{t}</span>
                    ))}
                  </div>

                  <Link href={`/blog/${post.slug}`} className="btn btn-secondary btn-sm">
                    <span>Read Article</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
