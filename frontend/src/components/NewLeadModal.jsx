import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  Tag,
  Compass,
  Zap
} from 'lucide-react';

export const NewLeadModal = ({ onClose, onAddLead, onImportCsv, onAiDiscover }) => {
  const [mode, setMode] = useState('ai_discover'); // 'ai_discover' | 'single' | 'csv'
  
  // Single lead state
  const [formData, setFormData] = useState({
    business_name: '',
    industry: 'Dental Healthcare',
    website: '',
    email: '',
    phone: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    auto_research: true
  });

  // AI Discovery state (Foreign & Domestic)
  const [discoverConfig, setDiscoverConfig] = useState({
    country: 'USA',
    industry: 'Dental Healthcare',
    count: 10,
    city: ''
  });

  const [csvFile, setCsvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    if (!formData.business_name || !formData.email) return;
    setIsSubmitting(true);
    await onAddLead(formData);
    setIsSubmitting(false);
    onClose();
  };

  const handleAiDiscover = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (onAiDiscover) {
      await onAiDiscover(discoverConfig);
    }
    setIsSubmitting(false);
    onClose();
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setIsSubmitting(true);
    const form = new FormData();
    form.append('file', csvFile);
    await onImportCsv(form);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '620px',
          padding: '28px',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              Add & Discover Leads
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              AI Autonomous discovery for foreign (USA, UK, UAE) and local clinics & businesses.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3-Way Tab Switch */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setMode('ai_discover')}
            className="btn btn-secondary"
            style={{
              background: mode === 'ai_discover' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              borderColor: mode === 'ai_discover' ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)',
              color: mode === 'ai_discover' ? '#818cf8' : 'var(--text-muted)',
              fontSize: '0.78rem'
            }}
          >
            <Sparkles size={14} color="#818cf8" />
            <span>AI Global Discovery</span>
          </button>
          <button
            onClick={() => setMode('single')}
            className="btn btn-secondary"
            style={{
              background: mode === 'single' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              borderColor: mode === 'single' ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)',
              color: mode === 'single' ? '#818cf8' : 'var(--text-muted)',
              fontSize: '0.78rem'
            }}
          >
            Single Lead
          </button>
          <button
            onClick={() => setMode('csv')}
            className="btn btn-secondary"
            style={{
              background: mode === 'csv' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              borderColor: mode === 'csv' ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)',
              color: mode === 'csv' ? '#818cf8' : 'var(--text-muted)',
              fontSize: '0.78rem'
            }}
          >
            <Upload size={14} />
            <span>CSV Import</span>
          </button>
        </div>

        {/* Mode 1: AI Global Discovery */}
        {mode === 'ai_discover' && (
          <form onSubmit={handleAiDiscover} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap size={15} color="#818cf8" />
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#c7d2fe' }}>
                  Autonomous Foreign & Domestic Business Generation
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Gemini will discover high-ticket prospects, evaluate pain points, assign opportunity scores (80-95), and auto-draft personalized cold pitches!
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Country</label>
                <select
                  className="form-input"
                  value={discoverConfig.country}
                  onChange={(e) => setDiscoverConfig({ ...discoverConfig, country: e.target.value })}
                >
                  <option value="India">🇮🇳 India (Restaurants, Clinics, Salons, Banquets)</option>
                  <option value="USA">🇺🇸 United States (USA)</option>
                  <option value="UK">🇬🇧 United Kingdom (UK)</option>
                  <option value="UAE">🇦🇪 United Arab Emirates (Dubai / UAE)</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Industry / Niche</label>
                <select
                  className="form-input"
                  value={discoverConfig.industry}
                  onChange={(e) => setDiscoverConfig({ ...discoverConfig, industry: e.target.value })}
                >
                  <option value="Restaurants & Cafes">🍽️ Restaurants & Cafes (Need Web & Order CRM)</option>
                  <option value="Dental Healthcare">🏥 Dental & Healthcare Clinics (Need Booking CRM)</option>
                  <option value="Salons & Wellness">💇 Salons & Spas (Need WhatsApp Funnels)</option>
                  <option value="Banquet & Event Spaces">🎪 Banquets & Events (Need Inquiries CRM)</option>
                  <option value="Cosmetic & Dermatology">✨ Cosmetic & Dermatology</option>
                  <option value="Luxury Real Estate">🏢 High-Ticket Real Estate</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target City (Optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Indore, Bhopal, Mumbai, Delhi, London"
                  value={discoverConfig.city}
                  onChange={(e) => setDiscoverConfig({ ...discoverConfig, city: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Leads Count to Discover</label>
                <select
                  className="form-input"
                  value={discoverConfig.count}
                  onChange={(e) => setDiscoverConfig({ ...discoverConfig, count: Number(e.target.value) })}
                >
                  <option value={5}>5 Verified Prospects</option>
                  <option value={10}>10 Verified Prospects</option>
                  <option value={20}>20 Verified Prospects</option>
                  <option value={50}>50 Leads (Daily Quota)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                <Sparkles size={16} />
                <span>{isSubmitting ? 'AI Finding & Scoring Leads...' : `Discover ${discoverConfig.count} ${discoverConfig.country} Leads`}</span>
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Single Lead Entry */}
        {mode === 'single' && (
          <form onSubmit={handleSubmitSingle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Business Name *</label>
              <input
                required
                className="form-input"
                placeholder="e.g. The Royal Grand Fine Dine"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Industry</label>
                <select
                  className="form-input"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  <option value="Restaurants & Cafes">🍽️ Restaurants & Cafes</option>
                  <option value="Dental Healthcare">🏥 Dental Healthcare</option>
                  <option value="Cosmetic & Dermatology">✨ Cosmetic & Dermatology</option>
                  <option value="Salons & Wellness">💇 Luxury Spa & Salon</option>
                  <option value="Banquet & Event Spaces">🎪 Banquets & Events</option>
                  <option value="Real Estate">🏢 Real Estate</option>
                  <option value="General Business">General Business</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>City / Location</label>
                <input
                  className="form-input"
                  placeholder="e.g. Indore / Bhopal / Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Decision Maker / Business Email *</label>
                <input
                  required
                  type="email"
                  className="form-input"
                  placeholder="contact@business.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone / WhatsApp</label>
                <input
                  className="form-input"
                  placeholder="+91 98260..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Website URL (Leave blank if business has NO website)</label>
              <input
                className="form-input"
                placeholder="https://example.in (Optional - Leave blank for No-Website pitch)"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                <Sparkles size={16} />
                <span>{isSubmitting ? 'Adding & Auditing...' : 'Add Lead & Trigger AI'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Mode 3: Batch CSV / Excel Import */}
        {mode === 'csv' && (
          <form onSubmit={handleCsvUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Priority Notice & Template Download */}
            <div style={{ padding: '12px 14px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#38bdf8' }}>
                  ⚡ Smart Manual Priority Queue
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  When you import manual leads, AI automatic discovery <strong>pauses</strong> until all manual leads are contacted.
                </div>
              </div>

              <a
                href="/api/leads/download-template"
                download="leovexa_leads_sample_template.csv"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap', textDecoration: 'none' }}
              >
                <span>📥 Download Demo Template</span>
              </a>
            </div>

            <div style={{
              border: '2px dashed rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 20px',
              textAlign: 'center',
              background: 'rgba(99, 102, 241, 0.04)'
            }}>
              <Upload size={32} color="#818cf8" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.88rem', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                Upload Lead List (.csv or Excel exported)
              </p>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Columns: <code>business_name</code>, <code>email</code>, <code>phone</code>, <code>city</code>, <code>industry</code>, <code>website</code> (Optional)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={!csvFile || isSubmitting} className="btn btn-primary">
                <Upload size={16} />
                <span>{isSubmitting ? 'Importing & Verifying...' : 'Upload & Process Manual Batch'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
