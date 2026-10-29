import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;

async function testGeminiDirect() {
  const models = ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];
  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
      const res = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: 'Respond with exactly: "GEMINI_OK"' }] }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );
      console.log(`✅ Gemini (${m}) SUCCESS:`, res.data.candidates[0].content.parts[0].text);
      return m;
    } catch(e) {
      console.log(`❌ Gemini (${m}) FAILED:`, e.response?.status, e.response?.data?.error?.message || e.message);
    }
  }
}

testGeminiDirect();
