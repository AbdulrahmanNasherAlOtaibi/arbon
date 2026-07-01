import { eq, and } from "drizzle-orm";
import {
  db,
  dealsTable,
  dealFundsTable,
  approvalsTable,
  disputesTable,
  timelineTable,
} from "@workspace/db";
import * as ledger from "./ledger";
import { assertTransition, type DealStatus } from "./stateMachine";
import { assertVerified } from "./kyc";
import { DomainError } from "./errors";

type Action = "release" | "refund" | "forfeit";

async function addTimeline(
  tx: ledger.DbOrTx,
  dealId: number,
  event: string,
  description: string,
  actorName?: string,
): Promise<void> {
  await tx
    .insert(timelineTable)
    .values({ dealId, event, description, actorName: actorName ?? null });
}

/** Lazily create the funds-tracking row for a deal. */
export async function ensureFunds(dealId: number): Promise<void> {
  const [existing] = await db
    .select()
    .from(dealFundsTable)
    .where(eq(dealFundsTable.dealId, dealId));
  if (!existing) {
    await db.insert(dealFundsTable).values({ dealId, state: "awaiting_deposit" });
  }
}

export async function getFunds(dealId: number) {
  const [funds] = await db
    .select()
    .from(dealFundsTable)
    .where(eq(dealFundsTable.dealId, dealId));
  return funds ?? null;
}

async function loadDeal(dealId: number) {
  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, dealId));
  if (!deal) throw new DomainError("الصفقة غير موجودة", 404);
  return deal;
}

/**
 * Buyer deposits the earnest money into the segregated escrow account.
 * Gate: both parties must have signed the contract, the buyer must be KYC
 * verified, and no funds may already be held. Moves pending → active.
 */
export async function deposit(dealId: number, actorId: number): Promise<void> {
  await ensureFunds(dealId);
  const deal = await loadDeal(dealId);
  const funds = await getFunds(dealId);

  if (!deal.buyerSigned || !deal.sellerSigned) {
    throw new DomainError("لا يمكن الإيداع قبل توقيع الطرفين على العقد", 409);
  }
  if (funds?.state !== "awaiting_deposit") {
    throw new DomainError("تم إيداع العربون مسبقاً لهذه الصفقة", 409);
  }
  await assertVerified(actorId);
  assertTransition(deal.status as DealStatus, "active");

  const amount = Number(deal.amount);

  await db.transaction(async (tx) => {
    await ledger.post(tx, {
      dealId,
      idempotencyKey: `deposit:${dealId}`,
      memo: "إيداع العربون في حساب الضمان",
      lines: [
        { account: "escrow_cash", direction: "debit", amount },
        { account: "buyer_held", direction: "credit", amount },
      ],
    });
    await tx
      .update(dealFundsTable)
      .set({ state: "held", heldAmount: amount.toFixed(2), updatedAt: new Date() })
      .where(eq(dealFundsTable.dealId, dealId));
    await tx
      .update(dealsTable)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(dealsTable.id, dealId));
    await addTimeline(tx, dealId, "deposit_held", "تم إيداع مبلغ العربون واحتجازه في حساب الضمان", "النظام");
  });
}

/** Freeze / unfreeze funds — toggled while a dispute is open. */
export async function setFrozen(dealId: number, frozen: boolean): Promise<void> {
  await ensureFunds(dealId);
  await db
    .update(dealFundsTable)
    .set({ frozen: frozen ? 1 : 0, updatedAt: new Date() })
    .where(eq(dealFundsTable.dealId, dealId));
}

async function hasOpenDispute(dealId: number): Promise<boolean> {
  const rows = await db
    .select()
    .from(disputesTable)
    .where(
      and(eq(disputesTable.dealId, dealId), eq(disputesTable.status, "open")),
    );
  const underReview = await db
    .select()
    .from(disputesTable)
    .where(
      and(eq(disputesTable.dealId, dealId), eq(disputesTable.status, "under_review")),
    );
  return rows.length > 0 || underReview.length > 0;
}

/**
 * Maker step: request a money-moving action. Creates a pending approval that a
 * different checker must approve. Does not move any money yet.
 */
export async function requestAction(params: {
  dealId: number;
  action: Action;
  makerId: number;
  reason?: string;
}): Promise<{ approvalId: number }> {
  const { dealId, action, makerId } = params;
  await ensureFunds(dealId);
  const funds = await getFunds(dealId);

  if (funds?.state !== "held") {
    throw new DomainError("لا توجد أموال محتجزة قابلة للتحريك في هذه الصفقة", 409);
  }
  if (funds.frozen === 1) {
    throw new DomainError("الأموال مجمّدة بسبب نزاع مفتوح", 409);
  }
  if (action === "release" && (await hasOpenDispute(dealId))) {
    throw new DomainError("لا يمكن تحرير الأموال مع وجود نزاع مفتوح", 409);
  }
  await assertVerified(makerId);

  const [existingPending] = await db
    .select()
    .from(approvalsTable)
    .where(
      and(eq(approvalsTable.dealId, dealId), eq(approvalsTable.status, "pending")),
    );
  if (existingPending) {
    throw new DomainError("يوجد طلب موافقة معلّق بالفعل لهذه الصفقة", 409);
  }

  const [approval] = await db
    .insert(approvalsTable)
    .values({
      dealId,
      action,
      amount: funds.heldAmount,
      reason: params.reason ?? "",
      status: "pending",
      makerId,
    })
    .returning();

  await addTimeline(
    db,
    dealId,
    "approval_requested",
    `تم طلب موافقة على عملية «${action}» بانتظار اعتماد طرف ثانٍ`,
    "النظام",
  );

  return { approvalId: approval.id };
}

