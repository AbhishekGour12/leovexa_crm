import React, { useState } from 'react';
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
  Flame,
  Trash2,
  CheckSquare,
  Square,
  Zap,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const ApprovalQueueView = ({ messages = [], onOpenApprovalModal, onApprove, onReject, onRefresh }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map(m => m._id)));
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Approve and queue ${selectedIds.size} selected email pitch(es) for live dispatch?`)) return;

    try {
      setIsProcessing(true);
      const res = await api.batchApproveMessages(Array.from(selectedIds));
      if (res.success) {
        alert(res.message || `Successfully approved ${selectedIds.size} messages!`);
        setSelectedIds(new Set());
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || 'Failed to batch approve messages');
      }
    } catch (e) {
      alert(`Batch approve error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchReject = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete / reject ${selectedIds.size} selected draft(s)?`)) return;

    try {
      setIsProcessing(true);
      const res = await api.deleteMultipleMessages(Array.from(selectedIds));
      if (res.success) {
        setSelectedIds(new Set());
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || 'Failed to delete selected drafts');
      }
    } catch (e) {
      alert(`Batch delete error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAllPending = async () => {
    if (messages.length === 0) return;
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to delete ALL (${messages.length}) pending outreach drafts from the approval queue?`)) return;

    try {
      setIsProcessing(true);
      const res = await api.deleteAllMessages('PENDING_APPROVAL');
      if (res.success) {
        setSelectedIds(new Set());
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || 'Failed to clear approval queue');
      }
    } catch (e) {
      alert(`Clear queue error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(244, 63, 94, 0.08))',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
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
            Review, edit, or multi-select and batch approve personalized cold pitches before they are sent via Gmail to prevent AI hallucinations or generic outreach.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {messages.length > 0 && (
            <button
              onClick={handleSelectAllToggle}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {selectedIds.size === messages.length ? (
                <>
                  <Square size={14} />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <CheckSquare size={14} />
                  <span>Select All ({messages.length})</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleClearAllPending}
            disabled={messages.length === 0 || isProcessing}
            className="btn btn-danger"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: messages.length === 0 ? 0.5 : 1
            }}
            title="Delete all drafts currently waiting for approval"
          >
            <Trash2 size={14} />
            <span>Clear All Pending ({messages.length})</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div style={{
          position: 'sticky',
          top: '10px',
          zIndex: 30,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(99, 102, 241, 0.5)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color="#818cf8" />
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              {selectedIds.size} pitch draft{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear selection
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleBatchReject}
              disabled={isProcessing}
              className="btn btn-danger"
              style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 size={14} />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>

            <button
              onClick={handleBatchApprove}
              disabled={isProcessing}
              className="btn btn-success"
              style={{
                padding: '7px 16px',
                fontSize: '0.82rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)'
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Approve & Dispatch Selected ({selectedIds.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

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
            const isSelected = selectedIds.has(msg._id);

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
                  borderColor: isSelected
                    ? 'rgba(99, 102, 241, 0.7)'
                    : score >= 80 ? 'rgba(244, 63, 94, 0.3)' : undefined,
                  background: isSelected ? 'rgba(99, 102, 241, 0.08)' : undefined,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(msg._id)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          marginTop: '3px',
                          accentColor: '#818cf8'
                        }}
                        title="Select for batch action"
                      />
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
