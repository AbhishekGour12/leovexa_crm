import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileText,
  Upload,
  Download,
  ExternalLink,
  RefreshCw,
  Sliders,
  User,
  Building,
  MapPin,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Eye,
  Trash2,
  Calendar,
  Check,
  X,
  Zap,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

const POPULAR_BOARDS = [
  { token: 'okta', name: 'Okta', badge: '🇮🇳 100+ India Jobs' },
  { token: 'stripe', name: 'Stripe', badge: '🇮🇳 46+ India Jobs' },
  { token: 'coupang', name: 'Coupang', badge: '🇮🇳 34+ India Jobs' },
  { token: 'rubrik', name: 'Rubrik', badge: '🇮🇳 27+ India Jobs' },
  { token: 'smartsheet', name: 'Smartsheet', badge: '🇮🇳 20+ India Jobs' },
  { token: 'elastic', name: 'Elastic', badge: '🇮🇳 16+ India Jobs' },
  { token: 'abnormalsecurity', name: 'Abnormal Security', badge: '🇮🇳 13+ India Jobs' },
  { token: 'speechify', name: 'Speechify', badge: '🇮🇳 12+ India Jobs' },
  { token: 'inmobi', name: 'InMobi', badge: '🇮🇳 India HQ (80+ Jobs)' },
  { token: 'glance', name: 'Glance', badge: '🇮🇳 India (38+ Jobs)' },
  { token: 'datadog', name: 'Datadog', badge: '🇮🇳 12+ India Jobs' },
  { token: 'coinbase', name: 'Coinbase', badge: '🇮🇳 Remote India' },
  { token: 'airbnb', name: 'Airbnb', badge: '🇮🇳 5+ India Jobs' },
  { token: 'figma', name: 'Figma', badge: '🌐 Global' },
  { token: 'vercel', name: 'Vercel', badge: '🌐 Global' },
  { token: 'cloudflare', name: 'Cloudflare', badge: '🌐 Global' }
];

