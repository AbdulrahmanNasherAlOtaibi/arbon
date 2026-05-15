import { Router, type IRouter } from "express";
import { eq, or, sql } from "drizzle-orm";
import { db, dealsTable, timelineTable, usersTable } from "@workspace/db";
import { GetDashboardSummaryResponse, GetRecentActivityResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const MOCK_USER_ID = 1;

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const allDeals = await db
    .select()
    .from(dealsTable)
    .where(or(eq(dealsTable.buyerId, MOCK_USER_ID), eq(dealsTable.sellerId, MOCK_USER_ID)));

  const totalDeals = allDeals.length;
  const activeDeals = allDeals.filter((d) => d.status === "active").length;
  const completedDeals = allDeals.filter((d) => d.status === "completed").length;
  const disputedDeals = allDeals.filter((d) => d.status === "disputed").length;
  const cancelledDeals = allDeals.filter((d) => d.status === "cancelled").length;
  const dealsAsbuyer = allDeals.filter((d) => d.buyerId === MOCK_USER_ID).length;
  const dealsAsSeller = allDeals.filter((d) => d.sellerId === MOCK_USER_ID).length;
  const pendingSignature = allDeals.filter((d) => d.status === "pending").length;

  const totalAmountEscrowed = allDeals
    .filter((d) => d.status === "active" || d.status === "pending")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const totalAmountCompleted = allDeals
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const summary = {
    totalDeals,
    activeDeals,
    completedDeals,
    disputedDeals,
    cancelledDeals,
    totalAmountEscrowed,
    totalAmountCompleted,
    pendingSignature,
    dealsAsbuyer,
    dealsAsSeller,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const userDeals = await db
    .select()
    .from(dealsTable)
    .where(or(eq(dealsTable.buyerId, MOCK_USER_ID), eq(dealsTable.sellerId, MOCK_USER_ID)));

  const dealIds = userDeals.map((d) => d.id);
  const dealMap = Object.fromEntries(userDeals.map((d) => [d.id, d]));

  if (dealIds.length === 0) {
    res.json([]);
    return;
  }

  const events = await db
    .select()
    .from(timelineTable)
    .orderBy(sql`${timelineTable.createdAt} DESC`)
    .limit(20);

  const filtered = events.filter((e) => dealIds.includes(e.dealId));

  const result = filtered.map((e) => ({
    id: e.id,
    dealId: e.dealId,
    dealTitle: dealMap[e.dealId]?.title ?? "",
    event: e.event,
    description: e.description,
    amount: dealMap[e.dealId] ? Number(dealMap[e.dealId].amount) : null,
    createdAt: e.createdAt.toISOString(),
  }));

  res.json(GetRecentActivityResponse.parse(result));
});

export default router;
