# 🚀 Leovexa AI Outreach CRM & Autonomous Agent

A full-stack, enterprise-grade AI Sales & Cold Outreach System built for **Leovexa Technologies**.

---

## 🌟 Core Features & Architecture

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                    LEOVEXA OUTREACH AI                      │
  ├─────────────────────────────────────────────────────────────┤
  │ 1. Lead Discovery / CSV Import (Indore Clinics, Real Estate)│
  │ 2. Automated Web Scraping & Deep Opportunity Audit          │
  │ 3. Gemini 1.5 Flash AI Qualification & Scoring (0-100)      │
  │ 4. OpenRouter Free Fallback AI Engine (Zero Downtime)       │
  │ 5. Hyper-Personalized Cold Pitch Generator                  │
  │ 6. Human Approval Gate (Web UI & Telegram Bot)              │
  │ 7. Gmail SMTP Dispatcher & Auto Follow-up (Day 3 & Day 7)   │
  │ 8. Inbound Reply AI Intent Classifier & Hot Lead Alerts     │
  │ 9. High-Ticket Deals Pipeline (Interactive Kanban)          │
  └─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & Database

- **Backend**: Node.js, Express.js (ES Modules), Mongoose, Axios, Cheerio, Telegraf, Nodemailer
- **Database**: MongoDB Atlas (`cluster0.oo1aj2i.mongodb.net/leovexa_crm`)
- **Frontend**: React 18, Vite 6, Lucide Icons, Canvas Confetti, Obsidian Glassmorphism Design System
- **AI Primary**: Google Gemini 1.5 Flash (`@google/generative-ai`)
- **AI Fallback**: OpenRouter Free API Models (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`)
- **Telegram Bot**: Telegraf for real-time mobile push notifications and 1-click inline button approvals

---

## 🚀 How to Run the Project

### 1. Start Backend Server
```bash
cd backend
npm install
node src/server.js
# Runs on http://localhost:5000
```

### 2. Start Frontend UI
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Step-by-Step Guide to Extract All API Keys

### 1. Google Gemini API Key (100% Free)
1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"** and select a project.
4. Copy the generated key starting with `AIzaSy...`.
5. Open the CRM **Settings** tab, paste it into `GEMINI_API_KEY`, and click **"Test Gemini Key"**.

### 2. Telegram Bot Token & Chat ID
#### Part A: Get Bot Token
1. In Telegram, search for `@BotFather` (verified blue tick).
2. Send `/newbot`.
3. Enter your bot name (e.g. `Leovexa Outreach Agent`).
4. Enter a bot username ending with `bot` (e.g. `leovexa_crm_bot`).
5. Copy the **HTTP API Token** provided by BotFather.

#### Part B: Get Your Personal Chat ID
1. In Telegram, search for `@userinfobot` and send `/start`. It will return your numeric **Id** (e.g. `123456789`).
2. Search for your newly created bot and click **Start** so it has permission to message you.
3. Paste both token and chat ID in the CRM **Settings** tab and click **"Send Test Alert to Telegram"**.

### 3. Gmail 16-Digit App Password
1. Go to [Google Account Security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned ON.
3. Open [Google App Passwords](https://myaccount.google.com/apppasswords).
4. Enter App Name `Leovexa CRM` and click **Create**.
5. Copy the 16-letter password (e.g. `abcd efgh ijkl mnop`).
6. Paste your Gmail address and 16-letter app password in **Settings** and click **"Verify Gmail SMTP"**.

### 4. OpenRouter Free API Key (Fallback AI)
1. Visit [OpenRouter Keys](https://openrouter.ai/keys).
2. Sign in with Google / GitHub.
3. Click **Create Key** (Name: `Leovexa CRM`).
4. Copy the key starting with `sk-or-v1-...` and paste into **Settings**.

---

## 📂 Project Directory Structure

```text
leovexa_crm/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js - MongoDB Atlas connection)
│   │   ├── models/ (Lead.js, Campaign.js, Message.js, Conversation.js, Deal.js, AiLog.js, Notification.js, Setting.js)
│   │   ├── services/
│   │   │   ├── ai.service.js (Gemini + OpenRouter fallback)
│   │   │   ├── lead.service.js (Scraper & AI audit engine)
│   │   │   ├── email.service.js (Nodemailer Gmail sender & reply processor)
│   │   │   ├── telegram.service.js (Bot commands & inline approvals)
│   │   │   └── queue.service.js (Auto campaign dispatcher & follow-ups)
│   │   ├── controllers/
│   │   ├── routes/ (api.js)
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ (Sidebar, Header, LeadDrawer, ApprovalModal, NewLeadModal, NewCampaignModal)
│   │   ├── pages/ (Dashboard, LeadsView, CampaignsView, ApprovalQueueView, InboxView, DealsKanbanView, SettingsView, ApiGuideView)
│   │   ├── services/ (api.js)
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   └── vite.config.js
└── README.md
```
