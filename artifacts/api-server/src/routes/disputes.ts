import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, disputesTable, dealsTable, timelineTable } from "@workspace/db";
import * as escrow from "../domain/escrow";
import {
  GetDealDisputeParams,
  GetDealDisputeResponse,
  CreateDisputeParams,
  CreateDisputeBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
const MOCK_USER_ID = 1;

function formatDispute(dispute: typeof disputesTable.$inferSelect) {
  return {
    ...dispute,
    evidence: dispute.evidence ?? null,
    resolution: dispute.resolution ?? null,
    resolvedAt: dispute.resolvedAt ? dispute.resolvedAt.toISOString() : null,
    createdAt: dispute.createdAt.toISOString(),
  };
}

router.get("/deals/:id/dispute", async (req, res): Promise<void> => {
  const params = GetDealDisputeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [dispute] = await db
    .select()
    .from(disputesTable)
    .where(eq(disputesTable.dealId, params.data.id));

  if (!dispute) {
    res.status(404).json({ error: "لا يوجد نزاع لهذه الصفقة" });
    return;
  }

  res.json(GetDealDisputeResponse.parse(formatDispute(dispute)));
});

router.post("/deals/:id/dispute", async (req, res): Promise<void> => {
  const params = CreateDisputeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateDisputeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.update(dealsTable).set({ status: "disputed", updatedAt: new Date() }).where(eq(dealsTable.id, params.data.id));

  const [dispute] = await db.insert(disputesTable).values({
    dealId: params.data.id,
    reason: parsed.data.reason,
    evidence: parsed.data.evidence ?? null,
    status: "open",
    openedBy: MOCK_USER_ID,
  }).returning();

  // Freeze the escrowed funds for the duration of the dispute — no release,
  // refund or forfeit may occur while a dispute is open.
  await escrow.setFrozen(params.data.id, true);

  await db.insert(timelineTable).values({
    dealId: params.data.id,
    event: "dispute_opened",
    description: `تم فتح نزاع وتجميد الأموال المحتجزة. السبب: ${parsed.data.reason}`,
    actorName: null,
  });

  res.status(201).json(formatDispute(dispute));
});

export default router;
