import { Lead } from '../models/Lead.js';
import { Message } from '../models/Message.js';
import { Deal } from '../models/Deal.js';
import { Campaign } from '../models/Campaign.js';
import { AiLog } from '../models/AiLog.js';
import { Notification } from '../models/Notification.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const qualifiedLeads = await Lead.countDocuments({ lead_score: { $gte: 60 } });
    const contactedLeads = await Lead.countDocuments({ status: { $in: ['CONTACTED', 'REPLIED', 'MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON'] } });
    const repliesCount = await Lead.countDocuments({ status: { $in: ['REPLIED', 'MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON'] } });
    const meetingsCount = await Lead.countDocuments({ status: { $in: ['MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON'] } });
    const wonDeals = await Deal.find({ stage: 'WON' });
    const totalRevenueWon = wonDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
    const pipelineDeals = await Deal.find({ stage: { $nin: ['WON', 'LOST'] } });
    const totalPipelineValue = pipelineDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);

    const pendingApprovals = await Message.countDocuments({ status: 'PENDING_APPROVAL' });
    const hotLeads = await Lead.find({ lead_score: { $gte: 75 } }).sort({ lead_score: -1 }).limit(5);

    // AI Call summary
    const totalAiCalls = await AiLog.countDocuments();
    const geminiCalls = await AiLog.countDocuments({ provider: 'gemini' });
    const openRouterCalls = await AiLog.countDocuments({ provider: 'openrouter' });
    const fallbackCalls = await AiLog.countDocuments({ provider: 'system_fallback' });

    // Recent notifications
    const recentNotifications = await Notification.find().sort({ created_at: -1 }).limit(10);

    // Conversion rates
    const qualificationRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    const replyRate = contactedLeads > 0 ? Math.round((repliesCount / contactedLeads) * 100) : 0;
    const meetingRate = repliesCount > 0 ? Math.round((meetingsCount / repliesCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        metrics: {
          totalLeads,
          qualifiedLeads,
          contactedLeads,
          repliesCount,
          meetingsCount,
          wonCount: wonDeals.length,
          totalRevenueWon,
          totalPipelineValue,
          pendingApprovals,
          qualificationRate,
          replyRate,
          meetingRate
        },
        hotLeads,
        aiLogs: {
          total: totalAiCalls,
          gemini: geminiCalls,
          openrouter: openRouterCalls,
          fallback: fallbackCalls
        },
        notifications: recentNotifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
