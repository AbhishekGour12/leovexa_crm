import { aiService } from './src/services/ai.service.js';
import dotenv from 'dotenv';
dotenv.config();

async function testPipeline() {
  console.log('Testing AI Lead Discovery...');
  const leads = await aiService.discoverLeadsWithAI({
    country: 'USA',
    industry: 'Dental Healthcare',
    count: 2,
    city: 'Austin'
  });
  console.log('Discovered Leads:', leads.length);
  if (leads.length > 0) {
    console.log('Lead 1:', leads[0].business_name, '| Email:', leads[0].email);
    console.log('\nTesting Outreach Email Generation for Lead 1...');
    const emailDraft = await aiService.generateOutreachEmail({
      lead: leads[0],
      analysis: {
        pain_points: leads[0].pain_points,
        opportunities: leads[0].opportunities,
        ai_summary: leads[0].ai_summary
      }
    });
    console.log('Subject:', emailDraft.subject);
    console.log('Body:\n', emailDraft.body);
  }
}

testPipeline();
