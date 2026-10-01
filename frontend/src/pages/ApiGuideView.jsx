import React from 'react';
import {
  BookOpen,
  Sparkles,
  Send,
  Mail,
  Bot,
  CheckCircle2,
  ExternalLink,
  Copy,
  ArrowRight
} from 'lucide-react';

export const ApiGuideView = ({ onNavigateToSettings }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '950px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-high" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
            Complete Setup Manual
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Step-by-Step Step Instructions (Hinglish & English)</span>
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
          How to Extract & Connect API Keys (Gemini, Telegram, Gmail, OpenRouter)
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Follow these 4 simple steps to extract your personal API keys and paste them into the Settings tab.
        </p>
      </div>

      {/* Step 1: Gemini API Key */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#818cf8" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              Step 1: Get Gemini API Key (100% Free)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Gemini is your primary AI for website scraping analysis, scoring & cold pitch writing.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          <p>
            1. Open Google AI Studio: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#06b6d4', fontWeight: '700' }}>https://aistudio.google.com/app/apikey <ExternalLink size={12} style={{ display: 'inline' }} /></a>
          </p>
          <p>
            2. Apne Google Account se sign in karein.
          </p>
          <p>
            3. <strong>"Create API Key"</strong> button par click karein aur project select karein (e.g. <code>My First Project</code>).
          </p>
          <p>
            4. Key generate hone ke baad copy karein (Starts with <code>AIzaSy...</code>).
          </p>
          <p>
            5. Is CRM ke <strong>Settings</strong> page par <code>GEMINI_API_KEY</code> mein paste karein aur <strong>"Test Gemini Key"</strong> par click karein!
          </p>
        </div>
      </div>

      {/* Step 2: Telegram Bot Token & Chat ID */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} color="#06b6d4" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              Step 2: Create Telegram Bot & Get Chat ID
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Allows you to get instant hot lead notifications on your phone and approve pitches with 1 click.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#67e8f9' }}>Part A: Create Bot & Get Token</strong>
            <p style={{ marginTop: '4px' }}>
              1. Telegram app open karein aur search karein: <strong>@BotFather</strong> (Verified blue tick).<br />
              2. Send command: <code>/newbot</code><br />
              3. Name enter karein (e.g., <code>Leovexa Outreach Bot</code>).<br />
              4. Username enter karein ending in 'bot' (e.g., <code>leovexa_outreach_crm_bot</code>).<br />
              5. BotFather aapko <strong>HTTP API Token</strong> dega (e.g., <code>7123456789:AAF...</code>). Copy karein!
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#67e8f9' }}>Part B: Get your Chat ID</strong>
            <p style={{ marginTop: '4px' }}>
              1. Telegram par search karein: <strong>@userinfobot</strong><br />
              2. <code>/start</code> press karein. Ye aapka numeric <strong>Id</strong> dega (e.g., <code>987654321</code>).<br />
              3. Phir apne naye bot ko search karein aur uske andar <code>/start</code> press karein taaki bot aapko message bhej sake.<br />
              4. Settings page mein <code>TELEGRAM_BOT_TOKEN</code> aur <code>TELEGRAM_CHAT_ID</code> daalkar <strong>"Send Test Alert"</strong> dabayein!
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Gmail App Password */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={18} color="#f43f5e" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              Step 3: Generate 16-Digit Gmail App Password
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Allows Leovexa to send approved cold outreach emails directly from your Gmail account safely.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          <p>
            1. Go to your Google Account Security: <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" style={{ color: '#06b6d4', fontWeight: '700' }}>https://myaccount.google.com/security <ExternalLink size={12} style={{ display: 'inline' }} /></a>
          </p>
          <p>
            2. Make sure <strong>2-Step Verification</strong> (2FA) is turned ON.
          </p>
          <p>
            3. Search bar mein <strong>"App Passwords"</strong> search karein ya direct visit karein: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#06b6d4' }}>https://myaccount.google.com/apppasswords</a>
          </p>
          <p>
            4. App Name enter karein: <code>Leovexa Outreach</code> aur <strong>Create</strong> dabayein.
          </p>
          <p>
            5. Google aapko 16-character password dega (e.g. <code>abcd efgh ijkl mnop</code>). Copy karein aur Settings mein paste karein!
          </p>
        </div>
      </div>

      {/* Step 4: OpenRouter Free API Key */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color="#10b981" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              Step 4: Get OpenRouter Free API Key (Backup AI)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Ensures zero downtime if Gemini hits rate limits.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          <p>
            1. Visit OpenRouter: <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: '#06b6d4', fontWeight: '700' }}>https://openrouter.ai/keys <ExternalLink size={12} style={{ display: 'inline' }} /></a>
          </p>
          <p>
            2. Sign in with Google / GitHub.
          </p>
          <p>
            3. Click <strong>"Create Key"</strong> (Name: <code>Leovexa CRM</code>).
          </p>
          <p>
            4. Copy key (Starts with <code>sk-or-v1-...</code>) and paste into Settings!
          </p>
        </div>
      </div>

      {/* Jump to Settings CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button onClick={onNavigateToSettings} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
          <span>Go to Settings & Test Keys</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
