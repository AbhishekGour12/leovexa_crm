const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const api = {
  // Dashboard & Analytics
  async getDashboard() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    return res.json();
  },

  // Leads
  async getLeads(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/leads?${query}`);
    return res.json();
  },

  async getLeadById(id) {
    const res = await fetch(`${API_BASE}/leads/${id}`);
    return res.json();
  },

  async createLead(leadData) {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return res.json();
  },

  async triggerResearch(leadId) {
    const res = await fetch(`${API_BASE}/leads/${leadId}/research`, {
      method: 'POST'
    });
    return res.json();
  },

  async importCsv(formData) {
    const res = await fetch(`${API_BASE}/leads/import-csv`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async downloadTemplate() {
    window.open(`${API_BASE}/leads/download-template`, '_blank');
  },

  async seedDemoData() {
    const res = await fetch(`${API_BASE}/leads/seed-demo`, {
      method: 'POST'
    });
    return res.json();
  },

  async aiDiscoverLeads(params = {}) {
    const res = await fetch(`${API_BASE}/leads/ai-discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async clearAllData() {
    const res = await fetch(`${API_BASE}/leads/clear-all`, {
      method: 'POST'
    });
    return res.json();
  },

  async extractPostLeadsAndProposals(payload) {
    const res = await fetch(`${API_BASE}/leads/ai-extract-pitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async sendProposalEmail(payload) {
    const res = await fetch(`${API_BASE}/leads/send-pitch-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async triggerDailyLeads() {
    const res = await fetch(`${API_BASE}/leads/trigger-daily-leads`, {
      method: 'POST'
    });
    return res.json();
  },

  async deleteLead(id) {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Campaigns
  async getCampaigns() {
    const res = await fetch(`${API_BASE}/campaigns`);
    return res.json();
  },

  async createCampaign(data) {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Messages & Approvals
  async getPendingApprovals() {
    const res = await fetch(`${API_BASE}/messages/pending-approvals`);
    return res.json();
  },

  async approveMessage(id, data = {}) {
    const res = await fetch(`${API_BASE}/messages/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async rejectMessage(id, reason = '') {
    const res = await fetch(`${API_BASE}/messages/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  async regeneratePitch(id, options = {}) {
    const res = await fetch(`${API_BASE}/messages/${id}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    return res.json();
  },

  async simulateReply(lead_id, reply_text) {
    const res = await fetch(`${API_BASE}/messages/simulate-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id, reply_text })
    });
    return res.json();
  },

  async getConversations() {
    const res = await fetch(`${API_BASE}/conversations`);
    return res.json();
  },

  async getFollowupSequences() {
    const res = await fetch(`${API_BASE}/messages/followup-sequences`);
    return res.json();
  },

  async triggerManualFollowup(lead_id, step = 'FOLLOWUP_1') {
    const res = await fetch(`${API_BASE}/messages/trigger-followup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id, step })
    });
    return res.json();
  },

  // Deals
  async getDeals() {
    const res = await fetch(`${API_BASE}/deals`);
    return res.json();
  },

  async createDeal(data) {
    const res = await fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateDealStage(id, stageData) {
    const res = await fetch(`${API_BASE}/deals/${id}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stageData)
    });
    return res.json();
  },

  async deleteDeal(id) {
    const res = await fetch(`${API_BASE}/deals/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(data) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async testGemini(key) {
    const res = await fetch(`${API_BASE}/settings/test-gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    return res.json();
  },

  async testOpenRouter(key) {
    const res = await fetch(`${API_BASE}/settings/test-openrouter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    return res.json();
  },

  async testTelegram(token, chatId) {
    const res = await fetch(`${API_BASE}/settings/test-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chatId })
    });
    return res.json();
  },

  async testGmail(user, pass) {
    const res = await fetch(`${API_BASE}/settings/test-gmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    });
    return res.json();
  }
};
