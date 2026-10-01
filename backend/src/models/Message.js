import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  channel: {
    type: String,
    enum: ['EMAIL', 'TELEGRAM', 'WHATSAPP', 'LINKEDIN', 'INSTAGRAM'],
    default: 'EMAIL'
  },
  direction: {
    type: String,
    enum: ['OUTBOUND', 'INBOUND'],
    default: 'OUTBOUND'
  },
  type: {
    type: String,
    enum: ['INITIAL', 'FOLLOWUP_1', 'FOLLOWUP_2', 'CUSTOM', 'REPLY'],
    default: 'INITIAL'
  },
  subject: { type: String, default: '' },
  content: { type: String, required: true },
  ai_generated: { type: Boolean, default: true },
  ai_model_used: { type: String, default: 'gemini-1.5-flash' },
  status: {
    type: String,
    enum: [
      'DRAFT',
      'PENDING_APPROVAL',
      'APPROVED',
      'REJECTED',
      'QUEUED',
      'SENDING',
      'SENT',
      'DELIVERED',
      'OPENED',
      'REPLIED',
      'FAILED'
    ],
    default: 'PENDING_APPROVAL'
  },
  approval_source: {
    type: String,
    enum: ['WEB_DASHBOARD', 'TELEGRAM_BOT', 'AUTO_CAMPAIGN', 'NONE'],
    default: 'NONE'
  },
  scheduled_at: { type: Date },
  sent_at: { type: Date },
  delivered_at: { type: Date },
  reply_detected_at: { type: Date },
  rejection_reason: { type: String, default: '' },
  error_message: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

export const Message = mongoose.model('Message', MessageSchema);
