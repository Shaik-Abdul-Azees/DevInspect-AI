const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API key");
    return;
  }
  
  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const models = response.data.models.map(m => m.name);
    console.log('Available models:');
    models.forEach(m => console.log(m));
  } catch (err) {
    console.log(`❌ Failed to list models:`, err.response?.data || err.message);
  }
}

listModels();
