'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Download, CheckCircle2, AlertCircle, Database, ShieldCheck, CreditCard } from 'lucide-react';

interface SettingsManagerClientProps {
  initialSettings: Record<string, string>;
}

export default function SettingsManagerClient({ initialSettings }: SettingsManagerClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!res.ok) {
        throw new Error('Failed to update settings');
      }

      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Platform &amp; Business Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Configure site identity, payment gateway mode, and operational parameters.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary"
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved Changes!' : 'Save Settings'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="notice notice-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <div>Settings have been saved and applied across the platform.</div>
        </div>
      )}

      {errorMsg && (
        <div className="notice notice-warning" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
          {/* Site Identity */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Brand &amp; Site Identity</h2>

            <div className="form-group">
              <label className="form-label">Platform Site Title</label>
              <input
                type="text"
                className="form-control"
                value={settings.site_title || ''}
                onChange={(e) => handleChange('site_title', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline / Header Description</label>
              <input
                type="text"
                className="form-control"
                value={settings.site_tagline || ''}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operator Display Name</label>
              <input
                type="text"
                className="form-control"
                value={settings.owner_name || ''}
                onChange={(e) => handleChange('owner_name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Short Biography</label>
              <textarea
                className="input-textarea"
                rows={3}
                value={settings.owner_bio || ''}
                onChange={(e) => handleChange('owner_bio', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Public Availability Notice</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Taking select projects for Q4."
                value={settings.services_notice || ''}
                onChange={(e) => handleChange('services_notice', e.target.value)}
              />
            </div>
          </div>

          {/* Payment & Currency Configuration */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span>Payment Gateway &amp; Billing</span>
            </h2>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select
                className="input-select"
                value={settings.payment_mode || 'mock_sandbox'}
                onChange={(e) => handleChange('payment_mode', e.target.value)}
              >
                <option value="mock_sandbox">Mock Sandbox (Safe Test Mode - No Real Charges)</option>
                <option value="razorpay">Razorpay Gateway (Production / Live)</option>
                <option value="stripe">Stripe Checkout (Production / Live)</option>
              </select>
              <div className="form-help">
                Mock Sandbox provides instant simulation without merchant accounts. Switch to Razorpay or Stripe when your production credentials are ready.
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.currency || 'INR'}
                  onChange={(e) => handleChange('currency', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.currency_symbol || '₹'}
                  onChange={(e) => handleChange('currency_symbol', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <label className="form-label">Contact &amp; Operations Email</label>
              <input
                type="email"
                className="form-control"
                value={settings.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                className="form-control"
                value={settings.github_url || ''}
                onChange={(e) => handleChange('github_url', e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Database Backup Section */}
      <div className="card" style={{ padding: '2rem', background: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: 'var(--accent-emerald)' }} />
            <span>SQLite Database Snapshot &amp; Backup</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Download an exact, byte-for-byte binary copy of the active <code>platform.db</code> database including all posts, orders, enquiries, and settings.
          </p>
        </div>

        <a href="/api/admin/backup" className="btn btn-secondary">
          <Download size={16} />
          <span>Download Database Snapshot (.db)</span>
        </a>
      </div>
    </div>
  );
}
