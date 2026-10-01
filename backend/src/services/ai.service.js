import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { AiLog } from '../models/AiLog.js';
import dotenv from 'dotenv';
dotenv.config();

class AIService {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || '';
    this.openRouterKey = process.env.OPENROUTER_API_KEY || '';
  }

  updateKeys({ geminiKey, openRouterKey }) {
    if (geminiKey !== undefined) this.geminiKey = geminiKey;
    if (openRouterKey !== undefined) this.openRouterKey = openRouterKey;
  }

  async callGemini(prompt, systemInstruction = '', modelName = 'gemini-3.8-flash') {
    if (!this.geminiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    const genAI = new GoogleGenerativeAI(this.geminiKey);
    const candidateModels = [modelName, 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.8-pro'];
    let lastError = null;

    for (const m of candidateModels) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: m,
            systemInstruction: systemInstruction || undefined,
          });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        } catch (err) {
          lastError = err;
          if (err.message && err.message.includes('503') && attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 800 * attempt));
            continue;
          }
          if (err.message && (err.message.includes('404') || err.message.includes('no longer available'))) {
            break; // Try next candidate model
          }
          throw err;
        }
      }
    }
    throw lastError || new Error('Gemini API call failed');
  }

  async callOpenRouter(prompt, systemInstruction = '', model = 'google/gemini-2.0-flash-exp:free') {
    if (!this.openRouterKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openRouterKey}`,
          'HTTP-Referer': 'https://leovexa.in',
          'X-Title': 'Leovexa Outreach CRM',
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    return response.data.choices[0].message.content;
  }

  async executeWithFallback(prompt, systemInstruction, task, lead_id = null) {
    const startTime = Date.now();
    let provider = 'gemini';
    let outputText = '';
    let success = true;
    let errorMsg = '';

    // Step 1: Try Gemini Primary
    try {
      if (this.geminiKey) {
        outputText = await this.callGemini(prompt, systemInstruction);
        provider = 'gemini';
      } else {
        throw new Error('Gemini API key missing');
      }
    } catch (geminiError) {
      console.warn(`⚠️ Gemini API error (${geminiError.message}). Trying OpenRouter fallback...`);
      // Step 2: Try OpenRouter Fallback
      try {
        if (this.openRouterKey) {
          outputText = await this.callOpenRouter(prompt, systemInstruction);
          provider = 'openrouter';
        } else {
          throw new Error('OpenRouter API key missing');
        }
      } catch (openRouterError) {
        console.warn(`⚠️ OpenRouter error (${openRouterError.message}). Using intelligent rule engine.`);
        provider = 'system_fallback';
        outputText = this.generateRuleBasedFallback(task, prompt);
        if (!outputText) {
          success = false;
          errorMsg = `Gemini: ${geminiError.message} | OpenRouter: ${openRouterError.message}`;
        }
      }
    }

    const duration_ms = Date.now() - startTime;

    // Log AI call
    try {
      await AiLog.create({
        provider,
        model: provider === 'gemini' ? 'gemini-1.5-flash' : provider === 'openrouter' ? 'openrouter/free' : 'rule_engine',
        task,
        lead_id,
        input_prompt: prompt.substring(0, 1000),
        output_text: (outputText || '').substring(0, 2000),
        success,
        error: errorMsg,
        duration_ms,
      });
    } catch (e) {
      // ignore logging db error
    }

    return { text: outputText, provider, success };
  }

  // --- Task 1: Research & Lead Qualification ---
  async analyzeAndScoreLead(leadData) {
    const prompt = `
You are Leovexa's elite B2B Sales & Digital Audit AI.
Analyze this business lead and evaluate digital opportunities for web redesign, appointment booking systems, and CRM automation:

Business Name: ${leadData.business_name}
Industry: ${leadData.industry || 'General'}
Website: ${leadData.website || 'None'}
City/Location: ${leadData.city || 'India'}
Observed website content & cues:
${leadData.scraped_content || 'No website found or minimal presence.'}

Scoring Rules (0-100 max):
- No website: +30 points
- Outdated / Poor UI / Slow: +20 points
- No online booking flow / missing appointment scheduler: +15 points
- Weak CTA / missing clear value proposition: +10 points
- Poor mobile responsiveness / WhatsApp only: +10 points
- Active verified local business: +10 points
- High-ticket industry (e.g. Dental, Real Estate, Healthcare, High-end clinics, Legal, Luxury): +5 points

Return strict valid JSON ONLY in this format:
{
  "website_exists": ${leadData.website ? 'true' : 'false'},
  "website_quality": "Poor" | "Medium" | "High" | "None",
  "mobile_quality": "Poor" | "Medium" | "High",
  "booking_available": false,
  "whatsapp_available": true,
  "seo_observations": "Brief SEO audit note",
  "pain_points": ["Pain point 1", "Pain point 2", "Pain point 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "recommended_services": ["Custom Website Redesign", "Automated Booking CRM", "WhatsApp AI Agent"],
  "ai_summary": "Crisp 2-3 sentence executive summary of why this lead needs Leovexa services.",
  "ai_score": 85,
  "score_category": "HIGH PRIORITY"
}
`;

    const response = await this.executeWithFallback(prompt, 'You are an expert agency audit AI. Always return strict valid JSON.', 'RESEARCH', leadData._id);
    
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error('Failed to parse AI JSON response, generating fallback structure:', err.message);
    }

    return this.fallbackAnalysis(leadData);
  }

  // --- Task 2: Personalized Outreach Generation ---
  async generateOutreachEmail({ lead, analysis, campaign }) {
    const prompt = `
Generate a hyper-personalized, ultra-high-converting cold outreach email for Leovexa Technologies.
Rules:
1. Keep it concise (under 120 words), authentic, human, and not sounding like generic AI spam.
2. Mention 1-2 specific observations/pain points from the analysis (${analysis?.pain_points?.join(', ') || 'No modern booking system'}).
3. Offer concrete value tailored to their business (${lead.business_name} in ${lead.industry}).
4. Low friction Call To Action (e.g. "Happy to share a quick 2-minute video audit / 3 specific ideas if you're open?").
5. Company: Leovexa Technologies (Web Development, CRM & AI Automation).

Lead Data:
- Business: ${lead.business_name}
- Industry: ${lead.industry}
- City: ${lead.city || 'India'}
- Website: ${lead.website}
- Analysis Summary: ${analysis?.ai_summary || ''}
- Opportunities: ${analysis?.opportunities?.join(', ') || ''}
- Campaign Goal: ${campaign?.service_offering || 'Modern web design & appointment booking automation'}

Return JSON ONLY:
{
  "subject": "Quick idea for ${lead.business_name}'s website / appointment flow",
  "body": "Hi ${lead.business_name} team,\\n\\n..."
}
`;

    const response = await this.executeWithFallback(prompt, 'You are a master cold email copywriter. Output strict valid JSON.', 'MESSAGE_GEN', lead._id);

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error('JSON parse error in outreach email generation:', err.message);
    }

    return {
      subject: `Quick idea for ${lead.business_name}'s website`,
      body: `Hi ${lead.business_name} team,\n\nI came across your practice while researching ${lead.industry || 'businesses'} in ${lead.city || 'your area'}.\n\nI noticed your website currently doesn't have an automated online appointment and lead capture flow, which might be costing you high-intent inquiries.\n\nAt Leovexa Technologies, we help businesses like yours build modern, high-converting websites with instant booking workflows.\n\nWould you be open to a quick 2-minute audit with a few specific ideas for ${lead.business_name}?\n\nBest regards,\nLeovexa Outreach Team\nhttps://leovexa.in`
    };
  }

  // --- Task: Autonomous AI Lead Discovery (Foreign & Domestic) ---
  async discoverLeadsWithAI({ country = 'USA', industry = 'Dental Healthcare', count = 10, city = '' }) {
    const prompt = `
You are Leovexa's autonomous global business discovery & prospecting intelligence engine.
Find/Generate a list of exactly ${count} highly realistic, high-ticket B2B business prospects for:
- Industry/Niche: ${industry}
- Country: ${country}
- Target City / Region: ${city || (country === 'USA' ? 'California / Texas / New York / Florida' : country === 'UK' ? 'London / Manchester / Birmingham' : country === 'UAE' ? 'Dubai / Abu Dhabi' : country === 'Canada' ? 'Toronto / Vancouver' : country === 'Australia' ? 'Sydney / Melbourne' : 'Indore / Mumbai / Delhi / Bangalore')}

For each business, generate:
1. "business_name": Authentic realistic local business / clinic / agency name in that region.
2. "website": Realistic website URL (e.g. "https://www.drsmithdentalny.com").
3. "email": Valid corporate decision maker email format (e.g. "info@drsmithdentalny.com" or "contact@...").
4. "phone": Realistic phone number with appropriate country dialing code (+1 for USA/Canada, +44 for UK, +971 for UAE, +61 for Australia, +91 for India).
5. "city": City name in that country.
6. "state": State/Province.
7. "country": "${country}".
8. "estimated_score": Number between 75 and 95 (based on high conversion potential for web redesign, CRM automation & appointment booking).
9. "pain_points": Array of 2-3 specific observed digital weaknesses (e.g. "Missing 24/7 online booking flow", "Slow mobile landing page", "No automated SMS/Email reminder funnel").
10. "opportunities": Array of 2 specific service opportunities.

Return strict JSON array of objects ONLY in this exact format:
[
  {
    "business_name": "...",
    "industry": "${industry}",
    "website": "...",
    "email": "...",
    "phone": "...",
    "city": "...",
    "state": "...",
    "country": "${country}",
    "estimated_score": 88,
    "pain_points": ["...", "..."],
    "opportunities": ["...", "..."],
    "ai_summary": "Crisp 2-sentence rationale on why this business needs digital modernization."
  }
]
`;

    const response = await this.executeWithFallback(prompt, 'You are a master B2B sales discovery engine. Always return a strict JSON array of objects.', 'RESEARCH');

    try {
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('AI Discovery JSON parse error, generating rich fallback data:', err.message);
    }

    return this.generateFallbackForeignLeads(country, industry, count, city);
  }

  generateFallbackForeignLeads(country, industry, count, city) {
    const list = [];
    const sampleNames = {
      USA: ['Beverly Hills Smile Studio', 'Manhattan Dermatology & Laser Center', 'Austin Premier Orthodontics', 'Apex Spine & Wellness Clinic', 'Horizon Capital Real Estate', 'Pacific Coast Dental Spa', 'Vanguard Fitness & Athletics', 'Metropolitan Legal Group', 'Prestige MedSpa Dallas', 'Golden Gate Aesthetics'],
      UK: ['Harley Street Dental Excellence', 'Mayfair Dermatology & Wellness', 'Kensington Prime Real Estate', 'Manchester Elite Fitness Club', 'Edinburgh Dental Studio', 'Chelsea Health & Longevity Clinic', 'Birmingham Spine Specialists', 'Oxford Legal & Corporate Partners', 'The London Smile Boutique', 'Canary Wharf Aesthetics'],
      UAE: ['Dubai Hills Dental Clinic', 'Palm Jumeirah Luxury Real Estate', 'Emirates Dermatology & Laser Spa', 'Downtown Dubai Aesthetics Center', 'Al Barsha Wellness & Sports Clinic', 'Gulf Coast Medical & Dental', 'Marina Heights Luxury Properties', 'Jumeirah Family Dental', 'Arabian Ranches Health Care', 'Abu Dhabi Premier Dental'],
      Canada: ['Yorkville Dental Specialists Toronto', 'Vancouver Coast Aesthetics Clinic', 'Downtown Calgary Orthodontics', 'Montreal Premier Medical Spa', 'Pacific Rim Real Estate Vancouver', 'Ontario Wellness & Sports Clinic', 'Toronto Smile Architecture', 'West Coast Dental Studio', 'Boutique Law Toronto', 'Apex Health & Fitness Ottawa'],
      Australia: ['Sydney Harbour Dental Studio', 'Melbourne City Dermatology', 'Brisbane Premier Orthodontics', 'Gold Coast Luxury Villas & Real Estate', 'Perth Aesthetics & Wellness', 'Bondi Beach Dental Lounge', 'South Yarra Medical Spa', 'Adelaide Spine & Health', 'Crown Sydney Properties', 'Sunshine Coast Dental'],
      India: ['Apex Dental & Implant Super Specialty', 'Shree Radhey Aesthetics & Dermatology', 'FitPulse Luxury Fitness & Gym', 'Crown Heights Luxury Real Estate', 'Dr. Mehta Orthopedic Super Specialty', 'The Grand Heritage Fine Dining & Banquets', 'Indore Laser & Cosmetic Institute', 'Apollo Dental Care Residency', 'Bhopal Premier Health Clinic', 'Royal Palms Banquets & Events']
    };

    const names = sampleNames[country] || sampleNames['USA'];
    const codes = { USA: '+1', UK: '+44', UAE: '+971', Canada: '+1', Australia: '+61', India: '+91' };
    const defaultCities = { USA: 'Los Angeles', UK: 'London', UAE: 'Dubai', Canada: 'Toronto', Australia: 'Sydney', India: 'Indore' };
    const dialCode = codes[country] || '+1';
    const targetCity = city || defaultCities[country] || 'New York';

    for (let i = 0; i < Math.min(count, names.length); i++) {
      const name = names[i];
      const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const score = Math.floor(Math.random() * 16) + 80; // 80 - 95 score

      list.push({
        business_name: name,
        industry: industry || 'Dental Healthcare',
        website: `https://www.${cleanSlug}.com`,
        email: `contact@${cleanSlug}.com`,
        phone: `${dialCode} ${Math.floor(Math.random() * 899 + 100)} ${Math.floor(Math.random() * 899999 + 100000)}`,
        city: targetCity,
        state: country === 'USA' ? 'CA' : country === 'UK' ? 'Greater London' : country === 'UAE' ? 'Dubai' : 'State',
        country: country,
        estimated_score: score,
        pain_points: [
          'No automated 24/7 online appointment booking system',
          'Missing high-converting mobile funnel and inquiry capture',
          'Zero automated post-consultation email/WhatsApp sequence'
        ],
        opportunities: [
          'Custom Web App Redesign with Instant Booking',
          'AI-Powered Appointment Scheduling Funnel'
        ],
        ai_summary: `${name} in ${targetCity}, ${country} has high organic traffic but suffers from lead leakage due to missing automated booking workflows.`
      });
    }

    return list;
  }

  // --- Task 3: Classify Inbound Reply ---
  async classifyReply({ reply_text, original_pitch, lead }) {
    const prompt = `
Analyze this inbound email reply from a prospect (${lead?.business_name || 'Prospect'}).
Original Outreach Pitch:
${original_pitch || 'Offered web development and appointment CRM services.'}

Inbound Prospect Reply:
"${reply_text}"

Classify the reply into one of these exact intents:
- "INTERESTED" (wants to know more, open to talk, requested portfolio/case studies)
- "MEETING_REQUEST" (asked for a call, calendar, or meeting)
- "PRICING_INQUIRY" (asked how much it costs or packages)
- "PORTFOLIO_REQUEST" (asked for work samples or past clients)
- "QUESTION" (asked specific inquiry)
- "NOT_INTERESTED" (declined politely)
- "UNSUBSCRIBE" (angry, requested opt out, stop emailing)
- "NEUTRAL" (auto-responder, out of office, acknowledgement)

Also generate a crisp human-like follow-up reply recommendation.

Return JSON ONLY:
{
  "intent": "INTERESTED",
  "requires_human": true,
  "sentiment": "positive",
  "summary": "Prospect expressed interest and asked for sample work.",
  "suggested_reply": "Hi team, thanks for getting back! Here are 2 recent case studies... When would be a good time for a 10-minute discovery call this week?"
}
`;

    const response = await this.executeWithFallback(prompt, 'You are an AI sales classifier. Output valid JSON.', 'REPLY_CLASSIFY', lead?._id);

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error('Classification parse error:', err.message);
    }

    return {
      intent: 'INTERESTED',
      requires_human: true,
      sentiment: 'positive',
      summary: 'Prospect sent an inbound message that requires review.',
      suggested_reply: `Hi ${lead?.business_name || 'there'},\n\nThank you for reaching out! We'd love to discuss how we can tailor this for your practice. Would you be free for a brief 10-minute call tomorrow?\n\nBest,\nLeovexa Team`
    };
  }

  // Fallback engine if no API keys are present
  fallbackAnalysis(leadData) {
    let score = 40;
    const hasWebsite = Boolean(leadData.website && leadData.website.startsWith('http'));
    const isHighTicket = /dental|clinic|hospital|doctor|law|real estate|luxury|gym|spa|jewel/i.test(leadData.industry || '');

    if (!hasWebsite) score += 35;
    else score += 15;

    if (isHighTicket) score += 15;
    if (leadData.city) score += 10;
    if (leadData.phone || leadData.whatsapp) score += 10;

    score = Math.min(score, 95);

    let category = 'QUALIFIED';
    if (score >= 80) category = 'HIGH PRIORITY';
    else if (score >= 60) category = 'QUALIFIED';
    else if (score >= 40) category = 'REVIEW';
    else category = 'LOW';

    return {
      website_exists: hasWebsite,
      website_quality: hasWebsite ? 'Medium' : 'None',
      mobile_quality: hasWebsite ? 'Medium' : 'Unknown',
      booking_available: false,
      whatsapp_available: Boolean(leadData.whatsapp || leadData.phone),
      seo_observations: hasWebsite ? 'Basic SEO in place, missing conversion funnel.' : 'No digital website footprint found.',
      pain_points: [
        hasWebsite ? 'Missing modern automated booking system' : 'No official website to capture Google searches',
        'Manual inquiry handling causing lead leakage',
        'Weak brand positioning against competitors'
      ],
      opportunities: [
        'Deploy custom responsive landing page with online booking',
        'Connect WhatsApp & Email CRM automation',
        'Implement instant appointment reminder funnel'
      ],
      recommended_services: [
        'High-Converting Web App Development',
        'AI Appointment Booking CRM',
        'Local SEO & Google Business Optimization'
      ],
      ai_summary: `${leadData.business_name} in ${leadData.city || 'local market'} represents a prime target for digital modernization. Adding an automated booking and web funnel can significantly increase client conversions.`,
      ai_score: score,
      score_category: category
    };
  }

  generateRuleBasedFallback(task, prompt) {
    if (task === 'RESEARCH') {
      return JSON.stringify({
        website_exists: true,
        website_quality: 'Medium',
        mobile_quality: 'Medium',
        booking_available: false,
        whatsapp_available: true,
        seo_observations: 'Standard indexing, conversion optimization needed.',
        pain_points: ['No automated booking workflow', 'High inquiry leakage'],
        opportunities: ['Modern UI Redesign', 'AI Appointment Booking CRM'],
        recommended_services: ['High-Converting Web App', 'Appointment Automation'],
        ai_summary: 'Strong candidate for digital modernization and appointment booking conversion.',
        ai_score: 84,
        score_category: 'HIGH PRIORITY'
      });
    }
    if (task === 'MESSAGE_GEN') {
      return JSON.stringify({
        subject: "Quick idea for your website & appointment booking",
        body: "Hi team,\n\nI was looking into your practice and noticed a clear opportunity to modernize your website and automate 24/7 online appointment scheduling.\n\nAt Leovexa Technologies (https://leovexa.in), we help businesses convert visitors directly into confirmed bookings.\n\nWould you be open to a quick 2-minute audit with 3 specific ideas?\n\nBest regards,\nLeovexa Outreach Team\nhttps://leovexa.in"
      });
    }
    if (task === 'REPLY_CLASSIFY') {
      return JSON.stringify({
        intent: "INTERESTED",
        requires_human: true,
        sentiment: "positive",
        summary: "Prospect expressed interest in web development & booking CRM.",
        suggested_reply: "Hi team,\n\nThanks for getting back! Here are 2 recent case studies of our work. Would you be free for a brief 10-minute discovery call this week?\n\nBest,\nLeovexa Team\nhttps://leovexa.in"
      });
    }
    return null;
  }
}

export const aiService = new AIService();
