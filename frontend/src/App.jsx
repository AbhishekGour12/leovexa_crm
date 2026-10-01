import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LeadsView } from './pages/LeadsView';
import { CampaignsView } from './pages/CampaignsView';
import { ApprovalQueueView } from './pages/ApprovalQueueView';
import { InboxView } from './pages/InboxView';
import { DealsKanbanView } from './pages/DealsKanbanView';
import { SettingsView } from './pages/SettingsView';
import { ApiGuideView } from './pages/ApiGuideView';
import { LeadDrawer } from './components/LeadDrawer';
import { ApprovalModal } from './components/ApprovalModal';
import { NewLeadModal } from './components/NewLeadModal';
import { NewCampaignModal } from './components/NewCampaignModal';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [deals, setDeals] = useState([]);

  // Modals & Drawers
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState(null);
  const [selectedApprovalMsg, setSelectedApprovalMsg] = useState(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 12000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [dashRes, leadsRes, campRes, msgRes, convRes, dealsRes] = await Promise.all([
        api.getDashboard(),
        api.getLeads(),
        api.getCampaigns(),
        api.getPendingApprovals(),
        api.getConversations(),
        api.getDeals()
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (leadsRes.success) setLeads(leadsRes.data);
      if (campRes.success) setCampaigns(campRes.data);
      if (msgRes.success) setPendingMessages(msgRes.data);
      if (convRes.success) setConversations(convRes.data);
      if (dealsRes.success) setDeals(dealsRes.data);
    } catch (e) {
      console.warn('Data sync notice:', e.message);
    }
  };

  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
    try {
      const res = await api.getLeadById(lead._id);
      if (res.success) {
        setSelectedLeadDetail(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const res = await api.seedDemoData();
      alert(res.message || 'Demo leads seeded with full AI research and cold pitches!');
      fetchAllData();
    } catch (e) {
      alert(`Error seeding: ${e.message}`);
    }
  };

  const handleAddLead = async (leadData) => {
    try {
      await api.createLead(leadData);
      fetchAllData();
    } catch (e) {
      alert(`Error creating lead: ${e.message}`);
    }
  };

  const handleImportCsv = async (formData) => {
    try {
      const res = await api.importCsv(formData);
      alert(res.message);
      fetchAllData();
    } catch (e) {
      alert(`CSV error: ${e.message}`);
    }
  };

  const handleAiDiscover = async (config) => {
    try {
      const res = await api.aiDiscoverLeads(config);
      alert(res.message || 'Leads discovered and qualified by AI!');
      fetchAllData();
    } catch (e) {
      alert(`Discovery error: ${e.message}`);
    }
  };

  const handleTriggerResearch = async (leadId) => {
    try {
      const res = await api.triggerResearch(leadId);
      alert('AI Audit & Pitch updated!');
      fetchAllData();
      if (selectedLead && selectedLead._id === leadId) {
        handleSelectLead(selectedLead);
      }
    } catch (e) {
      alert(`Audit error: ${e.message}`);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Delete this lead and all associated messages?')) return;
    try {
      await api.deleteLead(leadId);
      fetchAllData();
      if (selectedLead?._id === leadId) setSelectedLead(null);
    } catch (e) {
      alert(`Delete error: ${e.message}`);
    }
  };

  const handleCreateCampaign = async (campData) => {
    try {
      await api.createCampaign(campData);
      fetchAllData();
    } catch (e) {
      alert(`Campaign error: ${e.message}`);
    }
  };

  const handleApproveMessage = async (msgId, data = {}) => {
    try {
      await api.approveMessage(msgId, data);
      fetchAllData();
      if (selectedLead) handleSelectLead(selectedLead);
    } catch (e) {
      alert(`Approve error: ${e.message}`);
    }
  };

  const handleRejectMessage = async (msgId, reason = '') => {
    try {
      await api.rejectMessage(msgId, reason);
      fetchAllData();
    } catch (e) {
      alert(`Reject error: ${e.message}`);
    }
  };

  const handleRegeneratePitch = async (msgId, opts = {}) => {
    try {
      const res = await api.regeneratePitch(msgId, opts);
      fetchAllData();
      return res;
    } catch (e) {
      alert(`Regenerate error: ${e.message}`);
    }
  };

  const handleSimulateReply = async (leadId, replyText) => {
    try {
      const res = await api.simulateReply(leadId, replyText);
      alert('Simulated reply processed! Intent classified by AI and alert sent.');
      fetchAllData();
      setActiveTab('inbox');
    } catch (e) {
      alert(`Simulate error: ${e.message}`);
    }
  };

  const handleCreateDeal = async (dealData) => {
    try {
      await api.createDeal(dealData);
      fetchAllData();
    } catch (e) {
      alert(`Deal error: ${e.message}`);
    }
  };

  const handleUpdateDealStage = async (dealId, stageData) => {
    try {
      await api.updateDealStage(dealId, stageData);
      fetchAllData();
    } catch (e) {
      alert(`Stage update error: ${e.message}`);
    }
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      await api.deleteDeal(dealId);
      fetchAllData();
    } catch (e) {
      alert(`Delete deal error: ${e.message}`);
    }
  };

  // Header titles
  const titles = {
    dashboard: { title: 'AI Outreach Command Center', sub: 'Autonomous pipeline metrics & conversion telemetry' },
    campaigns: { title: 'Campaigns', sub: 'Targeted niche sequences & pacing settings' },
    leads: { title: 'Leads & Discovery Layer', sub: 'AI audit observations, opportunity scoring & lead directory' },
    approvals: { title: 'Approval Queue', sub: 'Human-in-the-loop review safety gate for cold pitches' },
    inbox: { title: 'Unified Inbox & Reply AI', sub: 'Inbound intent detection and 1-click follow-up answers' },
    pipeline: { title: 'Deals Pipeline (Kanban)', sub: 'Stage progression & revenue forecast' },
    guide: { title: 'API Setup Master Guide', sub: 'Detailed tutorial for Gemini, Telegram, Gmail & OpenRouter keys' },
    settings: { title: 'Integrations & API Keys', sub: 'Manage API keys and test connections in real time' }
  };

  const currentMeta = titles[activeTab] || { title: 'Leovexa CRM', sub: '' };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          leads: leads.length,
          pending: pendingMessages.length,
          replies: conversations.length
        }}
      />

      {/* Main Container */}
      <div className="main-content">
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.sub}
          onOpenNewLead={() => setShowNewLeadModal(true)}
          onOpenNewCampaign={() => setShowNewCampaignModal(true)}
          onSeedDemo={handleSeedDemo}
          notifications={dashboardData.notifications || []}
        />

        <main className="content-body">
          {activeTab === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              onSelectLead={handleSelectLead}
              onOpenApprovals={() => setActiveTab('approvals')}
              onOpenCampaigns={() => setActiveTab('campaigns')}
              onSeedDemo={handleSeedDemo}
              onAiDiscover={handleAiDiscover}
              onOpenNewLead={() => setShowNewLeadModal(true)}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignsView
              campaigns={campaigns}
              onOpenNewCampaign={() => setShowNewCampaignModal(true)}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              leads={leads}
              onSelectLead={handleSelectLead}
              onOpenNewLead={() => setShowNewLeadModal(true)}
              onTriggerResearch={handleTriggerResearch}
              onDeleteLead={handleDeleteLead}
              onSeedDemo={handleSeedDemo}
              onAiDiscover={handleAiDiscover}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalQueueView
              messages={pendingMessages}
              onOpenApprovalModal={(msg) => setSelectedApprovalMsg(msg)}
              onApprove={handleApproveMessage}
              onReject={handleRejectMessage}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxView
              conversations={conversations}
              leads={leads}
              onSimulateReply={handleSimulateReply}
            />
          )}

          {activeTab === 'pipeline' && (
            <DealsKanbanView
              deals={deals}
              leads={leads}
              onUpdateStage={handleUpdateDealStage}
              onCreateDeal={handleCreateDeal}
              onDeleteDeal={handleDeleteDeal}
            />
          )}

          {activeTab === 'guide' && (
            <ApiGuideView
              onNavigateToSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onNavigateToGuide={() => setActiveTab('guide')}
            />
          )}
        </main>
      </div>

      {/* Lead Drawer */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          analysis={selectedLeadDetail?.analysis || selectedLead.analysis}
          messages={selectedLeadDetail?.messages || []}
          onClose={() => {
            setSelectedLead(null);
            setSelectedLeadDetail(null);
          }}
          onTriggerResearch={handleTriggerResearch}
          onSimulateReply={handleSimulateReply}
          onApproveMessage={handleApproveMessage}
        />
      )}

      {/* Approval Modal */}
      {selectedApprovalMsg && (
        <ApprovalModal
          message={selectedApprovalMsg}
          onClose={() => setSelectedApprovalMsg(null)}
          onApprove={handleApproveMessage}
          onReject={handleRejectMessage}
          onRegenerate={handleRegeneratePitch}
        />
      )}

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <NewLeadModal
          onClose={() => setShowNewLeadModal(false)}
          onAddLead={handleAddLead}
          onImportCsv={handleImportCsv}
          onAiDiscover={handleAiDiscover}
        />
      )}

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <NewCampaignModal
          onClose={() => setShowNewCampaignModal(false)}
          onCreateCampaign={handleCreateCampaign}
        />
      )}
    </div>
  );
}

export default App;
