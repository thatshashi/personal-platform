import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ArrowRight, ArrowUpRight, CheckCircle2, Layers } from 'lucide-react';

export const revalidate = 0;

interface PortfolioPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const { category } = await searchParams;
  const db = getDb();

  let query = 'SELECT * FROM projects';
  const params: string[] = [];

  if (category && category !== 'all') {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY order_index ASC, created_at DESC';
  const projects = db.prepare(query).all(...params) as any[];

  // Get distinct categories
  const categoriesRaw = db.prepare('SELECT DISTINCT category FROM projects').all() as { category: string }[];
  const categories = ['all', ...categoriesRaw.map((c) => c.category)];

  return (
    <div className="section-padding">
      <div className="container">
        <div className="section-header" style={{ maxWidth: '780px' }}>
          <span className="section-eyebrow">Portfolio &amp; Case Studies</span>
          <h1 className="section-title">Verified systems, tools, and technical outcomes.</h1>
          <p className="section-subtitle">
            Every project listed here represents actual architectural and engineering work. No conceptual Figma mockups presented as working software.
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {categories.map((cat) => {
            const isSelected = (!category && cat === 'all') || category === cat;
            return (
              <Link
                key={cat}
                href={cat === 'all' ? '/portfolio' : `/portfolio?category=${encodeURIComponent(cat)}`}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Project Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {projects.map((project) => {
            const tech = JSON.parse(project.tech_stack_json || '[]');
            const tags = JSON.parse(project.tags_json || '[]');

            return (
              <div key={project.id} className="card card-hover" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-brand">{project.category}</span>
                      <span className="badge badge-success">{project.stage}</span>
                      {project.featured === 1 && (
                        <span className="badge badge-warning">Featured</span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
                      <Link href={`/portfolio/${project.slug}`} style={{ color: 'var(--text-primary)' }}>
                        {project.title}
                      </Link>
                    </h2>

                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                      {project.summary}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                      {tech.map((t: string) => (
                        <span key={t} className="badge" style={{ fontSize: '0.8rem' }}>{t}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <Link href={`/portfolio/${project.slug}`} className="btn btn-secondary btn-sm">
                        <span>Read Technical Case Study</span>
                        <ArrowRight size={15} />
                      </Link>
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                          <span>Live Site</span>
                          <ArrowUpRight size={15} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        The Challenge &amp; Problem
                      </div>
                      <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
                        {project.problem}
                      </p>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Documented Outcome
                      </div>
                      <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                        &ldquo;{project.outcomes}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
