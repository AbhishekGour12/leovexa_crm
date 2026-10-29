import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  Trash2,
  Eye,
  Calendar,
  Download,
  ExternalLink,
  ChevronDown,
  X,
  ShieldAlert,
  Zap,
  Building,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const EmailLogsView = ({ onSelectLead }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [batchResending, setBatchResending] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SENT, FAILED, QUEUED, REPLIED
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, INITIAL, FOLLOWUP_1, FOLLOWUP_2, CUSTOM
  const [datePreset, setDatePreset] = useState('ALL'); // ALL, TODAY, YESTERDAY, 7DAYS, 30DAYS, CUSTOM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.getMessages({ direction: 'OUTBOUND' });
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (e) {
      console.warn('Failed to load email logs:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleResend = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setResendingId(id);
      const res = await api.resendMessage(id);
      if (res.success) {
        alert(res.message || 'Email successfully re-dispatched!');
        fetchLogs();
        if (selectedMsg && selectedMsg._id === id) {
          setSelectedMsg(res.data);
        }
      } else {
        alert(`Resend failed: ${res.error}`);
      }
    } catch (err) {
      alert(`Error resending email: ${err.message}`);
    } finally {
      setResendingId(null);
    }
  };

  const handleBatchRetryFailed = async () => {
    const failedList = filteredMessages.filter(m => m.status === 'FAILED');
    if (failedList.length === 0) {
      alert('No failed emails found in current filtered view.');
      return;
    }

    if (!window.confirm(`Attempt to re-dispatch ${failedList.length} failed email(s) via ZeptoMail?`)) {
      return;
    }

    setBatchResending(true);
    let successCount = 0;
    for (const msg of failedList) {
      try {
        const res = await api.resendMessage(msg._id);
        if (res.success) successCount++;
      } catch (e) {
        console.warn(`Retry failed for ${msg._id}:`, e.message);
      }
    }
    setBatchResending(false);
    alert(`Batch retry complete: ${successCount} of ${failedList.length} emails delivered!`);
    fetchLogs();
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this email record from logs?')) return;
    try {
      await api.deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      if (selectedMsg && selectedMsg._id === id) setSelectedMsg(null);
    } catch (e) {
      alert(`Delete error: ${e.message}`);
    }
  };

  // Date Filtering Calculation
  const isWithinDatePreset = (dateStr) => {
    if (!dateStr) return false;
    const msgDate = new Date(dateStr);
    const now = new Date();

    if (datePreset === 'TODAY') {
      return msgDate.toDateString() === now.toDateString();
    }
    if (datePreset === 'YESTERDAY') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      return msgDate.toDateString() === yest.toDateString();
    }
    if (datePreset === '7DAYS') {
      const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return msgDate >= d7;
    }
    if (datePreset === '30DAYS') {
      const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return msgDate >= d30;
    }
    if (datePreset === 'CUSTOM') {
      if (startDate && msgDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (msgDate > end) return false;
      }
      return true;
    }
    return true; // 'ALL'
  };

  // Filtered dataset
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // 1. Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'SENT') {
          if (!['SENT', 'DELIVERED', 'OPENED', 'REPLIED'].includes(msg.status)) return false;
        } else if (statusFilter === 'FAILED') {
          if (!['FAILED', 'REJECTED'].includes(msg.status)) return false;
        } else if (statusFilter === 'QUEUED') {
          if (!['QUEUED', 'APPROVED', 'SENDING', 'PENDING_APPROVAL'].includes(msg.status)) return false;
        } else if (msg.status !== statusFilter) {
          return false;
        }
      }

      // 2. Type Filter
      if (typeFilter !== 'ALL' && msg.type !== typeFilter) {
        return false;
      }

      // 3. Date Filter
      const dateToCheck = msg.sent_at || msg.created_at;
      if (!isWithinDatePreset(dateToCheck)) {
        return false;
      }

      // 4. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const recipientEmail = (msg.lead_id?.email || '').toLowerCase();
        const businessName = (msg.lead_id?.business_name || '').toLowerCase();
        const subject = (msg.subject || '').toLowerCase();
        const error = (msg.error_message || '').toLowerCase();
        const body = (msg.content || '').toLowerCase();

        if (
          !recipientEmail.includes(q) &&
          !businessName.includes(q) &&
          !subject.includes(q) &&
          !error.includes(q) &&
          !body.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [messages, statusFilter, typeFilter, datePreset, startDate, endDate, search]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = messages.length;
    const sent = messages.filter(m => ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'].includes(m.status)).length;
    const failed = messages.filter(m => ['FAILED', 'REJECTED'].includes(m.status)).length;
    const queued = messages.filter(m => ['QUEUED', 'APPROVED', 'SENDING'].includes(m.status)).length;
    const successRate = total > 0 ? Math.round((sent / total) * 100) : 100;
    return { total, sent, failed, queued, successRate };
  }, [messages]);

  // CSV Export
  const handleExportCsv = () => {
    if (filteredMessages.length === 0) {
      alert('No messages to export');
      return;
    }

    const headers = ['Recipient Business', 'Recipient Email', 'Subject', 'Status', 'Type', 'Sent At', 'Error Reason'];
    const rows = filteredMessages.map(m => [
      `"${(m.lead_id?.business_name || 'Direct / Unknown').replace(/"/g, '""')}"`,
      `"${(m.lead_id?.email || 'N/A').replace(/"/g, '""')}"`,
      `"${(m.subject || 'No Subject').replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${m.type || 'INITIAL'}"`,
      `"${m.sent_at ? new Date(m.sent_at).toLocaleString() : new Date(m.created_at).toLocaleString()}"`,
      `"${(m.error_message || m.rejection_reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leovexa_email_dispatch_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (msg) => {
    switch (msg.status) {
      case 'SENT':
      case 'DELIVERED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={13} />
            Delivered
          </span>
        );
      case 'FAILED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <AlertTriangle size={13} />
            Failed / Blocked
          </span>
        );
      case 'REPLIED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <Sparkles size={13} />
            Replied
          </span>
        );
      case 'SENDING':
      case 'QUEUED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <Clock size={13} />
            {msg.status === 'SENDING' ? 'Sending...' : 'Queued'}
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: 'rgba(148, 163, 184, 0.15)',
            color: '#94a3b8',
            border: '1px solid rgba(148, 163, 184, 0.3)'
          }}>
            {msg.status}
          </span>
        );
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'INITIAL': return '🎯 Cold Pitch (Day 1)';
      case 'FOLLOWUP_1': return '🔄 Follow-up (Day 3)';
      case 'FOLLOWUP_2': return '🚀 Breakup (Day 7)';
      case 'CUSTOM': return '✉️ Custom Outreach';
      default: return type || 'Email';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Telemetry KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Total Dispatched */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Mail size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Total Outbound Logs
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>
              {stats.total}
            </div>
          </div>
        </div>

        {/* Successfully Sent */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Delivered Successfully
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>
                {stats.sent}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ({stats.successRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Failed / Bounced */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Failed / Blocked
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: stats.failed > 0 ? '#ef4444' : '#fff', marginTop: '2px' }}>
              {stats.failed}
            </div>
          </div>
        </div>

        {/* Dispatch Engine Indicator */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Active Dispatch Engine
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" style={{ background: '#10b981' }}></span>
              Zoho ZeptoMail SMTP
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search recipient email, business name, subject, or error reason..."
              className="form-input"
              style={{ paddingLeft: '38px', width: '100%' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {stats.failed > 0 && (
              <button
                onClick={handleBatchRetryFailed}
                disabled={batchResending}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                  borderColor: '#f43f5e',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} className={batchResending ? 'animate-spin' : ''} />
                <span>{batchResending ? 'Retrying Failed...' : `Retry ${stats.failed} Failed`}</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Download filtered logs as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Filter Badges & Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '4px' }}>
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          {/* Status Select */}
          <select
            className="form-input"
            style={{ width: '170px', padding: '6px 10px', fontSize: '0.82rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({messages.length})</option>
            <option value="SENT">✅ Delivered ({stats.sent})</option>
            <option value="FAILED">❌ Failed / Blocked ({stats.failed})</option>
            <option value="QUEUED">⏳ Queued ({stats.queued})</option>
          </select>

          {/* Type Select */}
          <select
            className="form-input"
            style={{ width: '180px', padding: '6px 10px', fontSize: '0.82rem' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Email Types</option>
            <option value="INITIAL">🎯 Initial Cold Pitch</option>
            <option value="FOLLOWUP_1">🔄 Follow-up (Day 3)</option>
            <option value="FOLLOWUP_2">🚀 Breakup (Day 7)</option>
            <option value="CUSTOM">✉️ Custom Outreach</option>
          </select>

          {/* Date Preset Select */}
          <select
            className="form-input"
            style={{ width: '150px', padding: '6px 10px', fontSize: '0.82rem' }}
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
          >
            <option value="ALL">📅 All Time</option>
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="7DAYS">Last 7 Days</option>
            <option value="30DAYS">Last 30 Days</option>
            <option value="CUSTOM">Custom Range...</option>
          </select>

          {/* Custom Date Pickers */}
          {datePreset === 'CUSTOM' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                className="form-input"
                style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          {(statusFilter !== 'ALL' || typeFilter !== 'ALL' || datePreset !== 'ALL' || search) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setDatePreset('ALL');
                setStartDate('');
                setEndDate('');
                setSearch('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#818cf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginLeft: 'auto'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Email Logs Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} color="#818cf8" />
            Outbound Email Dispatch Log & Error History
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <b>{filteredMessages.length}</b> of <b>{messages.length}</b> emails
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '10px' }}>
              <RefreshCw size={24} color="#818cf8" />
            </div>
            <p>Loading email delivery logs...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Mail size={42} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h4 style={{ color: '#fff', marginBottom: '6px' }}>No Email Logs Found</h4>
            <p style={{ fontSize: '0.85rem' }}>
              {search || statusFilter !== 'ALL' || datePreset !== 'ALL'
                ? 'Try adjusting your search query or filter settings.'
                : 'No emails have been dispatched yet. Send pitches from Leads or Campaigns to see them here!'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>Recipient & Prospect</th>
                  <th style={{ padding: '14px 16px' }}>Subject & Snippet</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px' }}>Type</th>
                  <th style={{ padding: '14px 16px' }}>Timestamp</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => {
                  const lead = msg.lead_id || {};
                  const isFailed = msg.status === 'FAILED';
                  const timestamp = msg.sent_at || msg.created_at;

                  return (
                    <tr
                      key={msg._id}
                      onClick={() => setSelectedMsg(msg)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isFailed ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = isFailed ? 'rgba(239, 68, 68, 0.07)' : 'rgba(255, 255, 255, 0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = isFailed ? 'rgba(239, 68, 68, 0.03)' : 'transparent'}
                    >
                      {/* Recipient info */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building size={14} color="#818cf8" />
                          {lead.business_name || 'Direct Recipient'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '2px', fontFamily: 'monospace' }}>
                          {lead.email || 'N/A'}
                        </div>
                        {lead.city && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            {lead.city}, {lead.country || 'India'}
                          </div>
                        )}
                      </td>

                      {/* Subject & Error/Snippet */}
                      <td style={{ padding: '14px 16px', maxWidth: '320px' }}>
                        <div style={{ fontWeight: '600', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {msg.subject || '(No Subject Line)'}
                        </div>
                        
                        {isFailed && msg.error_message ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#f87171',
                            fontSize: '0.76rem',
                            marginTop: '4px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}>
                            <ShieldAlert size={12} flexShrink={0} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {msg.error_message}
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '3px' }}>
                            {(msg.content || '').replace(/\n/g, ' ')}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(msg)}
                      </td>

                      {/* Email Type */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                          {getTypeLabel(msg.type)}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div>{timestamp ? new Date(timestamp).toLocaleDateString() : 'N/A'}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                          {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {/* Resend button */}
                          <button
                            onClick={(e) => handleResend(msg._id, e)}
                            disabled={resendingId === msg._id}
                            title="Re-send this email via ZeptoMail"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: isFailed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                              border: isFailed ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)',
                              color: isFailed ? '#f87171' : '#818cf8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.76rem',
                              fontWeight: '600'
                            }}
                          >
                            <RotateCcw size={12} className={resendingId === msg._id ? 'animate-spin' : ''} />
                            {isFailed ? 'Retry' : 'Resend'}
                          </button>

                          {/* View details */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedMsg(msg); }}
                            title="View Full Content & Diagnostics"
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={13} />
                          </button>

                          {/* Delete log */}
                          <button
                            onClick={(e) => handleDelete(msg._id, e)}
                            title="Delete Log"
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-dim)',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                          >
                            <Trash2 size={13} />
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

      {/* Detailed Email & Diagnostics Modal */}
      {selectedMsg && (
        <div className="modal-overlay" onClick={() => setSelectedMsg(null)}>
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '24px',
              background: '#0d1322',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                    Email Dispatch Detail
                  </h3>
                  {getStatusBadge(selectedMsg)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Message ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{selectedMsg._id}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMsg(null)}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Banner if Failed */}
            {selectedMsg.status === 'FAILED' && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: '#f87171', fontWeight: '700', marginBottom: '4px' }}>
                    Delivery Failure Reason
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: '1.4', fontFamily: 'monospace' }}>
                    {selectedMsg.error_message || 'SMTP delivery rejected or connection timed out.'}
                  </p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    💡 <b>Fix Tip:</b> Verify if the recipient domain exists and has active MX records, or check Zoho ZeptoMail SMTP credentials in Settings.
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '18px', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>RECIPIENT EMAIL</span>
                <span style={{ fontWeight: '600', color: '#38bdf8', fontFamily: 'monospace' }}>
                  {selectedMsg.lead_id?.email || 'N/A'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>PROSPECT BUSINESS</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>
                  {selectedMsg.lead_id?.business_name || 'Direct Lead'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>OUTREACH SEQUENCE</span>
                <span style={{ fontWeight: '600', color: '#c7d2fe' }}>
                  {getTypeLabel(selectedMsg.type)}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>TIMESTAMP</span>
                <span style={{ color: 'var(--text-main)' }}>
                  {selectedMsg.sent_at ? new Date(selectedMsg.sent_at).toLocaleString() : new Date(selectedMsg.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Subject Line */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                Subject Line
              </label>
              <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>
                {selectedMsg.subject || '(No Subject)'}
              </div>
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                Email Content
              </label>
              <div style={{
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                color: '#e2e8f0',
                fontSize: '0.86rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {selectedMsg.content}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div>
                {selectedMsg.lead_id && onSelectLead && (
                  <button
                    onClick={() => {
                      onSelectLead(selectedMsg.lead_id);
                      setSelectedMsg(null);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Lead Profile</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedMsg(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Close
                </button>

                <button
                  onClick={() => handleResend(selectedMsg._id)}
                  disabled={resendingId === selectedMsg._id}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={14} className={resendingId === selectedMsg._id ? 'animate-spin' : ''} />
                  <span>{resendingId === selectedMsg._id ? 'Sending...' : 'Re-send Email Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
