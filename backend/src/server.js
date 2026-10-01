import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';
import { queueService } from './services/queue.service.js';
import { Setting } from './models/Setting.js';
import { aiService } from './services/ai.service.js';
import { telegramService } from './services/telegram.service.js';
import { emailService } from './services/email.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API Routes
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Leovexa AI Outreach CRM',
    timestamp: new Date().toISOString()
  });
});

// Startup initialization
const startServer = async () => {
  try {
    await connectDB();

    // Hydrate runtime settings from DB if available
    try {
      const settings = await Setting.find();
      const configMap = {};
      settings.forEach(s => {
        configMap[s.key] = s.value;
      });

      aiService.updateKeys({
        geminiKey: configMap.gemini_api_key || process.env.GEMINI_API_KEY,
        openRouterKey: configMap.openrouter_api_key || process.env.OPENROUTER_API_KEY
      });

      if (configMap.telegram_bot_token) {
        telegramService.updateConfig({
          token: configMap.telegram_bot_token,
          chatId: configMap.telegram_chat_id || process.env.TELEGRAM_CHAT_ID
        });
      }

      if (configMap.gmail_user && configMap.gmail_app_password) {
        emailService.updateCredentials({
          user: configMap.gmail_user,
          pass: configMap.gmail_app_password,
          senderName: configMap.sender_name || process.env.SENDER_NAME
        });
      }
    } catch (e) {
      console.warn('Initial settings load notice:', e.message);
    }

    // Start background queue worker
    queueService.startWorker();

    app.listen(PORT, () => {
      console.log(`🚀 Leovexa Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

startServer();
