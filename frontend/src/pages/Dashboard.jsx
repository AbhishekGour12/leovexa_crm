import React from 'react';
import {
  Users,
  Target,
  Send,
  MessageSquare,
  CheckCircle2,
  Trophy,
  Flame,
  ArrowUpRight,
  Sparkles,
  Bot,
  Zap,
  TrendingUp
} from 'lucide-react';

export const Dashboard = ({ data = {}, onSelectLead, onOpenApprovals, onOpenCampaigns, onSeedDemo, onAiDiscover, onOpenNewLead }) => {
  const metrics = data.metrics || {};
  const hotLeads = data.hotLeads || [];
  const aiLogs = data.aiLogs || {};

  const statCards = [
    { label: 'Total Leads Discovered', value: metrics.totalLeads || 0, icon: Users, color: '#6366f1', sub: `${metrics.qualificationRate || 0}% Qualified` },
    { label: 'Qualified Leads', value: metrics.qualifiedLeads || 0, icon: Sparkles, color: '#10b981', sub: 'Audited by Gemini' },
    { label: 'Pending Human Approvals', value: metrics.pendingApprovals || 0, icon: CheckCircle2, color: '#f59e0b', sub: 'Ready for Review', alert: (metrics.pendingApprovals || 0) > 0, onClick: onOpenApprovals },
    { label: 'Outreach Contacted', value: metrics.contactedLeads || 0, icon: Send, color: '#06b6d4', sub: 'Dispatched via Gmail' },
    { label: 'Inbound Replies', value: metrics.repliesCount || 0, icon: MessageSquare, color: '#8b5cf6', sub: `${metrics.replyRate || 0}% Reply Rate` },
    { label: 'Deals Won & Closed', value: `₹${(metrics.totalRevenueWon || 0).toLocaleString('en-IN')}`, icon: Trophy, color: '#ec4899', sub: `${metrics.wonCount || 0} Closed Clients` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-high" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
              Autonomous Growth Engine Active
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MongoDB Atlas Connected</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.01em' }}>
            Leovexa AI Outreach Command Center
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '650px' }}>
            Automated Discovery → Web Audit → Gemini Scoring → Cold Pitch Generation → Human Approval → Gmail Dispatch → Telegram Alerts.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              onClick={() => onAiDiscover({ country: 'India', industry: 'Restaurants & Cafes', count: 10 })}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '7px 14px', background: 'linear-gradient(135deg, #d97706, #b45309)' }}
              title="Target Indian Restaurants, Cafes & Clinics with No Website / Needing CRM Automation"
            >
              <span>🇮🇳 +10 Indian (No Website)</span>
            </button>
            <button
              onClick={() => onAiDiscover({ country: 'USA', industry: 'Dental Healthcare', count: 10 })}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '7px 14px', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
              title="Generate 10 verified US Dental & Medical Clinics with AI Cold Pitches"
            >
              <span>🇺🇸 +10 USA Clinics</span>
            </button>
            <button
              onClick={() => onAiDiscover({ country: 'UK', industry: 'Cosmetic & Dermatology', count: 10 })}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '7px 14px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              title="Generate 10 verified UK Aesthetic & Dermatology Clinics"
            >
              <span>🇬🇧 +10 UK Clinics</span>
            </button>
            <button
              onClick={() => onAiDiscover({ country: 'UAE', industry: 'Luxury Real Estate', count: 10 })}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '7px 14px', background: 'linear-gradient(135deg, #059669, #047857)' }}
              title="Generate 10 Dubai Luxury Real Estate & Villa Developers"
            >
              <span>🇦🇪 +10 Dubai Leads</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="/api/leads/download-template"
              download="leovexa_leads_sample_template.csv"
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>📥 Sample Excel Template</span>
            </a>
            <button onClick={onSeedDemo} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              <Sparkles size={14} color="#818cf8" />
              <span>Seed India Leads</span>
            </button>
            <button onClick={onOpenCampaigns} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              <Target size={14} />
              <span>50/Day Auto-Pilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card-interactive"
              onClick={card.onClick}
              style={{
                padding: '20px',
                cursor: card.onClick ? 'pointer' : 'default',
                borderColor: card.alert ? 'rgba(245, 158, 11, 0.4)' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  {card.label}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${card.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: card.alert ? '#fbbf24' : 'var(--text-dim)', fontWeight: '600' }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Section: Hot Leads & AI Engine Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Hot Leads Table */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#f43f5e" />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                Top Rated Hot Leads (Score 75+)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              High conversion probability
            </span>
          </div>

          {hotLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No hot leads yet. Click <strong>"Seed Demo Leads"</strong> above to load authentic prospects.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hotLeads.map((lead) => (
                <div
                  key={lead._id}
                  onClick={() => onSelectLead(lead)}
                  className="glass-card-interactive"
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                        {lead.business_name}
                      </span>
                      <span className="badge badge-high" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                        {lead.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {lead.industry} • {lead.city || 'Indore'} • {lead.email}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="score-pill score-80" style={{ fontSize: '0.82rem' }}>
                      {lead.lead_score}/100
                    </span>
                    <ArrowUpRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI & Automation Architecture Telemetry */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bot size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
              AI Telemetry & Fallback Engine
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gemini Free API (Primary)</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981' }}>{aiLogs.gemini || 0} calls</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: '#10b981' }}></div>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OpenRouter (Fallback)</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#06b6d4' }}>{aiLogs.openrouter || 0} calls</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '15%', height: '100%', background: '#06b6d4' }}></div>
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c7d2fe', marginBottom: '4px' }}>
                Telegram Bot Integration
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Bot triggers real-time alerts when score &ge; 80 and accepts inline one-click dispatch approvals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
