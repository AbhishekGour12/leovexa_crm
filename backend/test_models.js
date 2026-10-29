import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  console.log('--- 1. Testing Gemini 3.7 Flash & 3.8 Flash & gemini-flash-latest ---');
  for (const m of ['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.5-flash']) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Say Hello');
      console.log(`✅ Gemini (${m}) SUCCESS:`, res.response.text().trim());
      break;
    } catch(e) {
      console.log(`❌ Gemini (${m}) FAILED:`, e.message);
    }
  }

  console.log('\n--- 2. Testing OpenRouter Models ---');
  for (const m of ['meta-llama/llama-3.3-70b-instruct:free', 'mistralai/mistral-7b-instruct:free', 'google/gemini-2.0-flash-thinking-exp:free', 'openrouter/auto']) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: m,
          messages: [{ role: 'user', content: 'Say Hello' }]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://leovexa.in',
            'X-Title': 'Leovexa CRM',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      console.log(`✅ OpenRouter (${m}) SUCCESS:`, response.data.choices[0].message.content.trim());
      break;
    } catch (e) {
      console.log(`❌ OpenRouter (${m}) FAILED:`, e.response?.data?.error?.message || e.message);
    }
  }
}

run();
