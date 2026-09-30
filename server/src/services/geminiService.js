import { GoogleGenAI } from '@google/genai';

const responseSchema = {
  type: 'OBJECT',
  properties: {
    matchedStandards: { type: 'ARRAY', items: { type: 'STRING' } },
    confidenceScore: { type: 'NUMBER' },
    reasoning: { type: 'STRING' },
    certificationFlags: { type: 'ARRAY', items: { type: 'STRING' } },
    needsReview: { type: 'BOOLEAN' },
  },
  required: ['matchedStandards', 'confidenceScore', 'reasoning', 'certificationFlags', 'needsReview'],
};

function parseResponse(text) {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const parsed = JSON.parse(clean);
  if (!Array.isArray(parsed.matchedStandards) || !Array.isArray(parsed.certificationFlags)
      || typeof parsed.confidenceScore !== 'number' || typeof parsed.reasoning !== 'string') {
    throw new Error('Gemini returned an invalid recommendation shape');
  }
  return parsed;
}

function describeFailure(error, apiKey) {
  const status = Number(error?.status ?? error?.response?.status);
  let message = String(error?.message || '').toLowerCase();
  if (apiKey) message = message.replaceAll(apiKey.toLowerCase(), '[redacted]');

  if (/api.?key|credential/.test(message) || status === 401 || status === 403) {
    return 'API key rejected or missing permission';
  }
  if (/quota|resource_exhausted|rate.?limit/.test(message) || status === 429) {
    return 'API quota or rate limit reached';
  }
  if (/model.*(not found|not supported|unavailable)/.test(message) || status === 404) {
    return 'configured Gemini model is unavailable';
  }
  if (error instanceof SyntaxError || /invalid recommendation shape|empty response/.test(message)) {
    return 'Gemini returned invalid or empty JSON';
  }
  if (status === 400) return 'Gemini rejected the request or JSON response schema';
  if (status >= 500) return `Gemini service returned HTTP ${status}`;
  return error?.name || 'unknown Gemini error';
}

export async function recommendWithGemini(inputText, standards) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured. Add it to server/.env to enable recommendations.');
    error.status = 503;
    throw error;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an Indian procurement standards assistant. Compare the user requirement to the standards catalog below. Select ONLY standardNumber values present in the catalog; never invent numbers. Return strict JSON matching the response schema, with confidenceScore from 0 to 1. Set needsReview true when confidence is below 0.6 or the requirement is vague.\n\nUser requirement:\n${inputText}\n\nIllustrative standards catalog (JSON):\n${JSON.stringify(standards)}`;

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema, temperature: 0.1 },
      });
      if (!response.text) throw new Error('Gemini returned an empty response');
      return parseResponse(response.text);
    } catch (error) {
      lastError = error;
    }
  }
  const reason = describeFailure(lastError, apiKey);
  console.error(`Gemini request failed after 2 attempts: ${reason}.`);
  const error = new Error(`Gemini request failed: ${reason}. Check GEMINI_MODEL, API key permissions, and quota.`);
  error.status = 502;
  throw error;
}
