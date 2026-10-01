import React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  CheckCircle2,
  Inbox,
  Kanban,
  Settings,
  BookOpen,
  Sparkles,
  Zap,
  Bot
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, counts = {} }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'post_ingestor', label: 'AI Post & Pitch Pitcher', icon: Sparkles, badge: 'NEW', alert: false },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'leads', label: 'Leads & Discovery', icon: Users, badge: counts.leads },
    { id: 'approvals', label: 'Approval Queue', icon: CheckCircle2, badge: counts.pending, alert: counts.pending > 0 },
    { id: 'inbox', label: 'Inbox & AI Replies', icon: Inbox, badge: counts.replies },
    { id: 'pipeline', label: 'Deals Pipeline', icon: Kanban },
    { id: 'guide', label: 'API Setup Guide', icon: BookOpen },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              LEOVEXA
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="pulse-dot" style={{ background: '#10b981' }}></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Outreach Agent
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ padding: '4px 12px 8px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700', letterSpacing: '0.08em' }}>
          Core CRM Engine
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.18), rgba(139, 92, 246, 0.08))' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? '#818cf8' : 'currentColor'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: item.alert ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  boxShadow: item.alert ? '0 0 10px rgba(244, 63, 94, 0.4)' : 'none'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Telemetry Badge */}
      <div style={{ padding: '16px', margin: '12px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Bot size={16} color="#818cf8" />
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#c7d2fe' }}>AI Architecture</span>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Gemini 1.5 Flash <span style={{ color: '#10b981' }}>● Active</span><br />
          OpenRouter <span style={{ color: '#06b6d4' }}>● Standby</span>
        </p>
      </div>
    </aside>
  );
};
