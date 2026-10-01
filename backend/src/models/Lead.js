import mongoose from 'mongoose';

const LeadAnalysisSchema = new mongoose.Schema({
  lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  website_exists: { type: Boolean, default: true },
  website_quality: { type: String, enum: ['Poor', 'Medium', 'High', 'None'], default: 'Medium' },
  mobile_quality: { type: String, enum: ['Poor', 'Medium', 'High', 'Unknown'], default: 'Unknown' },
  booking_available: { type: Boolean, default: false },
  whatsapp_available: { type: Boolean, default: false },
  seo_observations: { type: String, default: '' },
  pain_points: [{ type: String }],
  opportunities: [{ type: String }],
  recommended_services: [{ type: String }],
  ai_summary: { type: String, default: '' },
  ai_score: { type: Number, default: 0 },
  raw_scraped_data: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

export const LeadAnalysis = mongoose.model('LeadAnalysis', LeadAnalysisSchema);

const LeadSchema = new mongoose.Schema({
  business_name: { type: String, required: true },
  industry: { type: String, default: 'General' },
  website: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: 'India' },
  linkedin_url: { type: String, default: '' },
  instagram_url: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  source: { type: String, default: 'Manual Import' }, // CSV, Manual, Scraper, Discovery
  source_url: { type: String, default: '' },
  status: {
    type: String,
    enum: [
      'NEW',
      'SCRAPING',
      'QUALIFIED',
      'LOW_QUALITY',
      'PENDING_APPROVAL',
      'APPROVED',
      'CONTACTED',
      'REPLIED',
      'MEETING',
      'PROPOSAL',
      'NEGOTIATION',
      'WON',
      'LOST',
      'DO_NOT_CONTACT'
    ],
    default: 'NEW'
  },
  lead_score: { type: Number, default: 0 },
  score_category: {
    type: String,
    enum: ['HIGH PRIORITY', 'QUALIFIED', 'REVIEW', 'LOW'],
    default: 'REVIEW'
  },
  analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadAnalysis' },
  tags: [{ type: String }],
  campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

LeadSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  if (this.lead_score >= 80) this.score_category = 'HIGH PRIORITY';
  else if (this.lead_score >= 60) this.score_category = 'QUALIFIED';
  else if (this.lead_score >= 40) this.score_category = 'REVIEW';
  else this.score_category = 'LOW';
  next();
});

export const Lead = mongoose.model('Lead', LeadSchema);
