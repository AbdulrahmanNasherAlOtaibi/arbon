import { Router, type IRouter } from "express";
import { eq, and, or, sql } from "drizzle-orm";
import { db, dealsTable, usersTable, contractsTable, timelineTable, transferRequestsTable } from "@workspace/db";
import { assertTransition, TransitionError, type DealStatus } from "../domain/stateMachine";
import {
  ListDealsQueryParams,
  ListDealsResponse,
  CreateDealBody,
  GetDealParams,
  GetDealResponse,
  UpdateDealParams,
  UpdateDealBody,
  UpdateDealResponse,
  DeleteDealParams,
  CompleteDealParams,
  CompleteDealResponse,
  CancelDealParams,
  CancelDealBody,
  CancelDealResponse,
  ForfeitDealParams,
  ForfeitDealBody,
  ForfeitDealResponse,
  GetDealTimelineParams,
  GetDealTimelineResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const MOCK_USER_ID = 1;
const PLATFORM_FEE_RATE = 0.02;

async function getDealWithParties(id: number) {
  const [deal] = await db
    .select({
      deal: dealsTable,
      buyer: usersTable,
    })
    .from(dealsTable)
    .leftJoin(usersTable, eq(dealsTable.buyerId, usersTable.id))
    .where(eq(dealsTable.id, id));
  if (!deal) return null;
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, deal.deal.sellerId));
  return { ...deal.deal, buyerName: deal.buyer?.name ?? "", sellerName: seller?.name ?? "" };
}

function formatDeal(deal: ReturnType<typeof getDealWithParties> extends Promise<infer T> ? T : never) {
  if (!deal) return null;
  return {
    ...deal,
    amount: Number(deal.amount),
    platformFee: Number(deal.platformFee),
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
    deadline: deal.deadline,
  };
}

async function addTimeline(dealId: number, event: string, description: string, actorName?: string) {
  await db.insert(timelineTable).values({ dealId, event, description, actorName: actorName ?? null });
}

/**
 * Load a deal's current status and assert the requested transition is allowed
 * by the state machine. Returns the current status, or null if the deal is
 * missing (so the caller can 404).
 */
async function guardTransition(dealId: number, to: DealStatus): Promise<DealStatus | null> {
  const [current] = await db.select({ status: dealsTable.status }).from(dealsTable).where(eq(dealsTable.id, dealId));
  if (!current) return null;
  assertTransition(current.status as DealStatus, to);
  return current.status as DealStatus;
}

