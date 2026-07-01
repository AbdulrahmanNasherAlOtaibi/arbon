import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import {
  db,
  seedDemoData,
  usersTable,
  dealsTable,
  contractsTable,
  disputesTable,
  timelineTable,
  templatesTable,
  transferRequestsTable,
  ledgerEntriesTable,
  dealFundsTable,
  approvalsTable,
  siteSettingsTable,
} from "@workspace/db";
import * as ledger from "../domain/ledger";

const router: IRouter = Router();

// ── Admin credentials (override via env in production) ───────────────────────
const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "admin@arbon.sa";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "Arbon@Admin2026";
const SECRET = process.env["SESSION_SECRET"] ?? "arbon-dev-secret";

/** Stateless bearer token derived from the credentials + server secret. */
function adminToken(): string {
  return createHmac("sha256", SECRET).update(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("x-admin-token") ?? "";
  if (!token || !safeEqual(token, adminToken())) {
    res.status(401).json({ error: "غير مصرّح — سجّل دخول المشرف" });
    return;
  }
  next();
}

// ── Login ────────────────────────────────────────────────────────────────────
router.post("/admin/login", (req, res): void => {
  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
  if (
    typeof email === "string" &&
    typeof password === "string" &&
    safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL.toLowerCase()) &&
    safeEqual(password, ADMIN_PASSWORD)
  ) {
    res.json({ token: adminToken(), email: ADMIN_EMAIL });
    return;
  }
  res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
});

// Everything below requires a valid admin token.
router.use("/admin", requireAdmin);

// ── Overview (counts + money totals + reconciliation) ────────────────────────
router.get("/admin/overview", async (_req, res): Promise<void> => {
  const [users, deals, disputes, transfers, entries, funds, approvals, templates] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(dealsTable),
    db.select().from(disputesTable),
    db.select().from(transferRequestsTable),
    db.select().from(ledgerEntriesTable),
    db.select().from(dealFundsTable),
    db.select().from(approvalsTable),
    db.select().from(templatesTable),
  ]);

  const sumFunds = (state: string) =>
    funds.filter((f) => f.state === state).reduce((s, f) => s + Number(f.heldAmount), 0);

  const reconcile = await ledger.reconcile();

  res.json({
    counts: {
      users: users.length,
      deals: deals.length,
      disputes: disputes.length,
      transfers: transfers.length,
      ledgerEntries: entries.length,
      approvals: approvals.length,
      templates: templates.length,
    },
    dealsByStatus: deals.reduce<Record<string, number>>((acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1;
      return acc;
    }, {}),
    money: {
      held: sumFunds("held"),
      released: sumFunds("released"),
      refunded: sumFunds("refunded"),
      forfeited: sumFunds("forfeited"),
    },
    reconcile,
    verifiedUsers: users.filter((u) => u.verified).length,
    openDisputes: disputes.filter((d) => d.status === "open" || d.status === "under_review").length,
    pendingApprovals: approvals.filter((a) => a.status === "pending").length,
  });
});

// ── Raw tables ───────────────────────────────────────────────────────────────
const table = (
  path: string,
  run: () => Promise<unknown[]>,
) =>
  router.get(`/admin/${path}`, async (_req, res): Promise<void> => {
    res.json(await run());
  });

table("users", () => db.select().from(usersTable).orderBy(desc(usersTable.id)));
table("deals", () => db.select().from(dealsTable).orderBy(desc(dealsTable.id)));
table("contracts", () => db.select().from(contractsTable).orderBy(desc(contractsTable.id)));
table("disputes", () => db.select().from(disputesTable).orderBy(desc(disputesTable.id)));
table("timeline", () => db.select().from(timelineTable).orderBy(desc(timelineTable.id)));
table("templates", () => db.select().from(templatesTable).orderBy(desc(templatesTable.id)));
table("transfers", () => db.select().from(transferRequestsTable).orderBy(desc(transferRequestsTable.id)));
table("ledger", () => db.select().from(ledgerEntriesTable).orderBy(desc(ledgerEntriesTable.id)));
table("funds", () => db.select().from(dealFundsTable).orderBy(desc(dealFundsTable.id)));
table("approvals", () => db.select().from(approvalsTable).orderBy(desc(approvalsTable.id)));

// ── Site settings (read / update site-wide details) ──────────────────────────
router.get("/admin/settings", async (_req, res): Promise<void> => {
  const [s] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 1));
  res.json(s ?? null);
});

router.put("/admin/settings", async (req, res): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const patch: Record<string, string> = {};
  for (const key of ["siteName", "tagline", "platformFeePercent", "supportEmail", "supportPhone", "aboutText"]) {
    if (typeof body[key] === "string" || typeof body[key] === "number") {
      patch[key] = String(body[key]);
    }
  }
  await db.insert(siteSettingsTable).values({ id: 1, ...patch }).onConflictDoUpdate({ target: siteSettingsTable.id, set: patch });
  const [s] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 1));
  res.json(s);
});

// ── Delete any row from a whitelisted table ──────────────────────────────────
const DELETABLE: Record<string, PgTable & { id: never }> = {
  deals: dealsTable as never,
  users: usersTable as never,
  disputes: disputesTable as never,
  transfers: transferRequestsTable as never,
  contracts: contractsTable as never,
  timeline: timelineTable as never,
  templates: templatesTable as never,
  approvals: approvalsTable as never,
  funds: dealFundsTable as never,
  ledger: ledgerEntriesTable as never,
};

router.delete("/admin/:table/:id", async (req, res): Promise<void> => {
  const table = DELETABLE[req.params.table as string];
  const id = Number(req.params.id);
  if (!table || !Number.isInteger(id)) {
    res.status(400).json({ error: "جدول أو معرّف غير صالح" });
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.delete(table as any).where(eq((table as any).id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(409).json({ error: err instanceof Error ? err.message : "تعذّر الحذف (قد تكون هناك سجلات مرتبطة)" });
  }
});

// ── Reload the demo dataset (full reset) ─────────────────────────────────────
router.post("/admin/reseed", async (_req, res): Promise<void> => {
  try {
    await seedDemoData(db, { reset: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "فشل إعادة التهيئة" });
  }
});

export default router;
