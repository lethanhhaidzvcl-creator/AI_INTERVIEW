const express = require('express');
const dotenv = require('dotenv');
const {GoogleGenerativeAI} = require('@google/generative-ai');

// Load environment variables
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const app = express();
app.use(express.json());

// Initialise Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const {sanitizePrompt, validatePayload} = require('./validation');
// Default model; fallback logic will be handled in request handler

/**
 * POST /generate
 * Body JSON: { "prompt": "your prompt text" }
 * Returns: Gemini model response (JSON) or error message.
 */
app.post('/generate', async (req, res) => {
  // Validate incoming payload against the evaluation schema
  const payload = req.body;
  const {valid, errors} = validatePayload(payload);
  if (!valid) {
    return res.status(400).json({error: 'Invalid payload', details: errors});
  }

  // Build the prompt by combining the evaluation template with the sanitized payload
  const fs = require('fs');
  const path = require('path');
  const templatePath = path.resolve(__dirname, '../../docs/ai/evaluation_prompt.txt');
  let template = '';
  try { template = fs.readFileSync(templatePath, 'utf-8'); } catch (e) { console.warn('Could not read evaluation_prompt.txt:', e.message); }
  const sanitizedPayload = {
    question: sanitizePrompt(payload.question),
    context: sanitizePrompt(payload.context),
    candidate_answer: sanitizePrompt(payload.candidate_answer)
  };
  const fullPrompt = `${template}\n${JSON.stringify(sanitizedPayload)}`;

  // Try primary model, fallback if 503
  const primaryModel = 'gemini-3.6-flash';
  const fallbackModel = 'gemini-3.5-flash';

  async function callModel(modelName) {
    try {
      const model = genAI.getGenerativeModel({model: modelName, generationConfig: {responseMimeType: 'application/json'}});
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      return {json: JSON.parse(text), model: modelName};
    } catch (e) {
      throw e;
    }
  }

  try {
    const {json, model} = await callModel(primaryModel);
    return res.json({modelUsed: model, result: json});
  } catch (err) {
    if (err.message && err.message.includes('503')) {
      try {
        const {json, model} = await callModel(fallbackModel);
        return res.json({modelUsed: model, result: json, note: 'Fell back to secondary model'});
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
        return res.status(502).json({error: 'Both primary and fallback Gemini models failed', details: fallbackErr.message});
      }
    }
    console.error('Gemini call error:', err);
    return res.status(502).json({error: 'Gemini API error', details: err.message});
  }
});
  const {prompt} = req.body;
  if (!prompt) {
    return res.status(400).json({error: 'Missing "prompt" in request body'});
  }

  // Try primary model, fallback if 503
  const primaryModel = 'gemini-3.6-flash';
  const fallbackModel = 'gemini-3.5-flash';

  async function callModel(modelName) {
    try {
      const model = genAI.getGenerativeModel({model: modelName, generationConfig: {responseMimeType: 'application/json'}});
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Assume model returns valid JSON string
      return {json: JSON.parse(text), model: modelName};
    } catch (e) {
      // Propagate error for handling
      throw e;
    }
  }

  try {
    const {json, model} = await callModel(primaryModel);
    return res.json({modelUsed: model, result: json});
  } catch (err) {
    // If primary fails with 503, fallback
    if (err.message && err.message.includes('503')) {
      try {
        const {json, model} = await callModel(fallbackModel);
        return res.json({modelUsed: model, result: json, note: 'Fell back to secondary model'});
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
        return res.status(502).json({error: 'Both primary and fallback Gemini models failed', details: fallbackErr.message});
      }
    }
    console.error('Gemini call error:', err);
    return res.status(502).json({error: 'Gemini API error', details: err.message});
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gemini backend service listening on port ${PORT}`);
});
