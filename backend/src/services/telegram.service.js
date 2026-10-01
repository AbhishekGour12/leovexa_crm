import { Telegraf, Markup } from 'telegraf';
import { Lead } from '../models/Lead.js';
import { Message } from '../models/Message.js';
import { Deal } from '../models/Deal.js';
import dotenv from 'dotenv';
dotenv.config();

class TelegramService {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.bot = null;
    this.initBot();
  }

  updateConfig({ token, chatId }) {
    if (token !== undefined) this.token = token;
    if (chatId !== undefined) this.chatId = chatId;
    this.initBot();
  }

  initBot() {
    if (!this.token) {
      console.log('ℹ️ Telegram Bot Token not set. Running in quiet mode.');
      return;
    }

    try {
      this.bot = new Telegraf(this.token);

      // Setup Bot Commands
      this.bot.command('start', async (ctx) => {
        const welcome = `
🚀 <b>Welcome to Leovexa AI Outreach Command Center!</b>

I will send you instant alerts for:
• 🔥 <b>Hot Leads</b> (Score 80+) with AI research
• 📩 <b>Prospect Replies</b> classified by AI
• ⚡ <b>One-Click Approvals</b> to dispatch outreach

<b>Available Commands:</b>
/dashboard - View quick overview
/pending - Leads waiting for your approval
/hotleads - Top rated qualified leads
/stats - Total sent, replies, conversions
/help - Command guide

<i>Chat ID:</i> <code>${ctx.chat.id}</code> (Add this to your CRM Settings)
`;
        await ctx.replyWithHTML(welcome);
      });

      this.bot.command('dashboard', async (ctx) => {
        try {
          const totalLeads = await Lead.countDocuments();
          const qualified = await Lead.countDocuments({ status: { $in: ['QUALIFIED', 'APPROVED', 'CONTACTED', 'REPLIED', 'MEETING', 'WON'] } });
          const pending = await Message.countDocuments({ status: 'PENDING_APPROVAL' });
          const replied = await Lead.countDocuments({ status: 'REPLIED' });
          const meetings = await Lead.countDocuments({ status: 'MEETING' });

          const text = `
📊 <b>Leovexa CRM Dashboard Live:</b>

• <b>Total Leads:</b> ${totalLeads}
• <b>Qualified:</b> ${qualified}
• <b>Pending Approvals:</b> ${pending}
• <b>Replies Detected:</b> ${replied}
• <b>Meetings Booked:</b> ${meetings}

Use /pending to approve cold pitches directly!
`;
          await ctx.replyWithHTML(text);
        } catch (e) {
          await ctx.reply(`Error fetching dashboard: ${e.message}`);
        }
      });

      this.bot.command('pending', async (ctx) => {
        try {
          const pendingMessages = await Message.find({ status: 'PENDING_APPROVAL' })
            .populate('lead_id')
            .limit(5);

          if (pendingMessages.length === 0) {
            return ctx.reply('✅ No pending messages waiting for approval.');
          }

          for (const msg of pendingMessages) {
            const lead = msg.lead_id;
            if (!lead) continue;

            const text = `
⏳ <b>APPROVAL REQUIRED</b>
🏢 <b>${lead.business_name}</b> (${lead.industry || 'General'})
📍 ${lead.city || 'India'} | Score: <b>${lead.lead_score}/100</b>
📧 <code>${lead.email}</code>

<b>Subject:</b> ${msg.subject}

<b>Pitch Draft:</b>
${msg.content}
`;
            const keyboard = Markup.inlineKeyboard([
              [
                Markup.button.callback('✅ Approve & Send', `approve_${msg._id}`),
                Markup.button.callback('❌ Reject', `reject_${msg._id}`)
              ]
            ]);

            await ctx.replyWithHTML(text, keyboard);
          }
        } catch (e) {
          await ctx.reply(`Error: ${e.message}`);
        }
      });

      this.bot.command('hotleads', async (ctx) => {
        try {
          const hotLeads = await Lead.find({ lead_score: { $gte: 75 } }).sort({ lead_score: -1 }).limit(5);
          if (hotLeads.length === 0) {
            return ctx.reply('No hot leads found yet.');
          }

          let text = '🔥 <b>Top Hot Leads (Score 75+):</b>\n\n';
          hotLeads.forEach((l, idx) => {
            text += `${idx + 1}. <b>${l.business_name}</b> (Score: ${l.lead_score}) - ${l.status}\n🌐 ${l.website || 'No website'}\n\n`;
          });
          await ctx.replyWithHTML(text);
        } catch (e) {
          await ctx.reply(`Error: ${e.message}`);
        }
      });

      // Handle Inline Callbacks
      this.bot.action(/approve_(.+)/, async (ctx) => {
        const messageId = ctx.match[1];
        try {
          const message = await Message.findById(messageId).populate('lead_id');
          if (!message) return ctx.answerCbQuery('Message not found');

          message.status = 'APPROVED';
          message.approval_source = 'TELEGRAM_BOT';
          await message.save();

          if (message.lead_id) {
            message.lead_id.status = 'APPROVED';
            await message.lead_id.save();
          }

          await ctx.editMessageText(`✅ <b>APPROVED & QUEUED FOR DISPATCH</b>\n\nPitch to <b>${message.lead_id?.business_name}</b> has been approved and queued to send via Gmail.`, { parse_mode: 'HTML' });
          await ctx.answerCbQuery('Pitch approved!');
        } catch (e) {
          await ctx.answerCbQuery(`Error: ${e.message}`);
        }
      });

      this.bot.action(/reject_(.+)/, async (ctx) => {
        const messageId = ctx.match[1];
        try {
          await Message.findByIdAndUpdate(messageId, { status: 'REJECTED', rejection_reason: 'Rejected via Telegram Bot' });
          await ctx.editMessageText('❌ <b>Pitch Rejected</b>. Won’t be dispatched.', { parse_mode: 'HTML' });
          await ctx.answerCbQuery('Pitch rejected.');
        } catch (e) {
          await ctx.answerCbQuery(`Error: ${e.message}`);
        }
      });

      this.bot.launch().then(() => {
        console.log('🤖 Telegram Bot launched successfully');
      }).catch(err => {
        console.warn('⚠️ Telegram Bot Launch Warning:', err.message);
      });
    } catch (err) {
      console.error('Telegram Bot init error:', err.message);
    }
  }

  async notifyNewQualifiedLead({ lead, analysis, message }) {
    if (!this.bot || !this.chatId) return;

    try {
      const painPoints = (analysis?.pain_points || []).slice(0, 2).map(p => `• ${p}`).join('\n');
      const text = `
🔥 <b>HOT QUALIFIED LEAD DETECTED!</b>

🏢 <b>${lead.business_name}</b>
📂 Industry: ${lead.industry || 'General'}
📍 Location: ${lead.city || 'India'}
⭐ Lead Score: <b>${lead.lead_score}/100</b> (${lead.score_category})
🌐 Website: ${lead.website || 'No website (High Opportunity!)'}

💡 <b>AI Audit:</b>
${analysis?.ai_summary || 'Digital upgrade opportunity detected.'}

🚨 <b>Key Pain Points:</b>
${painPoints || '• Missing online booking & conversion funnel'}

📧 <b>Proposed Email Subject:</b>
"${message?.subject || 'Quick idea for your website'}"
`;

      const keyboard = message ? Markup.inlineKeyboard([
        [
          Markup.button.callback('⚡ Approve & Send', `approve_${message._id}`),
          Markup.button.callback('❌ Reject', `reject_${message._id}`)
        ]
      ]) : undefined;

      await this.bot.telegram.sendMessage(this.chatId, text, {
        parse_mode: 'HTML',
        ...keyboard
      });
    } catch (e) {
      console.warn('Telegram send alert error:', e.message);
    }
  }

  async notifyInboundReply({ lead, replyText, classification }) {
    if (!this.bot || !this.chatId) return;

    try {
      const text = `
🎉 <b>INBOUND PROSPECT REPLY RECEIVED!</b>

🏢 <b>${lead.business_name}</b> (${lead.email})
🎯 <b>Intent Detected:</b> <code>${classification.intent}</code>
⭐ Sentiment: ${classification.sentiment || 'Positive'}

💬 <b>Prospect Reply:</b>
<i>"${replyText}"</i>

🧠 <b>AI Summary:</b>
${classification.summary}

💡 <b>Suggested Follow-up:</b>
${classification.suggested_reply}
`;

      await this.bot.telegram.sendMessage(this.chatId, text, { parse_mode: 'HTML' });
    } catch (e) {
      console.warn('Telegram reply alert error:', e.message);
    }
  }
}

export const telegramService = new TelegramService();