router.get("/deals", async (req, res): Promise<void> => {
  const params = ListDealsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [
    or(
      eq(dealsTable.buyerId, MOCK_USER_ID),
      eq(dealsTable.sellerId, MOCK_USER_ID)
    ),
  ];

  if (params.data.role === "buyer") {
    conditions.length = 0;
    conditions.push(eq(dealsTable.buyerId, MOCK_USER_ID));
  } else if (params.data.role === "seller") {
    conditions.length = 0;
    conditions.push(eq(dealsTable.sellerId, MOCK_USER_ID));
  }

  if (params.data.status) {
    conditions.push(eq(dealsTable.status, params.data.status as "pending" | "active" | "completed" | "cancelled" | "disputed" | "refunded" | "forfeited"));
  }
  if (params.data.type) {
    conditions.push(eq(dealsTable.type, params.data.type as "real_estate" | "vehicle" | "business" | "other"));
  }

  const deals = await db.select().from(dealsTable).where(and(...conditions));

  const dealIds = deals.map((d) => d.id);
  const allUsers = await db.select().from(usersTable);
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  const result = deals.map((d) => ({
    ...d,
    amount: Number(d.amount),
    platformFee: Number(d.platformFee),
    buyerName: userMap[d.buyerId] ?? "",
    sellerName: userMap[d.sellerId] ?? "",
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  res.json(ListDealsResponse.parse(result));
});

router.post("/deals", async (req, res): Promise<void> => {
  const parsed = CreateDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let seller = await db.select().from(usersTable).where(eq(usersTable.phone, parsed.data.sellerPhone));
  let sellerId: number;
  if (seller.length === 0) {
    const [newSeller] = await db.insert(usersTable).values({
      name: `بائع (${parsed.data.sellerPhone})`,
      phone: parsed.data.sellerPhone,
      nationalId: `TEMP_${Date.now()}`,
      verified: false,
    }).returning();
    sellerId = newSeller.id;
  } else {
    sellerId = seller[0].id;
  }

  const amount = Number(parsed.data.amount);
  const platformFee = (amount * PLATFORM_FEE_RATE).toFixed(2);

  const [deal] = await db.insert(dealsTable).values({
    title: parsed.data.title,
    type: parsed.data.type as "real_estate" | "vehicle" | "business" | "other",
    status: "pending",
    amount: amount.toFixed(2),
    currency: "SAR",
    buyerId: MOCK_USER_ID,
    sellerId,
    description: parsed.data.description,
    propertyAddress: parsed.data.propertyAddress ?? null,
    vehicleInfo: parsed.data.vehicleInfo ?? null,
    deadline: parsed.data.deadline,
    platformFee,
  }).returning();

  const template = parsed.data.templateId ? null : null;
  const terms = `شروط العقد: ${parsed.data.description}\n\nمبلغ العربون: ${amount.toLocaleString("ar-SA")} ر.س`;
  await db.insert(contractsTable).values({
    dealId: deal.id,
    terms,
    refundConditions: "يحق للمشتري الانسحاب من الصفقة واسترداد كامل مبلغ العربون في أي وقت قبل إتمام الصفقة، وكذلك عند تراجع البائع أو ظهور عيب جوهري.",
    forfeitureConditions: "لا يُصادر مبلغ العربون على المشتري عند انسحابه؛ يبقى المبلغ قابلاً للاسترداد بالكامل في جميع الأحوال.",
  });

  await addTimeline(deal.id, "created", "تم إنشاء الصفقة وإيداع مبلغ العربون في حساب الضمان", "المشتري");

  const buyer = await db.select().from(usersTable).where(eq(usersTable.id, MOCK_USER_ID));
  const sellerRow = await db.select().from(usersTable).where(eq(usersTable.id, sellerId));

  const result = {
    ...deal,
    amount: Number(deal.amount),
    platformFee: Number(deal.platformFee),
    buyerName: buyer[0]?.name ?? "",
    sellerName: sellerRow[0]?.name ?? "",
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  };

  res.status(201).json(GetDealResponse.parse(result));
});

router.get("/deals/:id", async (req, res): Promise<void> => {
  const params = GetDealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const deal = await getDealWithParties(params.data.id);
  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة" });
    return;
  }

  res.json(GetDealResponse.parse({
    ...deal,
    amount: Number(deal.amount),
    platformFee: Number(deal.platformFee),
    transferPrice: deal.transferPrice ? Number(deal.transferPrice) : null,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  }));
});

router.patch("/deals/:id", async (req, res): Promise<void> => {
  const params = UpdateDealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [deal] = await db.update(dealsTable).set({
    ...parsed.data,
    amount: parsed.data.amount ? String(parsed.data.amount) : undefined,
    updatedAt: new Date(),
  }).where(eq(dealsTable.id, params.data.id)).returning();

  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة" });
    return;
  }

  const fullDeal = await getDealWithParties(deal.id);
  res.json(UpdateDealResponse.parse({
    ...fullDeal,
    amount: Number(fullDeal!.amount),
    platformFee: Number(fullDeal!.platformFee),
    createdAt: fullDeal!.createdAt.toISOString(),
    updatedAt: fullDeal!.updatedAt.toISOString(),
  }));
});

router.delete("/deals/:id", async (req, res): Promise<void> => {
  const params = DeleteDealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deal] = await db.delete(dealsTable).where(
    and(eq(dealsTable.id, params.data.id), eq(dealsTable.status, "pending"))
  ).returning();

  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة أو لا يمكن حذفها" });
    return;
  }

  res.sendStatus(204);
});

