import { Campaign } from '../models/Campaign.js';
import { Lead } from '../models/Lead.js';
import { Message } from '../models/Message.js';
import { leadService } from '../services/lead.service.js';

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ created_at: -1 });
    
    // Refresh live stats in parallel
    await Promise.all(campaigns.map(async (c) => {
      const [total, qualified, pending, contacted, replies, won, meetings] = await Promise.all([
        Lead.countDocuments({ campaign_id: c._id }),
        Lead.countDocuments({ campaign_id: c._id, status: { $in: ['QUALIFIED', 'APPROVED', 'CONTACTED', 'REPLIED', 'MEETING', 'WON'] } }),
        Message.countDocuments({ campaign_id: c._id, status: 'PENDING_APPROVAL' }),
        Lead.countDocuments({ campaign_id: c._id, status: { $in: ['CONTACTED', 'REPLIED', 'MEETING', 'WON'] } }),
        Lead.countDocuments({ campaign_id: c._id, status: { $in: ['REPLIED', 'MEETING', 'WON'] } }),
        Lead.countDocuments({ campaign_id: c._id, status: 'WON' }),
        Lead.countDocuments({ campaign_id: c._id, status: 'MEETING' })
      ]);

      c.stats = {
        total_leads: total,
        qualified_leads: qualified,
        pending_approval: pending,
        contacted,
        replies,
        interested: replies,
        meetings,
        won
      };
    }));

    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
    const leads = await Lead.find({ campaign_id: campaign._id }).populate('analysis');
    res.json({ success: true, data: { campaign, leads } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
