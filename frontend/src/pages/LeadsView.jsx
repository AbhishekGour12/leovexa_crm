import React, { useState, useMemo } from 'react';
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
  Eye,
  Mail,
  Users,
  Calendar,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  X,
  Zap,
  ArrowUpDown,
  Phone,
  Clock,
  Layers,
  ChevronDown,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { EmailLogsView } from './EmailLogsView';

export const LeadsView = ({
  leads = [],
  onSelectLead,
  onOpenNewLead,
  onTriggerResearch,
  onDeleteLead,
  onSeedDemo,
  onAiDiscover,
  onTriggerDailyLeads
}) => {
  const [subTab, setSubTab] = useState('directory'); // 'directory' | 'email_logs'
  const [isFetchingDaily, setIsFetchingDaily] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, YESTERDAY, 7DAYS, 30DAYS, CUSTOM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL'); // ALL, HOT_80, QUALIFIED_60, MODERATE_40, LOW
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [websiteFilter, setWebsiteFilter] = useState('ALL'); // ALL, NO_WEBSITE, HAS_WEBSITE, MANUAL
  const [sortBy, setSortBy] = useState('NEWEST'); // NEWEST, OLDEST, SCORE_DESC, SCORE_ASC, NAME_ASC, NAME_DESC

  // Dynamic unique lists for filter dropdowns
  const uniqueLocations = useMemo(() => {
    const locSet = new Set();
    leads.forEach((l) => {
      const loc = l.city || l.state || l.country;
      if (loc && loc.trim()) locSet.add(loc.trim());
    });
    return Array.from(locSet).sort();
  }, [leads]);

  const uniqueIndustries = useMemo(() => {
    const indSet = new Set();
    leads.forEach((l) => {
      if (l.industry && l.industry.trim()) indSet.add(l.industry.trim());
    });
    return Array.from(indSet).sort();
  }, [leads]);

  const uniqueSources = useMemo(() => {
    const srcSet = new Set();
    leads.forEach((l) => {
      if (l.source && l.source.trim()) srcSet.add(l.source.trim());
    });
    return Array.from(srcSet).sort();
  }, [leads]);

  // Robust Date Checker Helper
  const isWithinDateFilter = (dateStr) => {
    if (!dateStr) return dateFilter === 'ALL';
    const leadDate = new Date(dateStr);
    if (isNaN(leadDate.getTime())) return dateFilter === 'ALL';

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateFilter === 'TODAY') {
      return leadDate >= todayStart && leadDate <= todayEnd;
    }
    if (dateFilter === 'YESTERDAY') {
      const yestStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      const yestEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      return leadDate >= yestStart && leadDate <= yestEnd;
    }
    if (dateFilter === '7DAYS') {
      const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return leadDate >= d7;
    }
    if (dateFilter === '30DAYS') {
      const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return leadDate >= d30;
    }
    if (dateFilter === 'CUSTOM') {
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        if (leadDate < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        if (leadDate > e) return false;
      }
      return true;
    }
    return true; // 'ALL'
  };

  // Helper to format date with time or friendly label
  const formatLeadDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const isYesterday = d.toDateString() === yest.toDateString();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;

    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Filtered and Sorted Leads
  const filteredLeads = useMemo(() => {
    let result = leads.filter((lead) => {
      // 1. Text Search across multiple attributes
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesText =
          (lead.business_name || '').toLowerCase().includes(q) ||
          (lead.email || '').toLowerCase().includes(q) ||
          (lead.phone || '').toLowerCase().includes(q) ||
          (lead.city || '').toLowerCase().includes(q) ||
          (lead.state || '').toLowerCase().includes(q) ||
          (lead.country || '').toLowerCase().includes(q) ||
          (lead.industry || '').toLowerCase().includes(q) ||
          (lead.source || '').toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // 2. Date Filter
      if (!isWithinDateFilter(lead.created_at)) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'ALL' && lead.status !== statusFilter) {
        return false;
      }

      // 4. Score / Qualification Filter
      const score = lead.lead_score || 0;
      if (scoreFilter === 'HOT_80' && score < 80) return false;
      if (scoreFilter === 'QUALIFIED_60' && score < 60) return false;
      if (scoreFilter === 'MODERATE_40' && (score < 40 || score >= 60)) return false;
      if (scoreFilter === 'LOW' && score >= 40) return false;

      // 5. Source Filter
      if (sourceFilter !== 'ALL' && lead.source !== sourceFilter) {
        return false;
      }

      // 6. Location Filter
      if (locationFilter !== 'ALL') {
        const loc = (lead.city || lead.state || lead.country || '').trim();
        if (loc !== locationFilter) return false;
      }

      // 7. Industry Filter
      if (industryFilter !== 'ALL' && (lead.industry || '').trim() !== industryFilter) {
        return false;
      }

      // 8. Website Opportunity Filter
      const hasWeb = Boolean(lead.website && lead.website.trim() !== '');
      if (websiteFilter === 'NO_WEBSITE' && hasWeb) return false;
      if (websiteFilter === 'HAS_WEBSITE' && !hasWeb) return false;
      if (websiteFilter === 'MANUAL' && lead.source !== 'MANUAL_IMPORT' && lead.source !== 'CSV Import') return false;

      return true;
    });

    // Multi-column sorting
    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'SCORE_DESC') {
        return (b.lead_score || 0) - (a.lead_score || 0);
      }
      if (sortBy === 'SCORE_ASC') {
        return (a.lead_score || 0) - (b.lead_score || 0);
      }
      if (sortBy === 'NAME_ASC') {
        return (a.business_name || '').localeCompare(b.business_name || '');
      }
      if (sortBy === 'NAME_DESC') {
        return (b.business_name || '').localeCompare(a.business_name || '');
      }
      return 0;
    });

    return result;
  }, [
    leads,
    searchTerm,
    dateFilter,
    startDate,
    endDate,
    statusFilter,
    scoreFilter,
    sourceFilter,
    locationFilter,
    industryFilter,
    websiteFilter,
    sortBy
  ]);

  // Aggregate statistics for the current filtered view vs total
  const stats = useMemo(() => {
    const total = leads.length;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const scrapedToday = leads.filter((l) => new Date(l.created_at || 0) >= todayStart).length;
    const hotCount = filteredLeads.filter((l) => (l.lead_score || 0) >= 80).length;
    const qualifiedCount = filteredLeads.filter((l) => (l.lead_score || 0) >= 60).length;
    const noWebsiteCount = filteredLeads.filter((l) => !l.website || l.website.trim() === '').length;
    const liveOrContacted = filteredLeads.filter((l) =>
      ['APPROVED', 'CONTACTED', 'REPLIED', 'MEETING', 'WON'].includes(l.status)
    ).length;

    return {
      total,
      filtered: filteredLeads.length,
      scrapedToday,
      hotCount,
      qualifiedCount,
      noWebsiteCount,
      liveOrContacted
    };
  }, [leads, filteredLeads]);

  // Export filtered leads as CSV
  const handleExportCsv = () => {
    if (filteredLeads.length === 0) {
      alert('No leads to export in the current filtered view');
      return;
    }

    const headers = [
      'Business Name',
      'Industry',
      'Email',
      'Phone',
      'Location',
      'Website',
      'Score',
      'Status',
      'Source',
      'Date Scraped / Added'
    ];

    const rows = filteredLeads.map((l) => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.city || l.state || l.country || '').replace(/"/g, '""')}"`,
      `"${(l.website || 'No Website').replace(/"/g, '""')}"`,
      `"${l.lead_score || 0}"`,
      `"${l.status || 'NEW'}"`,
      `"${(l.source || 'Scraper').replace(/"/g, '""')}"`,
      `"${l.created_at ? new Date(l.created_at).toISOString() : 'N/A'}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leovexa_leads_${dateFilter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFetchDaily = async () => {
    if (!onTriggerDailyLeads) return;
    setIsFetchingDaily(true);
    try {
      await onTriggerDailyLeads();
    } finally {
      setIsFetchingDaily(false);
    }
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setDateFilter('ALL');
    setStartDate('');
    setEndDate('');
    setStatusFilter('ALL');
    setScoreFilter('ALL');
    setSourceFilter('ALL');
    setLocationFilter('ALL');
    setIndustryFilter('ALL');
    setWebsiteFilter('ALL');
    setSortBy('NEWEST');
  };

  const isAnyFilterActive =
    searchTerm ||
    dateFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    scoreFilter !== 'ALL' ||
    sourceFilter !== 'ALL' ||
    locationFilter !== 'ALL' ||
    industryFilter !== 'ALL' ||
    websiteFilter !== 'ALL';

  // Toggle Column Sort helper
  const handleSortToggle = (colType) => {
    if (colType === 'SCORE') {
      setSortBy(sortBy === 'SCORE_DESC' ? 'SCORE_ASC' : 'SCORE_DESC');
    } else if (colType === 'NAME') {
      setSortBy(sortBy === 'NAME_ASC' ? 'NAME_DESC' : 'NAME_ASC');
    } else if (colType === 'DATE') {
      setSortBy(sortBy === 'NEWEST' ? 'OLDEST' : 'NEWEST');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* =========================================================================
          TOP NAV TABS & ACTION BAR
         ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setSubTab('directory')}
            className="btn"
            style={{
              padding: '8px 18px',
              fontSize: '0.88rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-md)',
              background:
                subTab === 'directory'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255, 255, 255, 0.04)',
              color: subTab === 'directory' ? '#fff' : 'var(--text-muted)',
              border:
                subTab === 'directory' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-subtle)',
              boxShadow: subTab === 'directory' ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Users size={16} />
            <span>Leads Directory ({leads.length})</span>
          </button>

          <button
            onClick={() => setSubTab('email_logs')}
            className="btn"
            style={{
              padding: '8px 18px',
              fontSize: '0.88rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-md)',
              background:
                subTab === 'email_logs'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255, 255, 255, 0.04)',
              color: subTab === 'email_logs' ? '#fff' : 'var(--text-muted)',
              border:
                subTab === 'email_logs' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-subtle)',
              boxShadow: subTab === 'email_logs' ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Mail size={16} />
            <span>Outbound Email Logs & Errors</span>
          </button>
        </div>

        {/* Action Buttons Right */}
        {subTab === 'directory' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onTriggerDailyLeads && (
              <button
                onClick={handleFetchDaily}
                disabled={isFetchingDaily}
                className="btn btn-primary"
                style={{
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                }}
              >
                <Sparkles size={15} className={isFetchingDaily ? 'animate-spin' : ''} />
                <span>{isFetchingDaily ? 'Extracting 40 Leads...' : '🤖 Fetch Daily 40 Leads'}</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Download currently filtered leads as CSV"
            >
              <Download size={14} />
              <span>Export Filtered ({filteredLeads.length})</span>
            </button>

            {onOpenNewLead && (
              <button
                onClick={onOpenNewLead}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Add Prospect</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Render Subtab View */}
      {subTab === 'email_logs' ? (
        <EmailLogsView onSelectLead={onSelectLead} />
      ) : (
        <>
          {/* =========================================================================
              📊 KPI SUMMARY STRIP
             ========================================================================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Showing / Total
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff' }}>
                  {stats.filtered}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '500', marginLeft: '4px' }}>
                    / {stats.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Scraped Today
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#34d399' }}>
                  {stats.scrapedToday}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Flame size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Hot Leads (80+)
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f87171' }}>
                  {stats.hotCount}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Globe size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  No Website (High Opp)
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fbbf24' }}>
                  {stats.noWebsiteCount}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#06b6d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Live in Outreach
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#38bdf8' }}>
                  {stats.liveOrContacted}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              🎯 ADVANCED DATE & MULTI-FILTER CONTROL BAR
             ========================================================================= */}
          <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Row 1: Fast Date Preset Buttons & Full-Text Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {/* Full Text Search Input */}
              <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '260px' }}>
                <Search
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search by business name, email, phone, city, industry, tags..."
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Date Presets Quick Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                  <Calendar size={14} color="#818cf8" />
                  <span>Date:</span>
                </span>

                {[
                  { id: 'ALL', label: 'All Dates' },
                  { id: 'TODAY', label: '⚡ Today (आज)' },
                  { id: 'YESTERDAY', label: 'Yesterday' },
                  { id: '7DAYS', label: 'Last 7 Days' },
                  { id: '30DAYS', label: 'Last 30 Days' },
                  { id: 'CUSTOM', label: 'Custom Range...' }
                ].map((dp) => (
                  <button
                    key={dp.id}
                    onClick={() => setDateFilter(dp.id)}
                    className="btn"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: dateFilter === dp.id ? '700' : '500',
                      borderRadius: 'var(--radius-sm)',
                      background:
                        dateFilter === dp.id
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : 'rgba(255, 255, 255, 0.03)',
                      color: dateFilter === dp.id ? '#fff' : 'var(--text-muted)',
                      border:
                        dateFilter === dp.id
                          ? '1px solid rgba(99, 102, 241, 0.5)'
                          : '1px solid var(--border-subtle)',
                      boxShadow: dateFilter === dp.id ? '0 0 10px rgba(99, 102, 241, 0.25)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {dp.label}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={14} color="var(--text-muted)" />
                <select
                  className="form-input"
                  style={{ width: '165px', padding: '6px 10px', fontSize: '0.8rem' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="NEWEST">📅 Newest First</option>
                  <option value="OLDEST">⏳ Oldest First</option>
                  <option value="SCORE_DESC">🏆 Highest Score (80+)</option>
                  <option value="SCORE_ASC">⚪ Lowest Score First</option>
                  <option value="NAME_ASC">🔤 Business Name (A-Z)</option>
                  <option value="NAME_DESC">🔤 Business Name (Z-A)</option>
                </select>
              </div>
            </div>

            {/* Custom Date Pickers (if CUSTOM selected) */}
            {dateFilter === 'CUSTOM' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c7d2fe' }}>
                  Filter by Specific Range:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>From:</span>
                  <input
                    type="date"
                    className="form-input"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>To:</span>
                  <input
                    type="date"
                    className="form-input"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            )}

            {/* Row 2: Secondary Filters (Status, Score, Website, Source, Location, Industry) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginRight: '2px'
                }}
              >
                <Filter size={13} />
                <span>Filters:</span>
              </div>

              {/* Status Filter */}
              <select
                className="form-input"
                style={{ width: '150px', padding: '6px 8px', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">🆕 New</option>
                <option value="SCRAPING">🔍 Scraping</option>
                <option value="QUALIFIED">🎯 Qualified</option>
                <option value="PENDING_APPROVAL">⏳ Pending Review</option>
                <option value="APPROVED">✅ Approved / Live</option>
                <option value="CONTACTED">📤 Outreach Sent</option>
                <option value="REPLIED">📩 Replied</option>
                <option value="MEETING">📅 Meeting</option>
                <option value="WON">🏆 Closed Won</option>
                <option value="LOST">❌ Lost</option>
              </select>

              {/* Score / Qualification Filter */}
              <select
                className="form-input"
                style={{ width: '165px', padding: '6px 8px', fontSize: '0.8rem' }}
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
              >
                <option value="ALL">All Scores</option>
                <option value="HOT_80">🔥 Hot Leads (80-100)</option>
                <option value="QUALIFIED_60">⚡ Qualified (60-100)</option>
                <option value="MODERATE_40">🟡 Moderate (40-59)</option>
                <option value="LOW">⚪ Low Quality (&lt;40)</option>
              </select>

              {/* Website Opportunity Filter */}
              <select
                className="form-input"
                style={{ width: '175px', padding: '6px 8px', fontSize: '0.8rem' }}
                value={websiteFilter}
                onChange={(e) => setWebsiteFilter(e.target.value)}
              >
                <option value="ALL">All Digital Footprints</option>
                <option value="NO_WEBSITE">⚡ No Website (High Opp)</option>
                <option value="HAS_WEBSITE">🌐 Has Existing Website</option>
                <option value="MANUAL">👤 Manual / CSV Imports</option>
              </select>

              {/* Source Filter */}
              <select
                className="form-input"
                style={{ width: '160px', padding: '6px 8px', fontSize: '0.8rem' }}
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="ALL">All Sources</option>
                {uniqueSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>

              {/* Location Filter */}
              <select
                className="form-input"
                style={{ width: '150px', padding: '6px 8px', fontSize: '0.8rem' }}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="ALL">📍 All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Industry Filter */}
              <select
                className="form-input"
                style={{ width: '160px', padding: '6px 8px', fontSize: '0.8rem' }}
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                <option value="ALL">🏢 All Industries</option>
                {uniqueIndustries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>

              {/* Reset All Filters Button */}
              {isAnyFilterActive && (
                <button
                  onClick={resetAllFilters}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginLeft: 'auto'
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Row 3: Active Filter Chips Bar */}
            {isAnyFilterActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Active:</span>

                {dateFilter !== 'ALL' && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#c7d2fe',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Date: {dateFilter}
                    <X size={11} style={{ cursor: 'pointer' }} onClick={() => setDateFilter('ALL')} />
                  </span>
                )}

                {statusFilter !== 'ALL' && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Status: {statusFilter}
                    <X size={11} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('ALL')} />
                  </span>
                )}

                {scoreFilter !== 'ALL' && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Score: {scoreFilter}
                    <X size={11} style={{ cursor: 'pointer' }} onClick={() => setScoreFilter('ALL')} />
                  </span>
                )}

                {websiteFilter !== 'ALL' && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#38bdf8',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Website: {websiteFilter}
                    <X size={11} style={{ cursor: 'pointer' }} onClick={() => setWebsiteFilter('ALL')} />
                  </span>
                )}

                {locationFilter !== 'ALL' && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Loc: {locationFilter}
                    <X size={11} style={{ cursor: 'pointer' }} onClick={() => setLocationFilter('ALL')} />
                  </span>
                )}

                {industryFilter !== 'ALL' && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Niche: {industryFilter}
                    <X size={11} style={{ cursor: 'pointer' }} onClick={() => setIndustryFilter('ALL')} />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              📋 MAIN LEADS DIRECTORY TABLE WITH CLEAR, CLEAN COLUMNS
             ========================================================================= */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Table Header Bar */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Users size={18} color="#818cf8" />
                Verified Prospects & Qualified Lead Directory
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing <b>{filteredLeads.length}</b> of <b>{leads.length}</b> prospects
                {dateFilter === 'TODAY' && ' (Filtered: Today)'}
              </span>
            </div>

            {filteredLeads.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Users size={44} style={{ opacity: 0.25, marginBottom: '14px' }} />
                <h4 style={{ color: '#fff', marginBottom: '6px', fontSize: '1.1rem' }}>No Leads Found Matching Filters</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '16px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
                  No prospects matched the selected criteria. Try changing the date filter to "All Dates" or click below to discover fresh leads.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {isAnyFilterActive && (
                    <button onClick={resetAllFilters} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
                      Clear All Filters
                    </button>
                  )}
                  {onTriggerDailyLeads && (
                    <button onClick={handleFetchDaily} className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                      <Sparkles size={14} />
                      <span>Fetch Daily 40 Leads</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr
                      style={{
                        background: 'rgba(255, 255, 255, 0.025)',
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                        fontSize: '0.76rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {/* Column 1: Business & Industry */}
                      <th
                        style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSortToggle('NAME')}
                        title="Click to sort by Business Name"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Business & Niche</span>
                          <ArrowUpDown size={12} color="var(--text-dim)" />
                        </div>
                      </th>

                      {/* Column 2: Direct Contact */}
                      <th style={{ padding: '14px 16px' }}>Contact & Outreach</th>

                      {/* Column 3: Location */}
                      <th style={{ padding: '14px 16px' }}>Location</th>

                      {/* Column 4: Digital Footprint */}
                      <th style={{ padding: '14px 16px' }}>Website / Opportunity</th>

                      {/* Column 5: Opportunity Score */}
                      <th
                        style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSortToggle('SCORE')}
                        title="Click to sort by Score"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Score</span>
                          <ArrowUpDown size={12} color="var(--text-dim)" />
                        </div>
                      </th>

                      {/* Column 6: Pipeline Status */}
                      <th style={{ padding: '14px 16px' }}>Status</th>

                      {/* Column 7: Scraped Date & Source */}
                      <th
                        style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSortToggle('DATE')}
                        title="Click to sort by Added Date"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Scraped Date & Source</span>
                          <ArrowUpDown size={12} color="var(--text-dim)" />
                        </div>
                      </th>

                      {/* Column 8: Actions */}
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const score = lead.lead_score || 0;
                      const scoreClass =
                        score >= 80 ? 'score-80' : score >= 60 ? 'score-60' : score >= 40 ? 'score-40' : 'score-low';
                      const hasWebsite = Boolean(lead.website && lead.website.trim() !== '');

                      return (
                        <tr
                          key={lead._id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => onSelectLead(lead)}
                        >
                          {/* 1. Business Name & Industry */}
                          <td style={{ padding: '14px 18px' }}>
                            <div
                              style={{
                                fontWeight: '700',
                                color: '#fff',
                                fontSize: '0.92rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Building size={14} color="#818cf8" />
                              <span>{lead.business_name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#c7d2fe',
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(99, 102, 241, 0.2)'
                                }}
                              >
                                {lead.industry || 'General Business'}
                              </span>
                            </div>
                          </td>

                          {/* 2. Contact & Outreach Info */}
                          <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                              {lead.email}
                            </div>
                            {lead.phone ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.74rem',
                                  color: 'var(--text-muted)',
                                  marginTop: '2px'
                                }}
                              >
                                <Phone size={11} color="#10b981" />
                                <span>{lead.phone}</span>
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                                Email verified
                              </div>
                            )}
                          </td>

                          {/* 3. Location */}
                          <td style={{ padding: '14px 16px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.82rem',
                                color: 'var(--text-muted)'
                              }}
                            >
                              <MapPin size={13} color="#818cf8" />
                              <span>
                                {lead.city || lead.state || 'Indore'}, {lead.country || 'India'}
                              </span>
                            </div>
                          </td>

                          {/* 4. Website / Footprint Opportunity */}
                          <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                            {hasWebsite ? (
                              <a
                                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.76rem',
                                  color: '#38bdf8',
                                  textDecoration: 'none'
                                }}
                              >
                                <Globe size={12} color="#06b6d4" />
                                <span>{lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#fbbf24',
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                  fontWeight: '700',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                ⚡ NO WEBSITE (HIGH OPP)
                              </span>
                            )}
                          </td>

                          {/* 5. Score */}
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              className={`score-pill ${scoreClass}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              {score >= 80 && <Flame size={12} />}
                              {score}/100
                            </span>
                          </td>

                          {/* 6. Pipeline Status */}
                          <td style={{ padding: '14px 16px' }}>
                            <span className={`badge badge-${(lead.status || 'NEW').toLowerCase()}`}>
                              {lead.status || 'NEW'}
                            </span>
                          </td>

                          {/* 7. Scraped Date & Source */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: '500' }}>
                              {formatLeadDate(lead.created_at)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  color: 'var(--text-dim)',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  padding: '1px 5px',
                                  borderRadius: '3px'
                                }}
                              >
                                {lead.source || 'Scraper'}
                              </span>
                            </div>
                          </td>

                          {/* 8. Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                onClick={() => onSelectLead(lead)}
                                className="btn btn-secondary"
                                style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                title="Open full AI Digital Audit & Pitch Drawer"
                              >
                                <Eye size={13} />
                                <span>Audit</span>
                              </button>

                              <button
                                onClick={() => onTriggerResearch(lead._id)}
                                className="btn btn-secondary"
                                style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                                title="Re-run AI Digital Audit & Scoring"
                              >
                                <RefreshCw size={12} />
                              </button>

                              <button
                                onClick={() => onDeleteLead(lead._id)}
                                className="btn btn-secondary"
                                style={{ padding: '5px 8px', fontSize: '0.75rem', color: '#f87171' }}
                                title="Delete Lead"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
