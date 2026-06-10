const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API key");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-flash-latest'
  ];

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello!");
      console.log(`✅ ${modelName} succeeded!`);
      break;
    } catch (err) {
      console.log(`❌ ${modelName} failed: ${err.message}`);
    }
  }
}

testModels();
