import { GoogleGenAI } from '@google/genai';
import type { Config } from '@netlify/functions';
import { desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { queryLogs } from '../../db/schema.js';
import illustrativeStandards from '../../server/src/seed/seedStandards.js';

type Standard = (typeof illustrativeStandards)[number];

type RecommendationDraft = {
  matchedStandards: string[];
  confidenceScore: number;
  reasoning: string;
  certificationFlags: string[];
  needsReview: boolean;
};

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

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function publicStandards(): Standard[] {
  return [...illustrativeStandards].sort((a, b) =>
    a.category.localeCompare(b.category) || a.standardNumber.localeCompare(b.standardNumber),
  );
}

function parseDraft(text: string): RecommendationDraft {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const draft = JSON.parse(clean) as Partial<RecommendationDraft>;
  if (
    !Array.isArray(draft.matchedStandards) ||
    !Array.isArray(draft.certificationFlags) ||
    typeof draft.confidenceScore !== 'number' ||
    typeof draft.reasoning !== 'string' ||
    typeof draft.needsReview !== 'boolean'
  ) {
    throw new Error('AI returned an invalid recommendation.');
  }
  return draft as RecommendationDraft;
}

async function createRecommendation(inputText: string, standards: Standard[]) {
  const ai = new GoogleGenAI({});
  const prompt = `You are an Indian procurement standards assistant. Compare the user requirement to the standards catalog below. Select ONLY standardNumber values present in the catalog; never invent numbers. Return strict JSON matching the response schema, with confidenceScore from 0 to 1. Set needsReview true when confidence is below 0.6 or the requirement is vague.\n\nUser requirement:\n${inputText}\n\nIllustrative standards catalog (JSON):\n${JSON.stringify(standards)}`;
  const response = await ai.models.generateContent({
    model: Netlify.env.get('GEMINI_MODEL') || 'gemini-3.6-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.1,
    },
  });
  if (!response.text) throw new Error('AI returned an empty recommendation.');
  return parseDraft(response.text);
}

async function recommend(req: Request) {
  const body = await req.json().catch(() => ({})) as { inputText?: unknown };
  const inputText = typeof body.inputText === 'string' ? body.inputText.trim() : '';
  if (inputText.length < 8 || inputText.length > 4000) {
    return json({ error: 'inputText must contain between 8 and 4000 characters.' }, 400);
  }

  const standards = publicStandards();
  const draft = await createRecommendation(inputText, standards);
  const validNumbers = new Set(standards.map((item) => item.standardNumber));
  const matchedStandards = [...new Set(draft.matchedStandards.filter((number) => validNumbers.has(number)))];
  const matches = standards.filter((item) => matchedStandards.includes(item.standardNumber));
  const rawConfidence = Number.isFinite(draft.confidenceScore) ? draft.confidenceScore : 0;
  const confidenceScore = matchedStandards.length
    ? Math.max(0, Math.min(1, rawConfidence))
    : Math.min(0.3, Math.max(0, rawConfidence));
  const needsReview = draft.needsReview || confidenceScore < 0.6 || inputText.length < 18 || !matchedStandards.length;
  const certificationFlags = [...new Set([
    ...draft.certificationFlags.filter((flag) => typeof flag === 'string'),
    ...matches.flatMap((item) => item.certificationRequired),
  ])];
  const [log] = await db.insert(queryLogs).values({
    inputText,
    matchedStandards,
    confidenceScore,
    reasoning: draft.reasoning,
    certificationFlags,
    needsReview,
  }).returning();

  return json({
    matchedStandards,
    standards: matches,
    confidenceScore,
    reasoning: draft.reasoning,
    certificationFlags,
    needsReview,
    queryId: String(log.id),
    createdAt: log.createdAt,
  });
}

export default async function handler(req: Request) {
  const { pathname } = new URL(req.url);

  try {
    if (pathname === '/api/health' && req.method === 'GET') return json({ status: 'ok' });

    if (pathname === '/api/standards' && req.method === 'GET') return json(publicStandards());

    if (pathname === '/api/standards/summary' && req.method === 'GET') {
      const standards = publicStandards();
      const counts = new Map<string, number>();
      for (const standard of standards) counts.set(standard.category, (counts.get(standard.category) || 0) + 1);
      const categories = [...counts].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
      return json({ total: standards.length, current: standards.filter((item) => item.status === 'current').length, categories });
    }

    if (pathname === '/api/queries' && req.method === 'GET') {
      const records = await db.select().from(queryLogs).orderBy(desc(queryLogs.createdAt)).limit(50);
      return json(records.map((item) => ({
        id: String(item.id),
        inputText: item.inputText,
        matchedStandards: item.matchedStandards,
        confidenceScore: item.confidenceScore,
        reasoning: item.reasoning,
        certificationFlags: item.certificationFlags,
        needsReview: item.needsReview,
        createdAt: item.createdAt,
      })));
    }

    if (pathname === '/api/recommend' && req.method === 'POST') return await recommend(req);
    return json({ error: 'Not found.' }, 404);
  } catch (error) {
    console.error('API request failed:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'Unable to complete the request.' }, 500);
  }
}

export const config: Config = {
  path: '/api/*',
};
