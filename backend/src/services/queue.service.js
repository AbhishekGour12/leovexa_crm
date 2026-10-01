import { Lead, LeadAnalysis } from '../models/Lead.js';
import { Message } from '../models/Message.js';
import { Campaign } from '../models/Campaign.js';
import { Setting } from '../models/Setting.js';
import { leadService } from './lead.service.js';
import { emailService } from './email.service.js';
import { aiService } from './ai.service.js';
import { realLeadScraper } from './realLeadScraper.service.js';
import { emailValidator } from './emailValidator.service.js';

class QueueService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.lastDailyRunDate = null;
  }

  startWorker() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('⚡ Background Autonomous Outreach & Daily 50 Lead Worker started');

    // Run interval every 25 seconds
    this.interval = setInterval(async () => {
      await this.checkDailyScheduledDiscovery();
      await this.processAutoApprovals();
      await this.processApprovedOutreachQueue();
      await this.checkScheduledFollowUps();
    }, 25000);
  }

  stopWorker() {
    if (this.interval) clearInterval(this.interval);
    this.isRunning = false;
  }

  // Auto-Approve Mode: Automatically approves high-scoring qualified pitches
  async processAutoApprovals() {
    try {
      const autoApproveSetting = await Setting.findOne({ key: 'auto_approve_outreach' });
      const isAutoApprove = autoApproveSetting ? autoApproveSetting.value === true : true; // default ON for fully autonomous experience

      if (!isAutoApprove) return;

      const pendingMessages = await Message.find({ status: 'PENDING_APPROVAL' })
        .populate('lead_id')
        .limit(10);

      for (const msg of pendingMessages) {
        if (msg.lead_id && (msg.lead_id.lead_score || 0) >= 60) {
          msg.status = 'APPROVED';
          msg.approval_source = 'AUTO_CAMPAIGN';
          await msg.save();

          msg.lead_id.status = 'APPROVED';
          await msg.lead_id.save();
        }
      }
    } catch (e) {
      console.warn('Auto-approval check notice:', e.message);
    }
  }

  // Check if there are unprocessed manual leads waiting
  async getUnprocessedManualCount() {
    try {
      const count = await Lead.countDocuments({
        source: { $in: ['MANUAL_IMPORT', 'CSV Import', 'Manual Entry'] },
        status: { $in: ['NEW', 'QUALIFIED', 'APPROVED', 'PENDING_APPROVAL'] }
      });
      return count;
    } catch (e) {
      return 0;
    }
  }

  // Daily Scheduled 50 Lead Ingestion & Pitch Generation (Runs every morning 09:00 AM)
  async checkDailyScheduledDiscovery() {
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Check if already ran today
      if (this.lastDailyRunDate === todayStr) return;

      // 🛡️ Priority Guard: If manual leads exist, pause automated AI extraction
      const manualCount = await this.getUnprocessedManualCount();
      if (manualCount > 0) {
        console.log(`⏸️ Autonomous AI Lead Discovery PAUSED: Prioritizing ${manualCount} unprocessed manual leads in queue.`);
        return;
      }

      const currentHour = now.getHours();
      // Runs automatically between 09:00 AM and 10:00 AM (or on initial launch)
      if (currentHour >= 9) {
        this.lastDailyRunDate = todayStr;
        console.log(`🤖 Starting Daily Autonomous 50 Real Lead Discovery for ${todayStr}...`);
        await this.runDaily50LeadsCycle();
      }
    } catch (e) {
      console.warn('Daily scheduled discovery check notice:', e.message);
    }
  }

  // Execution cycle for 50 Real Business Leads across niches & countries
  async runDaily50LeadsCycle() {
    try {
      // 🛡️ Double Check: Don't run AI discovery if manual leads are waiting
      const manualCount = await this.getUnprocessedManualCount();
      if (manualCount > 0) {
        console.log(`⏸️ Skipping AI Lead Cycle: ${manualCount} Manual Leads are currently being processed.`);
        return;
      }

      const targetCountries = ['India', 'USA', 'UK', 'UAE'];
      const targetNiches = [
        'Restaurants & Cafes',
        'Dental & Healthcare Clinics',
        'Salons & Wellness',
        'Banquet & Event Spaces',
        'Luxury Real Estate'
      ];

      for (const country of targetCountries) {
        for (const niche of targetNiches) {
          const realBusinesses = await realLeadScraper.getVerifiedBusinesses(country, niche);
          for (const biz of realBusinesses) {
            // DNS MX check
            const check = await emailValidator.verifyEmail(biz.email);
            if (!check.valid) continue;

            let lead = await Lead.findOne({ email: check.email });
            if (!lead) {
              const hasWebsite = Boolean(biz.website && biz.website.startsWith('http'));
              lead = new Lead({
                business_name: biz.business_name,
                industry: niche,
                website: biz.website || '',
                email: check.email,
                phone: biz.phone,
                city: biz.city,
                state: biz.state,
                country: biz.country,
                source: `Daily Verified Outreach (${country})`,
                lead_score: hasWebsite ? Math.floor(Math.random() * 12) + 80 : 94, // High score if NO website
                status: 'APPROVED'
              });
              await lead.save();

              const analysis = new LeadAnalysis({
                lead_id: lead._id,
                website_exists: hasWebsite,
                website_quality: hasWebsite ? 'Medium' : 'None (High Opportunity)',
                mobile_quality: hasWebsite ? 'Medium' : 'None',
                booking_available: false,
                whatsapp_available: true,
                seo_observations: hasWebsite
                  ? `Verified business in ${biz.city}, ${biz.country}. Digital appointment & modern web upgrade target.`
                  : `Verified business in ${biz.city}, ${biz.country} currently has NO official website. Prime target for Leovexa web app & automated booking CRM.`,
                pain_points: hasWebsite
                  ? ['Missing 24/7 automated online patient/client booking flow', 'Inquiry bounce rate']
                  : ['No official website on Google Search', 'Customer inquiries lost during non-business hours', 'Manual WhatsApp booking'],
                opportunities: hasWebsite
                  ? ['High-Converting Web App Redesign with Instant Booking', 'AI Appointment Scheduling CRM Funnel']
                  : ['Custom High-Converting Web Application Development', 'Automated Online Booking & Order CRM', 'WhatsApp Lead CRM'],
                recommended_services: ['Custom Web App Development', 'AI Booking CRM', 'WhatsApp Lead Nurture'],
                ai_summary: `${biz.business_name} in ${biz.city}, ${biz.country} represents a high-converting prospect for Leovexa web & booking automation solutions.`,
                ai_score: lead.lead_score
              });
              await analysis.save();

              lead.analysis = analysis._id;
              await lead.save();

              // Auto-generate cold pitch
              const emailDraft = await aiService.generateOutreachEmail({ lead, analysis });
              await Message.create({
                lead_id: lead._id,
                channel: 'EMAIL',
                direction: 'OUTBOUND',
                type: 'INITIAL',
                subject: emailDraft.subject,
                content: emailDraft.body,
                status: 'APPROVED', // Ready to send on schedule
                approval_source: 'AUTO_CAMPAIGN',
                ai_generated: true
              });
            }
          }
        }
      }
      console.log('✅ Daily Autonomous 50 Real Lead Discovery cycle completed!');
    } catch (err) {
      console.error('Error running daily lead cycle:', err.message);
    }
  }

  // Send approved emails via email service (spaced out safely, prioritizing manual leads)
  async processApprovedOutreachQueue() {
    try {
      // Find approved messages, prioritizing manual imports first
      const approvedMessages = await Message.find({ status: 'APPROVED' })
        .populate('lead_id')
        .sort({ approval_source: -1, created_at: 1 })
        .limit(3);

      for (const msg of approvedMessages) {
        if (!msg.lead_id || !msg.lead_id.email) {
          msg.status = 'FAILED';
          msg.error_message = 'No valid recipient email address';
          await msg.save();
          continue;
        }

        try {
          msg.status = 'SENDING';
          await msg.save();

          await emailService.sendEmail({
            to: msg.lead_id.email,
            subject: msg.subject,
            text: msg.content,
            messageId: msg._id,
            leadId: msg.lead_id._id
          });
        } catch (err) {
          console.error(`Error sending approved message ${msg._id}:`, err.message);
        }
      }
    } catch (e) {
      console.warn('Queue processing error:', e.message);
    }
  }

  // Check if any leads need Day 3 or Day 7 follow-up
  async checkScheduledFollowUps() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const leadsForFollowup = await Lead.find({
        status: 'CONTACTED',
        updated_at: { $lte: threeDaysAgo }
      }).limit(5);

      for (const lead of leadsForFollowup) {
        const existingFollowup = await Message.findOne({
          lead_id: lead._id,
          type: 'FOLLOWUP_1'
        });

        if (!existingFollowup) {
          const prompt = `
Generate a quick, polite, non-pushy Day 3 Follow-up cold email for Leovexa Technologies (https://leovexa.in).
Lead: ${lead.business_name} in ${lead.city || 'local area'} (${lead.industry}).
Keep it under 60 words.

Return JSON: { "subject": "Following up on my note regarding ${lead.business_name}'s website", "body": "Hi ${lead.business_name} team,..." }
`;
          const response = await aiService.executeWithFallback(prompt, 'You are an email copywriter.', 'MESSAGE_GEN', lead._id);
          let json = {
            subject: `Quick follow-up for ${lead.business_name}`,
            body: `Hi ${lead.business_name} team,\n\nFollowing up briefly on my earlier note. Have you had a moment to review ideas for updating ${lead.business_name}'s website and appointment booking?\n\nHappy to connect when convenient.\n\nBest,\nLeovexa Team\nhttps://leovexa.in`
          };

          try {
            const parsed = JSON.parse(response.text.match(/\{[\s\S]*\}/)?.[0]);
            if (parsed.subject && parsed.body) json = parsed;
          } catch (e) {}

          await Message.create({
            lead_id: lead._id,
            campaign_id: lead.campaign_id,
            channel: 'EMAIL',
            direction: 'OUTBOUND',
            type: 'FOLLOWUP_1',
            subject: json.subject,
            content: json.body,
            status: 'APPROVED',
            approval_source: 'AUTO_CAMPAIGN',
            ai_generated: true
          });
        }
      }

      // Check for Day 7 Follow-up #2
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const leadsForFollowup2 = await Lead.find({
        status: 'CONTACTED',
        updated_at: { $lte: sevenDaysAgo }
      }).limit(5);

      for (const lead of leadsForFollowup2) {
        const existingFollowup2 = await Message.findOne({
          lead_id: lead._id,
          type: 'FOLLOWUP_2'
        });

        if (!existingFollowup2) {
          const prompt = `
Generate a final graceful breakup Day 7 Follow-up cold email for Leovexa Technologies (https://leovexa.in).
Lead: ${lead.business_name} in ${lead.city || 'local market'}.
Keep it under 50 words with low pressure.
Return JSON: { "subject": "Final quick note regarding ${lead.business_name}", "body": "Hi ${lead.business_name} team,..." }
`;
          const response = await aiService.executeWithFallback(prompt, 'You are an email copywriter.', 'MESSAGE_GEN', lead._id);
          let json = {
            subject: `Final note for ${lead.business_name}`,
            body: `Hi ${lead.business_name} team,\n\nI assume you're fully focused on other priorities right now, so I won't keep following up.\n\nIf you ever decide to modernize your website or automate online appointments, feel free to visit https://leovexa.in.\n\nWishing your practice continued success!\n\nBest,\nLeovexa Outreach Team\nhttps://leovexa.in`
          };

          try {
            const parsed = JSON.parse(response.text.match(/\{[\s\S]*\}/)?.[0]);
            if (parsed.subject && parsed.body) json = parsed;
          } catch (e) {}

          await Message.create({
            lead_id: lead._id,
            campaign_id: lead.campaign_id,
            channel: 'EMAIL',
            direction: 'OUTBOUND',
            type: 'FOLLOWUP_2',
            subject: json.subject,
            content: json.body,
            status: 'APPROVED',
            approval_source: 'AUTO_CAMPAIGN',
            ai_generated: true
          });
        }
      }
    } catch (e) {
      console.warn('Follow-up check error:', e.message);
    }
  }
}

export const queueService = new QueueService();
