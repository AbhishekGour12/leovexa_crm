import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, default: 'All' },
  daily_limit: { type: Number, default: 20 },
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'],
    default: 'ACTIVE'
  },
  ai_provider: {
    type: String,
    enum: ['gemini', 'openrouter', 'hybrid'],
    default: 'hybrid'
  },
  require_approval: { type: Boolean, default: true },
  follow_ups_enabled: { type: Boolean, default: true },
  follow_up_days: { type: [Number], default: [3, 7] }, // Day 3, Day 7
  custom_prompt_instructions: { type: String, default: '' },
  service_offering: {
    type: String,
    default: 'Web development, AI automation, appointment booking systems, and CRM integrations for high growth businesses.'
  },
  stats: {
    total_leads: { type: Number, default: 0 },
    qualified_leads: { type: Number, default: 0 },
    pending_approval: { type: Number, default: 0 },
    contacted: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    interested: { type: Number, default: 0 },
    meetings: { type: Number, default: 0 },
    won: { type: Number, default: 0 }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Campaign = mongoose.model('Campaign', CampaignSchema);
