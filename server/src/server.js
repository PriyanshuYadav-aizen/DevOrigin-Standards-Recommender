import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const port = Number(process.env.PORT || 5000);

export async function startServer() {
  try {
    await connectDB();
    const httpServer = app.listen(port, () => console.info(`API server listening on port ${port}`));
    return httpServer;
  } catch (error) {
    if (error?.code === 'MISSING_MONGODB_URI') console.error(error.message);
    else console.error('Server startup failed. Fix the MongoDB message above, then restart the server.');
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  startServer().catch((error) => {
    console.error('Unexpected startup error:', error?.name || 'unknown error');
    process.exitCode = 1;
  });
}
