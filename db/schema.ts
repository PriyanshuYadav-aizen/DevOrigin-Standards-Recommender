import { boolean, doublePrecision, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const queryLogs = pgTable('query_logs', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  inputText: text('input_text').notNull(),
  matchedStandards: text('matched_standards').array().notNull().default([]),
  confidenceScore: doublePrecision('confidence_score').notNull(),
  reasoning: text().notNull(),
  certificationFlags: text('certification_flags').array().notNull().default([]),
  needsReview: boolean('needs_review').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
