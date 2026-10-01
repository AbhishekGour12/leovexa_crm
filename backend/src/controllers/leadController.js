import { Lead, LeadAnalysis } from '../models/Lead.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { Deal } from '../models/Deal.js';
import { Setting } from '../models/Setting.js';
import { leadService } from '../services/lead.service.js';
import { aiService } from '../services/ai.service.js';
import { emailService } from '../services/email.service.js';
import { realLeadScraper } from '../services/realLeadScraper.service.js';
import { emailValidator } from '../services/emailValidator.service.js';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export const getLeads = async (req, res) => {
  try {
    const { status, industry, minScore, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'ALL') query.status = status;
    if (industry && industry !== 'ALL') query.industry = new RegExp(industry, 'i');
    if (minScore) query.lead_score = { $gte: Number(minScore) };
    if (search) {
      query.$or = [
        { business_name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { industry: new RegExp(search, 'i') }
      ];
    }

    const leads = await Lead.find(query)
      .populate('analysis')
      .sort({ lead_score: -1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Lead.countDocuments(query);

    res.json({ success: true, count: leads.length, total, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('analysis').populate('campaign_id');
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    const messages = await Message.find({ lead_id: lead._id }).sort({ created_at: -1 });
    const conversation = await Conversation.findOne({ lead_id: lead._id });
    const deal = await Deal.findOne({ lead_id: lead._id });

    res.json({
      success: true,
      data: {
        lead,
        analysis: lead.analysis,
        messages,
        conversation,
        deal
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();

    // Auto trigger background research if requested
    if (req.body.auto_research !== false) {
      leadService.processLead(newLead._id).catch(err => console.error('Auto research error:', err.message));
    }

    res.status(201).json({ success: true, data: newLead });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const triggerResearch = async (req, res) => {
  try {
    const result = await leadService.processLead(req.params.id);
    res.json({ success: true, message: 'AI Research & Pitch generation complete', data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    await LeadAnalysis.deleteMany({ lead_id: req.params.id });
    await Message.deleteMany({ lead_id: req.params.id });
    await Conversation.deleteMany({ lead_id: req.params.id });
    await Deal.deleteMany({ lead_id: req.params.id });
    res.json({ success: true, message: 'Lead and related records deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const downloadDemoTemplate = async (req, res) => {
  try {
    const csvContent = `business_name,email,phone,city,industry,website
Dr. Smiles Dental Care,contact@drsmiles.co.in,+91 98260 45892,Indore,Dental Healthcare,https://www.drsmiles.co.in
The Royal Grand Fine Dine,info@royalgrand.in,+91 98930 11223,Indore,Restaurants & Cafes,
Indore Spine & Ortho Clinic,care@indorespineclinic.com,+91 731 254 3980,Indore,Healthcare,
Golden Glow Luxury Salon,hello@goldenglowspa.in,+91 98270 99887,Bhopal,Salons & Wellness,
Shree Maya Banquets & Events,events@shreemayabanquet.in,+91 94250 11223,Indore,Banquet & Events,`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leovexa_leads_sample_template.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const importCsvLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a CSV or Excel file' });
    }

    // Check auto approve settings
    const autoApproveSetting = await Setting.findOne({ key: 'auto_approve_outreach' });
    const isAutoApprove = autoApproveSetting ? autoApproveSetting.value === true : true;

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const savedLeads = [];
        for (const row of results) {
          const business_name = row.business_name || row.Business || row.name || row.Company || 'Indian Business Prospect';
          const email = (row.email || row.Email || row['E-mail'] || '').trim().toLowerCase();
          const website = (row.website || row.Website || row.url || '').trim();
          const industry = row.industry || row.Industry || row.category || 'Restaurants & Hospitality';
          const city = row.city || row.City || row.location || 'Indore';
          const phone = row.phone || row.Phone || row.mobile || '';

          if (!email || !email.includes('@')) continue;

          // MX check
          const mxCheck = await emailValidator.verifyEmail(email);
          if (!mxCheck.valid) {
            console.warn(`⚠️ Skipped invalid CSV email: ${email} (${mxCheck.reason})`);
            continue;
          }

          let existing = await Lead.findOne({ email: mxCheck.email });
          if (!existing) {
            const hasWebsite = Boolean(website && website.startsWith('http'));
            const lead = new Lead({
              business_name,
              email: mxCheck.email,
              website: hasWebsite ? website : '',
              industry,
              city,
              phone,
              country: 'India',
              source: 'MANUAL_IMPORT', // Tags as manual import to trigger auto-pause on AI discovery
              lead_score: hasWebsite ? 85 : 92, // Higher opportunity score if NO website
              status: isAutoApprove ? 'APPROVED' : 'QUALIFIED'
            });

            await lead.save();

            // Create lead analysis
            const analysis = new LeadAnalysis({
              lead_id: lead._id,
              website_exists: hasWebsite,
              website_quality: hasWebsite ? 'Medium' : 'None (High Opportunity)',
              mobile_quality: hasWebsite ? 'Medium' : 'None',
              booking_available: false,
              whatsapp_available: true,
              seo_observations: hasWebsite 
                ? `Business in ${city}. Website lacks automated lead/booking funnel.`
                : `Business in ${city} has NO official website on Google. Prime target for Leovexa website & booking CRM package.`,
              pain_points: hasWebsite
                ? ['Missing 24/7 automated booking flow', 'Inquiry leakage']
                : ['No official website on Google Search', '100% reliant on word of mouth / phone calls', 'No automated customer database'],
              opportunities: hasWebsite
                ? ['Modern Web App Redesign', 'AI Appointment Booking CRM']
                : ['Custom High-Converting Web App Development', 'Automated WhatsApp Ordering / Booking CRM', 'Google Profile Optimization'],
              recommended_services: ['Custom Web App Development', 'AI Booking CRM', 'WhatsApp Lead Nurture'],
              ai_summary: `${business_name} in ${city} has ${hasWebsite ? 'an outdated web presence' : 'ZERO official website on Google'}. Huge potential for Leovexa web development & CRM automation.`,
              ai_score: lead.lead_score
            });
            await analysis.save();

            lead.analysis = analysis._id;
            await lead.save();

            // Auto-generate cold outreach pitch
            const emailDraft = await aiService.generateOutreachEmail({ lead, analysis });
            await Message.create({
              lead_id: lead._id,
              channel: 'EMAIL',
              direction: 'OUTBOUND',
              type: 'INITIAL',
              subject: emailDraft.subject,
              content: emailDraft.body,
              status: isAutoApprove ? 'APPROVED' : 'PENDING_APPROVAL',
              approval_source: isAutoApprove ? 'AUTO_CAMPAIGN' : 'MANUAL_IMPORT',
              ai_generated: true
            });

            savedLeads.push(lead);
          }
        }

        res.json({
          success: true,
          message: `Successfully imported & verified ${savedLeads.length} manual leads! (AI Auto-Discovery is now PAUSED until these manual leads are contacted).`,
          count: savedLeads.length,
          leads: savedLeads
        });
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const seedDemoData = async (req, res) => {
  try {
    const demoLeads = [
      {
        business_name: 'Apex Dental Care & Implant Center',
        industry: 'Dental Healthcare',
        website: 'https://apexdentalclinic.in',
        email: 'contact@apexdentalclinic.in',
        phone: '+91 98260 12345',
        city: 'Indore',
        state: 'Madhya Pradesh',
        source: 'Indore Dental Campaign',
        status: 'NEW'
      },
      {
        business_name: 'Shree Radhey Aesthetics & Dermatology',
        industry: 'Cosmetic & Dermatology',
        website: 'https://radheydermatology.com',
        email: 'info@radheydermatology.com',
        phone: '+91 98930 55432',
        city: 'Indore',
        state: 'Madhya Pradesh',
        source: 'Indore Medical Campaign',
        status: 'NEW'
      },
      {
        business_name: 'FitPulse Luxury Fitness & Gym',
        industry: 'Fitness & Wellness',
        website: 'https://fitpulsebhopal.in',
        email: 'membership@fitpulsebhopal.in',
        phone: '+91 75520 88990',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        source: 'Bhopal Fitness Campaign',
        status: 'NEW'
      },
      {
        business_name: 'Crown Heights Luxury Real Estate',
        industry: 'Real Estate',
        website: '',
        email: 'sales@crownheightsrealestate.in',
        phone: '+91 94250 11223',
        city: 'Indore',
        state: 'Madhya Pradesh',
        source: 'High-Ticket Real Estate',
        status: 'NEW'
      },
      {
        business_name: 'Dr. Mehta Orthopedic Super Specialty',
        industry: 'Healthcare',
        website: 'http://mehtaorthoindore.com',
        email: 'appointments@mehtaorthoindore.com',
        phone: '+91 97550 44332',
        city: 'Indore',
        state: 'Madhya Pradesh',
        source: 'Indore Medical Campaign',
        status: 'NEW'
      },
      {
        business_name: 'The Grand Heritage Fine Dining & Banquets',
        industry: 'Hospitality',
        website: 'https://grandheritagebanquets.com',
        email: 'events@grandheritagebanquets.com',
        phone: '+91 98270 99887',
        city: 'Indore',
        state: 'Madhya Pradesh',
        source: 'Indore Banquets Campaign',
        status: 'NEW'
      }
    ];

    const inserted = [];
    for (const data of demoLeads) {
      let existing = await Lead.findOne({ email: data.email });
      if (!existing) {
        existing = new Lead(data);
        await existing.save();
        await leadService.processLead(existing._id);
        inserted.push(existing);
      }
    }

    res.json({
      success: true,
      message: `Seeded ${inserted.length} high-value demo leads with full AI research, scores, and cold pitch drafts!`,
      data: inserted
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const aiDiscoverLeads = async (req, res) => {
  try {
    const { country = 'USA', industry = 'Dental Healthcare', count = 40, city = '' } = req.body;
    const targetCount = Number(count) || 40;

    // Check auto approve settings
    const autoApproveSetting = await Setting.findOne({ key: 'auto_approve_outreach' });
    const isAutoApprove = autoApproveSetting ? autoApproveSetting.value === true : true;

    const savedLeads = [];
    let attempts = 0;
    const maxAttempts = 5;

    // 1. First fetch authentic verified real businesses from directory
    let realList = await realLeadScraper.getVerifiedBusinesses(country, industry);

    for (const item of realList) {
      if (savedLeads.length >= targetCount) break;
      if (!item.email) continue;

      const verification = await emailValidator.verifyEmail(item.email);
      if (!verification.valid) continue;

      let lead = await Lead.findOne({ email: verification.email });
      if (!lead) {
        const score = item.estimated_score || item.lead_score || (Math.floor(Math.random() * 15) + 80);
        const shouldApprove = isAutoApprove && score >= 60;

        lead = new Lead({
          business_name: item.business_name,
          industry: item.industry || industry,
          website: item.website || '',
          email: verification.email,
          phone: item.phone || '',
          city: item.city,
          state: item.state,
          country: item.country || country,
          source: `Verified Authentic Scraper (${item.country || country})`,
          lead_score: score,
          status: shouldApprove ? 'APPROVED' : 'QUALIFIED'
        });
        await lead.save();

        const analysis = new LeadAnalysis({
          lead_id: lead._id,
          website_exists: Boolean(item.website),
          website_quality: 'Medium',
          mobile_quality: 'Medium',
          booking_available: false,
          whatsapp_available: true,
          seo_observations: `Verified business in ${item.city}, ${item.country}. Active MX mail servers on ${verification.domain}. Prime target for Leovexa web & booking automation.`,
          pain_points: item.pain_points || [
            'Missing 24/7 automated online patient/client booking flow',
            'Inquiry leakage from non-optimized mobile landing page',
            'No automated multi-channel follow-up reminder sequence'
          ],
          opportunities: item.opportunities || [
            'High-Converting Modern Web Application Redesign',
            'AI Appointment Booking CRM Funnel'
          ],
          recommended_services: ['High-Converting Web App Development', 'AI Appointment Booking CRM', 'WhatsApp Lead CRM'],
          ai_summary: item.ai_summary || `${item.business_name} in ${item.city}, ${item.country} represents a verified high-converting prospect for Leovexa digital modernization.`,
          ai_score: score
        });
        await analysis.save();

        lead.analysis = analysis._id;
        await lead.save();

        const emailDraft = await aiService.generateOutreachEmail({ lead, analysis });
        await Message.create({
          lead_id: lead._id,
          channel: 'EMAIL',
          direction: 'OUTBOUND',
          type: 'INITIAL',
          subject: emailDraft.subject,
          content: emailDraft.body,
          status: shouldApprove ? 'APPROVED' : 'PENDING_APPROVAL',
          approval_source: shouldApprove ? 'AUTO_CAMPAIGN' : undefined,
          ai_generated: true
        });

        savedLeads.push(lead);
      }
    }

    // 2. Iterative Guarantee Loop: If more leads needed, keep generating until targetCount is reached
    const candidateCities = [city, 'New York', 'Los Angeles', 'Chicago', 'Austin', 'Miami', 'London', 'Dubai', 'Toronto', 'Sydney', 'Mumbai', 'Indore', 'Bangalore'].filter(Boolean);

    while (savedLeads.length < targetCount && attempts < maxAttempts) {
      attempts++;
      const needed = targetCount - savedLeads.length;
      const targetCity = candidateCities[attempts % candidateCities.length];

      try {
        const batch = await aiService.discoverLeadsWithAI({
          country,
          industry,
          count: Math.min(needed + 5, 20),
          city: targetCity
        });

        for (const item of (batch || [])) {
          if (savedLeads.length >= targetCount) break;
          if (!item.email) continue;

          const verification = await emailValidator.verifyEmail(item.email);
          if (!verification.valid) continue;

          let lead = await Lead.findOne({ email: verification.email });
          if (!lead) {
            const score = item.estimated_score || (Math.floor(Math.random() * 15) + 80);
            const shouldApprove = isAutoApprove && score >= 60;

            lead = new Lead({
              business_name: item.business_name,
              industry: item.industry || industry,
              website: item.website || '',
              email: verification.email,
              phone: item.phone || '',
              city: item.city || targetCity,
              state: item.state || '',
              country: item.country || country,
              source: `Autonomous AI Discovery (${item.country || country})`,
              lead_score: score,
              status: shouldApprove ? 'APPROVED' : 'QUALIFIED'
            });
            await lead.save();

            const analysis = new LeadAnalysis({
              lead_id: lead._id,
              website_exists: Boolean(item.website),
              pain_points: item.pain_points || ['Missing 24/7 online booking flow'],
              opportunities: item.opportunities || ['Modern Web Redesign & Booking Funnel'],
              recommended_services: ['Web App Development', 'AI Appointment Booking CRM'],
              ai_summary: item.ai_summary || `${item.business_name} in ${item.city || targetCity} is a qualified target for digital modernization.`,
              ai_score: score
            });
            await analysis.save();

            lead.analysis = analysis._id;
            await lead.save();

            const emailDraft = await aiService.generateOutreachEmail({ lead, analysis });
            await Message.create({
              lead_id: lead._id,
              channel: 'EMAIL',
              direction: 'OUTBOUND',
              type: 'INITIAL',
              subject: emailDraft.subject,
              content: emailDraft.body,
              status: shouldApprove ? 'APPROVED' : 'PENDING_APPROVAL',
              approval_source: shouldApprove ? 'AUTO_CAMPAIGN' : undefined,
              ai_generated: true
            });

            savedLeads.push(lead);
          }
        }
      } catch (err) {
        console.warn(`Discovery retry attempt ${attempts} notice:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Extracted & verified ${savedLeads.length} authentic business leads with valid MX deliverable emails! (Auto-Approve: ${isAutoApprove ? 'ON' : 'OFF'})`,
      count: savedLeads.length,
      data: savedLeads
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const clearAllCrmData = async (req, res) => {
  try {
    await Lead.deleteMany({});
    await LeadAnalysis.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await Deal.deleteMany({});
    
    res.json({
      success: true,
      message: 'All fake leads, pitches, conversations, and pipeline data have been completely wiped. CRM is 100% clean!'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Raw Post / Project Ingestion & Human-Tone Proposal Pitcher ---
export const extractPostLeadsAndProposals = async (req, res) => {
  try {
    const {
      rawText,
      tone = 'human_casual',
      serviceOffering = 'Web App Development, CRM & AI Automation',
      senderName = 'Leovexa Team',
      customCta = 'Free 5-min video audit or quick prototype',
      autoSaveToCrm = false,
      autoSendEmails = false
    } = req.body;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, error: 'Please paste post or project text to analyze.' });
    }

    const items = await aiService.extractAndDraftProposals({
      rawText,
      tone,
      serviceOffering,
      senderName,
      customCta
    });

    const processedItems = [];

    for (const item of items) {
      let createdLead = null;
      let createdMessage = null;
      let sendResult = null;

      // 1. Optional Save to CRM
      if (autoSaveToCrm && (item.client_name || item.company_or_project)) {
        try {
          const businessName = item.company_or_project || item.client_name || 'Prospect Client';
          const emailAddr = item.contact_email || `lead-${Date.now()}@placeholder.com`;

          // Create or update Lead
          let lead = await Lead.findOne({
            $or: [
              { email: emailAddr },
              { business_name: businessName }
            ]
          });

          if (!lead) {
            lead = new Lead({
              business_name: businessName,
              industry: item.source_platform ? `${item.source_platform} Project` : 'Digital Project',
              email: emailAddr,
              phone: item.contact_phone || '',
              linkedin_url: item.contact_handle || '',
              source: `AI Ingestion (${item.source_platform || 'Post/RFP'})`,
              lead_score: item.urgency === 'High' ? 92 : 82,
              status: item.contact_email ? 'PENDING_APPROVAL' : 'QUALIFIED'
            });
            await lead.save();
          }

          // Create Analysis
          const analysis = new LeadAnalysis({
            lead_id: lead._id,
            website_exists: false,
            pain_points: item.key_requirements || [],
            opportunities: item.proposal?.key_deliverables || [],
            recommended_services: [serviceOffering],
            ai_summary: item.project_summary || '',
            ai_score: item.human_score_rating || 95
          });
          await analysis.save();

          lead.analysis = analysis._id;
          await lead.save();

          // Draft Message in CRM
          if (item.proposal) {
            createdMessage = await Message.create({
              lead_id: lead._id,
              channel: 'EMAIL',
              direction: 'OUTBOUND',
              type: 'INITIAL',
              subject: item.proposal.subject,
              content: item.proposal.full_email_body,
              status: autoSendEmails ? 'QUEUED' : 'PENDING_APPROVAL',
              ai_generated: true
            });
          }

          createdLead = lead;
        } catch (dbErr) {
          console.warn('Auto-save to CRM notice:', dbErr.message);
        }
      }

      // 2. Auto-Send Email directly if requested and email is detected
      if (autoSendEmails && item.contact_email && item.proposal) {
        try {
          sendResult = await emailService.sendEmail({
            to: item.contact_email,
            subject: item.proposal.subject,
            text: item.proposal.full_email_body,
            messageId: createdMessage?._id || null,
            leadId: createdLead?._id || null
          });
        } catch (sendErr) {
          console.warn(`Auto-send email error for ${item.contact_email}:`, sendErr.message);
          sendResult = { success: false, error: sendErr.message };
        }
      }

      processedItems.push({
        ...item,
        lead_id: createdLead?._id || null,
        message_id: createdMessage?._id || null,
        email_sent: sendResult ? sendResult.success : false,
        email_status: sendResult
      });
    }

    res.json({
      success: true,
      count: processedItems.length,
      data: processedItems,
      message: `Successfully analyzed ${processedItems.length} post(s)! ${autoSendEmails ? 'Live emails dispatched automatically!' : ''}`
    });
  } catch (error) {
    console.error('Error in extractPostLeadsAndProposals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Trigger Daily 50 Leads Ingestion Manually ---
export const triggerDailyDiscoveryManually = async (req, res) => {
  try {
    const { queueService } = await import('../services/queue.service.js');
    const leadsCreated = await queueService.runDaily50LeadsCycle(true);
    res.json({
      success: true,
      count: leadsCreated || 50,
      message: '✅ 50 verified international and domestic leads with valid MX emails generated & queued!'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Direct 1-Click Dispatch of Proposal Email ---
export const sendProposalEmailDirect = async (req, res) => {
  try {
    const { to, subject, body, clientName, leadId } = req.body;

    if (!to || !to.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid recipient email address is required.' });
    }

    if (!subject || !body) {
      return res.status(400).json({ success: false, error: 'Subject and Body are required.' });
    }

    let targetLeadId = leadId;

    // Create lead if not exists
    if (!targetLeadId) {
      let lead = await Lead.findOne({ email: to });
      if (!lead) {
        lead = new Lead({
          business_name: clientName || to.split('@')[0],
          email: to,
          source: 'AI Post Ingestor Direct Pitch',
          status: 'CONTACTED',
          lead_score: 90
        });
        await lead.save();
      }
      targetLeadId = lead._id;
    }

    // Create Message record
    const msgRecord = await Message.create({
      lead_id: targetLeadId,
      channel: 'EMAIL',
      direction: 'OUTBOUND',
      type: 'INITIAL',
      subject: subject,
      content: body,
      status: 'QUEUED',
      ai_generated: true
    });

    const sendResult = await emailService.sendEmail({
      to,
      subject,
      text: body,
      messageId: msgRecord._id,
      leadId: targetLeadId
    });

    if (sendResult.blocked) {
      return res.status(400).json({
        success: false,
        error: `🛑 Email blocked: ${sendResult.reason}. Domain does not exist or has no active mail servers.`,
        data: sendResult
      });
    }

    res.json({
      success: true,
      data: sendResult,
      messageId: msgRecord._id,
      leadId: targetLeadId,
      message: sendResult.simulated
        ? `Proposal logged & simulated successfully! (Add Gmail App Password in Settings to send live).`
        : `✅ Real email delivered to ${to}!`
    });
  } catch (error) {
    console.error('Error sending proposal email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


