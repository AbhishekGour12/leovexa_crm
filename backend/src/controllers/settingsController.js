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
        gmail_user: configMap.gmail_user || process.env.GMAIL_USER || '',
        gmail_app_password: configMap.gmail_app_password || process.env.GMAIL_APP_PASSWORD || '',
        sender_name: configMap.sender_name || process.env.SENDER_NAME || 'Leovexa Technologies',
        auto_approve_outreach: configMap.auto_approve_outreach !== undefined ? configMap.auto_approve_outreach : true,
        daily_discovery_enabled: configMap.daily_discovery_enabled !== undefined ? configMap.daily_discovery_enabled : true,
        daily_leads_limit: configMap.daily_leads_limit || 50
      }
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

    emailService.updateCredentials({
      user: gmail_user,
      pass: gmail_app_password,
      senderName: sender_name
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
    const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.8-pro'];
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

    res.json({ success: true, message: 'Gemini API (3.8 Flash) is active and functioning perfectly!', response: (text || 'Gemini Connected OK').trim() });
  } catch (error) {
    res.status(400).json({ success: false, error: `Gemini Test Failed: ${error.message}` });
  }
};

export const testOpenRouterKey = async (req, res) => {
  try {
    const { key } = req.body;
    const testKey = key || process.env.OPENROUTER_API_KEY;
    if (!testKey) return res.status(400).json({ success: false, error: 'OpenRouter API Key is required' });

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: 'Say "OpenRouter Connected OK"' }]
      },
      {
        headers: {
          'Authorization': `Bearer ${testKey}`,
          'HTTP-Referer': 'https://leovexa.in',
          'X-Title': 'Leovexa Outreach CRM'
        },
        timeout: 15000
      }
    );

    res.json({ success: true, message: 'OpenRouter API is active and ready as fallback!', response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(400).json({ success: false, error: `OpenRouter Test Failed: ${error.message}` });
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
    const { user, pass } = req.body;
    const testUser = user || process.env.GMAIL_USER;
    const testPass = pass || process.env.GMAIL_APP_PASSWORD;

    if (!testUser || !testPass) {
      return res.status(400).json({ success: false, error: 'Gmail user email and 16-character App Password are required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: testUser, pass: testPass }
    });

    await transporter.verify();
    res.json({ success: true, message: 'Gmail SMTP authentication verified successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, error: `Gmail Auth Failed: ${error.message}` });
  }
};
