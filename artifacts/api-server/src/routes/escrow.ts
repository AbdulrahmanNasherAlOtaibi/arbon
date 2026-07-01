import { Router, type IRouter, type Response } from "express";
import { z } from "zod/v4";
import * as escrow from "../domain/escrow";
import * as ledger from "../domain/ledger";
import { DomainError } from "../domain/errors";
import { TransitionError } from "../domain/stateMachine";

const router: IRouter = Router();

// In the absence of real session auth every actor id is supplied explicitly so
// the maker-checker separation can be exercised. Defaults keep demos simple.
const PLATFORM_MAKER_ID = 1;
const PLATFORM_CHECKER_ID = 2;

function handleError(res: Response, err: unknown): void {
  if (err instanceof DomainError || err instanceof TransitionError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : "خطأ غير متوقع";
  res.status(500).json({ error: message });
}

const idParam = z.object({ id: z.coerce.number().int().positive() });

// ── Deposit earnest money into escrow (buyer) ────────────────────────────────
router.post("/deals/:id/deposit", async (req, res): Promise<void> => {
  const params = idParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = z.object({ actorId: z.number().int().positive().default(PLATFORM_MAKER_ID) }).safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  try {
    await escrow.deposit(params.data.id, body.data.actorId);
    const funds = await escrow.getFunds(params.data.id);
    res.status(200).json({ ok: true, funds });
  } catch (err) {
    handleError(res, err);
  }
});

// ── Read the funds state of a deal ───────────────────────────────────────────
router.get("/deals/:id/funds", async (req, res): Promise<void> => {
  const params = idParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await escrow.ensureFunds(params.data.id);
  const funds = await escrow.getFunds(params.data.id);
  const heldBalance = await ledger.accountBalance(params.data.id, "buyer_held");
  res.json({ funds, heldBalance });
});

// ── Maker: request a money-moving action ─────────────────────────────────────
router.post("/deals/:id/actions/request", async (req, res): Promise<void> => {
  const params = idParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = z
    .object({
      action: z.enum(["release", "refund", "forfeit"]),
      makerId: z.number().int().positive().default(PLATFORM_MAKER_ID),
      reason: z.string().optional(),
    })
    .safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  try {
    const result = await escrow.requestAction({
      dealId: params.data.id,
      action: body.data.action,
      makerId: body.data.makerId,
      reason: body.data.reason,
    });
    res.status(201).json({ ok: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});

// ── Checker: approve (and execute) a pending action ──────────────────────────
router.post("/approvals/:id/approve", async (req, res): Promise<void> => {
  const params = idParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = z.object({ checkerId: z.number().int().positive().default(PLATFORM_CHECKER_ID) }).safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  try {
    await escrow.approveAction({ approvalId: params.data.id, checkerId: body.data.checkerId });
    res.json({ ok: true });
  } catch (err) {
    handleError(res, err);
  }
});

// ── Checker: reject a pending action ─────────────────────────────────────────
router.post("/approvals/:id/reject", async (req, res): Promise<void> => {
  const params = idParam.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = z.object({ checkerId: z.number().int().positive().default(PLATFORM_CHECKER_ID) }).safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  try {
    await escrow.rejectAction({ approvalId: params.data.id, checkerId: body.data.checkerId });
    res.json({ ok: true });
  } catch (err) {
    handleError(res, err);
  }
});

// ── Reconciliation invariant (debits == credits across the whole ledger) ─────
router.get("/escrow/reconcile", async (_req, res): Promise<void> => {
  const result = await ledger.reconcile();
  res.status(result.balanced ? 200 : 500).json(result);
});

export default router;
