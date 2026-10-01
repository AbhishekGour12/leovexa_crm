import mongoose from 'mongoose';

const ConversationItemSchema = new mongoose.Schema({
  sender: { type: String, enum: ['LEOVEXA', 'PROSPECT', 'AI_ASSISTANT'], required: true },
  channel: { type: String, default: 'EMAIL' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  intent_detected: { type: String, default: '' },
  sentiment: { type: String, default: 'neutral' }
});

const ConversationSchema = new mongoose.Schema({
  lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, unique: true },
  campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  last_message: { type: String, default: '' },
  last_message_at: { type: Date, default: Date.now },
  intent: {
    type: String,
    enum: [
      'INTERESTED',
      'PRICING_INQUIRY',
      'MEETING_REQUEST',
      'PORTFOLIO_REQUEST',
      'QUESTION',
      'NOT_INTERESTED',
      'UNSUBSCRIBE',
      'NEUTRAL',
      'UNKNOWN'
    ],
    default: 'UNKNOWN'
  },
  ai_summary: { type: String, default: '' },
  requires_human: { type: Boolean, default: false },
  suggested_ai_reply: { type: String, default: '' },
  history: [ConversationItemSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Conversation = mongoose.model('Conversation', ConversationSchema);
