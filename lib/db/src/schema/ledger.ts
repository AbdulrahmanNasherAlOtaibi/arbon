import { pgTable, serial, text, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dealsTable } from "./deals";

/**
 * Chart of accounts for the escrow ledger. Every movement of money is recorded
 * as balanced double-entry lines against these accounts.
 *
 * - escrow_cash       : real cash physically held in the segregated trust account
 * - buyer_held        : liability toward the buyer while funds are held
 * - seller_payout     : amount owed to / paid out to the seller
 * - platform_revenue  : platform fee recognised as revenue
 * - buyer_refund      : amount refunded back to the buyer
 */
export const ledgerAccountEnum = pgEnum("ledger_account", [
  "escrow_cash",
  "buyer_held",
  "seller_payout",
  "platform_revenue",
  "buyer_refund",
]);

export const ledgerDirectionEnum = pgEnum("ledger_direction", ["debit", "credit"]);

/**
 * Append-only, immutable double-entry ledger. Rows are never updated or
 * deleted. Lines that belong to the same posting share a `txnGroup`, and the
 * sum of debits must equal the sum of credits within each group.
 */
export const ledgerEntriesTable = pgTable("ledger_entries", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => dealsTable.id),
  txnGroup: text("txn_group").notNull(),
  account: ledgerAccountEnum("account").notNull(),
  direction: ledgerDirectionEnum("direction").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  memo: text("memo").notNull().default(""),
  // Guards against double-posting the same economic event (idempotency).
  idempotencyKey: text("idempotency_key").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLedgerEntrySchema = createInsertSchema(ledgerEntriesTable).omit({ id: true, createdAt: true });
export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
export type LedgerEntry = typeof ledgerEntriesTable.$inferSelect;
