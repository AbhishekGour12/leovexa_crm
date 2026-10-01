import React from 'react';
import {
  CheckCircle2,
  ThumbsDown,
  Sparkles,
  Send,
  Edit3,
  Building,
  Mail,
  MapPin,
  Clock,
  Flame
} from 'lucide-react';

export const ApprovalQueueView = ({ messages = [], onOpenApprovalModal, onApprove, onReject }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(244, 63, 94, 0.08))',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-review">
              Human In The Loop Safety Gate
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {messages.length} drafts waiting for review
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            Cold Outreach Approval Queue
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Review and approve personalized cold pitches before they are sent via Gmail to prevent AI hallucinations or generic outreach.
          </p>
        </div>
      </div>

      {/* Messages Grid */}
      {messages.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 14px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
            Queue is Clear!
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
            No emails are currently waiting for approval. New pitches will appear here as AI audits imported leads.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '18px' }}>
          {messages.map((msg) => {
            const lead = msg.lead_id || {};
            const score = lead.lead_score || 70;
            const scoreClass = score >= 80 ? 'score-80' : score >= 60 ? 'score-60' : 'score-40';

            return (
              <div
                key={msg._id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  borderColor: score >= 80 ? 'rgba(244, 63, 94, 0.3)' : undefined
                }}
              >
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>
                          {lead.business_name || 'Prospect Business'}
                        </h4>
                        {score >= 80 && (
                          <span className="badge badge-high" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                            <Flame size={10} /> HOT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {lead.industry} • {lead.city || 'Indore'} • {lead.email}
                      </div>
                    </div>
                    <span className={`score-pill ${scoreClass}`} style={{ fontSize: '0.8rem' }}>
                      {score}/100
                    </span>
                  </div>

                  {/* Pitch Preview Box */}
                  <div style={{ background: 'rgba(13, 18, 31, 0.9)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#818cf8', marginBottom: '6px' }}>
                      Subject: {msg.subject}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5', whiteSpace: 'pre-line', maxHeight: '140px', overflowY: 'auto' }}>
                      {msg.content}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => onReject(msg._id)}
                    className="btn btn-danger"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    <ThumbsDown size={13} />
                    <span>Reject</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onOpenApprovalModal(msg)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      <Edit3 size={13} />
                      <span>Review / Re-write</span>
                    </button>
                    <button
                      onClick={() => onApprove(msg._id)}
                      className="btn btn-success"
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    >
                      <Send size={13} />
                      <span>Approve & Send</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
