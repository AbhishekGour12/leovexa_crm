import mongoose from 'mongoose';

const DealSchema = new mongoose.Schema({
  lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  title: { type: String, required: true },
  stage: {
    type: String,
    enum: [
      'NEW',
      'CONTACTED',
      'REPLIED',
      'QUALIFIED',
      'MEETING',
      'PROPOSAL',
      'NEGOTIATION',
      'WON',
      'LOST'
    ],
    default: 'QUALIFIED'
  },
  estimated_value: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  meeting_date: { type: Date },
  meeting_link: { type: String, default: '' },
  proposal_url: { type: String, default: '' },
  notes: { type: String, default: '' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Deal = mongoose.model('Deal', DealSchema);
