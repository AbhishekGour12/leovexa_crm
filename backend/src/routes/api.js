import express from 'express';
import multer from 'multer';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  triggerResearch,
  importCsvLeads,
  downloadDemoTemplate,
  seedDemoData,
  aiDiscoverLeads,
  clearAllCrmData,
  extractPostLeadsAndProposals,
  sendProposalEmailDirect,
  triggerDailyDiscoveryManually
} from '../controllers/leadController.js';
import {
  getCampaigns,
  createCampaign,
  getCampaignById,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController.js';
import {
  getMessages,
  getPendingApprovals,
  approveMessage,
  rejectMessage,
  regeneratePitch,
  simulateInboundReply,
  getConversations,
  getFollowupSequences,
  triggerManualFollowup
} from '../controllers/messageController.js';
import {
  getDeals,
  createDeal,
  updateDealStage,
  deleteDeal
} from '../controllers/dealController.js';
import { getDashboardStats } from '../controllers/analyticsController.js';
import {
  getSettings,
  updateSettings,
  testGeminiKey,
  testOpenRouterKey,
  testTelegramBot,
  testEmailSmtp
} from '../controllers/settingsController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Dashboard & Analytics
router.get('/analytics/dashboard', getDashboardStats);

// Leads
router.get('/leads', getLeads);
router.get('/leads/download-template', downloadDemoTemplate);
router.get('/leads/:id', getLeadById);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);
router.post('/leads/:id/research', triggerResearch);
router.post('/leads/import-csv', upload.single('file'), importCsvLeads);
router.post('/leads/seed-demo', seedDemoData);
router.post('/leads/ai-discover', aiDiscoverLeads);
router.post('/leads/clear-all', clearAllCrmData);
router.post('/leads/ai-extract-pitch', extractPostLeadsAndProposals);
router.post('/leads/send-pitch-email', sendProposalEmailDirect);
router.post('/leads/trigger-daily-leads', triggerDailyDiscoveryManually);

// Campaigns
router.get('/campaigns', getCampaigns);
router.get('/campaigns/:id', getCampaignById);
router.post('/campaigns', createCampaign);
router.put('/campaigns/:id', updateCampaign);
router.delete('/campaigns/:id', deleteCampaign);

// Messages & Approvals
router.get('/messages', getMessages);
router.get('/messages/pending-approvals', getPendingApprovals);
router.get('/messages/followup-sequences', getFollowupSequences);
router.post('/messages/trigger-followup', triggerManualFollowup);
router.post('/messages/:id/approve', approveMessage);
router.post('/messages/:id/reject', rejectMessage);
router.post('/messages/:id/regenerate', regeneratePitch);
router.post('/messages/simulate-reply', simulateInboundReply);
router.get('/conversations', getConversations);

// Deals (Pipeline Kanban)
router.get('/deals', getDeals);
router.post('/deals', createDeal);
router.put('/deals/:id/stage', updateDealStage);
router.delete('/deals/:id', deleteDeal);

// Settings & Integration Tests
router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.post('/settings/test-gemini', testGeminiKey);
router.post('/settings/test-openrouter', testOpenRouterKey);
router.post('/settings/test-telegram', testTelegramBot);
router.post('/settings/test-gmail', testEmailSmtp);

// 24/7 Autonomous Background Cron & Keep-Alive Endpoints (for cron-job.org / Vercel Cron / Render Keepalive)
router.get('/cron/keepalive', (req, res) => {
  res.json({
    status: 'online',
    message: 'Leovexa CRM Server is awake and active',
    timestamp: new Date().toISOString()
  });
});

router.all('/cron/daily-leads', async (req, res) => {
  try {
    const { queueService } = await import('../services/queue.service.js');
    const count = await queueService.runDaily40LeadsCycle(true);
    const sentCount = await queueService.processApprovedOutreachQueue(40);
    res.json({
      success: true,
      message: `✅ Autonomous Daily Cycle Executed: ${count} verified leads generated & ${sentCount} outreach emails dispatched!`,
      leads_created: count,
      emails_dispatched: sentCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.all('/cron/process-queue', async (req, res) => {
  try {
    const { queueService } = await import('../services/queue.service.js');
    const sentCount = await queueService.processApprovedOutreachQueue(20);
    res.json({
      success: true,
      message: `Queue processed: ${sentCount} messages sent`,
      sentCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

