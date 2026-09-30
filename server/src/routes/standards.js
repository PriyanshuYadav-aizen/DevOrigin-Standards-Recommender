import { Router } from 'express';
import Standard from '../models/Standard.js';

const router = Router();

function toPublicStandard({ standardNumber, title, category, testMethods, alliedCodes, certificationRequired, edition, status, supersededBy }) {
  return { standardNumber, title, category, testMethods, alliedCodes, certificationRequired, edition, status, supersededBy };
}

router.get('/', async (_req, res) => {
  try {
    const standards = await Standard.find().sort({ category: 1, standardNumber: 1 }).lean();
    return res.json(standards.map(toPublicStandard));
  } catch (error) {
    console.error('Could not load standards:', error?.message || 'Unknown error');
    return res.status(500).json({ error: 'Could not load standards.' });
  }
});

router.get('/summary', async (_req, res) => {
  try {
    const [total, current, categories] = await Promise.all([
      Standard.countDocuments(),
      Standard.countDocuments({ status: 'current' }),
      Standard.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);
    return res.json({ total, current, categories: categories.map(({ _id, count }) => ({ category: _id, count })) });
  } catch (error) {
    console.error('Could not summarize standards:', error?.message || 'Unknown error');
    return res.status(500).json({ error: 'Could not load standards summary.' });
  }
});

export default router;
