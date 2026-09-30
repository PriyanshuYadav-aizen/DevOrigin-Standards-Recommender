import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Standard from '../models/Standard.js';
import QueryLog from '../models/QueryLog.js';
import { recommendWithGemini } from '../services/geminiService.js';

const router = Router();
const recommendLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });

function toPublicStandard({ standardNumber, title, category, testMethods, alliedCodes, certificationRequired, edition, status, supersededBy }) {
  return { standardNumber, title, category, testMethods, alliedCodes, certificationRequired, edition, status, supersededBy };
}

router.post('/', recommendLimiter, async (req, res) => {
  const inputText = typeof req.body?.inputText === 'string' ? req.body.inputText.trim() : '';
  if (inputText.length < 8 || inputText.length > 4000) {
    return res.status(400).json({ error: 'inputText must contain between 8 and 4000 characters.' });
  }

  try {
    const records = await Standard.find().sort({ category: 1, standardNumber: 1 }).lean();
    const standards = records.map(toPublicStandard);
    const draft = await recommendWithGemini(inputText, standards);
    const validNumbers = new Set(standards.map((item) => item.standardNumber));
    const matchedStandards = [...new Set(draft.matchedStandards.filter((number) => validNumbers.has(number)))];
    const matches = standards.filter((item) => matchedStandards.includes(item.standardNumber));
    const confidenceScore = matchedStandards.length ? Math.max(0, Math.min(1, draft.confidenceScore)) : Math.min(0.3, draft.confidenceScore);
    const needsReview = Boolean(draft.needsReview || confidenceScore < 0.6 || inputText.length < 18 || matchedStandards.length === 0);
    const certificationFlags = [...new Set([
      ...draft.certificationFlags.filter((flag) => typeof flag === 'string'),
      ...matches.flatMap((item) => item.certificationRequired),
    ])];
    const log = await QueryLog.create({ inputText, matchedStandards, confidenceScore, reasoning: draft.reasoning, certificationFlags, needsReview });
    return res.json({
      matchedStandards,
      standards: matches,
      confidenceScore,
      reasoning: draft.reasoning,
      certificationFlags,
      needsReview,
      queryId: log._id.toString(),
      createdAt: log.timestamp,
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    if (status >= 500) console.error('Recommendation request failed:', error?.message || 'Unknown error');
    return res.status(status).json({ error: error?.message || 'Unable to create recommendation.' });
  }
});

export default router;

