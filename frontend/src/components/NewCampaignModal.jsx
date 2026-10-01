import React, { useState } from 'react';
import {
  X,
  Target,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const NewCampaignModal = ({ onClose, onCreateCampaign }) => {
  const [formData, setFormData] = useState({
    name: 'Indore Dental Clinics Campaign',
    industry: 'Dental Healthcare',
    location: 'Indore',
    daily_limit: 20,
    ai_provider: 'hybrid',
    require_approval: true,
    follow_ups_enabled: true,
    service_offering: 'Modern high-converting dental clinic website with automated 24/7 patient appointment booking & WhatsApp CRM reminders.'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onCreateCampaign(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '26px',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              Create Outreach Campaign
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Configure AI qualification, daily pacing, and multi-touch sequence.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Campaign Name *</label>
            <input
              required
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Industry</label>
              <input
                required
                className="form-input"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Location</label>
              <input
                required
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Daily Sending Limit</label>
              <input
                type="number"
                min="1"
                max="200"
                className="form-input"
                value={formData.daily_limit}
                onChange={(e) => setFormData({ ...formData, daily_limit: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>AI Engine Provider</label>
              <select
                className="form-input"
                value={formData.ai_provider}
                onChange={(e) => setFormData({ ...formData, ai_provider: e.target.value })}
              >
                <option value="hybrid">Gemini (Primary) + OpenRouter Fallback</option>
                <option value="gemini">Gemini Only</option>
                <option value="openrouter">OpenRouter Only</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Core Offer / Leovexa Value Proposition</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.service_offering}
              onChange={(e) => setFormData({ ...formData, service_offering: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.require_approval}
                onChange={(e) => setFormData({ ...formData, require_approval: e.target.checked })}
              />
              <span><strong>Require Human Approval</strong> (Mandatory review before sending cold emails)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.follow_ups_enabled}
                onChange={(e) => setFormData({ ...formData, follow_ups_enabled: e.target.checked })}
              />
              <span><strong>Automated Follow-ups</strong> (Day 3 & Day 7 sequences if no reply detected)</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Target size={16} />
              <span>{isSubmitting ? 'Creating...' : 'Launch Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
