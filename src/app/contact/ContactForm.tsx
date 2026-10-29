'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, CheckCircle2, AlertCircle, HelpCircle, Mail } from 'lucide-react';

export default function ContactForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'Website or Software Project';
  const initialBudget = searchParams.get('budget');
  const initialDays = searchParams.get('days');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(
    initialType === 'webapp' ? 'Website or Software Project'
    : initialType === 'automation' ? 'Chatbot & Business Automation'
    : initialType === 'audit' ? 'Architecture Review'
    : 'Website or Software Project'
  );
  const [budgetRange, setBudgetRange] = useState(initialBudget ? `₹${Math.round(Number(initialBudget) / 100)}` : '');
  const [timeline, setTimeline] = useState(initialDays ? `~${initialDays} business days` : '');
  const [message, setMessage] = useState(
    initialBudget && initialDays
      ? `Hi, I ran the Scope Estimator for a ${category} (~${initialDays} days, estimate ₹${Math.round(Number(initialBudget) / 100)}). Here are my specific requirements:\n\n`
      : ''
  );

  // Honeypot field (hidden from genuine users)
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          category,
          budgetRange,
          timeline,
          message,
          honeypot
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Enquiry Successfully Recorded</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          Thank you for reaching out, <strong>{name}</strong>. Your message has been safely logged in our review queue. I review new enquiries every morning and will respond to <code>{email}</code>.
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setIsSuccess(false);
            setMessage('');
          }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Send a Direct Project Enquiry</h2>

      {errorMsg && (
        <div className="notice notice-warning" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Anti-spam honeypot hidden from view */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label>Leave this empty</label>
          <input
            type="text"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Your Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Topic or Service Area</label>
          <select
            className="input-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Website or Software Project">Website or Full-Stack Web Application</option>
            <option value="Chatbot & Business Automation">Workflow Automation &amp; Intelligent Bot</option>
            <option value="Technology Buying Consultation">Hardware &amp; Technology Buying Consultation</option>
            <option value="Architecture Review">Codebase Audit / Architecture Review</option>
            <option value="General Question">General Question / Dialogue</option>
            <option value="Feedback or Critique">Critique on an Article or Principle</option>
          </select>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Estimated Budget (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. ₹50,000 - ₹1,00,000"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Timeline (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 2-3 weeks / ASAP"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Your Message or Requirements *</label>
          <textarea
            className="input-textarea"
            rows={5}
            placeholder="Tell me what you are looking to build or solve. Feel free to include links, current pain points, or questions..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          disabled={isSubmitting}
        >
          <Send size={18} />
          <span>{isSubmitting ? 'Sending Enquiry...' : 'Transmit Enquiry'}</span>
        </button>
      </form>
    </div>
  );
}
