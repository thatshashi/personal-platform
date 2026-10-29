'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface ServiceEditorProps {
  initialService?: any;
}

export default function ServiceEditor({ initialService }: ServiceEditorProps) {
  const router = useRouter();

  const [name, setName] = useState(initialService?.name || '');
  const [slug, setSlug] = useState(initialService?.slug || '');
  const [description, setDescription] = useState(initialService?.description || '');
  const [category, setCategory] = useState(initialService?.category || 'Development');
  const [pricingModel, setPricingModel] = useState(initialService?.pricing_model || 'fixed');
  const [priceRupees, setPriceRupees] = useState(
    initialService ? Math.round(initialService.price_cents / 100).toString() : '25000'
  );
  const [currency, setCurrency] = useState(initialService?.currency || 'INR');
  const [estimatedDays, setEstimatedDays] = useState(initialService?.estimated_days?.toString() || '14');
  const [deliverables, setDeliverables] = useState(
    initialService?.deliverables_json ? JSON.parse(initialService.deliverables_json).join('\n') : ''
  );
  const [exclusions, setExclusions] = useState(
    initialService?.exclusions_json ? JSON.parse(initialService.exclusions_json).join('\n') : ''
  );
  const [requiredInfoPrompt, setRequiredInfoPrompt] = useState(initialService?.required_info_prompt || '');
  const [termsNotes, setTermsNotes] = useState(initialService?.terms_notes || '');
  const [active, setActive] = useState(initialService ? Boolean(initialService.active) : true);
  const [featured, setFeatured] = useState(initialService ? Boolean(initialService.featured) : false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !description.trim() || !category.trim()) {
      setErrorMsg('Name, description, and category are required.');
      return;
    }

    setIsSaving(true);
    try {
      const priceCents = pricingModel === 'custom_quote' ? 0 : Math.round(Number(priceRupees) * 100);

      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialService?.id,
          name,
          slug,
          description,
          category,
          pricingModel,
          priceCents,
          currency,
          estimatedDays: Number(estimatedDays) || 7,
          deliverables,
          exclusions,
          requiredInfoPrompt,
          termsNotes,
          active,
          featured
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save service');
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving service');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/admin/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Services</span>
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary"
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : initialService ? 'Update Service' : 'Create Service'}</span>
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
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Service Identity &amp; Pricing</h2>

            <div className="form-group">
              <label className="form-label">Service Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Full-Stack Web Application / MVP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Custom Slug (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. web-app-architecture-and-build"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Development, Automation, Consultation"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pricing Model</label>
              <select
                className="input-select"
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
              >
                <option value="fixed">Fixed-Price Deliverable</option>
                <option value="custom_quote">Custom Project (Request Quote)</option>
                <option value="consultation">Time-Boxed Consultation</option>
                <option value="digital">Digital Product</option>
                <option value="experimental">Experimental Offering</option>
              </select>
            </div>

            {pricingModel !== 'custom_quote' && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Price ({currency}) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="25000"
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="input-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Estimated Delivery Turnaround (Days)</label>
              <input
                type="number"
                className="form-control"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <span>Active for Purchase</span>
              </label>

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
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Scope, Terms &amp; Prompts</h2>

            <div className="form-group">
              <label className="form-label">Summary Description *</label>
              <textarea
                className="input-textarea"
                rows={3}
                placeholder="High level overview of what this service delivers and who it is for."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Included Deliverables (One per line)</label>
              <textarea
                className="input-textarea"
                rows={4}
                placeholder="Complete full-stack Next.js app&#10;SQLite ACID database&#10;Vanilla CSS design tokens"
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Explicit Exclusions (One per line)</label>
              <textarea
                className="input-textarea"
                rows={3}
                placeholder="Third-party cloud infrastructure subscription fees&#10;Unbounded scope changes after spec approval"
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Customer Information Prompt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Describe your current manual workflow and primary goals..."
                value={requiredInfoPrompt}
                onChange={(e) => setRequiredInfoPrompt(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Terms &amp; Cancellation Notes</label>
              <textarea
                className="input-textarea"
                rows={2}
                placeholder="50% deposit to initiate. Revisions covered within agreed functional specification."
                value={termsNotes}
                onChange={(e) => setTermsNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
