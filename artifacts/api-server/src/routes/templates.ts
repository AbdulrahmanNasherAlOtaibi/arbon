import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, templatesTable } from "@workspace/db";
import { ListTemplatesQueryParams, ListTemplatesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/templates", async (req, res): Promise<void> => {
  const params = ListTemplatesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(templatesTable);
  const rows = params.data.type
    ? await db.select().from(templatesTable).where(eq(templatesTable.type, params.data.type as "real_estate" | "vehicle" | "business" | "other"))
    : await query;

  res.json(ListTemplatesResponse.parse(rows));
});

export default router;
