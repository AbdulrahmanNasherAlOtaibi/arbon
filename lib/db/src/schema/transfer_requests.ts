import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dealsTable } from "./deals";
import { usersTable } from "./users";

export const transferRequestStatusEnum = pgEnum("transfer_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const transferRequestsTable = pgTable("transfer_requests", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => dealsTable.id),
  fromUserId: integer("from_user_id").notNull().references(() => usersTable.id),
  toUserId: integer("to_user_id").notNull().references(() => usersTable.id),
  price: text("price").notNull(),
  message: text("message"),
  status: transferRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTransferRequestSchema = createInsertSchema(transferRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTransferRequest = z.infer<typeof insertTransferRequestSchema>;
export type TransferRequest = typeof transferRequestsTable.$inferSelect;
