import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY;
  const models = [
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-2.0-flash-thinking-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'openrouter/free'
  ];

  for (const m of models) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: m,
          messages: [{ role: 'user', content: 'Say OK' }]
        },
        {
          headers: {
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'https://leovexa.in',
            'X-Title': 'Leovexa Outreach CRM',
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      console.log(`✅ OpenRouter (${m}) SUCCESS:`, response.data.choices[0].message.content.trim());
      return;
    } catch (e) {
      console.log(`❌ OpenRouter (${m}) FAILED:`, e.response?.status, e.response?.data?.error?.message || e.message);
    }
  }
}

testOpenRouter();
