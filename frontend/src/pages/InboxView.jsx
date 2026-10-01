import React, { useState } from 'react';
import {
  Inbox as InboxIcon,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Bot,
  Flame,
  CornerDownRight
} from 'lucide-react';

export const InboxView = ({ conversations = [], leads = [], onSimulateReply, onSendReply }) => {
  const [selectedConv, setSelectedConv] = useState(conversations[0] || null);
  const [customReply, setCustomReply] = useState('');
  const [simLeadId, setSimLeadId] = useState(leads[0]?._id || '');
  const [simText, setSimText] = useState('Yes, we want to upgrade our dental clinic website and automate patient appointments. Can you share your portfolio and pricing?');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    if (!simLeadId) return;
    setIsSimulating(true);
    await onSimulateReply(simLeadId, simText);
    setIsSimulating(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', minHeight: '650px' }}>
      {/* Left Column: Conversation List + Simulator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Reply Simulator Card */}
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.06)', borderColor: 'rgba(6, 182, 212, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Sparkles size={16} color="#06b6d4" />
            <h4 style={{ fontSize: '0.86rem', fontWeight: '700', color: '#67e8f9' }}>
              Simulate Inbound Reply & AI
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select
              className="form-input"
              style={{ fontSize: '0.78rem', padding: '6px 10px' }}
              value={simLeadId}
              onChange={(e) => setSimLeadId(e.target.value)}
            >
              <option value="">Select Lead to simulate reply...</option>
              {leads.map(l => (
                <option key={l._id} value={l._id}>
                  {l.business_name} ({l.email})
                </option>
              ))}
            </select>

            <textarea
              className="form-input"
              rows={2}
              style={{ fontSize: '0.78rem', padding: '8px' }}
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
            />

            <button
              onClick={handleSimulate}
              disabled={isSimulating || !simLeadId}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Sparkles size={14} />
              <span>{isSimulating ? 'Classifying...' : 'Simulate Prospect Reply'}</span>
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="glass-panel" style={{ flex: 1, padding: '12px', overflowY: 'auto', maxHeight: '500px' }}>
          <div style={{ padding: '6px 8px 10px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Replies ({conversations.length})
          </div>

          {conversations.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              No replies received yet. Use the simulator above to test!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {conversations.map((c) => {
                const lead = c.lead_id || {};
                const isSelected = selectedConv && selectedConv._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      setSelectedConv(c);
                      setCustomReply(c.suggested_ai_reply || '');
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#fff' }}>
                        {lead.business_name || 'Prospect'}
                      </span>
                      <span className="badge badge-intent" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                        {c.intent || 'REPLIED'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.last_message || 'Inbound reply received'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active Thread & Suggested AI Follow-up */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {selectedConv ? (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                    {selectedConv.lead_id?.business_name || 'Prospect Conversation'}
                  </h3>
                  <span className="badge badge-high">
                    Intent: {selectedConv.intent}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedConv.lead_id?.email} • {selectedConv.lead_id?.city || 'Indore'}
                </p>
              </div>

              {selectedConv.ai_summary && (
                <div style={{ maxWidth: '320px', padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#818cf8', marginBottom: '2px' }}>
                    Gemini Intent Summary:
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {selectedConv.ai_summary}
                  </div>
                </div>
              )}
            </div>

            {/* Message Thread */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxHeight: '320px', overflowY: 'auto' }}>
              {selectedConv.history && selectedConv.history.length > 0 ? (
                selectedConv.history.map((item, idx) => {
                  const isLeovexa = item.sender === 'LEOVEXA';
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isLeovexa ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: isLeovexa ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                        border: isLeovexa ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.7rem', color: isLeovexa ? '#a5b4fc' : '#94a3b8', fontWeight: '700' }}>
                        {isLeovexa ? <Bot size={13} /> : <User size={13} />}
                        <span>{isLeovexa ? 'Leovexa Outreach' : selectedConv.lead_id?.business_name || 'Prospect'}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#f1f5f9', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                        {item.content}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Inbound Prospect Message:</div>
                  <p style={{ fontSize: '0.88rem', color: '#fff' }}>"{selectedConv.last_message}"</p>
                </div>
              )}
            </div>

            {/* AI Suggested Response Box */}
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Sparkles size={15} color="#10b981" />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#34d399' }}>
                  AI Suggested Follow-up & Booking Link
                </span>
              </div>
              <textarea
                className="form-input"
                rows={4}
                style={{ fontSize: '0.84rem', lineHeight: '1.5', marginBottom: '10px' }}
                value={customReply || selectedConv.suggested_ai_reply}
                onChange={(e) => setCustomReply(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-success"
                  style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                  onClick={() => alert('Reply dispatched to prospect!')}
                >
                  <Send size={14} />
                  <span>Send Reply via Gmail</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <InboxIcon size={48} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem' }}>Select a conversation on the left to view the thread</p>
          </div>
        )}
      </div>
    </div>
  );
};
