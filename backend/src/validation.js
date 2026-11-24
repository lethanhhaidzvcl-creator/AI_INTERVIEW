// validation.js – JSON schema validation & prompt sanitization
const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, strict: false});
const fs = require('fs');
const path = require('path');

// Load the evaluation schema (relative to project root)
const schemaPath = path.resolve(__dirname, '../../docs/ai/evaluation_schema.json');
let evaluationSchema = {};
try {
  const raw = fs.readFileSync(schemaPath, 'utf-8');
  evaluationSchema = JSON.parse(raw);
} catch (e) {
  console.warn('Could not load evaluation_schema.json:', e.message);
}

const validate = ajv.compile(evaluationSchema);

/**
 * Validate incoming JSON payload against the evaluation schema.
 * @param {object} data - Parsed JSON from request body.
 * @returns {{valid: boolean, errors?: string[]}}
 */
function validatePayload(data) {
  const valid = validate(data);
  if (!valid) {
    const msgs = validate.errors.map(err => `${err.instancePath} ${err.message}`);
    return {valid: false, errors: msgs};
  }
  return {valid: true};
}

/**
 * Simple sanitisation to mitigate prompt injection.
 * - Removes backticks, triple backticks, markdown headings, and any occurrence of "system" instructions.
 * - Trims whitespace.
 * @param {string} prompt
 * @returns {string}
 */
function sanitizePrompt(prompt) {
  if (typeof prompt !== 'string') return prompt;
  let cleaned = prompt;
  // Remove code fences and backticks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`/g, '');
  // Remove markdown headings (lines starting with #)
  cleaned = cleaned.replace(/^#{1,6}\s.*$/gm, '');
  // Strip any explicit system instruction pattern
  cleaned = cleaned.replace(/system:\s*\[.*?\]/gi, '');
  // Collapse multiple newlines
  cleaned = cleaned.replace(/\n{2,}/g, '\n').trim();
  return cleaned;
}

module.exports = {validatePayload, sanitizePrompt};
