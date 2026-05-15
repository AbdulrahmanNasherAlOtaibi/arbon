import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { dealsTable } from "./deals";

export const timelineTable = pgTable("timeline", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => dealsTable.id),
  event: text("event").notNull(),
  description: text("description").notNull(),
  actorName: text("actor_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTimelineSchema = createInsertSchema(timelineTable).omit({ id: true, createdAt: true });
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type Timeline = typeof timelineTable.$inferSelect;
