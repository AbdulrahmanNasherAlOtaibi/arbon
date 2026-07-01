import { pgTable, serial, text, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dealsTable } from "./deals";
import { usersTable } from "./users";

/**
 * Money-moving actions (release / refund / forfeit) require dual control:
 * a "maker" requests the action, and a different "checker" approves it before
 * it is executed. This table records that maker-checker workflow.
 */
export const approvalActionEnum = pgEnum("approval_action", ["release", "refund", "forfeit"]);
export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected", "executed"]);

export const approvalsTable = pgTable("approvals", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => dealsTable.id),
  action: approvalActionEnum("action").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  reason: text("reason").notNull().default(""),
  status: approvalStatusEnum("status").notNull().default("pending"),
  makerId: integer("maker_id").notNull().references(() => usersTable.id),
  checkerId: integer("checker_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  decidedAt: timestamp("decided_at"),
});

export const insertApprovalSchema = createInsertSchema(approvalsTable).omit({ id: true, createdAt: true });
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvalsTable.$inferSelect;
