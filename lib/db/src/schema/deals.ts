import { pgTable, serial, text, boolean, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const dealTypeEnum = pgEnum("deal_type", ["real_estate", "vehicle", "business", "other"]);
export const dealStatusEnum = pgEnum("deal_status", ["pending", "active", "completed", "cancelled", "disputed", "refunded", "forfeited"]);
export const transferStatusEnum = pgEnum("transfer_status", ["not_listed", "listed", "transferred"]);

export const dealsTable = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: dealTypeEnum("type").notNull(),
  status: dealStatusEnum("status").notNull().default("pending"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("SAR"),
  buyerId: integer("buyer_id").notNull().references(() => usersTable.id),
  sellerId: integer("seller_id").notNull().references(() => usersTable.id),
  description: text("description").notNull(),
  propertyAddress: text("property_address"),
  vehicleInfo: text("vehicle_info"),
  deadline: text("deadline").notNull(),
  platformFee: numeric("platform_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  buyerSigned: boolean("buyer_signed").notNull().default(false),
  sellerSigned: boolean("seller_signed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // Transfer fields
  transferStatus: transferStatusEnum("transfer_status").notNull().default("not_listed"),
  transferPrice: numeric("transfer_price", { precision: 12, scale: 2 }),
  transferDescription: text("transfer_description"),
  transferredToId: integer("transferred_to_id").references(() => usersTable.id),
  transferredAt: timestamp("transferred_at"),
});

export const insertDealSchema = createInsertSchema(dealsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof dealsTable.$inferSelect;
