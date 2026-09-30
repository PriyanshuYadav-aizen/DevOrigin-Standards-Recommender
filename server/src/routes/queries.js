import { Router } from 'express';
import QueryLog from '../models/QueryLog.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const records = await QueryLog.find().sort({ timestamp: -1 }).limit(50).lean();
    return res.json(records.map((item) => ({
      id: item._id.toString(),
      inputText: item.inputText,
      matchedStandards: item.matchedStandards,
      confidenceScore: item.confidenceScore,
      reasoning: item.reasoning,
      certificationFlags: item.certificationFlags,
      needsReview: item.needsReview,
      createdAt: item.timestamp,
    })));
  } catch (error) {
    console.error('Could not load recent queries:', error?.message || 'Unknown error');
    return res.status(500).json({ error: 'Could not load recent queries.' });
  }
});

export default router;
