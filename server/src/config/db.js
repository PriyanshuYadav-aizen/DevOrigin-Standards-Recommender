import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const error = new Error('MONGODB_URI is missing. From the project root, run: Copy-Item .env.example server/.env');
    error.code = 'MISSING_MONGODB_URI';
    throw error;
  }
  try {
    await mongoose.connect(uri);
    console.info('Connected to MongoDB');
  } catch (error) {
    const reason = error?.code ? `${error.name} (${error.code})` : error?.name || 'unknown error';
    console.error(`MongoDB connection failed: ${reason}. Check that MongoDB is running and MONGODB_URI is correct.`);
    throw error;
  }
}
