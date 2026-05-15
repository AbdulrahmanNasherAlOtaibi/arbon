import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dealsTable } from "./deals";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => dealsTable.id),
  terms: text("terms").notNull(),
  refundConditions: text("refund_conditions").notNull().default(""),
  forfeitureConditions: text("forfeiture_conditions").notNull().default(""),
  buyerSigned: boolean("buyer_signed").notNull().default(false),
  sellerSigned: boolean("seller_signed").notNull().default(false),
  buyerSignedAt: timestamp("buyer_signed_at"),
  sellerSignedAt: timestamp("seller_signed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, createdAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