router.post("/deals/:id/complete", async (req, res): Promise<void> => {
  const params = CompleteDealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const current = await guardTransition(params.data.id, "completed");
    if (current === null) {
      res.status(404).json({ error: "الصفقة غير موجودة" });
      return;
    }
  } catch (err) {
    if (err instanceof TransitionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    throw err;
  }

  const [deal] = await db.update(dealsTable).set({
    status: "completed",
    updatedAt: new Date(),
  }).where(eq(dealsTable.id, params.data.id)).returning();

  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة" });
    return;
  }

  await addTimeline(deal.id, "completed", "تم إتمام الصفقة وتحويل مبلغ العربون للبائع تلقائياً");

  const fullDeal = await getDealWithParties(deal.id);
  res.json(CompleteDealResponse.parse({
    ...fullDeal,
    amount: Number(fullDeal!.amount),
    platformFee: Number(fullDeal!.platformFee),
    createdAt: fullDeal!.createdAt.toISOString(),
    updatedAt: fullDeal!.updatedAt.toISOString(),
  }));
});

router.post("/deals/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelDealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CancelDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const current = await guardTransition(params.data.id, "cancelled");
    if (current === null) {
      res.status(404).json({ error: "الصفقة غير موجودة" });
      return;
    }
  } catch (err) {
    if (err instanceof TransitionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    throw err;
  }

  const [deal] = await db.update(dealsTable).set({
    status: "cancelled",
    updatedAt: new Date(),
  }).where(eq(dealsTable.id, params.data.id)).returning();

  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة" });
    return;
  }

  await addTimeline(deal.id, "cancelled", `تم إلغاء الصفقة. السبب: ${parsed.data.reason}`);

  const fullDeal = await getDealWithParties(deal.id);
  res.json(CancelDealResponse.parse({
    ...fullDeal,
    amount: Number(fullDeal!.amount),
    platformFee: Number(fullDeal!.platformFee),
    createdAt: fullDeal!.createdAt.toISOString(),
    updatedAt: fullDeal!.updatedAt.toISOString(),
  }));
});

router.post("/deals/:id/forfeit", async (req, res): Promise<void> => {
  const params = ForfeitDealParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ForfeitDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const current = await guardTransition(params.data.id, "forfeited");
    if (current === null) {
      res.status(404).json({ error: "الصفقة غير موجودة" });
      return;
    }
  } catch (err) {
    if (err instanceof TransitionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    throw err;
  }

  const [deal] = await db.update(dealsTable).set({
    status: "forfeited",
    updatedAt: new Date(),
  }).where(eq(dealsTable.id, params.data.id)).returning();

  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة" });
    return;
  }

  await addTimeline(deal.id, "forfeited", `تم مصادرة مبلغ العربون لصالح البائع. السبب: ${parsed.data.reason}`);

  const fullDeal = await getDealWithParties(deal.id);
  res.json(ForfeitDealResponse.parse({
    ...fullDeal,
    amount: Number(fullDeal!.amount),
    platformFee: Number(fullDeal!.platformFee),
    createdAt: fullDeal!.createdAt.toISOString(),
    updatedAt: fullDeal!.updatedAt.toISOString(),
  }));
});

router.get("/deals/:id/timeline", async (req, res): Promise<void> => {
  const params = GetDealTimelineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const events = await db
    .select()
    .from(timelineTable)
    .where(eq(timelineTable.dealId, params.data.id))
    .orderBy(timelineTable.createdAt);

  const result = events.map((e) => ({
    ...e,
    actorName: e.actorName ?? null,
    createdAt: e.createdAt.toISOString(),
  }));

  res.json(GetDealTimelineResponse.parse(result));
});

export default router;
