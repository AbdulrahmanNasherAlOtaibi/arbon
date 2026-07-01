import { eq, sql } from "drizzle-orm";
import { db, ledgerEntriesTable } from "@workspace/db";

/**
 * A drizzle transaction handle. Domain operations accept either the root `db`
 * or a transaction so callers can compose several postings atomically.
 */
export type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export type LedgerAccount =
  | "escrow_cash"
  | "buyer_held"
  | "seller_payout"
  | "platform_revenue"
  | "buyer_refund";

export interface LedgerLine {
  account: LedgerAccount;
  direction: "debit" | "credit";
  amount: number;
}

const money = (n: number): string => n.toFixed(2);

/**
 * Post a balanced set of double-entry lines as a single transaction group.
 * Throws if debits do not equal credits — the ledger can never be unbalanced.
 * `idempotencyKey` guarantees the same economic event is posted at most once.
 */
export async function post(
  tx: DbOrTx,
  params: {
    dealId: number;
    idempotencyKey: string;
    memo: string;
    lines: LedgerLine[];
  },
): Promise<void> {
  const debits = params.lines
    .filter((l) => l.direction === "debit")
    .reduce((s, l) => s + l.amount, 0);
  const credits = params.lines
    .filter((l) => l.direction === "credit")
    .reduce((s, l) => s + l.amount, 0);

  if (Math.round(debits * 100) !== Math.round(credits * 100)) {
    throw new Error(
      `Unbalanced ledger posting: debits ${money(debits)} != credits ${money(credits)}`,
    );
  }
  if (params.lines.some((l) => l.amount <= 0)) {
    throw new Error("Ledger lines must have positive amounts");
  }

  await tx.insert(ledgerEntriesTable).values(
    params.lines.map((line, idx) => ({
      dealId: params.dealId,
      txnGroup: params.idempotencyKey,
      account: line.account,
      direction: line.direction,
      amount: money(line.amount),
      memo: params.memo,
      idempotencyKey: `${params.idempotencyKey}:${idx}`,
    })),
  );
}

/** Net balance of a single account for one deal (debits minus credits). */
export async function accountBalance(dealId: number, account: LedgerAccount): Promise<number> {
  const [row] = await db
    .select({
      balance: sql<string>`
        coalesce(sum(case when ${ledgerEntriesTable.direction} = 'debit'
          then ${ledgerEntriesTable.amount} else -${ledgerEntriesTable.amount} end), 0)
      `,
    })
    .from(ledgerEntriesTable)
    .where(sql`${ledgerEntriesTable.dealId} = ${dealId} and ${ledgerEntriesTable.account} = ${account}`);
  return Number(row?.balance ?? 0);
}

/**
 * Global reconciliation invariant: across the whole ledger, total debits must
 * equal total credits. Returns the two totals plus whether they match.
 */
export async function reconcile(): Promise<{ debits: number; credits: number; balanced: boolean }> {
  const [row] = await db
    .select({
      debits: sql<string>`coalesce(sum(case when ${ledgerEntriesTable.direction} = 'debit' then ${ledgerEntriesTable.amount} else 0 end), 0)`,
      credits: sql<string>`coalesce(sum(case when ${ledgerEntriesTable.direction} = 'credit' then ${ledgerEntriesTable.amount} else 0 end), 0)`,
    })
    .from(ledgerEntriesTable);
  const debits = Number(row?.debits ?? 0);
  const credits = Number(row?.credits ?? 0);
  return { debits, credits, balanced: Math.round(debits * 100) === Math.round(credits * 100) };
}

export { eq };
