import { Lead } from '../models/Lead.js';
import { Message } from '../models/Message.js';
import { Deal } from '../models/Deal.js';
import { Campaign } from '../models/Campaign.js';
import { AiLog } from '../models/AiLog.js';
import { Notification } from '../models/Notification.js';
import { GreenhouseJobApplication } from '../models/GreenhouseJobApplication.js';
import { Setting } from '../models/Setting.js';

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Date boundaries
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart.getTime() - 1);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    // 1. Overall Lifetime Aggregates
    const [
      totalLeads,
      qualifiedLeads,
      contactedLeads,
      repliesCount,
      meetingsCount,
      wonDeals,
      pipelineDeals,
      pendingApprovals,
      hotLeads,
      totalGreenhouseJobs
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ lead_score: { $gte: 60 } }),
      Lead.countDocuments({ status: { $in: ['CONTACTED', 'REPLIED', 'MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON'] } }),
      Lead.countDocuments({ status: { $in: ['REPLIED', 'MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON'] } }),
      Lead.countDocuments({ status: { $in: ['MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON'] } }),
      Deal.find({ stage: 'WON' }),
      Deal.find({ stage: { $nin: ['WON', 'LOST'] } }),
      Message.countDocuments({ status: 'PENDING_APPROVAL' }),
      Lead.find({ lead_score: { $gte: 75 } }).sort({ lead_score: -1 }).limit(6),
      GreenhouseJobApplication.countDocuments().catch(() => 0)
    ]);

    const totalRevenueWon = wonDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
    const totalPipelineValue = pipelineDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);

    // 2. Today's Granular Status (Scraped, Live, Outreach, Deliveries, Replies)
    const [
      leadsScrapedToday,
      jobsScrapedToday,
      leadsApprovedToday,
      messagesApprovedToday,
      outreachSentToday,
      outreachDeliveredToday,
      outreachFailedToday,
      repliesToday,
      leadsScrapedYesterday,
      jobsScrapedYesterday,
      leadsApprovedYesterday,
      outreachSentYesterday,
      outreachDeliveredYesterday,
      repliesYesterday
    ] = await Promise.all([
      Lead.countDocuments({ created_at: { $gte: todayStart } }),
      GreenhouseJobApplication.countDocuments({
        $or: [
          { applied_at: { $gte: todayStart } },
          { createdAt: { $gte: todayStart } }
        ]
      }).catch(() => 0),
      Lead.countDocuments({
        status: { $in: ['APPROVED', 'CONTACTED', 'REPLIED', 'MEETING', 'WON'] },
        updated_at: { $gte: todayStart }
      }),
      Message.countDocuments({
        status: { $in: ['APPROVED', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'REPLIED'] },
        created_at: { $gte: todayStart }
      }),
      Message.countDocuments({
        status: { $in: ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'] },
        $or: [
          { sent_at: { $gte: todayStart } },
          { created_at: { $gte: todayStart } }
        ]
      }),
      Message.countDocuments({
        status: { $in: ['DELIVERED', 'OPENED', 'REPLIED'] },
        $or: [
          { delivered_at: { $gte: todayStart } },
          { sent_at: { $gte: todayStart } }
        ]
      }),
      Message.countDocuments({
        status: 'FAILED',
        created_at: { $gte: todayStart }
      }),
      Message.countDocuments({
        status: 'REPLIED',
        $or: [
          { reply_detected_at: { $gte: todayStart } },
          { created_at: { $gte: todayStart } }
        ]
      }),
      // Yesterday comparisons
      Lead.countDocuments({ created_at: { $gte: yesterdayStart, $lte: yesterdayEnd } }),
      GreenhouseJobApplication.countDocuments({
        $or: [
          { applied_at: { $gte: yesterdayStart, $lte: yesterdayEnd } },
          { createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } }
        ]
      }).catch(() => 0),
      Lead.countDocuments({
        status: { $in: ['APPROVED', 'CONTACTED', 'REPLIED', 'MEETING', 'WON'] },
        updated_at: { $gte: yesterdayStart, $lte: yesterdayEnd }
      }),
      Message.countDocuments({
        status: { $in: ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'] },
        $or: [
          { sent_at: { $gte: yesterdayStart, $lte: yesterdayEnd } },
          { created_at: { $gte: yesterdayStart, $lte: yesterdayEnd } }
        ]
      }),
      Message.countDocuments({
        status: { $in: ['DELIVERED', 'OPENED', 'REPLIED'] },
        $or: [
          { delivered_at: { $gte: yesterdayStart, $lte: yesterdayEnd } },
          { sent_at: { $gte: yesterdayStart, $lte: yesterdayEnd } }
        ]
      }),
      Message.countDocuments({
        status: 'REPLIED',
        $or: [
          { reply_detected_at: { $gte: yesterdayStart, $lte: yesterdayEnd } },
          { created_at: { $gte: yesterdayStart, $lte: yesterdayEnd } }
        ]
      })
    ]);

    const totalScrapedToday = leadsScrapedToday + jobsScrapedToday;
    const totalScrapedYesterday = leadsScrapedYesterday + jobsScrapedYesterday;
    const totalLiveToday = Math.max(leadsApprovedToday, messagesApprovedToday);
    const totalLiveYesterday = leadsApprovedYesterday;

    const deliveryRateToday = outreachSentToday > 0 ? Math.round((outreachDeliveredToday / outreachSentToday) * 100) : 100;

    // 3. Past 7 Days Day-by-Day Historical Telemetry
    const past7Days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(todayStart);
      dStart.setDate(dStart.getDate() - i);
      const dEnd = new Date(dStart);
      dEnd.setHours(23, 59, 59, 999);

      const isToday = i === 0;
      const isYesterday = i === 1;
      const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : `${dayNames[dStart.getDay()]}, ${dStart.getDate()} ${dStart.toLocaleString('default', { month: 'short' })}`;
      const dateStr = dStart.toISOString().slice(0, 10);

      // We can query counts for that day
      const [dayLeads, dayJobs, dayLive, dayOutreach, dayDelivered, dayReplies, dayFailed] = await Promise.all([
        Lead.countDocuments({ created_at: { $gte: dStart, $lte: dEnd } }),
        GreenhouseJobApplication.countDocuments({
          $or: [
            { applied_at: { $gte: dStart, $lte: dEnd } },
            { createdAt: { $gte: dStart, $lte: dEnd } }
          ]
        }).catch(() => 0),
        Lead.countDocuments({
          status: { $in: ['APPROVED', 'CONTACTED', 'REPLIED', 'MEETING', 'WON'] },
          updated_at: { $gte: dStart, $lte: dEnd }
        }),
        Message.countDocuments({
          status: { $in: ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'] },
          $or: [
            { sent_at: { $gte: dStart, $lte: dEnd } },
            { created_at: { $gte: dStart, $lte: dEnd } }
          ]
        }),
        Message.countDocuments({
          status: { $in: ['DELIVERED', 'OPENED', 'REPLIED'] },
          $or: [
            { delivered_at: { $gte: dStart, $lte: dEnd } },
            { sent_at: { $gte: dStart, $lte: dEnd } }
          ]
        }),
        Message.countDocuments({
          status: 'REPLIED',
          $or: [
            { reply_detected_at: { $gte: dStart, $lte: dEnd } },
            { created_at: { $gte: dStart, $lte: dEnd } }
          ]
        }),
        Message.countDocuments({
          status: 'FAILED',
          created_at: { $gte: dStart, $lte: dEnd }
        })
      ]);

      past7Days.push({
        date: dateStr,
        label,
        isToday,
        leadsScraped: dayLeads,
        jobsScraped: dayJobs,
        totalScraped: dayLeads + dayJobs,
        live: dayLive,
        outreachSent: dayOutreach,
        delivered: dayDelivered,
        replies: dayReplies,
        failed: dayFailed
      });
    }

    // 4. Source Breakdown Analysis
    const rawSources = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    const sourceBreakdown = {
      aiDiscovery: 0,
      dailyScraper: 0,
      postIngestor: 0,
      csvImport: 0,
      manual: 0,
      greenhouseBoard: totalGreenhouseJobs
    };

    rawSources.forEach(s => {
      const src = (s._id || '').toLowerCase();
      if (src.includes('post') || src.includes('ingest')) sourceBreakdown.postIngestor += s.count;
      else if (src.includes('discover')) sourceBreakdown.aiDiscovery += s.count;
      else if (src.includes('scraper') || src.includes('cron') || src.includes('daily')) sourceBreakdown.dailyScraper += s.count;
      else if (src.includes('csv')) sourceBreakdown.csvImport += s.count;
      else sourceBreakdown.manual += s.count;
    });

    // 5. Status Breakdown
    const rawStatuses = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusBreakdown = {};
    rawStatuses.forEach(st => {
      statusBreakdown[st._id || 'UNKNOWN'] = st.count;
    });

    // 6. Recent Real-time Activity Stream (Last 12 items)
    const recentMessages = await Message.find()
      .populate('lead_id', 'business_name email')
      .sort({ created_at: -1 })
      .limit(6)
      .lean();

    const recentLeads = await Lead.find()
      .sort({ created_at: -1 })
      .limit(6)
      .lean();

    const recentActivity = [];

    recentLeads.forEach(l => {
      recentActivity.push({
        id: `lead-${l._id}`,
        type: 'SCRAPE',
        title: `Lead Scraped: ${l.business_name}`,
        subtitle: `${l.industry || 'Business'} • ${l.city || 'India'} (Score: ${l.lead_score || 0})`,
        time: l.created_at,
        status: l.status,
        badgeColor: '#6366f1'
      });
    });

    recentMessages.forEach(m => {
      const isSent = ['SENT', 'DELIVERED', 'OPENED', 'REPLIED'].includes(m.status);
      const isReply = m.status === 'REPLIED';
      recentActivity.push({
        id: `msg-${m._id}`,
        type: isReply ? 'REPLY' : isSent ? 'OUTREACH' : 'APPROVAL',
        title: isReply ? `Inbound Reply from ${m.lead_id?.business_name || 'Prospect'}` : isSent ? `Email Sent to ${m.lead_id?.email || 'Prospect'}` : `Pitch Generated: ${m.lead_id?.business_name || 'Prospect'}`,
        subtitle: m.subject || m.content?.slice(0, 75) || 'Cold outreach pitch',
        time: m.sent_at || m.created_at,
        status: m.status,
        badgeColor: isReply ? '#10b981' : isSent ? '#06b6d4' : '#f59e0b'
      });
    });

    // Sort combined activity by time desc
    recentActivity.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

    // 7. AI Call summary
    const [totalAiCalls, geminiCalls, openRouterCalls, fallbackCalls] = await Promise.all([
      AiLog.countDocuments().catch(() => 0),
      AiLog.countDocuments({ provider: 'gemini' }).catch(() => 0),
      AiLog.countDocuments({ provider: 'openrouter' }).catch(() => 0),
      AiLog.countDocuments({ provider: 'system_fallback' }).catch(() => 0)
    ]);

    // 8. Notifications & Engine Settings
    const [recentNotifications, autoApproveSetting] = await Promise.all([
      Notification.find().sort({ created_at: -1 }).limit(10),
      Setting.findOne({ key: 'auto_approve_outreach' })
    ]);

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
          meetingRate,
          totalGreenhouseJobs
        },
        daily: {
          today: {
            date: todayStart.toISOString().slice(0, 10),
            scraped: {
              total: totalScrapedToday,
              leads: leadsScrapedToday,
              jobs: jobsScrapedToday,
              target: 50,
              progress: Math.min(100, Math.round((totalScrapedToday / 50) * 100))
            },
            live: {
              total: totalLiveToday,
              leads: leadsApprovedToday,
              pitches: messagesApprovedToday,
              target: 30,
              progress: Math.min(100, Math.round((totalLiveToday / 30) * 100))
            },
            outreach: {
              sent: outreachSentToday,
              delivered: outreachDeliveredToday,
              failed: outreachFailedToday,
              replies: repliesToday,
              deliveryRate: deliveryRateToday,
              target: 20,
              progress: Math.min(100, Math.round((outreachSentToday / 20) * 100))
            }
          },
          yesterday: {
            date: yesterdayStart.toISOString().slice(0, 10),
            totalScraped: totalScrapedYesterday,
            leadsScraped: leadsScrapedYesterday,
            jobsScraped: jobsScrapedYesterday,
            totalLive: totalLiveYesterday,
            outreachSent: outreachSentYesterday,
            delivered: outreachDeliveredYesterday,
            replies: repliesYesterday
          },
          past7Days
        },
        funnel: {
          scraped: totalLeads + totalGreenhouseJobs,
          qualified: qualifiedLeads,
          pitchesGenerated: await Message.countDocuments().catch(() => 0),
          approvedLive: contactedLeads + pendingApprovals,
          outreachSent: contactedLeads,
          replies: repliesCount,
          meetings: meetingsCount,
          won: wonDeals.length
        },
        sourceBreakdown,
        statusBreakdown,
        recentActivity: recentActivity.slice(0, 12),
        engineHealth: {
          workerStatus: 'ONLINE',
          autoApproveActive: autoApproveSetting ? autoApproveSetting.value === true : true,
          pacingInterval: '25 seconds',
          dailyQuota: 50,
          todayScrapedCount: totalScrapedToday,
          quotaRemaining: Math.max(0, 50 - totalScrapedToday)
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
