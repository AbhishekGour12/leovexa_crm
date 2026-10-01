import React, { useState } from 'react';
import {
  X,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Flame,
  CheckCircle,
  AlertTriangle,
  Send,
  MessageSquare,
  Bot,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const LeadDrawer = ({ lead, analysis, messages = [], onClose, onTriggerResearch, onSimulateReply, onApproveMessage }) => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'pitch' | 'activity'
  const [customReply, setCustomReply] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  if (!lead) return null;

  const handleSimulate = async () => {
    setIsSimulating(true);
    await onSimulateReply(lead._id, customReply || undefined);
    setIsSimulating(false);
    setCustomReply('');
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    await onTriggerResearch(lead._id);
    setIsAuditing(false);
  };

  const score = lead.lead_score || 0;
  const scoreClass = score >= 80 ? 'score-80' : score >= 60 ? 'score-60' : score >= 40 ? 'score-40' : 'score-low';

  const initialPitch = messages.find(m => m.type === 'INITIAL');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '700px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff' }}>
                {lead.business_name}
              </h3>
              <span className={`score-pill ${scoreClass}`}>
                {score}/100
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} color="#818cf8" />
                {lead.city || 'Indore'}, {lead.country || 'India'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} color="#818cf8" />
                {lead.email}
              </span>
              {lead.website && (
                <a
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06b6d4', textDecoration: 'none' }}
                >
                  <Globe size={14} />
                  {lead.website.replace(/^https?:\/\//, '')}
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('audit')}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              background: activeTab === 'audit' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              borderColor: activeTab === 'audit' ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
              color: activeTab === 'audit' ? '#818cf8' : 'var(--text-muted)'
            }}
          >
            <Bot size={15} />
            <span>AI Digital Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              background: activeTab === 'pitch' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              borderColor: activeTab === 'pitch' ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
              color: activeTab === 'pitch' ? '#818cf8' : 'var(--text-muted)'
            }}
          >
            <Send size={15} />
            <span>Cold Pitch Draft</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              background: activeTab === 'activity' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              borderColor: activeTab === 'activity' ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
              color: activeTab === 'activity' ? '#818cf8' : 'var(--text-muted)'
            }}
          >
            <MessageSquare size={15} />
            <span>Simulate Reply & Alerts</span>
          </button>
        </div>

        {/* Tab 1: AI Audit */}
        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* AI Summary Box */}
            <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.07)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="#818cf8" />
                  Gemini Qualification Executive Summary
                </span>
                <button
                  onClick={handleAudit}
                  disabled={isAuditing}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <RefreshCw size={12} className={isAuditing ? 'pulse-dot' : ''} />
                  <span>{isAuditing ? 'Re-auditing...' : 'Re-Audit Lead'}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                {analysis?.ai_summary || lead.analysis?.ai_summary || 'Analysis running or pending...'}
              </p>
            </div>

            {/* Matrix Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Website Quality</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', marginTop: '4px', color: '#fff' }}>
                  {analysis?.website_quality || 'None'}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Online Booking</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', marginTop: '4px', color: analysis?.booking_available ? '#10b981' : '#f43f5e' }}>
                  {analysis?.booking_available ? 'Available' : 'Missing (Opportunity)'}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WhatsApp Funnel</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', marginTop: '4px', color: analysis?.whatsapp_available ? '#10b981' : '#f59e0b' }}>
                  {analysis?.whatsapp_available ? 'Active' : 'Unoptimized'}
                </div>
              </div>
            </div>

            {/* Pain Points */}
            <div>
              <h5 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Observed Client Pain Points
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(analysis?.pain_points || lead.analysis?.pain_points || ['No automated booking workflow', 'High inquiry drop-off rate']).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#fca5a5' }}>
                    <AlertTriangle size={14} color="#f87171" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Services */}
            <div>
              <h5 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Recommended Leovexa Pitch Package
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(analysis?.recommended_services || lead.analysis?.recommended_services || ['Modern Website Redesign', 'AI Booking CRM', 'WhatsApp Lead Nurture']).map((s, i) => (
                  <span key={i} className="badge badge-intent">
                    <CheckCircle size={12} color="#818cf8" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cold Pitch Draft & Follow-up Sequence */}
        {activeTab === 'pitch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Step 1: Initial Pitch */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>1</span>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff' }}>Step 1: Day 0 Initial Value Pitch</span>
                </div>
                {initialPitch && (
                  <span className="badge" style={{ background: initialPitch.status === 'SENT' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: initialPitch.status === 'SENT' ? '#34d399' : '#fbbf24' }}>
                    {initialPitch.status}
                  </span>
                )}
              </div>

              {initialPitch ? (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}><strong>Subject:</strong> {initialPitch.subject}</div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                    {initialPitch.content}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Initial cold pitch not generated yet.</div>
              )}
            </div>

            {/* Step 2: Day 3 Automated Follow-up */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0ea5e9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>2</span>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff' }}>Step 2: Day 3 Automated Value Bump & Booking Flow</span>
                </div>
                {messages.find(m => m.type === 'FOLLOWUP_1') ? (
                  <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>SENT</span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>SCHEDULED (Day 3)</span>
                )}
              </div>

              {messages.find(m => m.type === 'FOLLOWUP_1') ? (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}><strong>Subject:</strong> {messages.find(m => m.type === 'FOLLOWUP_1').subject}</div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                    {messages.find(m => m.type === 'FOLLOWUP_1').content}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Auto-sends 3 days after initial pitch if client hasn't replied yet.
                  </span>
                  <button
                    onClick={async () => {
                      const res = await api.triggerManualFollowup(lead._id, 'FOLLOWUP_1');
                      alert(res.message || 'Follow-up 1 queued!');
                      if (onClose) onClose();
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.76rem', padding: '6px 12px' }}
                  >
                    <Send size={12} />
                    <span>⚡ Send Day 3 Now</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Day 7 Final Follow-up */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>3</span>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff' }}>Step 3: Day 7 Final Breakup / Portfolio Case Study</span>
                </div>
                {messages.find(m => m.type === 'FOLLOWUP_2') ? (
                  <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>SENT</span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>SCHEDULED (Day 7)</span>
                )}
              </div>

              {messages.find(m => m.type === 'FOLLOWUP_2') ? (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}><strong>Subject:</strong> {messages.find(m => m.type === 'FOLLOWUP_2').subject}</div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                    {messages.find(m => m.type === 'FOLLOWUP_2').content}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Auto-sends 7 days after initial outreach as a final courteous touchpoint.
                  </span>
                  <button
                    onClick={async () => {
                      const res = await api.triggerManualFollowup(lead._id, 'FOLLOWUP_2');
                      alert(res.message || 'Follow-up 2 queued!');
                      if (onClose) onClose();
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.76rem', padding: '6px 12px' }}
                  >
                    <Send size={12} />
                    <span>⚡ Send Day 7 Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Simulate Reply */}
        {activeTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <h5 style={{ fontSize: '0.86rem', fontWeight: '700', color: '#67e8f9', marginBottom: '6px' }}>
                Simulate Inbound Prospect Reply
              </h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Test the Gemini Reply Classifier, automatic status update, and instant Telegram Bot notification!
              </p>
              <textarea
                className="form-input"
                rows={3}
                placeholder="E.g.: 'Yes, we are interested in upgrading our clinic booking system. Please share your portfolio and pricing.'"
                value={customReply}
                onChange={(e) => setCustomReply(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <Sparkles size={16} />
                <span>{isSimulating ? 'Processing AI Reply...' : 'Simulate Inbound Reply & Trigger Alert'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
