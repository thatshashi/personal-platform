import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Terminal, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering to reflect DB changes

export default async function HomePage() {
  const db = getDb();

  // Load site settings
  const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  // Featured Projects
  const featuredProjects = db.prepare(`
    SELECT * FROM projects 
    WHERE featured = 1 
    ORDER BY order_index ASC 
    LIMIT 3
  `).all() as any[];

  // Primary Services
  const activeServices = db.prepare(`
    SELECT * FROM services 
    WHERE active = 1 AND featured = 1 
    ORDER BY order_index ASC 
    LIMIT 3
  `).all() as any[];

  // Latest Writing
  const latestPosts = db.prepare(`
    SELECT * FROM posts 
    WHERE status = 'published' 
    ORDER BY published_at DESC 
    LIMIT 3
  `).all() as any[];

  // Core Principles
  const corePrinciples = db.prepare(`
    SELECT * FROM principles 
    WHERE active = 1 
    ORDER BY order_index ASC 
    LIMIT 3
  `).all() as any[];

  return (
    <div>
      {/* Hero Section */}
      <section className="section-padding" style={{ paddingTop: '6rem', paddingBottom: '4.5rem' }}>
        <div className="container">
          <div style={{ maxWidth: '820px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span className="badge badge-success">
                <span className="nav-brand-dot" style={{ width: '7px', height: '7px' }} />
                <span>Taking Select Projects</span>
              </span>
              <span className="badge">{settings.owner_name || 'Systems Builder'}</span>
            </div>

            <h1 style={{ marginBottom: '1.5rem', lineHeight: 1.15 }}>
              Building reliable digital products, practical systems, and clear technical strategy.
            </h1>

            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              {settings.owner_bio || 'Engineer and consultant. I help founders, businesses, and individuals build full-stack web applications, automate operational friction, and make informed hardware and software decisions.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/services" className="btn btn-primary btn-lg">
                <span>Explore Services</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/portfolio" className="btn btn-secondary btn-lg">
                <span>View Real Work</span>
              </Link>
              <Link href="/playground" className="btn btn-outline btn-lg">
                <Sliders size={18} />
                <span>Project Estimator</span>
              </Link>
            </div>

            {settings.services_notice && (
              <div className="notice notice-info" style={{ marginTop: '2.5rem', maxWidth: '640px' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Current Status:</strong> {settings.services_notice}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="section-padding" style={{ background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="section-eyebrow">Direct Offerings</span>
              <h2 className="section-title">What I can help you with</h2>
              <p className="section-subtitle">
                Clear scope, explicit exclusions, and fixed transparent terms. No hidden retainer fees.
              </p>
            </div>
            <Link href="/services" className="btn btn-secondary btn-sm">
              <span>View All Services</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid-3">
            {activeServices.map((service) => {
              const deliverables = JSON.parse(service.deliverables_json || '[]');
              return (
                <div key={service.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <span className="badge badge-brand">{service.category}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {service.pricing_model === 'custom_quote'
                        ? 'Custom Scope'
                        : formatCurrency(service.price_cents, service.currency)}
                    </span>
                  </div>

                  <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>
                    {service.name}
                  </h3>

                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                    {service.description}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                      Key Deliverables
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      {deliverables.slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '3px' }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link href={`/services/${service.slug}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        <span>Full Terms</span>
                      </Link>
                      <Link href={`/checkout/${service.slug}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        <span>{service.pricing_model === 'custom_quote' ? 'Request Quote' : 'Order Service'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Work / Portfolio */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="section-eyebrow">Real Production Work</span>
              <h2 className="section-title">Verified systems and projects</h2>
              <p className="section-subtitle">
                No mock portfolio placeholders. Real systems, documented challenges, and verified technical outcomes.
              </p>
            </div>
            <Link href="/portfolio" className="btn btn-secondary btn-sm">
              <span>All Projects</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {featuredProjects.map((project) => {
              const tech = JSON.parse(project.tech_stack_json || '[]');
              return (
                <div key={project.id} className="card card-hover" style={{ padding: '2.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-brand">{project.category}</span>
                        <span className="badge badge-success">{project.stage}</span>
                      </div>

                      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.85rem' }}>
                        <Link href={`/portfolio/${project.slug}`} style={{ color: 'var(--text-primary)' }}>
                          {project.title}
                        </Link>
                      </h3>

                      <p style={{ fontSize: '0.975rem', marginBottom: '1.25rem' }}>
                        {project.summary}
                      </p>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        {tech.map((t: string) => (
                          <span key={t} className="badge" style={{ fontSize: '0.75rem' }}>{t}</span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href={`/portfolio/${project.slug}`} className="btn btn-secondary btn-sm">
                          <span>Read Case Study</span>
                          <ArrowRight size={14} />
                        </Link>
                        {project.live_url && (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                            <span>Live Preview</span>
                            <ArrowUpRight size={14} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Measured Outcome &amp; Contribution
                      </div>
                      <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '1rem', fontStyle: 'italic' }}>
                        &ldquo;{project.outcomes || project.contribution}&rdquo;
                      </p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong>My Role:</strong> {project.contribution}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Tool Banner */}
      <section className="section-padding" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <div className="container">
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)', borderColor: 'rgba(56, 189, 248, 0.25)', padding: '3rem' }}>
            <div style={{ maxWidth: '680px' }}>
              <span className="badge badge-brand" style={{ marginBottom: '1rem' }}>Interactive Decision Playground</span>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Estimate Your Project Scope &amp; Budget Instantly</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
                Use our interactive playground calculator to compute realistic timelines, deliverables, and cost breakdowns for web apps, bots, and consulting before booking a call.
              </p>
              <Link href="/playground" className="btn btn-accent btn-lg">
                <Sliders size={18} />
                <span>Launch Interactive Estimator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Writing & Guides */}
      <section className="section-padding" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="section-eyebrow">Publishing &amp; Guides</span>
              <h2 className="section-title">Honest writing and buying guides</h2>
              <p className="section-subtitle">
                Practical guides, architecture notes, and personal observations without sponsored affiliate fluff.
              </p>
            </div>
            <Link href="/blog" className="btn btn-secondary btn-sm">
              <span>All Articles</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid-3">
            {latestPosts.map((post) => (
              <article key={post.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge">{post.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {post.reading_time_min} min read
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'var(--text-primary)' }}>
                    {post.title}
                  </Link>
                </h3>

                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Read</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Highlight */}
      <section className="section-padding" style={{ background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="section-eyebrow">Operating Principles</span>
              <h2 className="section-title">How I actually work and evaluate problems</h2>
              <p className="section-subtitle">
                Core principles and honest boundaries that govern my business and code.
              </p>
            </div>
            <Link href="/principles" className="btn btn-secondary btn-sm">
              <span>Read All Principles</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid-3">
            {corePrinciples.map((p) => (
              <div key={p.id} className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
                <span className="badge badge-brand" style={{ marginBottom: '1rem' }}>{p.category}</span>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                  &ldquo;{p.statement}&rdquo;
                </p>
                {p.evolution_notes && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <strong>Note:</strong> {p.evolution_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Call to Action */}
      <section className="section-padding" style={{ borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Have a problem worth solving?</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Whether you need a bespoke full-stack application, an automated business pipeline, or an honest technical architecture review, let&apos;s evaluate the requirements together.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn-primary btn-lg">
              <span>Send Project Enquiry</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/services" className="btn btn-secondary btn-lg">
              <span>View Service Packages</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
