import axios from 'axios';
import * as cheerio from 'cheerio';
import { Lead, LeadAnalysis } from '../models/Lead.js';
import { Message } from '../models/Message.js';
import { Campaign } from '../models/Campaign.js';
import { Notification } from '../models/Notification.js';
import { aiService } from './ai.service.js';
import { telegramService } from './telegram.service.js';

class LeadService {
  async scrapeWebsite(url) {
    if (!url || !url.startsWith('http')) {
      return {
        scraped_text: 'No website URL provided.',
        has_booking: false,
        has_whatsapp: false,
        has_phone: false,
        is_responsive: false,
        title: '',
        description: ''
      };
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LeovexaAudit/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      $('script, style, noscript, iframe, svg').remove();

      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);
      const htmlString = response.data.toLowerCase();

      const has_booking = /calendly|book|appointment|schedule|cal\.com|practo|zocdoc/i.test(htmlString);
      const has_whatsapp = /wa\.me|whatsapp|api\.whatsapp/i.test(htmlString);
      const has_phone = /tel:|phone|\+91/i.test(htmlString);
      const is_responsive = $('meta[name="viewport"]').length > 0;

      return {
        scraped_text: `Title: ${title}\nDescription: ${description}\nContent Sample: ${bodyText}`,
        has_booking,
        has_whatsapp,
        has_phone,
        is_responsive,
        title,
        description
      };
    } catch (error) {
      console.warn(`Scraping warning for ${url}: ${error.message}`);
      return {
        scraped_text: `Website was not reachable (${error.message}). Potential server or SSL issue.`,
        has_booking: false,
        has_whatsapp: false,
        has_phone: false,
        is_responsive: false,
        title: '',
        description: ''
      };
    }
  }

  async processLead(leadId) {
    const lead = await Lead.findById(leadId);
    if (!lead) throw new Error('Lead not found');

    lead.status = 'SCRAPING';
    await lead.save();

    // 1. Scrape Website
    const scrapeData = await this.scrapeWebsite(lead.website);

    // 2. Perform AI Research & Scoring
    const aiAnalysisResult = await aiService.analyzeAndScoreLead({
      _id: lead._id,
      business_name: lead.business_name,
      industry: lead.industry,
      website: lead.website,
      city: lead.city,
      scraped_content: scrapeData.scraped_text
    });

    // 3. Save Lead Analysis
    let analysisDoc = await LeadAnalysis.findOne({ lead_id: lead._id });
    if (!analysisDoc) {
      analysisDoc = new LeadAnalysis({ lead_id: lead._id });
    }

    analysisDoc.website_exists = Boolean(lead.website);
    analysisDoc.website_quality = aiAnalysisResult.website_quality || 'Medium';
    analysisDoc.mobile_quality = aiAnalysisResult.mobile_quality || 'Medium';
    analysisDoc.booking_available = scrapeData.has_booking || aiAnalysisResult.booking_available || false;
    analysisDoc.whatsapp_available = scrapeData.has_whatsapp || aiAnalysisResult.whatsapp_available || false;
    analysisDoc.seo_observations = aiAnalysisResult.seo_observations || scrapeData.description;
    analysisDoc.pain_points = aiAnalysisResult.pain_points || [];
    analysisDoc.opportunities = aiAnalysisResult.opportunities || [];
    analysisDoc.recommended_services = aiAnalysisResult.recommended_services || [];
    analysisDoc.ai_summary = aiAnalysisResult.ai_summary || '';
    analysisDoc.ai_score = aiAnalysisResult.ai_score || 70;
    analysisDoc.raw_scraped_data = scrapeData.scraped_text;
    await analysisDoc.save();

    // 4. Update Lead Score and Status
    lead.analysis = analysisDoc._id;
    lead.lead_score = aiAnalysisResult.ai_score || 70;
    lead.status = lead.lead_score >= 50 ? 'QUALIFIED' : 'LOW_QUALITY';
    await lead.save();

    // 5. Generate Personalized Outreach Message
    let campaign = null;
    if (lead.campaign_id) {
      campaign = await Campaign.findById(lead.campaign_id);
    }

    const emailDraft = await aiService.generateOutreachEmail({
      lead,
      analysis: analysisDoc,
      campaign
    });

    // Check if message already exists
    let message = await Message.findOne({ lead_id: lead._id, type: 'INITIAL' });
    if (!message) {
      message = new Message({
        lead_id: lead._id,
        campaign_id: lead.campaign_id,
        channel: 'EMAIL',
        direction: 'OUTBOUND',
        type: 'INITIAL',
        subject: emailDraft.subject,
        content: emailDraft.body,
        status: 'PENDING_APPROVAL',
        ai_generated: true
      });
      await message.save();
    } else {
      message.subject = emailDraft.subject;
      message.content = emailDraft.body;
      await message.save();
    }

    // 6. Create in-app Notification
    await Notification.create({
      type: lead.lead_score >= 80 ? 'HOT_LEAD' : 'APPROVAL_REQUIRED',
      title: lead.lead_score >= 80 ? `🔥 Hot Lead: ${lead.business_name} (Score: ${lead.lead_score})` : `New Pitch Ready: ${lead.business_name}`,
      message: `AI generated custom outreach for ${lead.business_name} in ${lead.city || 'India'}. Review & approve pitch.`,
      lead_id: lead._id,
      data: { score: lead.lead_score, email: lead.email }
    });

    // 7. Trigger Telegram Bot Alert if configured
    if (lead.lead_score >= 60) {
      await telegramService.notifyNewQualifiedLead({
        lead,
        analysis: analysisDoc,
        message
      });
    }

    return { lead, analysis: analysisDoc, message };
  }
}

export const leadService = new LeadService();
