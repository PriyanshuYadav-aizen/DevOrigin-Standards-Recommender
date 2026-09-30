import mongoose from 'mongoose';

const queryLogSchema = new mongoose.Schema({
  inputText: { type: String, required: true },
  matchedStandards: { type: [String], default: [] },
  confidenceScore: { type: Number, min: 0, max: 1, required: true },
  reasoning: { type: String, required: true },
  certificationFlags: { type: [String], default: [] },
  needsReview: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.model('QueryLog', queryLogSchema);
