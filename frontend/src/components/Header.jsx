import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Plus,
  Flame,
  Search,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const Header = ({ title, subtitle, onOpenNewLead, onOpenNewCampaign, onSeedDemo, notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Seed Demo Button */}
        <button
          onClick={onSeedDemo}
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          title="Preload authentic verified clinic & business leads with full AI research"
        >
          <Sparkles size={15} color="#818cf8" />
          <span>Seed Demo Leads</span>
        </button>

        {/* Quick Add Lead */}
        <button
          onClick={onOpenNewLead}
          className="btn btn-primary"
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          <Plus size={16} />
          <span>Add Lead</span>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#f43f5e',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(244, 63, 94, 0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '360px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '16px',
                zIndex: 50,
                background: '#0d1322',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700' }}>Live Notifications & Alerts</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{notifications.length} total</span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.84rem' }}>
                  No new notifications
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map((n, idx) => (
                    <div
                      key={n._id || idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: n.type === 'HOT_LEAD' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: n.type === 'HOT_LEAD' ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {n.type === 'HOT_LEAD' && <Flame size={14} color="#f43f5e" />}
                        {n.type === 'REPLY_RECEIVED' && <CheckCircle2 size={14} color="#10b981" />}
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: n.type === 'HOT_LEAD' ? '#fb7185' : '#fff' }}>
                          {n.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
