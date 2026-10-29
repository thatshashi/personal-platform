import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Terminal, Code2 } from 'lucide-react';

export const revalidate = 0;

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const db = getDb();

  const project = db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as any;
  if (!project) {
    notFound();
  }

  const tech = JSON.parse(project.tech_stack_json || '[]');
  const tags = JSON.parse(project.tags_json || '[]');

  return (
    <div className="section-padding">
      <div className="container-prose">
        <Link href="/portfolio" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} />
          <span>Back to all projects</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-brand">{project.category}</span>
          <span className="badge badge-success">{project.stage}</span>
        </div>

        <h1 style={{ marginBottom: '1.25rem' }}>{project.title}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          {project.summary}
        </p>

        {/* Tech Stack Bar */}
        <div className="card" style={{ padding: '1.25rem 1.75rem', marginBottom: '3rem', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
            Technologies &amp; Architecture
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tech.map((t: string) => (
              <span key={t} className="badge" style={{ fontSize: '0.85rem' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* The Problem / Objective */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Problem &amp; Context</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {project.problem}
          </p>
        </div>

        {/* My Actual Contribution */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>My Contribution &amp; Architecture Decisions</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
            {project.contribution}
          </p>
        </div>

        {/* Outcomes & Metrics */}
        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)', marginBottom: '3rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.85rem', color: 'var(--accent-emerald)' }}>
            Verified Technical Outcomes
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
            {project.outcomes}
          </p>
        </div>

        {/* Action Links */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '2.5rem' }}>
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <span>View Live Project</span>
              <ArrowUpRight size={16} />
            </a>
          )}
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <Code2 size={16} />
              <span>Source Repository</span>
            </a>
          )}
          <Link href="/contact" className="btn btn-outline">
            <span>Inquire About Similar Work</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
