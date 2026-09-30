import express from 'express';
import cors from 'cors';
import recommendRouter from './routes/recommend.js';
import queriesRouter from './routes/queries.js';
import standardsRouter from './routes/standards.js';

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/recommend', recommendRouter);
app.use('/api/queries', queriesRouter);
app.use('/api/standards', standardsRouter);
app.use((error, _req, res, _next) => {
  console.error('Unhandled API error:', error?.message || 'Unknown error');
  res.status(500).json({ error: 'Internal server error.' });
});

export default app;
