import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Standard from '../models/Standard.js';
import standards from './seedStandards.js';

try {
  await connectDB();
  await Standard.init();
  await Standard.bulkWrite(standards.map((standard) => ({
    updateOne: { filter: { standardNumber: standard.standardNumber }, update: { $set: standard }, upsert: true },
  })), { ordered: false });
  console.info(`Seeded ${standards.length} illustrative standards (idempotent upsert).`);
} catch {
  console.error('Seed failed. Check MONGODB_URI and confirm the database is reachable.');
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
