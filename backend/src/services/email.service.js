import nodemailer from 'nodemailer';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';
import { Conversation } from '../models/Conversation.js';
import { Notification } from '../models/Notification.js';
import { aiService } from './ai.service.js';
import { telegramService } from './telegram.service.js';
import { emailValidator } from './emailValidator.service.js';
import dotenv from 'dotenv';
dotenv.config();

class EmailService {
  constructor() {
    this.provider = process.env.SMTP_PROVIDER || (process.env.SMTP_HOST ? 'custom_smtp' : (process.env.GMAIL_USER ? 'gmail' : 'zeptomail'));
    this.host = process.env.SMTP_HOST || 'smtp.zeptomail.in';
    this.port = parseInt(process.env.SMTP_PORT || '587', 10);
    this.user = process.env.SMTP_USER || process.env.GMAIL_USER || 'emailapikey';
    this.pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
    this.senderName = process.env.SENDER_NAME || 'Leovexa Technologies';
    this.senderEmail = process.env.SENDER_EMAIL || process.env.GMAIL_USER || 'noreply@leovexa.in';
    this.zeptomailApiKey = process.env.ZEPTOMAIL_API_KEY || '';
    this.transporter = null;
  }

  updateCredentials({ provider, host, port, user, pass, senderName, senderEmail, zeptomailApiKey }) {
    if (provider !== undefined) this.provider = provider;
    if (host !== undefined) this.host = host;
    if (port !== undefined) this.port = parseInt(port || '587', 10);
    if (user !== undefined) this.user = user;
    if (pass !== undefined) this.pass = pass;
    if (senderName !== undefined) this.senderName = senderName;
    if (senderEmail !== undefined) this.senderEmail = senderEmail;
    if (zeptomailApiKey !== undefined) this.zeptomailApiKey = zeptomailApiKey;

    // Reset transporter cache so next send re-initializes with new credentials
    this.transporter = null;
  }

  getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    if (!this.user || !this.pass) {
      return null;
    }

