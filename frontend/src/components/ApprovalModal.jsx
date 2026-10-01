import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  ThumbsDown,
  Building2,
  Mail,
  MapPin
} from 'lucide-react';

export const ApprovalModal = ({ message, onClose, onApprove, onReject, onRegenerate }) => {
  if (!message) return null;
  const lead = message.lead_id || {};

  const [subject, setSubject] = useState(message.subject || '');
  const [content, setContent] = useState(message.content || '');
  const [tone, setTone] = useState('Direct & High Converting');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const res = await onRegenerate(message._id, { tone, instructions: customPrompt });
    if (res && res.data) {
      setSubject(res.data.subject);
      setContent(res.data.content);
    }
    setIsRegenerating(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(message._id, { subject, content });
    setIsApproving(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-high">
                Human Review Required
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {message.channel} Outreach
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              {lead.business_name || 'Prospect'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {lead.industry} • {lead.city || 'India'} • Score: <strong style={{ color: '#fb7185' }}>{lead.lead_score || 70}/100</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Subject</label>
            <input
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pitch Body (Editable)</label>
            <textarea
              className="form-input"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ lineHeight: '1.6', fontSize: '0.88rem' }}
            />
          </div>
        </div>

        {/* AI Regeneration Bar */}
        <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.15)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#818cf8" />
              Re-generate with Gemini / OpenRouter
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px' }}>
            <select
              className="form-input"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            >
              <option value="Direct & Concise">Tone: Direct & Concise</option>
              <option value="Problem & Value Solution">Tone: Problem & Value Solution</option>
              <option value="Casual & Friendly Audit">Tone: Casual & Friendly Audit</option>
              <option value="High-Ticket Authority">Tone: High-Ticket Authority</option>
            </select>

            <input
              className="form-input"
              placeholder="Custom instructions (e.g. offer 20% discount)"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            />

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <RefreshCw size={13} className={isRegenerating ? 'pulse-dot' : ''} />
              <span>{isRegenerating ? 'Writing...' : 'Re-Write'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => onReject(message._id)}
            className="btn btn-danger"
            style={{ fontSize: '0.84rem' }}
          >
            <ThumbsDown size={14} />
            <span>Reject Pitch</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.84rem' }}
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="btn btn-success"
              style={{ fontSize: '0.84rem' }}
            >
              <Send size={15} />
              <span>{isApproving ? 'Dispatching...' : 'Approve & Send via Gmail'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
