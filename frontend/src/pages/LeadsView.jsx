import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Upload,
  Globe,
  Sparkles,
  Flame,
  ArrowRight,
  ExternalLink,
  Trash2,
  RefreshCw,
  Eye
} from 'lucide-react';

export const LeadsView = ({ leads = [], onSelectLead, onOpenNewLead, onTriggerResearch, onDeleteLead, onSeedDemo, onAiDiscover }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [websiteFilter, setWebsiteFilter] = useState('ALL'); // 'ALL' | 'NO_WEBSITE' | 'HAS_WEBSITE' | 'MANUAL'
  const [minScore, setMinScore] = useState(0);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.business_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.industry || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesScore = (lead.lead_score || 0) >= minScore;
    const matchesWebsite = 
      websiteFilter === 'ALL' ? true :
      websiteFilter === 'NO_WEBSITE' ? (!lead.website || lead.website.trim() === '') :
      websiteFilter === 'MANUAL' ? (lead.source === 'MANUAL_IMPORT' || lead.source === 'CSV Import') :
      Boolean(lead.website);

    return matchesSearch && matchesStatus && matchesScore && matchesWebsite;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '720px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search business, email, city (Indore, Bhopal)..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Website Filter */}
          <select
            className="form-input"
            style={{ width: '160px' }}
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
          >
            <option value="ALL">All Prospects</option>
            <option value="NO_WEBSITE">🌐 No Website (High Opp.)</option>
            <option value="MANUAL">👤 Manual Leads (Priority)</option>
            <option value="HAS_WEBSITE">💻 Has Website</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-input"
            style={{ width: '140px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PENDING_APPROVAL">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="CONTACTED">Contacted</option>
            <option value="REPLIED">Replied</option>
            <option value="MEETING">Meeting</option>
            <option value="WON">Won</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="/api/leads/download-template"
            download="leovexa_leads_sample_template.csv"
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Upload size={14} />
            <span>📥 Download Excel Template</span>
          </a>
          <button onClick={onOpenNewLead} className="btn btn-primary" style={{ fontSize: '0.84rem' }}>
            <Plus size={16} />
            <span>Add / Import Leads</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Business Name</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Industry & City</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Opportunity Score</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>AI Audit Summary</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    No leads match your filter. Click <strong>"Seed Demo Leads"</strong> or <strong>"Add Lead"</strong> to get started!
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const score = lead.lead_score || 0;
                  const scoreClass = score >= 80 ? 'score-80' : score >= 60 ? 'score-60' : score >= 40 ? 'score-40' : 'score-low';
                  return (
                    <tr
                      key={lead._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Business */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>
                          {lead.business_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>{lead.email}</span>
                          {lead.website && (
                            <a
                              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}
                            >
                              <Globe size={11} />
                              <span>web</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Industry */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: '600' }}>
                          {lead.industry || 'General'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {lead.city || 'Indore'}, {lead.country || 'India'}
                        </div>
                      </td>

                      {/* Score */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`score-pill ${scoreClass}`} style={{ fontSize: '0.8rem' }}>
                            {score}/100
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {lead.score_category || 'REVIEW'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${score >= 80 ? 'badge-high' : score >= 60 ? 'badge-qualified' : 'badge-low'}`}>
                          {lead.status}
                        </span>
                      </td>

                      {/* AI Audit Snippet */}
                      <td style={{ padding: '14px 20px', maxWidth: '280px' }}>
                        <p style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                          lineHeight: '1.4',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {lead.analysis?.ai_summary || 'Analysis pending or not audited.'}
                        </p>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            title="View full AI digital audit & cold pitch"
                          >
                            <Eye size={13} />
                            <span>Audit</span>
                          </button>
                          <button
                            onClick={() => onTriggerResearch(lead._id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            title="Re-run Gemini Scraping & Scoring"
                          >
                            <RefreshCw size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteLead(lead._id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 8px', fontSize: '0.75rem', color: '#fb7185' }}
                            title="Delete Lead"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
