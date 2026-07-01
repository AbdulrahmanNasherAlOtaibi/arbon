import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

type DemoDb = NodePgDatabase<typeof schema>;

const money = (n: number) => n.toFixed(2);
const daysFromNow = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  return t.toISOString().split("T")[0]!;
};

/**
 * Populate the database with a coherent demo dataset that exercises the whole
 * عربون (Arbon) platform — every deal status, the transfer marketplace,
 * disputes, contract templates, and the banking core (double-entry ledger,
 * per-deal funds state, and executed maker-checker approvals).
 *
 * @param opts.reset  When true, truncates all tables first (deterministic ids).
 *                    When false, seeds only if the database is empty — safe to
 *                    call on every server boot.
 * @returns whether data was actually written.
 */
export async function seedDemoData(
  db: DemoDb,
  opts: { reset: boolean } = { reset: false },
): Promise<{ seeded: boolean }> {
  const {
    usersTable, dealsTable, contractsTable, timelineTable, transferRequestsTable,
    disputesTable, templatesTable, dealFundsTable, ledgerEntriesTable, approvalsTable,
  } = schema;

  if (opts.reset) {
    await db.execute(sql`
      TRUNCATE TABLE
        ledger_entries, approvals, deal_funds, transfer_requests,
        timeline, contracts, disputes, deals, templates, users
      RESTART IDENTITY CASCADE
    `);
  } else {
    const existing = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
    if (existing.length > 0) {
      return { seeded: false };
    }
  }

  // ── Contract templates ───────────────────────────────────────────────────
  await db.insert(templatesTable).values([
    {
      name: "عقد عربون عقاري",
      type: "real_estate",
      description: "قالب موحّد لصفقات العقار (فلل، شقق، أراضٍ) يوثّق العربون وشروط الاسترداد.",
      terms:
        "يلتزم الطرفان بإتمام صفقة العقار الموصوف خلال المدة المتفق عليها. يُحتجز مبلغ العربون في حساب ضمان مستقل حتى إتمام نقل الملكية رسمياً في كتابة العدل. لا يُفرج عن المبلغ إلا بعد التأكد من سلامة الصك وخلوّه من الرهون والنزاعات.",
      refundConditions:
        "يُسترد كامل العربون للمشتري في حال: انسحاب البائع، وجود عيب جوهري في الصك، أو تعذّر نقل الملكية لأسباب خارجة عن المشتري.",
      forfeitureConditions:
        "يُصادر العربون لصالح البائع في حال انسحاب المشتري دون عذر مشروع بعد توقيع العقد.",
    },
    {
      name: "عقد عربون مركبة",
      type: "vehicle",
      description: "قالب لحجز/شراء المركبات يوثّق العربون وحالة المركبة وشروط التسليم.",
      terms:
        "يلتزم البائع بتسليم المركبة الموصوفة بحالتها المتفق عليها وبكامل مستنداتها (الاستمارة، الفحص الدوري، إخلاء الطرف). يُحتجز العربون في الضمان حتى معاينة المشتري وتسلّمه للمركبة.",
      refundConditions:
        "يُسترد العربون كاملاً للمشتري إذا اختلفت حالة المركبة عن الوصف جوهرياً أو تعذّر نقل الملكية في المرور.",
      forfeitureConditions:
        "يُصادر العربون لصالح البائع عند تراجع المشتري دون مبرر بعد الاتفاق النهائي.",
    },
    {
      name: "عقد عربون نشاط تجاري",
      type: "business",
      description: "قالب لبيع/التنازل عن المنشآت التجارية يوثّق العربون والترخيص والأصول.",
      terms:
        "يشمل الاتفاق أصول النشاط والترخيص والعلامة التجارية والبضاعة القائمة كما هي موصوفة. يُحتجز العربون في الضمان حتى نقل الترخيص وإتمام إجراءات التنازل لدى الجهات المختصة.",
      refundConditions:
        "يُسترد العربون للمشتري إذا تبيّن وجود التزامات أو مخالفات مخفية على النشاط أو تعذّر نقل الترخيص.",
      forfeitureConditions:
        "يُصادر العربون لصالح البائع عند انسحاب المشتري دون عذر مشروع بعد التوقيع.",
    },
    {
      name: "عقد عربون عام",
      type: "other",
      description: "قالب مرن للصفقات الأخرى يوثّق العربون وشروط التنفيذ والاسترداد.",
      terms:
        "يلتزم الطرفان بتنفيذ الالتزامات الموصوفة خلال المدة المحددة، ويُحتجز العربون في حساب ضمان مستقل حتى إتمام التنفيذ وقبول الطرفين.",
      refundConditions:
        "يُسترد العربون للمشتري عند إخلال البائع بالتزاماته أو تعذّر التنفيذ لأسباب لا تعود للمشتري.",
      forfeitureConditions:
        "يُصادر العربون لصالح البائع عند إخلال المشتري بالتزاماته دون عذر مشروع.",
    },
  ]);

  // ── Users ────────────────────────────────────────────────────────────────
  const users = await db.insert(usersTable).values([
    { name: "أنت (المشتري)", phone: "0500000001", email: "you@arbon.sa", nationalId: "1000000001", verified: true },
    { name: "مدقّق المنصة", phone: "0500000002", email: "checker@arbon.sa", nationalId: "1000000002", verified: true },
    { name: "موظّف العمليات", phone: "0500000003", email: "ops@arbon.sa", nationalId: "1000000003", verified: true },
    { name: "شركة الرياض للتطوير العقاري", phone: "0500000004", email: "riyadh-dev@arbon.sa", nationalId: "1000000004", verified: true },
    { name: "معرض النخبة للسيارات", phone: "0500000005", email: "elite-cars@arbon.sa", nationalId: "1000000005", verified: true },
    { name: "مؤسسة الخليج التجارية", phone: "0500000006", email: "gulf-biz@arbon.sa", nationalId: "1000000006", verified: true },
    { name: "خالد العتيبي", phone: "0500000007", email: "khalid@arbon.sa", nationalId: "1000000007", verified: true },
    { name: "سارة القحطاني", phone: "0500000008", email: "sara@arbon.sa", nationalId: "1000000008", verified: false },
  ]).returning();

  const YOU = users[0]!.id, CHECKER = users[1]!.id, MAKER = users[2]!.id;
  const REALESTATE = users[3]!.id, CARS = users[4]!.id, BIZ = users[5]!.id, KHALID = users[6]!.id;

  async function postLedger(
    dealId: number, key: string, memo: string,
    lines: { account: "escrow_cash" | "buyer_held" | "seller_payout" | "platform_revenue" | "buyer_refund"; direction: "debit" | "credit"; amount: number }[],
  ) {
    await db.insert(ledgerEntriesTable).values(
      lines.map((l, i) => ({
        dealId, txnGroup: key, account: l.account, direction: l.direction,
        amount: money(l.amount), memo, idempotencyKey: `${key}:${i}`,
      })),
    );
  }

  const addTimeline = (dealId: number, event: string, description: string, actorName?: string) =>
    db.insert(timelineTable).values({ dealId, event, description, actorName: actorName ?? null });

  async function createDeal(d: {
    title: string; type: "real_estate" | "vehicle" | "business" | "other";
    status: "pending" | "active" | "completed" | "cancelled" | "disputed" | "refunded" | "forfeited";
    amount: number; buyerId: number; sellerId: number; description: string;
    propertyAddress?: string; vehicleInfo?: string; deadline: string; feeRate?: number;
    signed?: boolean; transfer?: { price: number; description: string };
  }) {
    const fee = +(d.amount * (d.feeRate ?? 0.02)).toFixed(2);
    const signed = d.signed ?? true;
    const [deal] = await db.insert(dealsTable).values({
      title: d.title, type: d.type, status: d.status, amount: money(d.amount), currency: "SAR",
      buyerId: d.buyerId, sellerId: d.sellerId, description: d.description,
      propertyAddress: d.propertyAddress ?? null, vehicleInfo: d.vehicleInfo ?? null,
      deadline: d.deadline, platformFee: money(fee), buyerSigned: signed, sellerSigned: signed,
      transferStatus: d.transfer ? "listed" : "not_listed",
      transferPrice: d.transfer ? money(d.transfer.price) : null,
      transferDescription: d.transfer?.description ?? null,
    }).returning();
    await db.insert(contractsTable).values({
      dealId: deal!.id,
      terms: `شروط العقد: ${d.description}\n\nمبلغ العربون: ${d.amount.toLocaleString("ar-SA")} ر.س`,
      refundConditions: "يُسترجع مبلغ العربون كاملاً للمشتري عند إلغاء البائع للصفقة أو الفسخ المشروع.",
      forfeitureConditions: "يُصادر مبلغ العربون لصالح البائع عند انسحاب المشتري دون عذر مشروع.",
      buyerSigned: signed, sellerSigned: signed,
      buyerSignedAt: signed ? new Date() : null, sellerSignedAt: signed ? new Date() : null,
    });
    await addTimeline(deal!.id, "created", "تم إنشاء الصفقة", "أنت (المشتري)");
    if (signed) {
      await addTimeline(deal!.id, "buyer_signed", "وقّع المشتري على العقد");
      await addTimeline(deal!.id, "seller_signed", "وقّع البائع على العقد");
    }
    return { id: deal!.id, fee };
  }

  const setFunds = (dealId: number, state: "awaiting_deposit" | "held" | "released" | "refunded" | "forfeited", held: number, frozen = false) =>
    db.insert(dealFundsTable).values({ dealId, state, heldAmount: money(held), frozen: frozen ? 1 : 0 });

  // 1) ACTIVE — funds held
  const active = await createDeal({ title: "فيلا في حي الياسمين — الرياض", type: "real_estate", status: "active", amount: 150000, buyerId: YOU, sellerId: REALESTATE, deadline: daysFromNow(25), description: "فيلا دورين 450م²، 6 غرف، مسبح، حي الياسمين شمال الرياض.", propertyAddress: "حي الياسمين، الرياض" });
  await setFunds(active.id, "held", 150000);
  await postLedger(active.id, `deposit:${active.id}`, "إيداع العربون في حساب الضمان", [{ account: "escrow_cash", direction: "debit", amount: 150000 }, { account: "buyer_held", direction: "credit", amount: 150000 }]);
  await addTimeline(active.id, "deposit_held", "تم إيداع 150,000 ر.س واحتجازها في حساب الضمان", "النظام");

  // 2) COMPLETED — released via maker-checker
  const done = await createDeal({ title: "سيارة مرسيدس GLE 2024", type: "vehicle", status: "completed", amount: 90000, buyerId: YOU, sellerId: CARS, deadline: daysFromNow(-3), description: "مرسيدس GLE 450 موديل 2024، أبيض، ضمان الوكالة.", vehicleInfo: "GLE 450 2024 - أبيض" });
  await setFunds(done.id, "released", 90000);
  const donePayout = 90000 - done.fee;
  await postLedger(done.id, `deposit:${done.id}`, "إيداع العربون", [{ account: "escrow_cash", direction: "debit", amount: 90000 }, { account: "buyer_held", direction: "credit", amount: 90000 }]);
  await postLedger(done.id, `release:${done.id}`, "تحرير العربون للبائع بعد الإتمام", [{ account: "buyer_held", direction: "debit", amount: 90000 }, { account: "seller_payout", direction: "credit", amount: donePayout }, { account: "platform_revenue", direction: "credit", amount: done.fee }]);
  await db.insert(approvalsTable).values({ dealId: done.id, action: "release", amount: money(90000), reason: "إتمام تسليم المركبة", status: "executed", makerId: MAKER, checkerId: CHECKER, decidedAt: new Date() });
  await addTimeline(done.id, "deposit_held", "تم إيداع 90,000 ر.س في الضمان", "النظام");
  await addTimeline(done.id, "funds_released", `اعتمد المدقّق التحرير: ${donePayout.toLocaleString("ar-SA")} ر.س للبائع و ${done.fee.toLocaleString("ar-SA")} ر.س رسوم المنصة`, "مدقّق المنصة");

  // 3) DISPUTED — funds frozen
  const disputed = await createDeal({ title: "محل تجاري في الدمام", type: "business", status: "disputed", amount: 60000, buyerId: YOU, sellerId: BIZ, deadline: daysFromNow(10), description: "محل أدوات منزلية، شارع الأمير محمد بن فهد، الدمام.", propertyAddress: "الدمام" });
  await setFunds(disputed.id, "held", 60000, true);
  await postLedger(disputed.id, `deposit:${disputed.id}`, "إيداع العربون", [{ account: "escrow_cash", direction: "debit", amount: 60000 }, { account: "buyer_held", direction: "credit", amount: 60000 }]);
  await db.insert(disputesTable).values({ dealId: disputed.id, reason: "البائع لم يسلّم مستندات الترخيص في الموعد المتفق عليه.", evidence: "مراسلات واتساب + محضر اجتماع", status: "under_review", openedBy: YOU });
  await addTimeline(disputed.id, "dispute_opened", "تم فتح نزاع وتجميد الأموال المحتجزة — قيد المراجعة", "أنت (المشتري)");

  // 4) REFUNDED — resolved for buyer
  const refunded = await createDeal({ title: "أرض سكنية في القصيم", type: "real_estate", status: "refunded", amount: 40000, buyerId: YOU, sellerId: REALESTATE, deadline: daysFromNow(-10), description: "أرض سكنية 625م² في بريدة، القصيم.", propertyAddress: "بريدة، القصيم" });
  await setFunds(refunded.id, "refunded", 40000);
  await postLedger(refunded.id, `deposit:${refunded.id}`, "إيداع العربون", [{ account: "escrow_cash", direction: "debit", amount: 40000 }, { account: "buyer_held", direction: "credit", amount: 40000 }]);
  await postLedger(refunded.id, `refund:${refunded.id}`, "استرداد كامل العربون للمشتري", [{ account: "buyer_held", direction: "debit", amount: 40000 }, { account: "buyer_refund", direction: "credit", amount: 40000 }]);
  await db.insert(disputesTable).values({ dealId: refunded.id, reason: "تبيّن وجود نزاع ملكية على الأرض.", evidence: "صك مطعون فيه", status: "resolved_buyer", resolution: "لصالح المشتري — استرداد كامل العربون.", openedBy: YOU, resolvedAt: new Date() });
  await db.insert(approvalsTable).values({ dealId: refunded.id, action: "refund", amount: money(40000), reason: "قرار تحكيم لصالح المشتري", status: "executed", makerId: MAKER, checkerId: CHECKER, decidedAt: new Date() });
  await addTimeline(refunded.id, "funds_refunded", "تم استرداد كامل مبلغ العربون (40,000 ر.س) للمشتري", "النظام");

  // 5) FORFEITED — buyer withdrew
  const forfeited = await createDeal({ title: "تويوتا لاندكروزر 2023", type: "vehicle", status: "forfeited", amount: 50000, buyerId: KHALID, sellerId: CARS, deadline: daysFromNow(-5), description: "لاندكروزر GXR 2023، رمادي.", vehicleInfo: "GXR 2023 - رمادي" });
  await setFunds(forfeited.id, "forfeited", 50000);
  const forfPayout = 50000 - forfeited.fee;
  await postLedger(forfeited.id, `deposit:${forfeited.id}`, "إيداع العربون", [{ account: "escrow_cash", direction: "debit", amount: 50000 }, { account: "buyer_held", direction: "credit", amount: 50000 }]);
  await postLedger(forfeited.id, `forfeit:${forfeited.id}`, "مصادرة العربون لصالح البائع", [{ account: "buyer_held", direction: "debit", amount: 50000 }, { account: "seller_payout", direction: "credit", amount: forfPayout }, { account: "platform_revenue", direction: "credit", amount: forfeited.fee }]);
  await addTimeline(forfeited.id, "funds_forfeited", `تمت مصادرة العربون لصالح البائع (${forfPayout.toLocaleString("ar-SA")} ر.س)`, "النظام");

  // 6) PENDING — awaiting signatures/deposit
  const pending = await createDeal({ title: "شقة في جدة — حي الشاطئ", type: "real_estate", status: "pending", amount: 75000, buyerId: YOU, sellerId: REALESTATE, deadline: daysFromNow(30), signed: false, description: "شقة 3 غرف تطل على البحر، حي الشاطئ، جدة.", propertyAddress: "حي الشاطئ، جدة" });
  await setFunds(pending.id, "awaiting_deposit", 0);

  // 7) Transfer marketplace — listings + requests
  const listedA = await createDeal({ title: "فيلا للتنازل — حي النرجس", type: "real_estate", status: "active", amount: 120000, buyerId: KHALID, sellerId: REALESTATE, deadline: daysFromNow(40), description: "فيلا 400م² حي النرجس، الرياض.", propertyAddress: "حي النرجس، الرياض", transfer: { price: 135000, description: "تنازل عن صفقة فيلا مع التركيبات. السعر شامل الضريبة." } });
  await setFunds(listedA.id, "held", 120000);
  await postLedger(listedA.id, `deposit:${listedA.id}`, "إيداع العربون", [{ account: "escrow_cash", direction: "debit", amount: 120000 }, { account: "buyer_held", direction: "credit", amount: 120000 }]);
  await addTimeline(listedA.id, "listed", "تم عرض الصفقة في سوق التنازلات بسعر 135,000 ر.س");

  const listedB = await createDeal({ title: "حجز مرسيدس S-Class للتنازل", type: "vehicle", status: "active", amount: 200000, buyerId: KHALID, sellerId: CARS, deadline: daysFromNow(50), description: "حجز مرسيدس S 500 2024 كامل المواصفات.", vehicleInfo: "S 500 2024", transfer: { price: 220000, description: "تنازل عن حجز مرسيدس جديد." } });
  await setFunds(listedB.id, "held", 200000);
  await postLedger(listedB.id, `deposit:${listedB.id}`, "إيداع العربون", [{ account: "escrow_cash", direction: "debit", amount: 200000 }, { account: "buyer_held", direction: "credit", amount: 200000 }]);
  await addTimeline(listedB.id, "listed", "تم عرض الصفقة في سوق التنازلات بسعر 220,000 ر.س");

  await db.insert(transferRequestsTable).values([
    { dealId: listedA.id, fromUserId: YOU, toUserId: KHALID, price: "138000", message: "مهتم بالتنازل عن الفيلا، جاهز للدفع فوراً عبر الضمان.", status: "pending" },
    { dealId: listedB.id, fromUserId: YOU, toUserId: KHALID, price: "225000", message: "أرغب في التنازل عن حجز المرسيدس.", status: "pending" },
  ]);

  return { seeded: true };
}
