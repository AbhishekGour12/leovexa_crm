import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Kanban as KanbanIcon,
  Plus,
  Trophy,
  Calendar,
  IndianRupee,
  MoreVertical,
  ArrowRight,
  Flame,
  CheckCircle2,
  Trash2
} from 'lucide-react';

const STAGES = [
  { id: 'QUALIFIED', label: 'AI Qualified', color: '#6366f1' },
  { id: 'CONTACTED', label: 'Outreach Sent', color: '#06b6d4' },
  { id: 'REPLIED', label: 'Inbound Replied', color: '#8b5cf6' },
  { id: 'MEETING', label: 'Audit / Discovery Call', color: '#f59e0b' },
  { id: 'PROPOSAL', label: 'Proposal Sent', color: '#ec4899' },
  { id: 'WON', label: 'Client Closed (Won)', color: '#10b981' }
];

export const DealsKanbanView = ({ deals = [], leads = [], onUpdateStage, onCreateDeal, onDeleteDeal }) => {
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: 'Website Redesign + Appointment Funnel',
    lead_id: leads[0]?._id || '',
    stage: 'QUALIFIED',
    estimated_value: 45000,
    currency: 'INR'
  });

  const handleStageChange = async (dealId, nextStage) => {
    if (nextStage === 'WON') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
    await onUpdateStage(dealId, { stage: nextStage });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDeal.lead_id || !newDeal.title) return;
    await onCreateDeal(newDeal);
    setShowAddDeal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            High-Ticket Client Pipeline (Kanban)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Track leads from first AI research to signed retainer contracts.
          </p>
        </div>

        <button
          onClick={() => setShowAddDeal(true)}
          className="btn btn-primary"
          style={{ fontSize: '0.84rem' }}
        >
          <Plus size={16} />
          <span>+ Add Deal to Pipeline</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="kanban-board">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);

          return (
            <div key={stage.id} className="kanban-col">
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }}></div>
                  <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fff' }}>
                    {stage.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '9999px', color: 'var(--text-muted)' }}>
                    {stageDeals.length}
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: '700', color: stage.color }}>
                  ₹{stageTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Deal Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stageDeals.map((deal) => {
                  const lead = deal.lead_id || {};
                  return (
                    <div
                      key={deal._id}
                      className="glass-card-interactive"
                      style={{
                        padding: '14px',
                        borderColor: stage.id === 'WON' ? 'rgba(16, 185, 129, 0.4)' : undefined
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h5 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>
                          {deal.title}
                        </h5>
                        <button
                          onClick={() => onDeleteDeal(deal._id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                          title="Delete Deal"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        🏢 {lead.business_name || 'Prospect'} ({lead.city || 'Indore'})
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#34d399' }}>
                          ₹{(deal.estimated_value || 0).toLocaleString('en-IN')}
                        </span>

                        {/* Move Stage Selector */}
                        <select
                          value={deal.stage}
                          onChange={(e) => handleStageChange(deal._id, e.target.value)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            color: '#e2e8f0',
                            fontSize: '0.7rem',
                            padding: '3px 6px',
                            cursor: 'pointer'
                          }}
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      {showAddDeal && (
        <div className="modal-overlay" onClick={() => setShowAddDeal(false)}>
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '480px', padding: '24px', background: '#0d1322' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>Add Deal to Pipeline</h4>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Deal Title *</label>
                <input
                  required
                  className="form-input"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Select Lead *</label>
                <select
                  required
                  className="form-input"
                  value={newDeal.lead_id}
                  onChange={(e) => setNewDeal({ ...newDeal, lead_id: e.target.value })}
                >
                  <option value="">Select a lead...</option>
                  {leads.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.business_name} ({l.city || 'Indore'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Deal Value (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newDeal.estimated_value}
                    onChange={(e) => setNewDeal({ ...newDeal, estimated_value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stage</label>
                  <select
                    className="form-input"
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddDeal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
