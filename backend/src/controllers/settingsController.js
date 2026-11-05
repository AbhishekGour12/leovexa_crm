import { Setting } from '../models/Setting.js';
import { aiService } from '../services/ai.service.js';
import { telegramService } from '../services/telegram.service.js';
import { emailService } from '../services/email.service.js';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    const configMap = {};
    settings.forEach(s => {
      configMap[s.key] = s.value;
    });

    // Provide default masked keys or values
    res.json({
      success: true,
      data: {
        gemini_api_key: configMap.gemini_api_key || process.env.GEMINI_API_KEY || '',
        openrouter_api_key: configMap.openrouter_api_key || process.env.OPENROUTER_API_KEY || '',
        telegram_bot_token: configMap.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || '',
        telegram_chat_id: configMap.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || '',
        email_provider: configMap.email_provider || process.env.SMTP_PROVIDER || 'zeptomail',
        smtp_host: configMap.smtp_host || process.env.SMTP_HOST || 'smtp.zeptomail.in',
        smtp_port: configMap.smtp_port || process.env.SMTP_PORT || 587,
        smtp_user: configMap.smtp_user || process.env.SMTP_USER || 'emailapikey',
        smtp_pass: configMap.smtp_pass || process.env.SMTP_PASS || 'PHtE6r0PQOjpiWF6oUJUtP7sF8+hPI8v+rhmeFJOs45FC/9RTU1RrNp+kjW3qhl+VfdFEvbOmYk+sb3J4L6GcGi/MWhPCGqyqK3sx/VYSPOZsbq6x00as1Qff0fUUoXnetFu0SXUs9rfNA==',
        sender_email: configMap.sender_email || process.env.SENDER_EMAIL || 'abhishek@leovexa.in',
        zeptomail_api_key: configMap.zeptomail_api_key || process.env.ZEPTOMAIL_API_KEY || 'Zoho-enczapikey PHtE6r0PQOjpiWF6oUJUtP7sF8+hPI8v+rhmeFJOs45FC/9RTU1RrNp+kjW3qhl+VfdFEvbOmYk+sb3J4L6GcGi/MWhPCGqyqK3sx/VYSPOZsbq6x00as1Qff0fUUoXnetFu0SXUs9rfNA==',
        gmail_user: configMap.gmail_user || process.env.GMAIL_USER || 'leovexatechnologies@gmail.com',
        gmail_app_password: configMap.gmail_app_password || process.env.GMAIL_APP_PASSWORD || '',
        sender_name: configMap.sender_name || process.env.SENDER_NAME || 'Leovexa Technologies',
        auto_approve_outreach: configMap.auto_approve_outreach !== undefined ? configMap.auto_approve_outreach : true,
        daily_discovery_enabled: configMap.daily_discovery_enabled !== undefined ? configMap.daily_discovery_enabled : true,
        daily_leads_limit: configMap.daily_leads_limit || 50,
        automation_status: configMap.automation_status || 'RUNNING',
        automation_active: configMap.automation_active !== undefined ? configMap.automation_active : true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAutomationStatus = async (req, res) => {
  try {
    const { queueService } = await import('../services/queue.service.js');
    const status = queueService.getAutomationStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleAutomation = async (req, res) => {
  try {
    const { action } = req.body; // 'PAUSE', 'RESUME', or 'TOGGLE'
    const { queueService } = await import('../services/queue.service.js');
    
    const current = queueService.getAutomationStatus();
    let result;

    if (action === 'PAUSE' || (action === 'TOGGLE' && current.active)) {
      result = await queueService.pauseAutomation();
    } else {
      result = await queueService.resumeAutomation();
    }

    res.json({
      success: true,
      message: result.active
        ? '▶️ 24/7 Outreach Automation resumed! Auto-fetch leads and auto-send emails are active.'
        : '⏸️ Outreach Automation stopped! Auto-fetch leads and auto-send emails are paused. You can still fetch leads or send emails manually.',
      ...result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { 
      gemini_api_key, 
      openrouter_api_key, 
      telegram_bot_token, 
      telegram_chat_id, 
      email_provider,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      sender_email,
      zeptomail_api_key,
      gmail_user, 
      gmail_app_password, 
      sender_name,
      auto_approve_outreach,
      daily_discovery_enabled,
      daily_leads_limit
    } = req.body;

    const updates = [
      { key: 'gemini_api_key', value: gemini_api_key },
      { key: 'openrouter_api_key', value: openrouter_api_key },
      { key: 'telegram_bot_token', value: telegram_bot_token },
      { key: 'telegram_chat_id', value: telegram_chat_id },
      { key: 'email_provider', value: email_provider },
      { key: 'smtp_host', value: smtp_host },
      { key: 'smtp_port', value: smtp_port },
      { key: 'smtp_user', value: smtp_user },
      { key: 'smtp_pass', value: smtp_pass },
      { key: 'sender_email', value: sender_email },
      { key: 'zeptomail_api_key', value: zeptomail_api_key },
      { key: 'gmail_user', value: gmail_user },
      { key: 'gmail_app_password', value: gmail_app_password },
      { key: 'sender_name', value: sender_name },
      { key: 'auto_approve_outreach', value: auto_approve_outreach },
      { key: 'daily_discovery_enabled', value: daily_discovery_enabled },
      { key: 'daily_leads_limit', value: daily_leads_limit }
    ];

    for (const item of updates) {
      if (item.value !== undefined) {
        await Setting.findOneAndUpdate(
          { key: item.key },
          { value: item.value, updated_at: new Date() },
          { upsert: true }
        );
      }
    }

    // Update active service runtime configurations
    aiService.updateKeys({
      geminiKey: gemini_api_key,
      openRouterKey: openrouter_api_key
    });

    telegramService.updateConfig({
      token: telegram_bot_token,
      chatId: telegram_chat_id
    });

    const isGmail = email_provider === 'gmail';
    emailService.updateCredentials({
      provider: email_provider || 'zeptomail',
      host: smtp_host || 'smtp.zeptomail.in',
      port: smtp_port || 587,
      user: isGmail ? gmail_user : (smtp_user || 'emailapikey'),
      pass: isGmail ? gmail_app_password : smtp_pass,
      senderName: sender_name || 'Leovexa Technologies',
      senderEmail: sender_email || (isGmail ? gmail_user : 'noreply@leovexa.in'),
      zeptomailApiKey: zeptomail_api_key,
      gmailUser: gmail_user || process.env.GMAIL_USER || 'leovexatechnologies@gmail.com',
      gmailPass: gmail_app_password || process.env.GMAIL_APP_PASSWORD
    });

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const testGeminiKey = async (req, res) => {
  try {
    const { key } = req.body;
    const testKey = (key || process.env.GEMINI_API_KEY || '').trim();
    if (!testKey) return res.status(400).json({ success: false, error: 'Gemini API Key is required' });

    const genAI = new GoogleGenerativeAI(testKey);
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let text = '';
    let lastErr = null;

    for (const m of candidateModels) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: m });
          const result = await model.generateContent('Return only: "Gemini Connected OK"');
          text = await result.response.text();
          break;
        } catch (err) {
          lastErr = err;
          if (err.message && err.message.includes('503') && attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 800 * attempt));
            continue;
          }
          if (err.message && (err.message.includes('404') || err.message.includes('no longer available'))) {
            break;
          }
          throw err;
        }
      }
      if (text) break;
    }

    if (!text && lastErr) throw lastErr;

    res.json({ success: true, message: 'Gemini API is active and functioning perfectly!', response: (text || 'Gemini Connected OK').trim() });
  } catch (error) {
    res.status(400).json({ success: false, error: `Gemini Test Failed: ${error.message}` });
  }
};

export const testOpenRouterKey = async (req, res) => {
  try {
    const { key } = req.body;
    const testKey = (key || process.env.OPENROUTER_API_KEY || '').trim();
    if (!testKey) return res.status(400).json({ success: false, error: 'OpenRouter API Key is required' });

    const candidateModels = ['openrouter/free', 'openrouter/auto', 'meta-llama/llama-3.3-70b-instruct'];
    let responseText = '';
    let lastErr = null;

    for (const model of candidateModels) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: model,
            messages: [{ role: 'user', content: 'Say "OpenRouter Connected OK"' }]
          },
          {
            headers: {
              'Authorization': `Bearer ${testKey}`,
              'HTTP-Referer': 'https://leovexa.in',
              'X-Title': 'Leovexa Outreach CRM',
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        if (response.data && response.data.choices && response.data.choices[0]) {
          responseText = response.data.choices[0].message.content;
          break;
        }
      } catch (err) {
        lastErr = err;
        continue;
      }
    }

    if (!responseText) {
      throw lastErr || new Error('No response from OpenRouter');
    }

    res.json({ success: true, message: 'OpenRouter API is active and ready as dual-engine!', response: responseText.trim() });
  } catch (error) {
    res.status(400).json({ success: false, error: `OpenRouter Test Failed: ${error.response ? (error.response.data?.error?.message || error.response.statusText) : error.message}` });
  }
};

export const testTelegramBot = async (req, res) => {
  try {
    const { token, chatId } = req.body;
    const testToken = (token || process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const testChatId = (chatId || process.env.TELEGRAM_CHAT_ID || '').trim();

    if (!testToken || !testChatId) {
      return res.status(400).json({ success: false, error: 'Both Telegram Bot Token and Chat ID are required for testing' });
    }

    const testUrl = `https://api.telegram.org/bot${testToken}/sendMessage`;
    const response = await axios.post(testUrl, {
      chat_id: testChatId,
      text: '🔔 <b>Leovexa CRM Alert Test</b>\n\nYour Telegram integration is working perfectly! You will receive hot lead alerts (score 80+) and one-click pitch approvals here.\n\n🌐 <i>System: https://leovexa.in</i>',
      parse_mode: 'HTML'
    });

    res.json({ success: true, message: 'Test message sent to your Telegram chat successfully!', data: response.data.result });
  } catch (error) {
    let helpMsg = error.message;
    if (error.response && error.response.status === 401) {
      helpMsg = '401 Unauthorized: Telegram Bot Token is invalid or has a typo. Please open @BotFather on Telegram, send /mybots -> Choose your bot -> API Token, and copy the exact token string.';
    } else if (error.response && error.response.status === 400) {
      helpMsg = '400 Bad Request: Chat not found. Make sure you opened your bot in Telegram and clicked /start so it has permission to message your Chat ID.';
    }
    res.status(400).json({ success: false, error: `Telegram Test Failed: ${helpMsg}` });
  }
};

export const testEmailSmtp = async (req, res) => {
  try {
    const { provider, host, port, user, pass, gmail_user, gmail_app_password } = req.body;

    if (provider === 'gmail') {
      const testUser = user || gmail_user || process.env.GMAIL_USER;
      const testPass = pass || gmail_app_password || process.env.GMAIL_APP_PASSWORD;
      if (!testUser || !testPass) {
        return res.status(400).json({ success: false, error: 'Gmail user email and 16-character App Password are required' });
      }
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: testUser, pass: testPass }
      });
      await transporter.verify();
      return res.json({ 
        success: true, 
        message: '✅ Gmail SMTP authentication verified successfully! Outbound emails are 100% ready.' 
      });
    }

    // ZeptoMail or Custom SMTP check
    const testHost = host || process.env.SMTP_HOST || 'smtp.zeptomail.in';
    const testPort = parseInt(port || process.env.SMTP_PORT || '587', 10);
    const testUser = user || process.env.SMTP_USER || 'emailapikey';
    const testPass = pass || process.env.SMTP_PASS;

    let zeptoError = null;
    let zeptoSuccess = false;

    if (testHost && testUser && testPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: testHost,
          port: testPort,
          secure: testPort === 465,
          auth: { user: testUser, pass: testPass },
          tls: { rejectUnauthorized: false }
        });
        await transporter.verify();
        zeptoSuccess = true;
      } catch (err) {
        zeptoError = err.message;
      }
    } else {
      zeptoError = 'ZeptoMail credentials incomplete';
    }

    if (zeptoSuccess) {
      return res.json({ 
        success: true, 
        message: '✅ Zoho ZeptoMail SMTP authentication verified successfully!' 
      });
    }

    // ZeptoMail failed: Check if Gmail Fallback works!
    const fallbackUser = (gmail_user || process.env.GMAIL_USER || 'leovexatechnologies@gmail.com').trim();
    const fallbackPass = (gmail_app_password || process.env.GMAIL_APP_PASSWORD || '').trim();

    if (fallbackUser && fallbackPass) {
      try {
        const gmailTrans = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: fallbackUser, pass: fallbackPass }
        });
        await gmailTrans.verify();

        return res.json({
          success: true,
          fallbackActive: true,
          message: `⚠️ ZeptoMail notice: ${zeptoError}. HOWEVER, Gmail Fallback (${fallbackUser}) is verified and ACTIVE! All outreach emails will automatically be delivered via Gmail.`
        });
      } catch (gErr) {
        return res.status(400).json({
          success: false,
          error: `ZeptoMail failed: ${zeptoError} | Gmail Fallback also failed: ${gErr.message}. Please check Gmail App Password.`
        });
      }
    }

    res.status(400).json({ success: false, error: `SMTP Auth Failed: ${zeptoError}` });
  } catch (error) {
    res.status(400).json({ success: false, error: `SMTP Auth Failed: ${error.message}` });
  }
};
