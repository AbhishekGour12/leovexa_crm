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
    this.user = process.env.GMAIL_USER || '';
    this.pass = process.env.GMAIL_APP_PASSWORD || '';
    this.senderName = process.env.SENDER_NAME || 'Leovexa Technologies';
  }

  updateCredentials({ user, pass, senderName }) {
    if (user !== undefined) this.user = user;
    if (pass !== undefined) this.pass = pass;
    if (senderName !== undefined) this.senderName = senderName;
  }

  getTransporter() {
    if (!this.user || !this.pass) {
      return null;
    }
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.user,
        pass: this.pass,
      },
    });
  }

  async sendEmail({ to, subject, html, text, messageId = null, leadId = null }) {
    // 🛡️ Pre-Flight Verification: Verify DNS MX records before attempting SMTP send
    const mxCheck = await emailValidator.verifyEmail(to);
    if (!mxCheck.valid) {
      console.warn(`🛑 Pre-send check blocked delivery to invalid/unreachable email: ${to} (Reason: ${mxCheck.reason})`);
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
          error_message: 'Simulated dispatch (Add Gmail App Password in Settings for live sending)'
        });
      }
      if (leadId) {
        await Lead.findByIdAndUpdate(leadId, { status: 'CONTACTED' });
      }
      return { success: true, simulated: true };
    }

    try {
      const info = await transporter.sendMail({
        from: `"${this.senderName}" <${this.user}>`,
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br/>')
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

      console.log(`✅ Email sent successfully to ${to} (MessageId: ${info.messageId})`);
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
