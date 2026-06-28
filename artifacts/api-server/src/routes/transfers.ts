import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, dealsTable, usersTable, transferRequestsTable, timelineTable } from "@workspace/db";
import {
  ListMarketplaceDealsQueryParams,
  ListMarketplaceDealsResponse,
  GetMyListedDealsResponse,
  GetTransferRequestsResponse,
  ListForTransferParams,
  ListForTransferBody,
  ListForTransferResponse,
  UnlistForTransferParams,
  UnlistForTransferResponse,
  RequestTransferParams,
  RequestTransferBody,
  ApproveTransferParams,
  ApproveTransferBody,
  ApproveTransferResponse,
  GetDealResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const MOCK_USER_ID = 1;

async function getDealWithParties(id: number) {
  const [deal] = await db
    .select({ deal: dealsTable, buyer: usersTable })
    .from(dealsTable)
    .leftJoin(usersTable, eq(dealsTable.buyerId, usersTable.id))
    .where(eq(dealsTable.id, id));
  if (!deal) return null;
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, deal.deal.sellerId));
  return { ...deal.deal, buyerName: deal.buyer?.name ?? "", sellerName: seller?.name ?? "" };
}

async function addTimeline(dealId: number, event: string, description: string, actorName?: string) {
  await db.insert(timelineTable).values({ dealId, event, description, actorName: actorName ?? null });
}

// Browse deals available for transfer
router.get("/transfers/marketplace", async (req, res): Promise<void> => {
  const params = ListMarketplaceDealsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [eq(dealsTable.transferStatus, "listed")];
  if (params.data.type) {
    conditions.push(eq(dealsTable.type, params.data.type as "real_estate" | "vehicle" | "business" | "other"));
  }

  const deals = await db.select().from(dealsTable).where(and(...conditions));

  const allUsers = await db.select().from(usersTable);
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  const result = deals.map((d) => ({
    id: d.id,
    title: d.title,
    type: d.type,
    amount: Number(d.amount),
    transferPrice: Number(d.transferPrice ?? d.amount),
    description: d.description,
    propertyAddress: d.propertyAddress,
    vehicleInfo: d.vehicleInfo,
    buyerName: userMap[d.buyerId] ?? "",
    sellerName: userMap[d.sellerId] ?? "",
    deadline: d.deadline,
    createdAt: d.createdAt.toISOString(),
  }));

  res.json(ListMarketplaceDealsResponse.parse(result));
});

// My listed deals
router.get("/transfers/my-listings", async (req, res): Promise<void> => {
  const deals = await db
    .select()
    .from(dealsTable)
    .where(and(eq(dealsTable.buyerId, MOCK_USER_ID), eq(dealsTable.transferStatus, "listed")));

  const allUsers = await db.select().from(usersTable);
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  const result = deals.map((d) => ({
    id: d.id,
    title: d.title,
    type: d.type,
    amount: Number(d.amount),
    transferPrice: Number(d.transferPrice ?? d.amount),
    description: d.description,
    propertyAddress: d.propertyAddress,
    vehicleInfo: d.vehicleInfo,
    buyerName: userMap[d.buyerId] ?? "",
    sellerName: userMap[d.sellerId] ?? "",
    deadline: d.deadline,
    createdAt: d.createdAt.toISOString(),
  }));

  res.json(GetMyListedDealsResponse.parse(result));
});

// Transfer requests for my deals
router.get("/transfers/requests", async (req, res): Promise<void> => {
  // Requests on deals I own (buyerId = me)
  const myDeals = await db.select({ id: dealsTable.id }).from(dealsTable).where(eq(dealsTable.buyerId, MOCK_USER_ID));
  const myDealIds = myDeals.map((d) => d.id);

  if (myDealIds.length === 0) {
    res.json([]);
    return;
  }

  const requests = await db.select().from(transferRequestsTable).where(
    or(...myDealIds.map((id) => eq(transferRequestsTable.dealId, id)))
  );

  const allUsers = await db.select().from(usersTable);
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  const result = requests.map((r) => ({
    ...r,
    fromUserName: userMap[r.fromUserId] ?? "",
    toUserName: userMap[r.toUserId] ?? "",
    price: Number(r.price),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  res.json(GetTransferRequestsResponse.parse(result));
});

// List a deal for transfer
router.post("/deals/:id/list-for-transfer", async (req, res): Promise<void> => {
  const params = ListForTransferParams.safeParse(req.params);
  const body = ListForTransferBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)?.message });
    return;
  }

  const [deal] = await db.update(dealsTable).set({
    transferStatus: "listed",
    transferPrice: body.data.price ? String(body.data.price) : null,
    transferDescription: body.data.description ?? null,
    updatedAt: new Date(),
  }).where(
    and(
      eq(dealsTable.id, params.data.id),
      eq(dealsTable.buyerId, MOCK_USER_ID),
      or(eq(dealsTable.transferStatus, "not_listed"), eq(dealsTable.transferStatus, "listed"))
    )
  ).returning();

  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة أو لا يمكن عرضها للتنازل" });
    return;
  }

  await addTimeline(deal.id, "listed_for_transfer", "تم عرض الصفقة في سوق التنازلات للعامة");

  const fullDeal = await getDealWithParties(deal.id);
  res.json(ListForTransferResponse.parse({
    ...fullDeal,
    amount: Number(fullDeal!.amount),
    platformFee: Number(fullDeal!.platformFee),
    createdAt: fullDeal!.createdAt.toISOString(),
    updatedAt: fullDeal!.updatedAt.toISOString(),
  }));
});