/**
 * Checker step: approve and execute a pending action. The checker MUST be a
 * different user than the maker (dual control). Executes the ledger posting,
 * updates the funds state and the deal status atomically.
 */
export async function approveAction(params: {
  approvalId: number;
  checkerId: number;
}): Promise<void> {
  const { approvalId, checkerId } = params;

  const [approval] = await db
    .select()
    .from(approvalsTable)
    .where(eq(approvalsTable.id, approvalId));
  if (!approval) throw new DomainError("طلب الموافقة غير موجود", 404);
  if (approval.status !== "pending") {
    throw new DomainError("طلب الموافقة تمّت معالجته مسبقاً", 409);
  }
  if (approval.makerId === checkerId) {
    throw new DomainError(
      "مبدأ الرقابة المزدوجة: لا يمكن أن يعتمد الطلبَ نفسُ من أنشأه",
      403,
    );
  }
  await assertVerified(checkerId);

  const deal = await loadDeal(approval.dealId);
  const funds = await getFunds(approval.dealId);
  if (funds?.state !== "held") {
    throw new DomainError("حالة الأموال غير صالحة للتنفيذ", 409);
  }
  if (funds.frozen === 1) {
    throw new DomainError("الأموال مجمّدة بسبب نزاع مفتوح", 409);
  }

  const amount = Number(funds.heldAmount);
  const fee = Number(deal.platformFee);
  const sellerPayout = Math.max(0, amount - fee);
  const dealId = approval.dealId;

  await db.transaction(async (tx) => {
    if (approval.action === "release" || approval.action === "forfeit") {
      assertTransition(
        deal.status as DealStatus,
        approval.action === "release" ? "completed" : "forfeited",
      );
      await ledger.post(tx, {
        dealId,
        idempotencyKey: `${approval.action}:${dealId}:${approvalId}`,
        memo: approval.action === "release"
          ? "تحرير العربون للبائع بعد إتمام الصفقة"
          : "مصادرة العربون لصالح البائع",
        lines: [
          { account: "buyer_held", direction: "debit", amount },
          ...(sellerPayout > 0
            ? [{ account: "seller_payout" as const, direction: "credit" as const, amount: sellerPayout }]
            : []),
          ...(fee > 0
            ? [{ account: "platform_revenue" as const, direction: "credit" as const, amount: fee }]
            : []),
        ],
      });
      await tx
        .update(dealFundsTable)
        .set({ state: approval.action === "release" ? "released" : "forfeited", updatedAt: new Date() })
        .where(eq(dealFundsTable.dealId, dealId));
      await tx
        .update(dealsTable)
        .set({ status: approval.action === "release" ? "completed" : "forfeited", updatedAt: new Date() })
        .where(eq(dealsTable.id, dealId));
      await addTimeline(
        tx,
        dealId,
        approval.action === "release" ? "funds_released" : "funds_forfeited",
        approval.action === "release"
          ? `تم تحرير ${sellerPayout.toLocaleString("ar-SA")} ر.س للبائع ورسوم المنصة ${fee.toLocaleString("ar-SA")} ر.س`
          : `تمت مصادرة العربون لصالح البائع (${sellerPayout.toLocaleString("ar-SA")} ر.س)`,
        "النظام",
      );
    } else {
      // refund — full amount back to the buyer
      assertTransition(deal.status as DealStatus, "refunded");
      await ledger.post(tx, {
        dealId,
        idempotencyKey: `refund:${dealId}:${approvalId}`,
        memo: "استرداد كامل العربون للمشتري",
        lines: [
          { account: "buyer_held", direction: "debit", amount },
          { account: "buyer_refund", direction: "credit", amount },
        ],
      });
      await tx
        .update(dealFundsTable)
        .set({ state: "refunded", updatedAt: new Date() })
        .where(eq(dealFundsTable.dealId, dealId));
      await tx
        .update(dealsTable)
        .set({ status: "refunded", updatedAt: new Date() })
        .where(eq(dealsTable.id, dealId));
      await addTimeline(
        tx,
        dealId,
        "funds_refunded",
        `تم استرداد كامل مبلغ العربون (${amount.toLocaleString("ar-SA")} ر.س) للمشتري`,
        "النظام",
      );
    }

    await tx
      .update(approvalsTable)
      .set({ status: "executed", checkerId, decidedAt: new Date() })
      .where(eq(approvalsTable.id, approvalId));
  });
}

export async function rejectAction(params: {
  approvalId: number;
  checkerId: number;
}): Promise<void> {
  const [approval] = await db
    .select()
    .from(approvalsTable)
    .where(eq(approvalsTable.id, params.approvalId));
  if (!approval) throw new DomainError("طلب الموافقة غير موجود", 404);
  if (approval.status !== "pending") {
    throw new DomainError("طلب الموافقة تمّت معالجته مسبقاً", 409);
  }
  if (approval.makerId === params.checkerId) {
    throw new DomainError("لا يمكن أن يرفض الطلبَ نفسُ من أنشأه", 403);
  }
  await db
    .update(approvalsTable)
    .set({ status: "rejected", checkerId: params.checkerId, decidedAt: new Date() })
    .where(eq(approvalsTable.id, params.approvalId));
  await addTimeline(db, approval.dealId, "approval_rejected", "تم رفض طلب تحريك الأموال", "النظام");
}
