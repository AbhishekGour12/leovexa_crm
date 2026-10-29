import mongoose from 'mongoose';

const GreenhouseJobApplicationSchema = new mongoose.Schema({
  job_id: {
    type: String,
    required: true,
    index: true
  },
  board_token: {
    type: String,
    required: true,
    index: true
  },
  company_name: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    default: 'Remote / Unspecified'
  },
  department: {
    type: String,
    default: ''
  },
  job_url: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  recruiter_email: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED', 'FAILED', 'READY_TO_APPLY'],
    default: 'APPLIED',
    index: true
  },
  apply_channel: {
    type: String,
    enum: ['GREENHOUSE_API', 'DIRECT_EMAIL', 'PORTAL_ASSISTED', 'SIMULATED'],
    default: 'GREENHOUSE_API'
  },
  match_score: {
    type: Number,
    default: 85,
    min: 0,
    max: 100
  },
  match_reasons: [{
    type: String
  }],
  cover_letter: {
    type: String,
    default: ''
  },
  tech_stack: [{
    type: String
  }],
  key_requirements: [{
    type: String
  }],
  experience_level: {
    type: String,
    default: 'Mid - Senior'
  },
  is_india_role: {
    type: Boolean,
    default: false,
    index: true
  },
  outreach_status: {
    type: String,
    enum: ['NOT_SENT', 'EMAIL_SENT', 'API_SUBMITTED', 'PORTAL_LOGGED', 'FAILED'],
    default: 'API_SUBMITTED'
  },
  outreach_recipient: {
    type: String,
    default: ''
  },
  outreach_sent_at: {
    type: Date
  },
  outreach_subject: {
    type: String,
    default: ''
  },
  candidate_snapshot: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    resume_filename: { type: String, default: '' },
    resume_path: { type: String, default: '' }
  },
  daily_batch_date: {
    type: String, // 'YYYY-MM-DD'
    index: true
  },
  applied_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  interview_rounds: [{
    round_name: { type: String },
    scheduled_date: { type: Date },
    interviewer: { type: String },
    notes: { type: String }
  }],
  notes: {
    type: String,
    default: ''
  },
  api_response: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error_message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Unique compound index so we NEVER duplicate applications for the same job
GreenhouseJobApplicationSchema.index({ job_id: 1, board_token: 1 }, { unique: true });

export const GreenhouseJobApplication = mongoose.model('GreenhouseJobApplication', GreenhouseJobApplicationSchema);
