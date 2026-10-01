import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Bot,
  Send,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api.js';

export const SettingsView = ({ onNavigateToGuide }) => {
  const [settings, setSettings] = useState({
    gemini_api_key: '',
    openrouter_api_key: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    gmail_user: '',
    gmail_app_password: '',
    sender_name: 'Leovexa Technologies',
    auto_approve_outreach: true,
    daily_discovery_enabled: true,
    daily_leads_limit: 50
  });

  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      alert(`Save error: ${e.message}`);
    }
    setIsSaving(false);
  };

  const runTest = async (service, testFn) => {
    setTesting(prev => ({ ...prev, [service]: true }));
    setTestResults(prev => ({ ...prev, [service]: null }));
    try {
      const res = await testFn();
      setTestResults(prev => ({
        ...prev,
        [service]: { success: res.success, message: res.message || res.error || res.response }
      }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [service]: { success: false, message: err.message }
      }));
    }
    setTesting(prev => ({ ...prev, [service]: false }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      {/* Header with link to Guide */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>
            Integrations & API Settings
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Configure your Gemini, Telegram, OpenRouter, and Gmail credentials.
          </p>
        </div>

        <button
          onClick={onNavigateToGuide}
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem' }}
        >
          <HelpCircle size={15} color="#818cf8" />
          <span>Step-by-Step API Key Guide</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Gemini AI */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#818cf8" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                  Gemini API (Primary AI Brain)
                </h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Used for autonomous website audits, opportunity scoring & personalized message generation.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={testing.gemini || !settings.gemini_api_key}
              onClick={() => runTest('gemini', () => api.testGemini(settings.gemini_api_key))}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Zap size={13} />
              <span>{testing.gemini ? 'Testing Connection...' : 'Test Gemini Key'}</span>
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              GEMINI_API_KEY
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              className="form-input"
              value={settings.gemini_api_key}
              onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
            />
          </div>

          {testResults.gemini && (
            <div style={{
              marginTop: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              background: testResults.gemini.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: testResults.gemini.success ? '#34d399' : '#fb7185',
              border: `1px solid ${testResults.gemini.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}>
              {testResults.gemini.success ? '✅ ' : '❌ '} {testResults.gemini.message}
            </div>
          )}
        </div>

        {/* Section 2: OpenRouter AI (Fallback) */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} color="#06b6d4" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                  OpenRouter Free API (Fallback AI)
                </h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Automatically steps in if Gemini reaches rate limits or daily quotas.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={testing.openrouter || !settings.openrouter_api_key}
              onClick={() => runTest('openrouter', () => api.testOpenRouter(settings.openrouter_api_key))}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Zap size={13} />
              <span>{testing.openrouter ? 'Testing...' : 'Test OpenRouter'}</span>
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              OPENROUTER_API_KEY
            </label>
            <input
              type="password"
              placeholder="sk-or-v1-..."
              className="form-input"
              value={settings.openrouter_api_key}
              onChange={(e) => setSettings({ ...settings, openrouter_api_key: e.target.value })}
            />
          </div>

          {testResults.openrouter && (
            <div style={{
              marginTop: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              background: testResults.openrouter.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: testResults.openrouter.success ? '#34d399' : '#fb7185',
              border: `1px solid ${testResults.openrouter.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}>
              {testResults.openrouter.success ? '✅ ' : '❌ '} {testResults.openrouter.message}
            </div>
          )}
        </div>

        {/* Section 3: Telegram Bot */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={20} color="#38bdf8" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                  Telegram Bot (Hot Leads & Approvals)
                </h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Sends instant alerts to your phone with one-click inline approval buttons.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={testing.telegram || !settings.telegram_bot_token || !settings.telegram_chat_id}
              onClick={() => runTest('telegram', () => api.testTelegram(settings.telegram_bot_token, settings.telegram_chat_id))}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Send size={13} />
              <span>{testing.telegram ? 'Sending Test...' : 'Send Test Alert to Telegram'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                TELEGRAM_BOT_TOKEN (from @BotFather)
              </label>
              <input
                type="password"
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuvWXyz..."
                className="form-input"
                value={settings.telegram_bot_token}
                onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                TELEGRAM_CHAT_ID (your user/group ID)
              </label>
              <input
                placeholder="e.g. 123456789"
                className="form-input"
                value={settings.telegram_chat_id}
                onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
              />
            </div>
          </div>

          {testResults.telegram && (
            <div style={{
              marginTop: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              background: testResults.telegram.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: testResults.telegram.success ? '#34d399' : '#fb7185',
              border: `1px solid ${testResults.telegram.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}>
              {testResults.telegram.success ? '✅ ' : '❌ '} {testResults.telegram.message}
            </div>
          )}
        </div>

        {/* Section 4: Gmail Outreach */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={20} color="#f43f5e" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                  Gmail Outreach (Nodemailer SMTP)
                </h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Sends approved pitches using your official Gmail + 16-character Google App Password.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={testing.gmail || !settings.gmail_user || !settings.gmail_app_password}
              onClick={() => runTest('gmail', () => api.testGmail(settings.gmail_user, settings.gmail_app_password))}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Zap size={13} />
              <span>{testing.gmail ? 'Verifying SMTP...' : 'Verify Gmail SMTP'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Sender Name</label>
              <input
                className="form-input"
                value={settings.sender_name}
                onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Gmail Address</label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                className="form-input"
                value={settings.gmail_user}
                onChange={(e) => setSettings({ ...settings, gmail_user: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>16-Digit App Password</label>
              <input
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                className="form-input"
                value={settings.gmail_app_password}
                onChange={(e) => setSettings({ ...settings, gmail_app_password: e.target.value })}
              />
            </div>
          </div>

          {testResults.gmail && (
            <div style={{
              marginTop: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              background: testResults.gmail.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: testResults.gmail.success ? '#34d399' : '#fb7185',
              border: `1px solid ${testResults.gmail.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}>
              {testResults.gmail.success ? '✅ ' : '❌ '} {testResults.gmail.message}
            </div>
          )}
        </div>

        {/* Section 5: Autonomous Pipeline & Daily 50 Leads Schedule */}
        <div className="glass-panel" style={{ padding: '22px', border: '1px solid rgba(129, 140, 248, 0.3)', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={20} color="#38bdf8" />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                Autonomous Daily 50 Leads & Hands-Free Outreach Automation
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Controls automated daily business prospecting, automatic high-score cold pitch approval, and spaced Gmail email dispatch.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Auto Approve Toggle */}
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.84rem', color: '#fff' }}>
                  Auto-Approve High Scoring Pitches
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(settings.auto_approve_outreach)}
                  onChange={(e) => setSettings({ ...settings, auto_approve_outreach: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                When enabled, qualified business leads with score &ge; 60 are automatically approved upon AI discovery and queued for live Gmail sending without requiring manual button clicks.
              </p>
            </div>

            {/* Daily Automated Discovery */}
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.84rem', color: '#fff' }}>
                  Daily Scheduled Discovery Cycle
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(settings.daily_discovery_enabled)}
                  onChange={(e) => setSettings({ ...settings, daily_discovery_enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Automatically triggers every morning at <strong>09:00 AM</strong> to find 50 authentic clinic & business leads (USA, UK, UAE, India), drafts personalized pitches referencing <strong style={{ color: '#38bdf8' }}>https://leovexa.in</strong>, and runs follow-ups.
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ fontSize: '0.84rem', color: '#c7d2fe' }}>
            {saveSuccess ? '✅ Settings saved and active across all services!' : 'Changes update live in MongoDB without restarting backend.'}
          </div>
          <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <CheckCircle2 size={16} />
            <span>{isSaving ? 'Saving...' : 'Save & Activate Settings'}</span>
          </button>
        </div>

        {/* Danger Zone: Clear CRM Data */}
        <div className="glass-panel" style={{ padding: '20px', borderColor: 'rgba(244, 63, 94, 0.25)', background: 'rgba(244, 63, 94, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fb7185', marginBottom: '2px' }}>
                Reset / Wipe All Fake CRM Data
              </h5>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Clears all demo leads, pitches, deals, and simulated conversations from MongoDB Atlas while keeping your settings and API keys safe.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Are you sure you want to remove all fake leads and CRM data?')) {
                  const res = await api.clearAllData();
                  alert(res.message || 'All fake data removed successfully!');
                  window.location.reload();
                }
              }}
              className="btn btn-danger"
              style={{ fontSize: '0.8rem', padding: '8px 16px' }}
            >
              <span>Wipe Fake Data</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
