'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { 
  Sliders, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  HelpCircle,
  Cpu,
  Database,
  Server
} from 'lucide-react';

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<'estimator' | 'matrix'>('estimator');

  // Estimator State
  const [projectType, setProjectType] = useState<'webapp' | 'automation' | 'audit'>('webapp');
  const [hasAuth, setHasAuth] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [hasPayments, setHasPayments] = useState(false);
  const [hasAutomations, setHasAutomations] = useState(false);
  const [urgency, setUrgency] = useState<'standard' | 'express'>('standard');

  // Decision Matrix State
  const [workloadType, setWorkloadType] = useState<'crud' | 'realtime' | 'pipeline' | 'content'>('crud');
  const [scaleTier, setScaleTier] = useState<'early' | 'growing' | 'high'>('early');
  const [teamSize, setTeamSize] = useState<'solo' | 'small' | 'large'>('solo');

  // Calculate Estimation
  const calculateEstimates = () => {
    let basePrice = 4500000; // ₹45,000 base for webapp
    let baseDays = 14;

    if (projectType === 'automation') {
      basePrice = 2500000;
      baseDays = 7;
    } else if (projectType === 'audit') {
      basePrice = 1500000;
      baseDays = 4;
    }

    if (projectType === 'webapp') {
      if (hasAuth) { basePrice += 1000000; baseDays += 3; }
      if (hasAdmin) { basePrice += 1500000; baseDays += 4; }
      if (hasPayments) { basePrice += 1200000; baseDays += 3; }
      if (hasAutomations) { basePrice += 800000; baseDays += 2; }
    } else if (projectType === 'automation') {
      if (hasPayments) { basePrice += 1000000; baseDays += 3; }
      if (hasAutomations) { basePrice += 1000000; baseDays += 3; }
    }

    if (urgency === 'express') {
      basePrice = Math.round(basePrice * 1.3);
      baseDays = Math.max(3, Math.round(baseDays * 0.65));
    }

    return { priceCents: basePrice, days: baseDays };
  };

  const { priceCents, days } = calculateEstimates();

  // Tech Stack Matrix Recommendation Logic
  const getMatrixRecommendation = () => {
    if (workloadType === 'crud' && scaleTier === 'early') {
      return {
        stack: 'Next.js App Router + SQLite (WAL mode) + Vanilla CSS',
        hosting: 'Self-hosted VPS (Hetzner/DigitalOcean) or Docker Container',
        why: 'Zero network latency between Node and SQLite. Single process deployment, zero database subscription fees, sub-30ms TTFB.',
        antiPattern: 'Do not deploy a distributed microservices cluster with managed Postgres for an early-stage CRUD product.'
      };
    }
    if (workloadType === 'realtime') {
      return {
        stack: 'Node.js / Fastify + WebSockets + Redis + PostgreSQL',
        hosting: 'Containerized service with sticky load balancer',
        why: 'WebSockets require persistent duplex connections that break on serverless edge functions without external connection pooling.',
        antiPattern: 'Avoid pure serverless functions for bidirectional socket connections; serverless cold starts will drop socket heartbeats.'
      };
    }
    if (workloadType === 'pipeline') {
      return {
        stack: 'TypeScript Node.js Worker Pipeline + SQLite Queue + Python Scripts',
        hosting: 'Dedicated background worker instance with cron scheduler',
        why: 'Decoupled worker queues prevent long-running data transformations from blocking the customer-facing HTTP web server.',
        antiPattern: 'Never execute heavy synchronous document conversions or scraping inside an HTTP request handler.'
      };
    }
    return {
      stack: 'Next.js Static Generation (SSG) + SQLite / Markdown + CDN Cache',
      hosting: 'Standard Node server or edge CDN',
      why: 'Pre-rendered pages load instantaneously with zero database query overhead on initial visitor page loads.',
      antiPattern: 'Avoid client-side heavy single page applications that download 2MB of JavaScript before rendering a paragraph.'
    };
  };

  const matrixRec = getMatrixRecommendation();

  return (
    <div className="section-padding">
      <div className="container">
        <div className="section-header" style={{ maxWidth: '800px' }}>
          <span className="section-eyebrow">Interactive Decision Playground</span>
          <h1 className="section-title">Practical diagnostic tools and scope calculators.</h1>
          <p className="section-subtitle">
            Experiment with project scope estimates, turnaround timelines, and architecture selection without submitting forms or booking sales calls.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'estimator' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('estimator')}
          >
            <Sliders size={16} />
            <span>Project Scope &amp; Budget Estimator</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'matrix' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('matrix')}
          >
            <Cpu size={16} />
            <span>Tech Stack Decision Matrix</span>
          </button>
        </div>

        {/* Tool 1: Project Scope Estimator */}
        {activeTab === 'estimator' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {/* Options Panel */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Configure Requirements</h2>

              <div className="form-group">
                <label className="form-label">Project Core Category</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${projectType === 'webapp' ? 'btn-accent' : 'btn-secondary'}`}
                    onClick={() => setProjectType('webapp')}
                  >
                    Full-Stack Web App
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${projectType === 'automation' ? 'btn-accent' : 'btn-secondary'}`}
                    onClick={() => setProjectType('automation')}
                  >
                    Workflow Automation
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${projectType === 'audit' ? 'btn-accent' : 'btn-secondary'}`}
                    onClick={() => setProjectType('audit')}
                  >
                    System Audit
                  </button>
                </div>
              </div>

              {projectType === 'webapp' && (
                <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <label className="form-label">System Modules &amp; Scope Layers</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.925rem' }}>
                      <input type="checkbox" checked={hasAuth} onChange={(e) => setHasAuth(e.target.checked)} />
                      <span>User Authentication &amp; Sessions</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.925rem' }}>
                      <input type="checkbox" checked={hasAdmin} onChange={(e) => setHasAdmin(e.target.checked)} />
                      <span>Administrative Management Dashboard</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.925rem' }}>
                      <input type="checkbox" checked={hasPayments} onChange={(e) => setHasPayments(e.target.checked)} />
                      <span>Payment Gateway / Checkout Processing</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.925rem' }}>
                      <input type="checkbox" checked={hasAutomations} onChange={(e) => setHasAutomations(e.target.checked)} />
                      <span>External Webhook &amp; CRM Integrations</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <label className="form-label">Target Delivery Pace</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${urgency === 'standard' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setUrgency('standard')}
                  >
                    Standard Iteration
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${urgency === 'express' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setUrgency('express')}
                  >
                    Priority Sprint (+30%)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div>
              <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '2.5rem', position: 'sticky', top: '100px', border: '1px solid var(--accent-cyan)' }}>
                <span className="badge badge-brand" style={{ marginBottom: '1rem' }}>Instant Scope Calculation</span>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Estimated Scope Investment
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-cyan)', lineHeight: 1.2 }}>
                    {formatCurrency(priceCents, 'INR')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <Clock size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Estimated Delivery Window: <strong>~{days} business days</strong></span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                  Includes architectural specification, database migrations, unit validation tests, custom Vanilla CSS design system, and 30 days of post-launch stabilization support.
                </div>

                <Link
                  href={`/contact?type=${projectType}&budget=${priceCents}&days=${days}`}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  <span>Initiate Scope Discussion</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tool 2: Tech Stack Decision Matrix */}
        {activeTab === 'matrix' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>Define System Constraints</h2>

              <div className="form-group">
                <label className="form-label">Workload Characteristic</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${workloadType === 'crud' ? 'btn-accent' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => setWorkloadType('crud')}
                  >
                    1. Standard CRUD / Business Portal / SaaS
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${workloadType === 'realtime' ? 'btn-accent' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => setWorkloadType('realtime')}
                  >
                    2. Real-Time Collaborative / WebSockets
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${workloadType === 'pipeline' ? 'btn-accent' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => setWorkloadType('pipeline')}
                  >
                    3. Heavy Background Pipeline / Batch Scraping
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${workloadType === 'content' ? 'btn-accent' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => setWorkloadType('content')}
                  >
                    4. Content Publishing / High Read Frequency
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <label className="form-label">Scale Stage</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${scaleTier === 'early' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setScaleTier('early')}
                  >
                    0 - 10k Monthly Users
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${scaleTier === 'growing' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setScaleTier('growing')}
                  >
                    10k - 500k Users
                  </button>
                </div>
              </div>
            </div>

            {/* Matrix Output */}
            <div>
              <div className="card" style={{ background: 'var(--bg-surface-elevated)', padding: '2.5rem' }}>
                <span className="badge badge-success" style={{ marginBottom: '1rem' }}>Architectural Verdict</span>

                <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
                  {matrixRec.stack}
                </h3>

                <div style={{ marginBottom: '1.25rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    Deployment &amp; Infrastructure
                  </strong>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {matrixRec.hosting}
                  </span>
                </div>

                <div style={{ marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', display: 'block', marginBottom: '0.25rem' }}>
                    Why this architecture?
                  </strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {matrixRec.why}
                  </p>
                </div>

                <div style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <AlertTriangle size={15} />
                    <span>Avoided Overengineering Pitfall</span>
                  </strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {matrixRec.antiPattern}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
