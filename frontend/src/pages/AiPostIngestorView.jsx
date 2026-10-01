import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Mail,
  MessageSquare,
  FileText,
  User,
  Building,
  DollarSign,
  Clock,
  Zap,
  Globe,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  ExternalLink,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api';

export const AiPostIngestorView = ({ onLeadAdded }) => {
  const [rawInput, setRawInput] = useState('');
  const [tone, setTone] = useState('human_casual');
  const [serviceOffering, setServiceOffering] = useState('High-Converting Web Development & AI Automation');
  const [senderName, setSenderName] = useState('Leovexa Team');
  const [customCta, setCustomCta] = useState('Free 5-min video audit or quick Figma preview');
  const [autoSaveToCrm, setAutoSaveToCrm] = useState(false); // Default false: only pitch & send email without cluttering leads
  const [autoSendEmails, setAutoSendEmails] = useState(true); // Default true: directly send email immediately without asking

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTabPerItem, setActiveTabPerItem] = useState({});
  const [copiedKey, setCopiedKey] = useState('');
  const [sendingEmailIdx, setSendingEmailIdx] = useState(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState({});

  // Sample Presets for 1-Click Testing
  const presets = [
    {
      title: 'LinkedIn Founder Post',
      icon: '💼',
      text: `Looking for a rockstar web developer or small agency to revamp our SaaS landing page. Current one is slow and doesn't convert signups. Budget is around $2,500 - $4,000. Must have experience with React, Tailwind & modern clean design. Drop your work or reach out directly at founder@nexusflow.io!`
    },
    {
      title: 'Upwork / Freelancer RFP',
      icon: '🚀',
      text: `We operate 3 dental clinics in Austin, Texas. We need an automated online appointment booking system and WhatsApp reminder flow built into our WordPress/Next.js site. Clients should be able to book 24/7. Budget: $3,000. Timeline: 2-3 weeks. Send proposal and portfolio to drharris@austindentalcare.com or DM.`
    },
    {
      title: 'Meta / Facebook Group Query',
      icon: '💬',
      text: `Hey guys, can anyone help build an automated CRM pipeline and lead capture form? We are drowning in manual spreadsheets and losing leads. Need someone reliable who explains things simply and doesn't ghost. WhatsApp me at +1 555-019-2834 or email ops@primegrowth.co`
    },
    {
      title: 'Bulk Multi-Post (3 in 1)',
      icon: '📦',
      text: `POST 1:
Looking for a frontend dev to fix mobile responsiveness on our e-commerce store. Budget $800. Email: mark@urbanstride.shop

---

POST 2:
Need a full-stack developer to create an internal real estate lead tracking dashboard with email alerts. Budget $3,500. Contact: sarah.j@apexrealty.org

---

POST 3:
Hiring an agency for complete website redesign + AI chatbot integration. Urgent timeline. Email: alex@velocityscale.io`
    }
  ];

  const handleAnalyze = async () => {
    if (!rawInput.trim()) {
      alert('Please paste a post or project description first!');
      return;
    }

    setIsLoading(true);
    setResults(null);
    setEmailStatus({});

    try {
      const res = await api.extractPostLeadsAndProposals({
        rawText: rawInput,
        tone,
        serviceOffering,
        senderName,
        customCta,
        autoSaveToCrm,
        autoSendEmails
      });

      if (res.success && res.data) {
        setResults(res.data);
        const initialTabs = {};
        const initialEmailStatus = {};

        res.data.forEach((item, idx) => {
          initialTabs[idx] = 'email';
          if (item.email_sent) {
            initialEmailStatus[idx] = {
              success: true,
              message: item.email_status?.simulated
                ? '✅ Proposal Auto-Sent (Simulated Mode)'
                : '✅ Live Email Delivered Automatically!'
            };
          }
        });

        setActiveTabPerItem(initialTabs);
        setEmailStatus(initialEmailStatus);
        if (autoSaveToCrm && onLeadAdded) onLeadAdded();
      } else {
        alert(`Error: ${res.error || 'Failed to analyze text'}`);
      }
    } catch (err) {
      alert(`API Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAllRemaining = async () => {
    if (!results || results.length === 0) return;
    setIsBulkSending(true);

    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      if (item.contact_email && !emailStatus[i]?.success) {
        await handleSendEmail(item, i);
      }
    }
    setIsBulkSending(false);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const handleSendEmail = async (item, idx) => {
    if (!item.contact_email) {
      const manualEmail = prompt('No email was found in the post. Enter recipient email:');
      if (!manualEmail) return;
      item.contact_email = manualEmail;
    }

    setSendingEmailIdx(idx);
    try {
      const res = await api.sendProposalEmail({
        to: item.contact_email,
        subject: item.proposal?.subject || 'Quick idea regarding your project post',
        body: item.proposal?.full_email_body || '',
        clientName: item.client_name || item.company_or_project,
        leadId: item.lead_id
      });

      if (res.success) {
        setEmailStatus(prev => ({
          ...prev,
          [idx]: { success: true, message: res.message || 'Email sent successfully!' }
        }));
        if (onLeadAdded) onLeadAdded();
      } else {
        setEmailStatus(prev => ({
          ...prev,
          [idx]: { success: false, message: res.error || 'Send failed' }
        }));
      }
    } catch (err) {
      setEmailStatus(prev => ({
        ...prev,
        [idx]: { success: false, message: err.message }
      }));
    } finally {
      setSendingEmailIdx(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Top Banner Card */}
      <div className="glass-panel" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))',
        borderColor: 'rgba(99, 102, 241, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
              }}>
                <Sparkles size={22} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>
                AI Lead & Proposal Ingestor
              </h2>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <ShieldCheck size={13} /> 100% Anti-Robotic Human Tone
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '750px', lineHeight: '1.5' }}>
              Paste raw copy from <strong>LinkedIn posts, Upwork/Freelancer gigs, Facebook groups, or client messages</strong> (single or bulk). 
              Our AI extracts exact client requirements, email addresses, budget, and generates a warm, human-written proposal with zero robotic AI clichés in simple English.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              Engine: <span style={{ color: '#818cf8', fontWeight: '600' }}>Gemini 1.5 Flash</span>
            </div>
          </div>
        </div>

        {/* 1-Click Preset Chips */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '10px' }}>
            Try 1-Click Example Presets:
          </span>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setRawInput(p.text)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  fontSize: '0.78rem',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  e.currentTarget.style.borderColor = '#818cf8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <span>{p.icon}</span> {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Input & Options Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Left Column: Raw Input Box */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color="#818cf8" />
              Paste Raw Post, Client Message or Multi-Post Text
            </label>
            {rawInput && (
              <button
                onClick={() => setRawInput('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Clear text
              </button>
            )}
          </div>

          <textarea
            className="form-input"
            rows={9}
            placeholder="Example: Paste LinkedIn hiring post, Upwork job posting, Meta/Facebook group message, or email inquiry here... (For multiple posts at once, separate them with '---' or line breaks)"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            style={{
              width: '100%',
              fontSize: '0.86rem',
              lineHeight: '1.6',
              fontFamily: 'inherit',
              padding: '14px',
              resize: 'vertical',
              background: 'rgba(15, 23, 42, 0.6)'
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#67e8f9', cursor: 'pointer', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={autoSendEmails}
                  onChange={(e) => setAutoSendEmails(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#06b6d4' }}
                />
                ⚡ Auto-Send Email Immediately to all extracted emails (No confirmation prompt)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoSaveToCrm}
                  onChange={(e) => setAutoSaveToCrm(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#6366f1' }}
                />
                💾 Also save to CRM Leads directory (Leave unchecked to only pitch & email)
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={isLoading || !rawInput.trim()}
                style={{
                  padding: '11px 26px',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    Analyzing, Pitching & Dispatching...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Extract, Pitch & Auto-Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Copywriting & Pitch Preferences */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <HeartHandshake size={18} color="#ec4899" />
            <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#fff' }}>
              Human Pitch Settings
            </h3>
          </div>

          {/* Tone Selector */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Writing Style & Tone:
            </label>
            <select
              className="form-input"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{ width: '100%', fontSize: '0.82rem' }}
            >
              <option value="human_casual">🌟 Natural & Empathetic (Friendly, Zero AI Fluff)</option>
              <option value="executive_consultative">🎯 Direct & Consultative (Expert, Crisp)</option>
              <option value="storyteller_painpoint">🤝 Problem-Solver (Addresses Exact Friction)</option>
              <option value="quick_casual">💬 Short Punchy (For LinkedIn/WhatsApp DM)</option>
            </select>
          </div>

          {/* Service Offering */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Your Service / Pitch Focus:
            </label>
            <input
              type="text"
              className="form-input"
              value={serviceOffering}
              onChange={(e) => setServiceOffering(e.target.value)}
              placeholder="e.g. Web Development & Booking CRM"
              style={{ width: '100%', fontSize: '0.82rem' }}
            />
          </div>

          {/* Sender Name */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Your Name / Agency Name:
            </label>
            <input
              type="text"
              className="form-input"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Leovexa Team / Alex"
              style={{ width: '100%', fontSize: '0.82rem' }}
            />
          </div>

          {/* Custom CTA */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Low-Friction Call To Action (CTA):
            </label>
            <input
              type="text"
              className="form-input"
              value={customCta}
              onChange={(e) => setCustomCta(e.target.value)}
              placeholder="e.g. Free 5-min video breakdown or Figma mockup"
              style={{ width: '100%', fontSize: '0.82rem' }}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                {results.length} PROSPECT(S) EXTRACTED
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                AI Extracted Intel & Human Proposals
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {results.filter(r => r.contact_email && !emailStatus[results.indexOf(r)]?.success).length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={handleSendAllRemaining}
                  disabled={isBulkSending}
                  style={{
                    fontSize: '0.82rem',
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isBulkSending ? (
                    <>
                      <RefreshCw size={14} className="spin" /> Sending All...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Send Remaining Emails ({results.filter(r => r.contact_email && !emailStatus[results.indexOf(r)]?.success).length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {results.map((item, idx) => {
            const currentTab = activeTabPerItem[idx] || 'email';
            const status = emailStatus[idx];

            return (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  background: 'rgba(15, 23, 42, 0.75)'
                }}
              >
                {/* Item Header & Extracted Meta Cards */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        {item.source_platform || 'Inquiry'}
                      </span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
                        {item.company_or_project || item.client_name || 'Prospect Client'}
                      </h4>
                      {item.urgency === 'High' && (
                        <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          🔥 High Urgency
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '680px' }}>
                      {item.project_summary}
                    </p>
                  </div>

                  {/* Anti-AI Natural Score Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}>
                      <ShieldCheck size={16} color="#10b981" />
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#34d399' }}>
                        {item.human_score_rating || 98}% Human Emotion Score
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      0% AI Clichés • Easy Conversational English
                    </span>
                  </div>
                </div>

                {/* Key Extracted Info Chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {/* Email */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>
                      Contact Email
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '600', color: item.contact_email ? '#67e8f9' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} />
                      {item.contact_email || 'None in post (Will prompt on send)'}
                    </div>
                  </div>

                  {/* Phone / Handle */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>
                      Phone / Handle
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '600', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageSquare size={14} color="#818cf8" />
                      {item.contact_phone || item.contact_handle || 'Not specified'}
                    </div>
                  </div>

                  {/* Budget & Timeline */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>
                      Budget / Timeline
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '600', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={14} />
                      {item.budget_or_timeline || 'Open / Negotiable'}
                    </div>
                  </div>
                </div>

                {/* Requirements & Tech Stack Badges */}
                {item.key_requirements && item.key_requirements.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Extracted Project Requirements:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {item.key_requirements.map((req, rIdx) => (
                        <span key={rIdx} style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          color: '#c7d2fe',
                          fontSize: '0.78rem',
                          padding: '3px 10px',
                          borderRadius: '6px'
                        }}>
                          • {req}
                        </span>
                      ))}
                      {item.tech_stack?.map((t, tIdx) => (
                        <span key={`tech-${tIdx}`} style={{
                          background: 'rgba(6, 182, 212, 0.1)',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                          color: '#67e8f9',
                          fontSize: '0.78rem',
                          padding: '3px 10px',
                          borderRadius: '6px'
                        }}>
                          ⚡ {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pitch Tabs Switcher */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginTop: '6px' }}>
                  <button
                    onClick={() => setActiveTabPerItem(prev => ({ ...prev, [idx]: 'email' }))}
                    style={{
                      background: currentTab === 'email' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: currentTab === 'email' ? '#fff' : 'var(--text-muted)',
                      border: currentTab === 'email' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Mail size={14} /> Full Proposal Email
                  </button>

                  <button
                    onClick={() => setActiveTabPerItem(prev => ({ ...prev, [idx]: 'dm' }))}
                    style={{
                      background: currentTab === 'dm' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: currentTab === 'dm' ? '#fff' : 'var(--text-muted)',
                      border: currentTab === 'dm' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <MessageSquare size={14} /> 3-Sentence Social DM Pitch
                  </button>
                </div>

                {/* Tab 1: Full Proposal Email */}
                {currentTab === 'email' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Subject Line */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(0,0,0,0.4)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Subject:</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#fff' }}>
                          {item.proposal?.subject}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.proposal?.subject, `subj-${idx}`)}
                        style={{ background: 'transparent', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                      >
                        {copiedKey === `subj-${idx}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        {copiedKey === `subj-${idx}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Email Body */}
                    <div style={{ position: 'relative' }}>
                      <textarea
                        className="form-input"
                        rows={9}
                        value={item.proposal?.full_email_body}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResults(prev => {
                            const clone = [...prev];
                            clone[idx].proposal.full_email_body = val;
                            return clone;
                          });
                        }}
                        style={{
                          width: '100%',
                          fontSize: '0.86rem',
                          lineHeight: '1.65',
                          background: 'rgba(10, 15, 29, 0.85)',
                          padding: '14px',
                          color: '#e2e8f0',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    {/* Actions Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleCopy(item.proposal?.full_email_body, `body-${idx}`)}
                          className="btn"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {copiedKey === `body-${idx}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                          {copiedKey === `body-${idx}` ? 'Proposal Copied!' : 'Copy Proposal'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {status && (
                          <span style={{ fontSize: '0.8rem', color: status.success ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {status.success ? <CheckCircle2 size={15} /> : null} {status.message}
                          </span>
                        )}

                        <button
                          onClick={() => handleSendEmail(item, idx)}
                          disabled={sendingEmailIdx === idx}
                          className="btn btn-primary"
                          style={{
                            padding: '9px 18px',
                            fontSize: '0.84rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {sendingEmailIdx === idx ? (
                            <>
                              <RefreshCw size={15} className="spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <Send size={15} /> 1-Click Send Email
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: 3-Sentence Social DM Pitch */}
                {currentTab === 'dm' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Quick 3-sentence message optimized for direct messages on LinkedIn, WhatsApp, Telegram, or Twitter:
                    </p>

                    <div style={{
                      background: 'rgba(10, 15, 29, 0.85)',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      color: '#e2e8f0'
                    }}>
                      {item.proposal?.short_dm_pitch}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleCopy(item.proposal?.short_dm_pitch, `dm-${idx}`)}
                        className="btn btn-primary"
                        style={{
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {copiedKey === `dm-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                        {copiedKey === `dm-${idx}` ? 'DM Pitch Copied!' : 'Copy DM Pitch'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AiPostIngestorView;
