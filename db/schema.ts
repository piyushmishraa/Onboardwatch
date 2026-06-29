import { pgTable, serial, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

// One row per status report submitted by a fresher.
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 120 }).notNull(),
  batchYear: varchar("batch_year", { length: 20 }),
  status: varchar("status", { length: 30 }).notNull(), // delayed | onboarded | offer_revoked | no_update
  note: text("note"),
  source: varchar("source", { length: 50 }).default("web"), // web | api | seed
  verified: boolean("verified").default(false),
  ipHash: varchar("ip_hash", { length: 64 }), // for lightweight spam throttling, never store raw IP
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