// Unlist a deal
router.post("/deals/:id/unlist", async (req, res): Promise<void> => {
  const params = UnlistForTransferParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deal] = await db.update(dealsTable).set({
    transferStatus: "not_listed",
    transferPrice: null,
    transferDescription: null,
    updatedAt: new Date(),
  }).where(
    and(
      eq(dealsTable.id, params.data.id),
      eq(dealsTable.buyerId, MOCK_USER_ID),
      eq(dealsTable.transferStatus, "listed")
    )
  ).returning();

  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة أو لم يتم عرضها للتنازل" });
    return;
  }

  await addTimeline(deal.id, "unlisted", "تم إلغاء عرض الصفقة من سوق التنازلات");

  const fullDeal = await getDealWithParties(deal.id);
  res.json(UnlistForTransferResponse.parse({
    ...fullDeal,
    amount: Number(fullDeal!.amount),
    platformFee: Number(fullDeal!.platformFee),
    createdAt: fullDeal!.createdAt.toISOString(),
    updatedAt: fullDeal!.updatedAt.toISOString(),
  }));
});

// Request transfer
router.post("/deals/:id/request-transfer", async (req, res): Promise<void> => {
  const params = RequestTransferParams.safeParse(req.params);
  const body = RequestTransferBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)?.message });
    return;
  }

  const [deal] = await db.select().from(dealsTable).where(
    and(
      eq(dealsTable.id, params.data.id),
      eq(dealsTable.transferStatus, "listed")
    )
  );

  if (!deal) {
    res.status(404).json({ error: "الصفقة غير متاحة للتنازل" });
    return;
  }

  // Create a new user if they don't exist (mock)
  let fromUserId = MOCK_USER_ID;

  const [request] = await db.insert(transferRequestsTable).values({
    dealId: deal.id,
    fromUserId,
    toUserId: deal.buyerId,
    price: String(body.data.price),
    message: body.data.message ?? null,
    status: "pending",
  }).returning();

  await addTimeline(deal.id, "transfer_requested", "تم تقديم طلب تنازل على الصفقة", "مشتري محتمل");

  const allUsers = await db.select().from(usersTable);
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  res.status(201).json(ApproveTransferResponse.parse({
    ...request,
    fromUserName: userMap[request.fromUserId] ?? "",
    toUserName: userMap[request.toUserId] ?? "",
    price: Number(request.price),
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  }));
});

// Approve/reject transfer
router.post("/transfers/:id/approve", async (req, res): Promise<void> => {
  const params = ApproveTransferParams.safeParse(req.params);
  const body = ApproveTransferBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)?.message });
    return;
  }

  // Get the transfer request
  const [request] = await db.select().from(transferRequestsTable).where(
    eq(transferRequestsTable.id, params.data.id)
  );

  if (!request) {
    res.status(404).json({ error: "طلب التنازل غير موجود" });
    return;
  }

  // Verify the current user owns the deal
  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, request.dealId));
  if (!deal || deal.buyerId !== MOCK_USER_ID) {
    res.status(403).json({ error: "غير مصرح" });
    return;
  }

  const status = body.data.approved ? "approved" : "rejected";

  const [updated] = await db.update(transferRequestsTable).set({
    status,
    updatedAt: new Date(),
  }).where(eq(transferRequestsTable.id, params.data.id)).returning();

  if (status === "approved") {
    // Transfer the deal to the new buyer
    await db.update(dealsTable).set({
      buyerId: request.fromUserId,
      transferStatus: "transferred",
      transferPrice: null,
      transferDescription: null,
      updatedAt: new Date(),
    }).where(eq(dealsTable.id, request.dealId));

    await addTimeline(
      request.dealId,
      "transferred",
      "تم الموافقة على طلب التنازل ونقل الصفقة للمشتري الجديد"
    );
  } else {
    await addTimeline(request.dealId, "transfer_rejected", "تم رفض طلب التنازل");
  }

  const allUsers = await db.select().from(usersTable);
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  res.json(ApproveTransferResponse.parse({
    ...updated,
    fromUserName: userMap[updated.fromUserId] ?? "",
    toUserName: userMap[updated.toUserId] ?? "",
    price: Number(updated.price),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }));
});

export default router;
