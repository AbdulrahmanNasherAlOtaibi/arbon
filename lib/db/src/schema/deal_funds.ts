import { pgTable, serial, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dealsTable } from "./deals";

/**
 * The funds lifecycle is tracked separately from the deal status so the money
 * state can never be silently overwritten by a business-status change.
 *
 *   awaiting_deposit ─► held ─► released | refunded | forfeited
 *
 * `frozen` is a flag toggled while a dispute is open — no release/refund/
 * forfeit may occur while frozen.
 */
export const fundsStateEnum = pgEnum("funds_state", [
  "awaiting_deposit",
  "held",
  "released",
  "refunded",
  "forfeited",
]);

export const dealFundsTable = pgTable("deal_funds", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => dealsTable.id).unique(),
  state: fundsStateEnum("state").notNull().default("awaiting_deposit"),
  heldAmount: numeric("held_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  frozen: integer("frozen").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDealFundsSchema = createInsertSchema(dealFundsTable).omit({ id: true, updatedAt: true });
export type InsertDealFunds = z.infer<typeof insertDealFundsSchema>;
export type DealFunds = typeof dealFundsTable.$inferSelect;
