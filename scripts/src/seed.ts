import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../lib/db/src/schema";
import { sql } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  const { usersTable, dealsTable, contractsTable, timelineTable, transferRequestsTable } = schema;

  // Create extra users
  const users = await db.insert(usersTable).values([
    { name: "أحمد بن عبدالعزيز الشمري", phone: "0501112222", email: "ahmed@example.com", nationalId: "1098765432", verified: true },
    { name: "فاطمة بنت محمد الرشيد", phone: "0503334444", email: "fatima@example.com", nationalId: "2098765433", verified: true },
    { name: "عبدالله بن سالم المطيري", phone: "0505556666", email: "abdullah@example.com", nationalId: "3098765434", verified: true },
  ]).returning();

  const ahmedId = users[0].id;
  const fatimaId = users[1].id;
  const abdullahId = users[2].id;

  // Create deals listed for transfer (different sellers, different buyers)
  const now = new Date();
  const oneMonth = new Date(now);
  oneMonth.setDate(oneMonth.getDate() + 30);
  const twoMonths = new Date(now);
  twoMonths.setDate(twoMonths.getDate() + 60);

  const listedDeals = await db.insert(dealsTable).values([
    {
      title: "فيلا في حي الروضة - جدة",
      type: "real_estate",
      status: "active",
      amount: "120000.00",
      currency: "SAR",
      buyerId: ahmedId,
      sellerId: 2,
      description: "فيلا دورين بمساحة 400م² في حي الروضة، جدة. حديقة خلفية، مسبح، 5 غرف نوم. قريبة من كورنيش جدة.",
      propertyAddress: "حي الروضة، شارع الملك عبدالله، جدة",
      vehicleInfo: null,
      deadline: oneMonth.toISOString().split("T")[0],
      platformFee: "2400.00",
      buyerSigned: true,
      sellerSigned: true,
      transferStatus: "listed",
      transferPrice: "135000.00",
      transferDescription: "تنازل عن صفقة فيلا بجدة مع التركيبات. السعر شامل الضريبة.",
    },
    {
      title: "سيارة مرسيدس S-Class 2024",
      type: "vehicle",
      status: "active",
      amount: "350000.00",
      currency: "SAR",
      buyerId: fatimaId,
      sellerId: 3,
      description: "مرسيدس بنز S 500 2024، اللون أسود، قاطع 3,000 كم، ضمان الوكالة 3 سنوات، كامل المواصفات.",
      propertyAddress: null,
      vehicleInfo: "S 500 2024 - أسود - 3,000 كم",
      deadline: twoMonths.toISOString().split("T")[0],
      platformFee: "7000.00",
      buyerSigned: true,
      sellerSigned: true,
      transferStatus: "listed",
      transferPrice: "370000.00",
      transferDescription: "تنازل عن حجز مرسيدس جديد، العربون المحجوز 350 ألف والسعر المتفق 1.2 مليون.",
    },
    {
      title: "محل تجاري في الدمام",
      type: "business",
      status: "active",
      amount: "60000.00",
      currency: "SAR",
      buyerId: abdullahId,
      sellerId: 4,
      description: "محل بيع أدوات منزلية في شارع الامير محمد بن فهد، الدمام. قائم من 3 سنوات. عائد شهري ممتاز.",
      propertyAddress: "شارع الأمير محمد بن فهد، الدمام",
      vehicleInfo: null,
      deadline: oneMonth.toISOString().split("T")[0],
      platformFee: "1200.00",
      buyerSigned: true,
      sellerSigned: true,
      transferStatus: "listed",
      transferPrice: "65000.00",
      transferDescription: "تنازل عن صفقة محل تجاري. شامل البضاعة الموجودة والترخيص.",
    },
    {
      title: "أرض زراعية في القصيم",
      type: "real_estate",
      status: "active",
      amount: "80000.00",
      currency: "SAR",
      buyerId: ahmedId,
      sellerId: 2,
      description: "أرض زراعية بمساحة 10,000م² في القصيم، مزروعة نخيل. بئر ماء. كهرباء متصلة.",
      propertyAddress: "القصيم، بالقرب من بريدة",
      vehicleInfo: null,
      deadline: twoMonths.toISOString().split("T")[0],
      platformFee: "1600.00",
      buyerSigned: true,
      sellerSigned: true,
      transferStatus: "listed",
      transferPrice: "85000.00",
      transferDescription: "تنازل عن صفقة أرض زراعية مع 50 نخلة مثمرة.",
    },
    {
      title: "تويوتا كامري 2024",
      type: "vehicle",
      status: "active",
      amount: "45000.00",
      currency: "SAR",
      buyerId: fatimaId,
      sellerId: 3,
      description: "تويوتا كامري GLE 2024، اللون كحلي، قاطع 5,000 كم، صيانة دورية في الوكالة.",
      propertyAddress: null,
      vehicleInfo: "كامري GLE 2024 - كحلي - 5,000 كم",
      deadline: oneMonth.toISOString().split("T")[0],
      platformFee: "900.00",
      buyerSigned: true,
      sellerSigned: true,
      transferStatus: "listed",
      transferPrice: "48000.00",
      transferDescription: "تنازل عن حجز كامري جديد. السعر يشمل التأمين والتسجيل.",
    },
    {
      title: "مخبز وسوبر ماركت في الطائف",
      type: "business",
      status: "active",
      amount: "90000.00",
      currency: "SAR",
      buyerId: abdullahId,
      sellerId: 4,
      description: "مخبز أفران حجازية + سوبر ماركت صغير في حي الوسام، الطائف. يعمل من 4 سنوات. زبائن ثابتون.",
      propertyAddress: "حي الوسام، شارع الملك فهد، الطائف",
      vehicleInfo: null,
      deadline: twoMonths.toISOString().split("T")[0],
      platformFee: "1800.00",
      buyerSigned: true,
      sellerSigned: true,
      transferStatus: "listed",
      transferPrice: "95000.00",
      transferDescription: "تنازل عن صفقة مخبز وسوبر ماركت. شامل المعدات والترخيص.",
    },
  ]).returning();

  // Insert contracts for listed deals
  for (const deal of listedDeals) {
    await db.insert(contractsTable).values({
      dealId: deal.id,
      terms: `شروط العقد: ${deal.description}\n\nمبلغ العربون: ${Number(deal.amount).toLocaleString("ar-SA")} ر.س`,
      refundConditions: "يُسترجع مبلغ العربون كاملاً للمشتري في حال إلغاء الصفقة من قبل البائع أو عند الفسخ المشروع.",
      forfeitureConditions: "يُصادر مبلغ العربون لصالح البائع في حال انسحاب المشتري دون عذر مشروع.",
    });
    await db.insert(timelineTable).values({
      dealId: deal.id,
      event: "created",
      description: "تم إنشاء الصفقة",
      actorName: deal.buyerId === ahmedId ? "أحمد بن عبدالعزيز" : deal.buyerId === fatimaId ? "فاطمة بنت محمد" : "عبدالله بن سالم",
    });
    await db.insert(timelineTable).values({
      dealId: deal.id,
      event: "buyer_signed",
      description: "وقع المشتري على العقد",
    });
    await db.insert(timelineTable).values({
      dealId: deal.id,
      event: "seller_signed",
      description: "وقع البائع على العقد",
    });
    await db.insert(timelineTable).values({
      dealId: deal.id,
      event: "listed",
      description: `تم عرض الصفقة في سوق التنازلات بسعر ${Number(deal.transferPrice).toLocaleString("ar-SA")} ر.س`,
    });
  }

  // Create transfer requests (user 1 (mock) requests some transfers)
  await db.insert(transferRequestsTable).values([
    { dealId: listedDeals[0].id, requesterId: 1, price: 140000, message: "مهتم بالتنازل عن الفيلا. جاهز للدفع فوراً.", status: "pending" },
    { dealId: listedDeals[1].id, requesterId: 1, price: 375000, message: "أبحث عن سيارة فاخرة. التنازل مناسب لي.", status: "pending" },
    { dealId: listedDeals[2].id, requesterId: 1, price: 62000, message: "أرغب في الاستثمار في الدمام. هذا المحل فرصة جيدة.", status: "approved" },
  ]);

  console.log("Seed completed!");
  console.log(`- Added ${users.length} users`);
  console.log(`- Added ${listedDeals.length} listed deals`);
  console.log(`- Added 3 transfer requests`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
