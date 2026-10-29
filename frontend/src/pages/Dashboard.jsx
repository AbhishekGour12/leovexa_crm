import React, { useState } from 'react';
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
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  Activity,
  AlertCircle,
  ArrowDownRight,
  RefreshCw,
  Mail,
  ShieldCheck,
  Layers,
  Globe,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const Dashboard = ({
  data = {},
  onSelectLead,
  onOpenApprovals,
  onOpenCampaigns,
  onSeedDemo,
  onAiDiscover,
  onOpenNewLead,
  onTriggerDailyLeads
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('TODAY'); // 'TODAY' | 'YESTERDAY' | '7DAYS' | 'ALL'
  const [analyticsSubView, setAnalyticsSubView] = useState('funnel'); // 'funnel' | 'breakdown' | 'sources'

  const metrics = data.metrics || {};
  const daily = data.daily || {};
  const today = daily.today || {
    scraped: { total: 0, leads: 0, jobs: 0, target: 50, progress: 0 },
    live: { total: 0, leads: 0, pitches: 0, target: 30, progress: 0 },
    outreach: { sent: 0, delivered: 0, failed: 0, replies: 0, deliveryRate: 100, target: 20, progress: 0 }
  };
  const yesterday = daily.yesterday || {
    totalScraped: 0,
    totalLive: 0,
    outreachSent: 0,
    delivered: 0,
    replies: 0
  };
  const past7Days = daily.past7Days || [];
  const funnel = data.funnel || {};
  const sourceBreakdown = data.sourceBreakdown || {};
  const statusBreakdown = data.statusBreakdown || {};
  const recentActivity = data.recentActivity || [];
  const engineHealth = data.engineHealth || {};
  const hotLeads = data.hotLeads || [];
  const aiLogs = data.aiLogs || {};

  // Lifetime Top Cards
  const statCards = [
    {
      label: 'Total Leads Scraped & Discovered',
      value: (metrics.totalLeads || 0).toLocaleString(),
      icon: Users,
      color: '#6366f1',
      sub: `${metrics.qualificationRate || 0}% Qualified by AI`
    },
    {
      label: 'Audited & Qualified (60+)',
      value: (metrics.qualifiedLeads || 0).toLocaleString(),
      icon: Sparkles,
      color: '#10b981',
      sub: 'Digital Footprint Verified'
    },
    {
      label: 'Pending Human Approvals',
      value: metrics.pendingApprovals || 0,
      icon: CheckCircle2,
      color: '#f59e0b',
      sub: (metrics.pendingApprovals || 0) > 0 ? 'Requires One-Click Review' : 'Queue Cleared',
      alert: (metrics.pendingApprovals || 0) > 0,
      onClick: onOpenApprovals
    },
    {
      label: 'Outreach Contacted',
      value: (metrics.contactedLeads || 0).toLocaleString(),
      icon: Send,
      color: '#06b6d4',
      sub: 'Dispatched via Gmail SMTP'
    },
    {
      label: 'Inbound Replies Received',
      value: metrics.repliesCount || 0,
      icon: MessageSquare,
      color: '#8b5cf6',
      sub: `${metrics.replyRate || 0}% Reply Conversion`
    },
    {
      label: 'Deals Won & Closed',
      value: `₹${(metrics.totalRevenueWon || 0).toLocaleString('en-IN')}`,
      icon: Trophy,
      color: '#ec4899',
      sub: `${metrics.wonCount || 0} Clients Closed Won`
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Control Hub */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ zIndex: 2, maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-high" style={{
              background: 'rgba(99, 102, 241, 0.25)',
              color: '#c7d2fe',
              borderColor: 'rgba(99, 102, 241, 0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              fontSize: '0.78rem'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              24/7 Autonomous Scraper & Outreach Active
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color="#818cf8" />
              Pacing: Every {engineHealth.pacingInterval || '25s'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Daily Pipeline Command & Analytics
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>
            Real-time status of <b>daily scraped prospects</b>, <b>live approved outreach</b>, and <b>email delivery analytics</b>.
          </p>
        </div>

        {/* Quick Trigger Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 2, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {onTriggerDailyLeads && (
              <button
                onClick={onTriggerDailyLeads}
                className="btn btn-primary"
                style={{
                  fontSize: '0.82rem',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={15} />
                <span>Fetch Daily 40 Leads</span>
              </button>
            )}

            <button
              onClick={() => onAiDiscover && onAiDiscover({ country: 'India', industry: 'Restaurants & Cafes', count: 10 })}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '7px 12px', borderColor: 'rgba(217, 119, 6, 0.5)' }}
              title="Target Indian local businesses with No Website"
            >
              <span>🇮🇳 +10 Indian No-Website</span>
            </button>

            <button
              onClick={() => onAiDiscover && onAiDiscover({ country: 'USA', industry: 'Dental Healthcare', count: 10 })}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '7px 12px', borderColor: 'rgba(2, 132, 199, 0.5)' }}
            >
              <span>🇺🇸 +10 USA Clinics</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={onSeedDemo} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              <RefreshCw size={13} color="#818cf8" />
              <span>Seed Authentic Leads</span>
            </button>
            <button onClick={onOpenCampaigns} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              <Target size={13} />
              <span>Pacing & Campaigns</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          🔥 SECTION 1: TODAY'S GRANULAR EXECUTION STATUS (AAJ KA EXACT STATUS)
          Data Scrape Kara | Live Kara | Outreach Successful Emails & Replies
         ========================================================================= */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#10b981" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              Today's Live Execution Telemetry (आज का स्टेटस)
            </h2>
            <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '700' }}>
              TODAY • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Daily Target: <b>50 Scraped</b> • <b>30 Live</b> • <b>20 Outreach</b>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
          {/* 1. TODAY'S SCRAPED DATA */}
          <div
            className="glass-panel"
            style={{
              padding: '22px',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.75) 100%)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Data Scraped Today (आज स्क्रैप करा)
                </span>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
                  {today.scraped?.total || 0}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '6px' }}>
                    / {today.scraped?.target || 50} target
                  </span>
                </h3>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={22} color="#818cf8" />
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                <span>Daily Scrape Quota</span>
                <span style={{ color: '#818cf8', fontWeight: '700' }}>{today.scraped?.progress || 0}% Completed</span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, today.scraped?.progress || 0)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>

            {/* Granular Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CRM Business Leads</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>{today.scraped?.leads || 0}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Greenhouse Jobs</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#38bdf8' }}>{today.scraped?.jobs || 0}</div>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Yesterday Scraped: <b>{yesterday.totalScraped || 0}</b></span>
              <span style={{ color: (today.scraped?.total || 0) >= (yesterday.totalScraped || 0) ? '#34d399' : '#fbbf24' }}>
                {(today.scraped?.total || 0) >= (yesterday.totalScraped || 0) ? '▲ Ahead of yesterday' : '▼ Catching up'}
              </span>
            </div>
          </div>

          {/* 2. TODAY'S LIVE & APPROVED DATA */}
          <div
            className="glass-panel"
            style={{
              padding: '22px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.75) 100%)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Pushed Live & Approved (आज कितना लाइव करा)
                </span>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
                  {today.live?.total || 0}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '6px' }}>
                    / {today.live?.target || 30} target
                  </span>
                </h3>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={22} color="#34d399" />
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                <span>Daily Live Target</span>
                <span style={{ color: '#34d399', fontWeight: '700' }}>{today.live?.progress || 0}% Live</span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, today.live?.progress || 0)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>

            {/* Granular Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Leads Live in Pipeline</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>{today.live?.leads || 0}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pitches Approved</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10b981' }}>{today.live?.pitches || 0}</div>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending Human Review: <b>{metrics.pendingApprovals || 0}</b></span>
              <span style={{ color: '#34d399', cursor: 'pointer', textDecoration: 'underline' }} onClick={onOpenApprovals}>
                Review Queue →
              </span>
            </div>
          </div>

          {/* 3. TODAY'S OUTREACH & EMAIL DELIVERY */}
          <div
            className="glass-panel"
            style={{
              padding: '22px',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.75) 100%)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Outreach & Email Delivery (आउटरीच & ईमेल)
                </span>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
                  {today.outreach?.sent || 0}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '6px' }}>
                    Sent ({today.outreach?.deliveryRate || 100}% Success)
                  </span>
                </h3>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Send size={22} color="#38bdf8" />
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                <span>Daily Outreach Target</span>
                <span style={{ color: '#38bdf8', fontWeight: '700' }}>{today.outreach?.progress || 0}% Dispatched</span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, today.outreach?.progress || 0)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>

            {/* Granular Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '6px 8px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Delivered</div>
                <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#10b981' }}>{today.outreach?.delivered || 0}</div>
              </div>
              <div style={{ padding: '6px 8px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Replies</div>
                <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#a855f7' }}>{today.outreach?.replies || 0}</div>
              </div>
              <div style={{ padding: '6px 8px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Failed/Bounced</div>
                <div style={{ fontSize: '0.98rem', fontWeight: '800', color: (today.outreach?.failed || 0) > 0 ? '#ef4444' : '#6b7280' }}>
                  {today.outreach?.failed || 0}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Yesterday Sent: <b>{yesterday.outreachSent || 0}</b></span>
              <span style={{ color: '#38bdf8' }}>Delivery Rate: <b>{today.outreach?.deliveryRate || 100}%</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          📊 SECTION 2: PAST 7 DAYS DAY-BY-DAY TELEMETRY TABLE (HISTORICAL LOG)
         ========================================================================= */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              Day-by-Day Historical Telemetry (Daily Scraping & Outreach History)
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Past 7 days audit trail
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Data Scraped</th>
                <th style={{ padding: '12px 14px' }}>Live / Approved</th>
                <th style={{ padding: '12px 14px' }}>Outreach Dispatched</th>
                <th style={{ padding: '12px 14px' }}>Delivered</th>
                <th style={{ padding: '12px 14px' }}>Replies</th>
                <th style={{ padding: '12px 14px' }}>Failed</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Performance</th>
              </tr>
            </thead>
            <tbody>
              {past7Days.map((day) => {
                const deliveryRate = day.outreachSent > 0 ? Math.round((day.delivered / day.outreachSent) * 100) : 100;
                return (
                  <tr
                    key={day.date}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: day.isToday ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                      fontWeight: day.isToday ? '700' : '400'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: day.isToday ? '#818cf8' : '#fff' }}>{day.label}</span>
                        {day.isToday && (
                          <span style={{ fontSize: '0.68rem', background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', padding: '1px 5px', borderRadius: '3px' }}>
                            TODAY
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{day.date}</div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: '700', color: '#c7d2fe' }}>{day.totalScraped}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: '4px' }}>
                        ({day.leadsScraped} leads, {day.jobsScraped} jobs)
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', padding: '2px 8px' }}>
                        {day.live} Live
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: '700', color: '#38bdf8' }}>{day.outreachSent} sent</span>
                    </td>

                    <td style={{ padding: '12px 14px', color: '#34d399' }}>
                      {day.delivered}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: '700', color: '#a855f7' }}>{day.replies}</span>
                    </td>

                    <td style={{ padding: '12px 14px', color: day.failed > 0 ? '#ef4444' : 'var(--text-dim)' }}>
                      {day.failed}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.76rem',
                        fontWeight: '700',
                        color: deliveryRate >= 90 ? '#34d399' : '#fbbf24',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        {deliveryRate}% Delivery
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          📈 SECTION 3: FULL CONVERSION FUNNEL & ANALYSIS (EK EK CHIZ KI ANALYSIS)
         ========================================================================= */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                End-to-End Autonomous Pipeline Funnel
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              From initial data scraping to digital audit, pitch generation, email outreach, and closed deals.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setAnalyticsSubView('funnel')}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '5px 12px',
                background: analyticsSubView === 'funnel' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: analyticsSubView === 'funnel' ? '#fff' : 'var(--text-muted)',
                borderColor: analyticsSubView === 'funnel' ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)'
              }}
            >
              Conversion Funnel
            </button>
            <button
              onClick={() => setAnalyticsSubView('sources')}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '5px 12px',
                background: analyticsSubView === 'sources' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: analyticsSubView === 'sources' ? '#fff' : 'var(--text-muted)',
                borderColor: analyticsSubView === 'sources' ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)'
              }}
            >
              Source Breakdown
            </button>
            <button
              onClick={() => setAnalyticsSubView('breakdown')}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '5px 12px',
                background: analyticsSubView === 'breakdown' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: analyticsSubView === 'breakdown' ? '#fff' : 'var(--text-muted)',
                borderColor: analyticsSubView === 'breakdown' ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)'
              }}
            >
              Status Distribution
            </button>
          </div>
        </div>

        {analyticsSubView === 'funnel' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {/* Step 1 */}
            <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '700' }}>1. SCRAPED</div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{funnel.scraped || metrics.totalLeads || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>100% Volume</div>
            </div>

            {/* Step 2 */}
            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '700' }}>2. QUALIFIED (60+)</div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{funnel.qualified || metrics.qualifiedLeads || 0}</div>
              <div style={{ fontSize: '0.7rem', color: '#34d399' }}>{metrics.qualificationRate || 0}% Qualify</div>
            </div>

            {/* Step 3 */}
            <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '700' }}>3. PITCHES READY</div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{funnel.pitchesGenerated || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>AI Generated</div>
            </div>

            {/* Step 4 */}
            <div style={{ padding: '14px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700' }}>4. DISPATCHED</div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{funnel.outreachSent || metrics.contactedLeads || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Live Sent</div>
            </div>

            {/* Step 5 */}
            <div style={{ padding: '14px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: '700' }}>5. REPLIES</div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{funnel.replies || metrics.repliesCount || 0}</div>
              <div style={{ fontSize: '0.7rem', color: '#c084fc' }}>{metrics.replyRate || 0}% Reply Rate</div>
            </div>

            {/* Step 6 */}
            <div style={{ padding: '14px', background: 'rgba(236, 72, 153, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#f472b6', fontWeight: '700' }}>6. DEALS WON</div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>{funnel.won || metrics.wonCount || 0}</div>
              <div style={{ fontSize: '0.7rem', color: '#f472b6' }}>₹{(metrics.totalRevenueWon || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}

        {analyticsSubView === 'sources' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🤖 AI Discovery Layer</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#818cf8', marginTop: '4px' }}>{sourceBreakdown.aiDiscovery || 0}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⚡ Autonomous Daily Scraper</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>{sourceBreakdown.dailyScraper || 0}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🌐 Greenhouse Job Board</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>{sourceBreakdown.greenhouseBoard || 0}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📝 Social Post Ingestor</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>{sourceBreakdown.postIngestor || 0}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📄 CSV File Imports</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#c084fc', marginTop: '4px' }}>{sourceBreakdown.csvImport || 0}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👤 Manual CRM Entries</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#94a3b8', marginTop: '4px' }}>{sourceBreakdown.manual || 0}</div>
            </div>
          </div>
        )}

        {analyticsSubView === 'breakdown' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(statusBreakdown).map(([statusKey, count]) => (
              <div
                key={statusKey}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span className={`badge badge-${statusKey.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>
                  {statusKey}
                </span>
                <span style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          🔥 SECTION 4: PRIMARY LIFETIME METRICS GRID
         ========================================================================= */}
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
                borderColor: card.alert ? 'rgba(245, 158, 11, 0.5)' : undefined
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

      {/* =========================================================================
          ⚡ SECTION 5: REAL-TIME ACTIVITY STREAM & HOT LEADS
         ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Real-time Activity Stream (Ek Ek Chiz Jo Ho Rahi Hai) */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                Real-Time Activity Stream (हाल ही में हुआ काम)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live execution feed
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No recent activity recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentActivity.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: act.badgeColor || '#818cf8',
                      boxShadow: `0 0 6px ${act.badgeColor || '#818cf8'}`
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {act.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hot Leads (Score 75+) */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#f43f5e" />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                High-Conversion Hot Leads (75+)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Top conversion probability
            </span>
          </div>

          {hotLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No hot leads yet. Click <strong>"Seed Authentic Leads"</strong> to load prospects.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hotLeads.map((lead) => (
                <div
                  key={lead._id}
                  onClick={() => onSelectLead && onSelectLead(lead)}
                  className="glass-card-interactive"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lead.business_name}
                      </span>
                      <span className="badge badge-high" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                        {lead.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lead.industry} • {lead.city || 'Indore'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span className="score-pill score-80" style={{ fontSize: '0.8rem' }}>
                      {lead.lead_score}/100
                    </span>
                    <ArrowUpRight size={15} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
