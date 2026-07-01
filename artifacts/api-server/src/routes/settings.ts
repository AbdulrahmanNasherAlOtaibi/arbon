import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";

const router: IRouter = Router();

const DEFAULTS = {
  siteName: "عربون",
  tagline: "ثقتك محفوظة",
  aboutText: "منصّة ضمان رقمية تحفظ مبلغ العربون بين البائع والمشتري حتى إتمام الصفقة.",
  supportEmail: "support@arbon.sa",
  supportPhone: "920000000",
  platformFeePercent: 2,
  bankName: "",
  bankIban: "",
  bankAccountHolder: "",
};

/** Public, read-only site branding/details used by the frontend. */
router.get("/settings", async (_req, res): Promise<void> => {
  try {
    const [s] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 1));
    if (!s) {
      res.json(DEFAULTS);
      return;
    }
    res.json({
      siteName: s.siteName,
      tagline: s.tagline,
      aboutText: s.aboutText,
      supportEmail: s.supportEmail,
      supportPhone: s.supportPhone,
      platformFeePercent: Number(s.platformFeePercent),
      bankName: s.bankName,
      bankIban: s.bankIban,
      bankAccountHolder: s.bankAccountHolder,
    });
  } catch {
    res.json(DEFAULTS);
  }
});

export default router;
