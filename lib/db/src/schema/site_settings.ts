import { pgTable, serial, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Single-row table (id = 1) holding editable, site-wide details that an admin
 * can control from the dashboard — brand name, tagline, platform fee, and
 * support contacts. The frontend reads the public subset to render the brand.
 */
export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("عربون"),
  tagline: text("tagline").notNull().default("ثقتك محفوظة"),
  platformFeePercent: numeric("platform_fee_percent", { precision: 5, scale: 2 }).notNull().default("2"),
  supportEmail: text("support_email").notNull().default("support@arbon.sa"),
  supportPhone: text("support_phone").notNull().default("920000000"),
  aboutText: text("about_text").notNull().default("منصّة ضمان رقمية تحفظ مبلغ العربون بين البائع والمشتري حتى إتمام الصفقة."),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
