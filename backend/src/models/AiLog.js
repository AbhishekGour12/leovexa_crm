import mongoose from 'mongoose';

const AiLogSchema = new mongoose.Schema({
  provider: { type: String, enum: ['gemini', 'openrouter', 'hybrid', 'system_fallback'], required: true },
  model: { type: String, default: 'gemini-1.5-flash' },
  task: {
    type: String,
    enum: ['RESEARCH', 'SCORING', 'MESSAGE_GEN', 'REPLY_CLASSIFY', 'CUSTOM_CHAT'],
    required: true
  },
  lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  input_prompt: { type: String, default: '' },
  output_text: { type: String, default: '' },
  input_tokens: { type: Number, default: 0 },
  output_tokens: { type: Number, default: 0 },
  success: { type: Boolean, default: true },
  error: { type: String, default: '' },
  duration_ms: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

export const AiLog = mongoose.model('AiLog', AiLogSchema);

