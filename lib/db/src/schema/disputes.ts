import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dealsTable } from "./deals";
import { usersTable } from "./users";

export const disputeStatusEnum = pgEnum("dispute_status", ["open", "under_review", "resolved_buyer", "resolved_seller", "closed"]);

export const disputesTable = pgTable("disputes", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => dealsTable.id),
  reason: text("reason").notNull(),
  evidence: text("evidence"),
  status: disputeStatusEnum("status").notNull().default("open"),
  resolution: text("resolution"),
  openedBy: integer("opened_by").notNull().references(() => usersTable.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDisputeSchema = createInsertSchema(disputesTable).omit({ id: true, createdAt: true });
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputesTable.$inferSelect;
