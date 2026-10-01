import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Play,
  Pause,
  Users,
  Send,
  MessageSquare,
  Trophy,
  MapPin,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

export const CampaignsView = ({ campaigns = [], onOpenNewCampaign, onToggleStatus }) => {
  const [sequences, setSequences] = useState([]);
  const [loadingSeqs, setLoadingSeqs] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('cadence'); // 'cadence' | 'campaigns'

  useEffect(() => {
    loadSequences();
  }, []);

  const loadSequences = async () => {
    setLoadingSeqs(true);
    try {
      const res = await api.getFollowupSequences();
      if (res.success) {
        setSequences(res.data);
      }
    } catch (e) {
      console.warn('Error loading followup sequences:', e.message);
    }
    setLoadingSeqs(false);
  };

  const handleManualFollowup = async (leadId, step) => {
    try {
      const res = await api.triggerManualFollowup(leadId, step);
      alert(res.message || 'Follow-up queued and sent!');
      loadSequences();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            Multi-Touch Outreach Cadence & Automated Follow-up Pipeline
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Autonomous 3-step outreach sequence: Day 0 Initial Pitch &rarr; Day 3 Value Bump &rarr; Day 7 Final Case Study.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveSubTab(activeSubTab === 'cadence' ? 'campaigns' : 'cadence')}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            <span>{activeSubTab === 'cadence' ? '📁 View Campaign Groups' : '⚡ View Follow-up Pipeline'}</span>
          </button>
          <button
            onClick={onOpenNewCampaign}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem' }}
          >
            <Plus size={16} />
            <span>+ New Campaign</span>
          </button>
        </div>
      </div>

      {/* Cadence Flow Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {/* Step 1 */}
        <div className="glass-panel" style={{ padding: '16px', borderTop: '3px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase' }}>
              Touchpoint 1 (Day 0)
            </span>
            <Send size={15} color="#818cf8" />
          </div>
          <h5 style={{ fontSize: '0.96rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
            Personalized Digital Audit & Pitch
          </h5>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Deep research into business website, booking flaws, and custom conversion pitch referencing <strong>https://leovexa.in</strong>.
          </p>
        </div>

        {/* Step 2 */}
        <div className="glass-panel" style={{ padding: '16px', borderTop: '3px solid #0ea5e9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase' }}>
              Touchpoint 2 (Day 3)
            </span>
            <Clock size={15} color="#38bdf8" />
          </div>
          <h5 style={{ fontSize: '0.96rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
            Value Bump & 2-Min Video Offer
          </h5>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Polite reminder offering a 2-minute custom walkthrough of their booking funnel upgrade without sounding pushy.
          </p>
        </div>

        {/* Step 3 */}
        <div className="glass-panel" style={{ padding: '16px', borderTop: '3px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#c084fc', textTransform: 'uppercase' }}>
              Touchpoint 3 (Day 7)
            </span>
            <Zap size={15} color="#c084fc" />
          </div>
          <h5 style={{ fontSize: '0.96rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
            Final Note & Case Study Proof
          </h5>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Courteous breakup touchpoint sharing quick portfolio results before moving lead to long-term newsletter nurture.
          </p>
        </div>
      </div>

      {/* Main Table: Active Lead Follow-up Sequences */}
      {activeSubTab === 'cadence' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
                Active Automated Follow-up Sequences ({sequences.length} Leads in Sequence)
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Track each prospect's position in the 3-step cadence. Follow-ups send automatically on schedule or can be triggered manually.
              </p>
            </div>

            <button onClick={loadSequences} className="btn btn-secondary" style={{ fontSize: '0.78rem' }}>
              <span>🔄 Refresh Pipeline</span>
            </button>
          </div>

          {sequences.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No leads currently in the active follow-up sequence. Discover fresh leads from the Dashboard to begin the cadence!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>PROSPECT & CLINIC</th>
                    <th style={{ padding: '10px 12px' }}>STEP 1: INITIAL</th>
                    <th style={{ padding: '10px 12px' }}>STEP 2: DAY 3 VALUE</th>
                    <th style={{ padding: '10px 12px' }}>STEP 3: DAY 7 FINAL</th>
                    <th style={{ padding: '10px 12px' }}>NEXT AUTO ACTION</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {sequences.map((seq) => {
                    const countryFlag = seq.country === 'USA' ? '🇺🇸' : seq.country === 'UK' ? '🇬🇧' : seq.country === 'UAE' ? '🇦🇪' : '🇮🇳';
                    const hasStep1 = Boolean(seq.steps.initial && seq.steps.initial.status === 'SENT');
                    const hasStep2 = Boolean(seq.steps.followup_1 && seq.steps.followup_1.status === 'SENT');
                    const hasStep3 = Boolean(seq.steps.followup_2 && seq.steps.followup_2.status === 'SENT');

                    return (
                      <tr key={seq.lead_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{countryFlag}</span>
                            <span>{seq.business_name}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{seq.email}</div>
                        </td>

                        {/* Step 1 */}
                        <td style={{ padding: '12px' }}>
                          {hasStep1 ? (
                            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                              ✅ Sent
                            </span>
                          ) : (
                            <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                              ⏳ Queued
                            </span>
                          )}
                        </td>

                        {/* Step 2 */}
                        <td style={{ padding: '12px' }}>
                          {hasStep2 ? (
                            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                              ✅ Sent
                            </span>
                          ) : hasStep1 ? (
                            <span className="badge" style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>
                              ⏳ Auto (Day 3)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Waiting Step 1</span>
                          )}
                        </td>

                        {/* Step 3 */}
                        <td style={{ padding: '12px' }}>
                          {hasStep3 ? (
                            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                              ✅ Sent
                            </span>
                          ) : hasStep2 ? (
                            <span className="badge" style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
                              ⏳ Auto (Day 7)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Waiting Step 2</span>
                          )}
                        </td>

                        {/* Next Action */}
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#c7d2fe' }}>
                            {seq.next_action}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {!hasStep2 && hasStep1 && (
                            <button
                              onClick={() => handleManualFollowup(seq.lead_id, 'FOLLOWUP_1')}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            >
                              <Send size={11} />
                              <span>Send Day 3</span>
                            </button>
                          )}
                          {hasStep2 && !hasStep3 && (
                            <button
                              onClick={() => handleManualFollowup(seq.lead_id, 'FOLLOWUP_2')}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            >
                              <Send size={11} />
                              <span>Send Day 7</span>
                            </button>
                          )}
                          {hasStep3 && (
                            <span style={{ fontSize: '0.74rem', color: '#34d399' }}>✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Campaign Cards Section */}
      {activeSubTab === 'campaigns' && (
        <div>
          {campaigns.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center' }}>
              <Target size={40} color="#818cf8" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                No Active Campaigns
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Create your first outreach campaign (e.g. "US Dental Clinics" or "Dubai Luxury Real Estate")
              </p>
              <button onClick={onOpenNewCampaign} className="btn btn-primary" style={{ fontSize: '0.84rem' }}>
                <Plus size={16} />
                <span>Create Campaign</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '18px' }}>
              {campaigns.map((camp) => {
                const stats = camp.stats || {};
                const isActive = camp.status === 'ACTIVE';

                return (
                  <div
                    key={camp._id}
                    className="glass-panel"
                    style={{
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <span className="badge" style={{ background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isActive ? '#34d399' : '#fbbf24', marginBottom: '6px' }}>
                            {camp.status}
                          </span>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                            {camp.name}
                          </h4>
                        </div>

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                          Limit: {camp.daily_limit}/day
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        <span>🎯 {camp.industry}</span>
                        <span>📍 {camp.location}</span>
                        <span>🤖 {camp.ai_provider}</span>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Offer:</strong> {camp.service_offering}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{stats.total_leads || 0}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Leads</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>{stats.qualified_leads || 0}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Qualified</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#06b6d4' }}>{stats.contacted || 0}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Sent</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#8b5cf6' }}>{stats.replies || 0}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Replies</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