    try {
      if (this.provider === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 5,
          auth: {
            user: this.user,
            pass: this.pass,
          },
        });
      } else {
        // ZeptoMail / Zoho / Custom SMTP
        const isSecure = this.port === 465;
        this.transporter = nodemailer.createTransport({
          host: this.host || 'smtp.zeptomail.in',
          port: this.port || 587,
          secure: isSecure,
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          auth: {
            user: this.user,
            pass: this.pass,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
      }

      return this.transporter;
    } catch (e) {
      console.error('Failed to create Nodemailer transporter:', e.message);
      return null;
    }
  }

  async sendEmail({ to, subject, html, text, messageId = null, leadId = null }) {
    // 🛡️ Pre-Flight Verification: Instant cached / fast DNS check
    const mxCheck = await emailValidator.verifyEmail(to);
    if (!mxCheck.valid) {
      console.warn(`🛑 Pre-send check skipped invalid address: ${to} (Reason: ${mxCheck.reason})`);
      if (messageId) {
        await Message.findByIdAndUpdate(messageId, {
          status: 'FAILED',
          error_message: `Pre-send MX Check Failed: ${mxCheck.reason}`
        });
      }
      return { success: false, reason: mxCheck.reason, blocked: true };
    }

    const transporter = this.getTransporter();

    if (!transporter) {
      console.log(`[EMAIL SIMULATION] Sending to ${to} | Subject: ${subject}`);
      if (messageId) {
        await Message.findByIdAndUpdate(messageId, {
          status: 'SENT',
          sent_at: new Date(),
          delivered_at: new Date(),
          error_message: 'Simulated dispatch (Configure ZeptoMail or Gmail in Settings for live delivery)'
        });
      }
      if (leadId) {
        await Lead.findByIdAndUpdate(leadId, { status: 'CONTACTED' });
      }
      return { success: true, simulated: true };
    }

    try {
      const fromAddress = this.senderEmail && this.senderEmail.includes('@') 
        ? this.senderEmail 
        : (this.user.includes('@') ? this.user : 'noreply@leovexa.in');

      const info = await transporter.sendMail({
        from: `"${this.senderName}" <${fromAddress}>`,
        to,
        subject,
        text,
        html: html || (text ? text.replace(/\n/g, '<br/>') : '')
      });

      if (messageId) {
        await Message.findByIdAndUpdate(messageId, {
          status: 'SENT',
          sent_at: new Date(),
          delivered_at: new Date(),
          error_message: ''
        });
      }

      if (leadId) {
        await Lead.findByIdAndUpdate(leadId, { status: 'CONTACTED' });
      }

      console.log(`✅ Email sent successfully to ${to} (MessageId: ${info.messageId}) via ${this.provider}`);
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (error) {
      console.error(`❌ Email send failed to ${to}:`, error.message);
      if (messageId) {
        await Message.findByIdAndUpdate(messageId, {
          status: 'FAILED',
          error_message: error.message
        });
      }
      throw error;
    }
  }

  // Handle Prospect Reply (from simulated webhook or real inbound)
  async handleInboundReply({ leadId, replyText, channel = 'EMAIL' }) {
    const lead = await Lead.findById(leadId);
    if (!lead) throw new Error('Lead not found');

    const lastOutbound = await Message.findOne({
      lead_id: leadId,
      direction: 'OUTBOUND'
    }).sort({ created_at: -1 });

    // 1. AI Classification of Reply
    const classification = await aiService.classifyReply({
      reply_text: replyText,
      original_pitch: lastOutbound?.content || '',
      lead
    });

    // 2. Update Lead Status
    if (classification.intent === 'UNSUBSCRIBE' || classification.intent === 'NOT_INTERESTED') {
      lead.status = classification.intent === 'UNSUBSCRIBE' ? 'DO_NOT_CONTACT' : 'LOST';
    } else if (classification.intent === 'MEETING_REQUEST') {
      lead.status = 'MEETING';
    } else {
      lead.status = 'REPLIED';
    }
    await lead.save();

    // 3. Save Message Record
    await Message.create({
      lead_id: lead._id,
      campaign_id: lead.campaign_id,
      channel,
      direction: 'INBOUND',
      type: 'REPLY',
      content: replyText,
      status: 'DELIVERED',
      ai_generated: false
    });

    // 4. Update Conversation Thread
    let conversation = await Conversation.findOne({ lead_id: lead._id });
    if (!conversation) {
      conversation = new Conversation({
        lead_id: lead._id,
        campaign_id: lead.campaign_id,
        history: []
      });
    }

    if (lastOutbound && conversation.history.length === 0) {
      conversation.history.push({
        sender: 'LEOVEXA',
        channel: 'EMAIL',
        content: lastOutbound.content,
        timestamp: lastOutbound.sent_at || lastOutbound.created_at
      });
    }

    conversation.history.push({
      sender: 'PROSPECT',
      channel,
      content: replyText,
      timestamp: new Date(),
      intent_detected: classification.intent,
      sentiment: classification.sentiment || 'neutral'
    });

    conversation.last_message = replyText;
    conversation.last_message_at = new Date();
    conversation.intent = classification.intent;
    conversation.ai_summary = classification.summary;
    conversation.requires_human = classification.requires_human;
    conversation.suggested_ai_reply = classification.suggested_reply;
    await conversation.save();

    // 5. In-app Notification
    await Notification.create({
      type: 'REPLY_RECEIVED',
      title: `📩 Inbound Reply from ${lead.business_name} (${classification.intent})`,
      message: `"${replyText.substring(0, 100)}..."`,
      lead_id: lead._id,
      data: { intent: classification.intent, reply: replyText }
    });

    // 6. Telegram Hot Alert
    await telegramService.notifyInboundReply({
      lead,
      replyText,
      classification
    });

    return { lead, conversation, classification };
  }
}

export const emailService = new EmailService();