export const GreenhouseJobsView = () => {
  // Navigation View: 'tracker' | 'explorer'
  const [activeSubView, setActiveSubView] = useState('tracker');

  // Dashboard Telemetry
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Applications Tracker
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [boardFilter, setBoardFilter] = useState('ALL');
  const [isIndiaFilter, setIsIndiaFilter] = useState('ALL'); // 'ALL' | 'INDIA_ONLY' | 'GLOBAL_ONLY'
  const [channelFilter, setChannelFilter] = useState('ALL'); // 'ALL' | 'DIRECT_EMAIL' | 'GREENHOUSE_API'
  const [searchQuery, setSearchQuery] = useState('');

  // Live Explorer
  const [explorerBoard, setExplorerBoard] = useState('okta');
  const [explorerKeyword, setExplorerKeyword] = useState('');
  const [explorerJobs, setExplorerJobs] = useState([]);
  const [loadingExplorer, setLoadingExplorer] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);

  // Modals & Outreach Console
  const [selectedApp, setSelectedApp] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [runningDailyCycle, setRunningDailyCycle] = useState(false);
  const [cycleProgressMsg, setCycleProgressMsg] = useState('');

  // Direct Outreach Email in modal
  const [outreachEmailInput, setOutreachEmailInput] = useState('');
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [outreachSuccessMsg, setOutreachSuccessMsg] = useState('');

  // Candidate Profile State
  const [profile, setProfile] = useState({
    name: 'Abhishek Gour',
    email: 'abhishek@leovexa.in',
    phone: '+91 98765 43210',
    linkedin: '',
    github: '',
    portfolio: '',
    location: 'Remote / Global',
    bio: '',
    target_keywords: '',
    target_boards: '',
    daily_quota: 20,
    auto_apply_enabled: true
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchApplications();
    fetchProfile();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const res = await api.getGreenhouseDashboard();
      if (res.success) {
        setDashboard(res.data);
      }
    } catch (e) {
      console.warn('Dashboard fetch notice:', e.message);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const params = {
        status: statusFilter,
        board: boardFilter,
        search: searchQuery
      };
      if (isIndiaFilter === 'INDIA_ONLY') params.is_india = 'true';
      if (isIndiaFilter === 'GLOBAL_ONLY') params.is_india = 'false';
      if (channelFilter !== 'ALL') params.channel = channelFilter;

      const res = await api.getGreenhouseApplications(params);
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (e) {
      console.warn('Applications fetch notice:', e.message);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.getGreenhouseProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (e) {
      console.warn('Profile fetch notice:', e.message);
    }
  };

  // Re-fetch applications on any filter change
  useEffect(() => {
    fetchApplications();
  }, [statusFilter, boardFilter, isIndiaFilter, channelFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  // Trigger Daily 20 Auto-Apply Cycle
  const handleTriggerDailyCycle = async (force = false) => {
    if (!window.confirm(force ? 'Force run daily 20 auto-apply cycle now?' : 'Run today\'s 20-job Greenhouse auto-apply cycle now?')) return;
    try {
      setRunningDailyCycle(true);
      setCycleProgressMsg('Querying active Greenhouse boards, generating tailored AI cover letters & attaching candidate resume...');
      const res = await api.triggerDailyGreenhouseCycle({ targetCount: profile.daily_quota || 20, force });
      if (res.success) {
        alert(res.message || `Auto-applied to ${res.newlyAppliedCount} jobs!`);
        fetchDashboard();
        fetchApplications();
      } else {
        alert(res.error || 'Failed to complete daily cycle');
      }
    } catch (e) {
      alert(`Error running cycle: ${e.message}`);
    } finally {
      setRunningDailyCycle(false);
      setCycleProgressMsg('');
    }
  };

  // Live Explorer: Fetch jobs for board token
  const handleExploreBoard = async (token = explorerBoard, keyword = explorerKeyword) => {
    try {
      setLoadingExplorer(true);
      setExplorerBoard(token);
      const res = await api.exploreGreenhouseJobs({
        boardToken: token,
        keyword,
        content: false
      });
      if (res.success) {
        setExplorerJobs(res.jobs || []);
      } else {
        alert(res.error || `Failed to fetch jobs from board: ${token}`);
      }
    } catch (e) {
      alert(`Error exploring board: ${e.message}`);
    } finally {
      setLoadingExplorer(false);
    }
  };

  // 1-Click Apply to a single job from Live Explorer
  const handleApplySingle = async (job) => {
    try {
      setApplyingJobId(job.id);
      const res = await api.applySingleGreenhouseJob({
        boardToken: job.board_token || explorerBoard,
        jobId: job.id,
        force: true
      });
      if (res.success) {
        alert(`Application prepared & sent for ${job.title}!`);
        // Update job status in explorer
        setExplorerJobs(prev => prev.map(j => j.id === job.id ? { ...j, isApplied: true } : j));
        fetchDashboard();
        fetchApplications();
      } else {
        alert(res.error || 'Failed to submit application');
      }
    } catch (e) {
      alert(`Error applying: ${e.message}`);
    } finally {
      setApplyingJobId(null);
    }
  };

  // Update Status of Application
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await api.updateGreenhouseStatus(appId, { status: newStatus });
      if (res.success) {
        setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp(prev => ({ ...prev, status: newStatus }));
        }
        fetchDashboard();
      }
    } catch (e) {
      alert(`Status update error: ${e.message}`);
    }
  };

  // Delete Application
  const handleDeleteApp = async (appId) => {
    if (!window.confirm('Delete this application record?')) return;
    try {
      const res = await api.deleteGreenhouseApplication(appId);
      if (res.success) {
        setApplications(prev => prev.filter(a => a._id !== appId));
        if (selectedApp?._id === appId) setSelectedApp(null);
        fetchDashboard();
      }
    } catch (e) {
      alert(`Delete error: ${e.message}`);
    }
  };

  // Upload Resume File
  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      alert('Please select a resume file (PDF or DOCX)');
      return;
    }
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      setUploadingResume(true);
      const res = await api.uploadResume(formData);
      if (res.success) {
        alert(res.message || 'Resume uploaded successfully!');
        setProfile(res.data);
        setResumeFile(null);
        fetchDashboard();
      } else {
        alert(res.error || 'Failed to upload resume');
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingResume(false);
    }
  };

  // Save Candidate Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateGreenhouseProfile(profile);
      if (res.success) {
        alert('Profile saved successfully!');
        setShowProfileModal(false);
        fetchDashboard();
      } else {
        alert(res.error || 'Failed to save profile');
      }
    } catch (err) {
      alert(`Error saving profile: ${err.message}`);
    }
  };

  // Copy AI Cover Letter to clipboard
  const handleCopyPitch = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  // Send Direct Recruiter Outreach Email
  const handleSendDirectOutreach = async (app, recipientOverride = null) => {
    const toEmail = (recipientOverride || outreachEmailInput || app.recruiter_email || '').trim();
    if (!toEmail) {
      alert('Please enter a valid recruiter or hiring contact email address.');
      return;
    }

    try {
      setSendingOutreach(true);
      setOutreachSuccessMsg('Sending tailored AI application pitch & candidate resume...');
      const res = await api.sendGreenhouseOutreach({
        applicationId: app._id,
        recipientEmail: toEmail
      });

      if (res.success) {
        setOutreachSuccessMsg(`✅ Application successfully emailed to ${toEmail}!`);
        if (selectedApp && selectedApp._id === app._id) {
          setSelectedApp(res.application);
        }
        setApplications(prev => prev.map(a => a._id === app._id ? res.application : a));
        fetchDashboard();
        setTimeout(() => setOutreachSuccessMsg(''), 5000);
      } else {
        alert(res.error || 'Failed to dispatch email outreach');
        setOutreachSuccessMsg('');
      }
    } catch (err) {
      alert(`Outreach error: ${err.message}`);
      setOutreachSuccessMsg('');
    } finally {
      setSendingOutreach(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '700' }}>APPLIED</span>;
      case 'UNDER_REVIEW':
        return <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '700' }}>UNDER REVIEW</span>;
      case 'INTERVIEW':
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '700' }}>🎯 INTERVIEW</span>;
      case 'OFFER':
        return <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '700' }}>🎉 OFFER</span>;
      case 'REJECTED':
        return <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '700' }}>REJECTED</span>;
      default:
        return <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '700' }}>{status}</span>;
    }
  };

  const getChannelBadge = (channel) => {
    if (channel === 'DIRECT_EMAIL') {
      return <span style={{ fontSize: '0.72rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>Direct Email</span>;
    }
    if (channel === 'GREENHOUSE_API') {
      return <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>Greenhouse API</span>;
    }
    return <span style={{ fontSize: '0.72rem', color: '#06b6d4', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>Portal Assisted</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      {/* 🚀 Top Command Hero & Daily 20 Quota Telemetry */}
      <div className="glass-panel" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-20px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)'
              }}>
                <Briefcase size={22} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
                Greenhouse Job Board AI & Auto-Applier
              </h2>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span className="pulse-dot" style={{ background: '#10b981' }}></span>
                24/7 AUTONOMOUS RUNNER
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '650px', lineHeight: '1.5' }}>
              Daily autonomous pipeline that fetches 20 high-fit tech jobs from official Greenhouse API boards, crafts tailored AI pitches mapped to candidate skills, attaches your resume file, and submits direct applications automatically.
            </p>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="btn-run-daily-20"
              onClick={() => handleTriggerDailyCycle(false)}
              disabled={runningDailyCycle}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
                padding: '11px 18px',
                fontWeight: '700',
                cursor: runningDailyCycle ? 'wait' : 'pointer'
              }}
            >
              {runningDailyCycle ? (
                <>
                  <RefreshCw size={17} className="animate-spin" style={{ marginRight: '8px' }} />
                  Auto-Applying 20 Jobs...
                </>
              ) : (
                <>
                  <Zap size={17} style={{ marginRight: '8px' }} />
                  Run Daily 20 Auto-Apply
                </>
              )}
            </button>

            <button
              id="btn-resume-profile"
              onClick={() => setShowProfileModal(true)}
              className="btn btn-secondary"
              style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <User size={16} />
              Resume & Profile
            </button>

            <button
              id="btn-target-boards"
              onClick={() => setShowSettingsModal(true)}
              className="btn btn-secondary"
              style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Sliders size={16} />
              Target Boards
            </button>
          </div>
        </div>

        {/* Progress Message Banner if cycle is running */}
        {cycleProgressMsg && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#a7f3d0',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <RefreshCw size={16} className="animate-spin" color="#10b981" />
            <span>{cycleProgressMsg}</span>
          </div>
        )}

        {/* 📊 Telemetry Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginTop: '22px'
        }}>
          {/* Card 1: Daily Quota & Execution Cycle */}
          <div className="glass-card-interactive" style={{ padding: '16px', borderRadius: 'var(--radius-md)', borderTop: '2px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Daily Quota Progress
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#10b981' }}>
                {dashboard?.appliedToday || 0} / {dashboard?.dailyQuota || 20}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: `${Math.min(100, Math.round(((dashboard?.appliedToday || 0) / (dashboard?.dailyQuota || 20)) * 100))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease'
              }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Run: {dashboard?.lastDailyRun || 'Today'}</span>
              <span style={{ color: (dashboard?.appliedToday || 0) >= (dashboard?.dailyQuota || 20) ? '#10b981' : '#38bdf8', fontWeight: '700' }}>
                {(dashboard?.appliedToday || 0) >= (dashboard?.dailyQuota || 20) ? '🎯 Quota Met' : `${(dashboard?.dailyQuota || 20) - (dashboard?.appliedToday || 0)} Remaining`}
              </span>
            </div>
          </div>

          {/* Card 2: 🇮🇳 India Hubs & Roles */}
          <div
            className="glass-card-interactive"
            onClick={() => setIsIndiaFilter(isIndiaFilter === 'INDIA_ONLY' ? 'ALL' : 'INDIA_ONLY')}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              borderTop: '2px solid #f97316',
              cursor: 'pointer',
              background: isIndiaFilter === 'INDIA_ONLY' ? 'rgba(249, 115, 22, 0.12)' : undefined
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: '#fb923c', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🇮🇳 India Roles
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(249, 115, 22, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                Click to Filter
              </span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
              {dashboard?.indiaJobsCount || 0}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              Bengaluru, Gurgaon, Hyd & Remote ({dashboard?.todayIndiaCount || 0} applied today)
            </span>
          </div>

          {/* Card 3: 🌐 Global & Remote Roles */}
          <div
            className="glass-card-interactive"
            onClick={() => setIsIndiaFilter(isIndiaFilter === 'GLOBAL_ONLY' ? 'ALL' : 'GLOBAL_ONLY')}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              borderTop: '2px solid #38bdf8',
              cursor: 'pointer',
              background: isIndiaFilter === 'GLOBAL_ONLY' ? 'rgba(56, 189, 248, 0.12)' : undefined
            }}
          >
            <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🌐 Global & Remote
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
              {dashboard?.globalJobsCount || 0}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              Across {dashboard?.uniqueCompaniesCount || 1}+ top tech employers
            </span>
          </div>

          {/* Card 4: ✉️ Outreach & Recruiter Delivery */}
          <div className="glass-card-interactive" style={{ padding: '16px', borderRadius: 'var(--radius-md)', borderTop: '2px solid #818cf8' }}>
            <span style={{ fontSize: '0.74rem', color: '#a5b4fc', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ✉️ Email Outreach & Submissions
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#818cf8' }}>
                {dashboard?.emailOutreachCount || 0}
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Emails Sent
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              {dashboard?.apiSubmissionsCount || 0} API Submissions • {dashboard?.recruiterEmailsCount || 0} Contacts Found
            </span>
          </div>

          {/* Card 5: Interview Pipeline */}
          <div className="glass-card-interactive" style={{ padding: '16px', borderRadius: 'var(--radius-md)', borderTop: '2px solid #fbbf24' }}>
            <span style={{ fontSize: '0.74rem', color: '#fde68a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🎯 Interview Pipeline
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#fbbf24', marginTop: '6px' }}>
              {dashboard?.interviewCount || 0}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              {dashboard?.underReviewCount || 0} Under Review • {dashboard?.offerCount || 0} Offers
            </span>
          </div>
        </div>

        {/* 🧠 AI Market Intelligence & In-Demand Tech Stacks Bar */}
        <div style={{
          marginTop: '16px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="#818cf8" />
              In-Demand Tech Requirements Extracted by AI:
            </span>
            {dashboard?.topTechStacks && dashboard.topTechStacks.length > 0 ? (
              dashboard.topTechStacks.slice(0, 7).map((item) => (
                <span
                  key={item.skill}
                  style={{
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#c7d2fe',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '600'
                  }}
                >
                  {item.skill} ({item.count})
                </span>
              ))
            ) : (
              ['React', 'Node.js', 'Python', 'AWS', 'TypeScript', 'Docker', 'PostgreSQL'].map(tech => (
                <span
                  key={tech}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem'
                  }}
                >
                  {tech}
                </span>
              ))
            )}
          </div>

          <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot" style={{ background: '#10b981', width: '6px', height: '6px' }}></span>
            <span>AI Provider: Google Gemini & OpenRouter (100% Free Tier Integrated)</span>
          </div>
        </div>
      </div>

      {/* 🧭 Sub-View Switcher Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            id="btn-subview-tracker"
            onClick={() => setActiveSubView('tracker')}
            style={{
              background: activeSubView === 'tracker' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.1))' : 'transparent',
              color: activeSubView === 'tracker' ? '#10b981' : 'var(--text-muted)',
              border: activeSubView === 'tracker' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            Applications Tracker ({applications.length})
          </button>

          <button
            id="btn-subview-explorer"
            onClick={() => {
              setActiveSubView('explorer');
              if (explorerJobs.length === 0) {
                handleExploreBoard('stripe', '');
              }
            }}
            style={{
              background: activeSubView === 'explorer' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))' : 'transparent',
              color: activeSubView === 'explorer' ? '#818cf8' : 'var(--text-muted)',
              border: activeSubView === 'explorer' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Globe size={16} />
            Live Greenhouse Board Explorer
          </button>
        </div>

        <button
          onClick={() => {
            fetchDashboard();
            fetchApplications();
          }}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} style={{ marginRight: '6px' }} />
          Refresh
        </button>
      </div>

      {/* 📋 VIEW 1: APPLICATIONS TRACKER */}
      {activeSubView === 'tracker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {/* Status Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700', marginRight: '4px' }}>
                  Status:
                </span>
                {['ALL', 'APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: statusFilter === st ? '700' : '500',
                      background: statusFilter === st ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: statusFilter === st ? '#10b981' : 'var(--text-muted)',
                      border: statusFilter === st ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search role, company, location, tech stack..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '8px 12px 8px 34px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(0,0,0,0.2)',
                      color: '#fff',
                      fontSize: '0.84rem',
                      width: '280px'
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                  Search
                </button>
              </form>
            </div>

            {/* Sub-Filters: India Market & Outreach Channel */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Market Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '700' }}>Market:</span>
                <button
                  onClick={() => setIsIndiaFilter('ALL')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: isIndiaFilter === 'ALL' ? '700' : '500',
                    background: isIndiaFilter === 'ALL' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    color: isIndiaFilter === 'ALL' ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  All Markets
                </button>
                <button
                  onClick={() => setIsIndiaFilter('INDIA_ONLY')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: isIndiaFilter === 'INDIA_ONLY' ? '700' : '500',
                    background: isIndiaFilter === 'INDIA_ONLY' ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                    color: isIndiaFilter === 'INDIA_ONLY' ? '#fb923c' : 'var(--text-muted)',
                    border: isIndiaFilter === 'INDIA_ONLY' ? '1px solid rgba(249, 115, 22, 0.4)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  🇮🇳 India Hubs Only ({dashboard?.indiaJobsCount || 0})
                </button>
                <button
                  onClick={() => setIsIndiaFilter('GLOBAL_ONLY')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: isIndiaFilter === 'GLOBAL_ONLY' ? '700' : '500',
                    background: isIndiaFilter === 'GLOBAL_ONLY' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: isIndiaFilter === 'GLOBAL_ONLY' ? '#38bdf8' : 'var(--text-muted)',
                    border: isIndiaFilter === 'GLOBAL_ONLY' ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  🌐 Global / Remote ({dashboard?.globalJobsCount || 0})
                </button>
              </div>

              {/* Channel Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '700' }}>Outreach:</span>
                <button
                  onClick={() => setChannelFilter('ALL')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: channelFilter === 'ALL' ? '700' : '500',
                    background: channelFilter === 'ALL' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    color: channelFilter === 'ALL' ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  All Channels
                </button>
                <button
                  onClick={() => setChannelFilter('DIRECT_EMAIL')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: channelFilter === 'DIRECT_EMAIL' ? '700' : '500',
                    background: channelFilter === 'DIRECT_EMAIL' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: channelFilter === 'DIRECT_EMAIL' ? '#a5b4fc' : 'var(--text-muted)',
                    border: channelFilter === 'DIRECT_EMAIL' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  ✉️ Email Outreach ({dashboard?.emailOutreachCount || 0})
                </button>
                <button
                  onClick={() => setChannelFilter('GREENHOUSE_API')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: channelFilter === 'GREENHOUSE_API' ? '700' : '500',
                    background: channelFilter === 'GREENHOUSE_API' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    color: channelFilter === 'GREENHOUSE_API' ? '#10b981' : 'var(--text-muted)',
                    border: channelFilter === 'GREENHOUSE_API' ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Greenhouse API ({dashboard?.apiSubmissionsCount || 0})
                </button>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          {loadingApps ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>Loading applied jobs telemetry...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Briefcase size={42} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
                No Applications Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px' }}>
                {searchQuery || statusFilter !== 'ALL' || isIndiaFilter !== 'ALL' || channelFilter !== 'ALL'
                  ? 'No applications match your active filter criteria.'
                  : 'Start your automated job applications now. The autonomous engine will fetch 20 matching jobs from Greenhouse boards (including India tech hubs) and dispatch applications.'}
              </p>
              <button
                onClick={() => handleTriggerDailyCycle(false)}
                className="btn btn-primary"
                style={{ padding: '10px 20px', margin: '0 auto' }}
              >
                <Zap size={16} style={{ marginRight: '8px' }} />
                Run Daily 20 Auto-Apply Cycle
              </button>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                      <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: '700' }}>Company & Role</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: '700' }}>Location & Market</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: '700' }}>AI Tech Stack</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: '700' }}>Applied Date</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: '700' }}>Outreach Channel</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: '700' }}>AI Match</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app._id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Company & Role */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              color: '#818cf8',
                              fontSize: '0.85rem',
                              flexShrink: 0
                            }}>
                              {app.company_name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>
                                {app.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                <span style={{ fontWeight: '600', color: '#38bdf8' }}>{app.company_name}</span>
                                <span>•</span>
                                <span>gh: {app.board_token}</span>
                                {app.job_url && (
                                  <a
                                    href={app.job_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'var(--text-dim)', marginLeft: '2px', display: 'inline-flex' }}
                                    title="Open Job Posting"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location & Market */}
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {app.is_india_role ? (
                              <span style={{
                                background: 'rgba(249, 115, 22, 0.15)',
                                color: '#fb923c',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: '700'
                              }}>
                                🇮🇳 India
                              </span>
                            ) : (
                              <span style={{
                                background: 'rgba(56, 189, 248, 0.12)',
                                color: '#38bdf8',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: '600'
                              }}>
                                🌐 Global
                              </span>
                            )}
                            <span style={{ fontSize: '0.82rem' }}>{app.location || 'Remote'}</span>
                          </div>
                          {app.department && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                              {app.department}
                            </div>
                          )}
                        </td>

                        {/* AI Tech Stack Chips */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                            {app.tech_stack && app.tech_stack.length > 0 ? (
                              app.tech_stack.slice(0, 3).map((tech) => (
                                <span
                                  key={tech}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#cbd5e1',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '5px',
                                    fontSize: '0.7rem',
                                    fontWeight: '500'
                                  }}
                                >
                                  {tech}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Full Stack</span>
                            )}
                            {app.tech_stack && app.tech_stack.length > 3 && (
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem', alignSelf: 'center' }}>
                                +{app.tech_stack.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Applied Date */}
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} color="var(--text-dim)" />
                            <span>{new Date(app.applied_at || app.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Batch: {app.daily_batch_date || 'Today'}
                          </div>
                        </td>

                        {/* Outreach Channel & Recruiter Status */}
                        <td style={{ padding: '14px 18px' }}>
                          <div>
                            {getChannelBadge(app.apply_channel)}
                            {app.outreach_status === 'EMAIL_SENT' && (
                              <div style={{ fontSize: '0.7rem', color: '#a5b4fc', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Send size={10} /> {app.outreach_recipient || app.recruiter_email || 'Recruiter'}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* AI Match Score */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            color: '#10b981',
                            fontWeight: '700',
                            fontSize: '0.78rem'
                          }}>
                            <Sparkles size={12} />
                            <span>{app.match_score || 88}% Match</span>
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td style={{ padding: '14px 18px' }}>
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                            style={{
                              background: 'rgba(0,0,0,0.4)',
                              border: '1px solid var(--border-subtle)',
                              color: '#fff',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="APPLIED">Applied</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              id={`btn-view-app-${app._id}`}
                              onClick={() => {
                                setSelectedApp(app);
                                setOutreachEmailInput(app.recruiter_email || '');
                                setOutreachSuccessMsg('');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '5px 9px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="View AI Requirements & Cover Letter"
                            >
                              <Eye size={13} /> View
                            </button>

                            <button
                              id={`btn-email-app-${app._id}`}
                              onClick={() => {
                                setSelectedApp(app);
                                setOutreachEmailInput(app.recruiter_email || '');
                                setOutreachSuccessMsg('');
                              }}
                              className="btn"
                              style={{
                                padding: '5px 8px',
                                fontSize: '0.76rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: '#a5b4fc',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                              }}
                              title="Direct Recruiter Outreach"
                            >
                              <Send size={12} /> Outreach
                            </button>

                            <button
                              id={`btn-delete-app-${app._id}`}
                              onClick={() => handleDeleteApp(app._id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-dim)',
                                cursor: 'pointer',
                                padding: '5px',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🌐 VIEW 2: LIVE GREENHOUSE BOARD EXPLORER */}
      {activeSubView === 'explorer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Query Bar */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                Query Live Greenhouse Job Board API
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Target URL: <code>https://boards-api.greenhouse.io/v1/boards/{'{board_token}'}/jobs</code>
              </p>
            </div>

            {/* Quick popular board chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                Top Tech Boards:
              </span>
              {POPULAR_BOARDS.map((b) => (
                <button
                  key={b.token}
                  onClick={() => handleExploreBoard(b.token, explorerKeyword)}
                  title={b.badge}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: explorerBoard === b.token ? '700' : '500',
                    background: explorerBoard === b.token ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: explorerBoard === b.token ? '#a5b4fc' : 'var(--text-muted)',
                    border: explorerBoard === b.token ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{b.name}</span>
                  {b.badge && b.badge.includes('🇮🇳') && (
                    <span style={{ fontSize: '0.68rem', color: '#fb923c', fontWeight: '700' }}>🇮🇳</span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Board Token & Keyword Input */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Greenhouse Board Token:
                </label>
                <input
                  type="text"
                  placeholder="e.g. okta, stripe, rubrik, coupang"
                  value={explorerBoard}
                  onChange={(e) => setExplorerBoard(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ flex: '2 1 280px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Filter by Role Keyword (optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineer, Full Stack, Frontend, React, Bangalore"
                  value={explorerKeyword}
                  onChange={(e) => setExplorerKeyword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  onClick={() => handleExploreBoard(explorerBoard, explorerKeyword)}
                  disabled={loadingExplorer}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontWeight: '700' }}
                >
                  {loadingExplorer ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" style={{ marginRight: '6px' }} />
                      Fetching Live Board...
                    </>
                  ) : (
                    <>
                      <Search size={15} style={{ marginRight: '6px' }} />
                      Fetch Live Jobs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loadingExplorer ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 12px', color: '#818cf8' }} />
              <p>Calling Greenhouse API for <strong>{explorerBoard}</strong>...</p>
            </div>
          ) : explorerJobs.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center' }}>
              <Building size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)' }}>
                No active jobs found for board <code>{explorerBoard}</code> matching "{explorerKeyword}".
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {explorerJobs.map((job) => {
                const locLower = (job.location?.toLowerCase() || '');
                const isIndiaJob = ['india', 'bengaluru', 'bangalore', 'gurgaon', 'gurugram', 'hyderabad', 'mumbai', 'pune', 'delhi', 'noida'].some(k => locLower.includes(k));

                return (
                  <div
                    key={job.id}
                    className="glass-card-interactive"
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      border: job.isApplied ? '1px solid rgba(16, 185, 129, 0.4)' : isIndiaJob ? '1px solid rgba(249, 115, 22, 0.35)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>
                            {job.company_name}
                          </span>
                          {isIndiaJob && (
                            <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                              🇮🇳 India Hub
                            </span>
                          )}
                        </div>
                        {job.isApplied ? (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Check size={12} /> Applied
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            ID: #{job.id}
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#fff', marginBottom: '8px', lineHeight: '1.4' }}>
                        {job.title}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} color="var(--text-dim)" />
                        <span>{job.location || 'Remote'}</span>
                        {job.department && (
                          <>
                            <span>•</span>
                            <span>{job.department}</span>
                          </>
                        )}
                      </div>
                    </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {job.absolute_url ? (
                      <a
                        href={job.absolute_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ExternalLink size={13} /> View on Greenhouse
                      </a>
                    ) : <div />}

                    <button
                      onClick={() => handleApplySingle(job)}
                      disabled={applyingJobId === job.id || job.isApplied}
                      className="btn btn-primary"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        background: job.isApplied ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, #10b981, #059669)',
                        color: job.isApplied ? 'var(--text-muted)' : '#fff',
                        cursor: job.isApplied ? 'default' : 'pointer'
                      }}
                    >
                      {applyingJobId === job.id ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" style={{ marginRight: '4px' }} />
                          Applying...
                        </>
                      ) : job.isApplied ? (
                        'Already Applied'
                      ) : (
                        <>
                          <Zap size={12} style={{ marginRight: '4px' }} />
                          Auto-Apply Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* 🔍 MODAL: APPLICATION DETAIL INSPECTOR */}
      {selectedApp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>
                  {selectedApp.company_name} • gh:{selectedApp.board_token}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>
                  {selectedApp.title}
                </h3>
              </div>
              <button
                id="btn-close-app-modal-x"
                onClick={() => setSelectedApp(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Meta Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Location & Market</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    {selectedApp.is_india_role && (
                      <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                        🇮🇳 India
                      </span>
                    )}
                    <span style={{ fontSize: '0.86rem', color: '#fff', fontWeight: '600' }}>
                      {selectedApp.location || 'Remote'}
                    </span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Applied Timestamp</div>
                  <div style={{ fontSize: '0.86rem', color: '#fff', fontWeight: '600', marginTop: '4px' }}>
                    {new Date(selectedApp.applied_at || selectedApp.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Application Channel</div>
                  <div style={{ marginTop: '4px' }}>{getChannelBadge(selectedApp.apply_channel)}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>AI Suitability Score</div>
                  <div style={{ fontSize: '0.86rem', color: '#10b981', fontWeight: '700', marginTop: '4px' }}>
                    {selectedApp.match_score || 88}% Match ({selectedApp.experience_level || 'Mid - Senior'})
                  </div>
                </div>
              </div>

              {/* 🧠 AI Company Requirements & Tech Stack Section */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#818cf8" />
                    AI Extracted Company Requirements & Tech Stack
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Level: <strong style={{ color: '#fff' }}>{selectedApp.experience_level || 'Mid - Senior'}</strong>
                  </span>
                </div>

                {/* Tech Stack Chips */}
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>
                    Required Technical Stack:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedApp.tech_stack && selectedApp.tech_stack.length > 0 ? (
                      selectedApp.tech_stack.map((t) => (
                        <span
                          key={t}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#e2e8f0',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: '600'
                          }}
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>General Full Stack Engineering</span>
                    )}
                  </div>
                </div>

                {/* Key Requirements Bullets */}
                {selectedApp.key_requirements && selectedApp.key_requirements.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>
                      Core Company Responsibilities:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                      {selectedApp.key_requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Match Reasons */}
                {selectedApp.match_reasons && selectedApp.match_reasons.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', marginBottom: '4px', display: 'block', fontWeight: '600' }}>
                      Why Candidate Profile Fits:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#a7f3d0', lineHeight: '1.5' }}>
                      {selectedApp.match_reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ✉️ Direct Recruiter Outreach Console */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={14} color="#10b981" />
                    Direct Recruiter Outreach Console
                  </span>
                  {selectedApp.outreach_status === 'EMAIL_SENT' ? (
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                      Delivered to {selectedApp.outreach_recipient || selectedApp.recruiter_email}
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem' }}>
                      Ready to Send
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    placeholder="Recruiter or talent email (e.g. careers@company.com or recruiter@...)"
                    value={outreachEmailInput}
                    onChange={(e) => setOutreachEmailInput(e.target.value)}
                    style={{
                      flex: '1 1 260px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />
                  <button
                    onClick={() => handleSendDirectOutreach(selectedApp, outreachEmailInput)}
                    disabled={sendingOutreach || !outreachEmailInput}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sendingOutreach ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" style={{ marginRight: '6px' }} />
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <Send size={13} style={{ marginRight: '6px' }} />
                        {selectedApp.outreach_status === 'EMAIL_SENT' ? 'Re-send Outreach' : 'Send Outreach Email'}
                      </>
                    )}
                  </button>
                </div>

                {outreachSuccessMsg && (
                  <div style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: '600' }}>
                    {outreachSuccessMsg}
                  </div>
                )}
              </div>

              {/* Cover Letter Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#818cf8" />
                    AI-Generated Personalized Pitch / Cover Letter
                  </span>
                  <button
                    id="btn-copy-pitch"
                    onClick={() => handleCopyPitch(selectedApp.cover_letter)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#a5b4fc',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedPitch ? <Check size={12} color="#10b981" /> : null}
                    {copiedPitch ? 'Copied!' : 'Copy Pitch'}
                  </button>
                </div>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.84rem',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedApp.cover_letter || 'No cover letter attached.'}
                </div>
              </div>

              {/* Candidate Snapshot & Resume Used */}
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#c7d2fe', marginBottom: '8px', display: 'block' }}>
                  Candidate Snapshot & Resume Attached
                </span>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.88rem' }}>
                      {selectedApp.candidate_snapshot?.name || profile.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedApp.candidate_snapshot?.email || profile.email} • {selectedApp.candidate_snapshot?.phone || profile.phone}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} />
                      {selectedApp.candidate_snapshot?.resume_filename || 'Candidate_Resume.pdf'}
                    </span>
                    <a
                      href={api.getResumeDownloadUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                    >
                      <Download size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Greenhouse Direct Link */}
              {selectedApp.job_url && (
                <div>
                  <a
                    href={selectedApp.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '10px' }}
                  >
                    <ExternalLink size={15} />
                    Open Live Greenhouse Job Posting
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status:</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleUpdateStatus(selectedApp._id, e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}
                >
                  <option value="APPLIED">Applied</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <button
                id="btn-close-app-modal-bottom"
                onClick={() => setSelectedApp(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📄 MODAL: RESUME & CANDIDATE PROFILE */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                  Candidate Profile & Resume Manager
                </h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Resume File Upload Box */}
              <div style={{
                border: '2px dashed rgba(99, 102, 241, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(99, 102, 241, 0.04)'
              }}>
                <Upload size={28} color="#818cf8" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  Upload Active Resume File
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  This file will be automatically attached to every Greenhouse application and email outreach.
                </p>

                {profile?.resume_filename && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    color: '#a7f3d0',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '14px'
                  }}>
                    <Check size={14} color="#10b981" />
                    <span>Active File: <strong>{profile.resume_filename}</strong></span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}
                  />
                  <button
                    onClick={handleUploadResume}
                    disabled={uploadingResume || !resumeFile}
                    className="btn btn-primary"
                    style={{ padding: '7px 16px', fontSize: '0.8rem' }}
                  >
                    {uploadingResume ? 'Uploading...' : 'Save File'}
                  </button>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Target Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={profile.linkedin}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>GitHub / Portfolio URL</label>
                    <input
                      type="text"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Candidate Bio / Core Technical Skills (for AI tailored pitches)</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px' }}
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ MODAL: TARGET BOARDS & KEYWORDS SETTINGS */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '580px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#10b981" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                  Greenhouse Automation Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  Target Greenhouse Board Tokens (comma-separated):
                </label>
                <textarea
                  rows={3}
                  value={profile.target_boards}
                  onChange={(e) => setProfile({ ...profile, target_boards: e.target.value })}
                  placeholder="stripe, figma, airbnb, gusto, discord, datadog, reddit, coinbase, vercel..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  The daily automated runner iterates through these Greenhouse boards in sequence.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  Target Job Title Keywords (comma-separated):
                </label>
                <input
                  type="text"
                  value={profile.target_keywords}
                  onChange={(e) => setProfile({ ...profile, target_keywords: e.target.value })}
                  placeholder="engineer, developer, full stack, frontend, backend, react, node, ai..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                    Daily Quota Limit:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={profile.daily_quota || 20}
                    onChange={(e) => setProfile({ ...profile, daily_quota: parseInt(e.target.value, 10) || 20 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                    Autonomous Runner Status:
                  </label>
                  <select
                    value={profile.auto_apply_enabled ? 'true' : 'false'}
                    onChange={(e) => setProfile({ ...profile, auto_apply_enabled: e.target.value === 'true' })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.84rem' }}
                  >
                    <option value="true">Active (Autonomous Daily 20)</option>
                    <option value="false">Paused (Manual Triggers Only)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
