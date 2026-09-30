import mongoose from 'mongoose';

const standardSchema = new mongoose.Schema({
  standardNumber: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  testMethods: { type: [String], default: [] },
  alliedCodes: { type: [String], default: [] },
  certificationRequired: { type: [String], default: [] },
  edition: { type: String, required: true },
  status: { type: String, enum: ['current', 'superseded'], default: 'current' },
  supersededBy: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Standard', standardSchema);
