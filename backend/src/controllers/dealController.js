import { Deal } from '../models/Deal.js';
import { Lead } from '../models/Lead.js';

export const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate('lead_id')
      .sort({ updated_at: -1 });

    res.json({ success: true, count: deals.length, data: deals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDeal = async (req, res) => {
  try {
    const { lead_id, title, stage, estimated_value, currency, meeting_date, proposal_url, notes, priority } = req.body;
    const deal = new Deal({
      lead_id,
      title,
      stage: stage || 'QUALIFIED',
      estimated_value: estimated_value || 0,
      currency: currency || 'INR',
      meeting_date,
      proposal_url,
      notes,
      priority: priority || 'MEDIUM'
    });
    await deal.save();

    // Sync status with Lead
    if (stage) {
      await Lead.findByIdAndUpdate(lead_id, { status: stage });
    }

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDealStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, estimated_value, notes, meeting_date } = req.body;

    const deal = await Deal.findByIdAndUpdate(
      id,
      { stage, estimated_value, notes, meeting_date, updated_at: new Date() },
      { new: true }
    ).populate('lead_id');

    if (deal && deal.lead_id && stage) {
      await Lead.findByIdAndUpdate(deal.lead_id._id, { status: stage });
    }

    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDeal = async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
