import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dealTypeEnum } from "./deals";

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: dealTypeEnum("type").notNull(),
  description: text("description").notNull(),
  terms: text("terms").notNull(),
  refundConditions: text("refund_conditions").notNull(),
  forfeitureConditions: text("forfeiture_conditions").notNull(),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({ id: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;
