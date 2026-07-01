import { Router, type IRouter } from "express";

const router: IRouter = Router();

const NOW = new Date().toISOString();
const D = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockUser = {
  id: 1,
  name: "أحمد الغامدي",
  phone: "0501234567",
  nationalId: "1234567890",
  verified: true,
  createdAt: D(90),
  updatedAt: D(10),
};

const mockDeals = [
  {
    id: 1,
    title: "شقة في حي النرجس – الرياض",
    type: "real_estate",
    status: "active",
    amount: 50000,
    platformFee: 1000,
    currency: "SAR",
    buyerId: 1,
    sellerId: 2,
    buyerName: "أحمد الغامدي",
    sellerName: "محمد العتيبي",
    description: "حجز شقة من ثلاث غرف في حي النرجس بالرياض",
    propertyAddress: "حي النرجس، شارع الأمير سلطان، الرياض",
    vehicleInfo: null,
    deadline: D(-30).slice(0, 10),
    buyerSigned: true,
    sellerSigned: true,
    transferStatus: "not_listed",
    transferPrice: null,
    transferDescription: null,
    createdAt: D(20),
    updatedAt: D(15),
  },
  {
    id: 2,
    title: "تويوتا كامري 2022",
    type: "vehicle",
    status: "completed",
    amount: 15000,
    platformFee: 300,
    currency: "SAR",
    buyerId: 1,
    sellerId: 3,
    buyerName: "أحمد الغامدي",
    sellerName: "خالد السهلي",
    description: "حجز سيارة تويوتا كامري موديل 2022 بحالة ممتازة",
    propertyAddress: null,
    vehicleInfo: "تويوتا كامري 2022 – لون أبيض – 45,000 كم",
    deadline: D(-60).slice(0, 10),
    buyerSigned: true,
    sellerSigned: true,
    transferStatus: "not_listed",
    transferPrice: null,
    transferDescription: null,
    createdAt: D(45),
    updatedAt: D(30),
  },
  {
    id: 3,
    title: "محل تجاري في العليا",
    type: "business",
    status: "pending",
    amount: 80000,
    platformFee: 1600,
    currency: "SAR",
    buyerId: 1,
    sellerId: 4,
    buyerName: "أحمد الغامدي",
    sellerName: "عبدالله القحطاني",
    description: "حجز محل تجاري في حي العليا – الرياض بمساحة 80 متر",
    propertyAddress: "حي العليا، شارع التحلية، الرياض",
    vehicleInfo: null,
    deadline: D(-15).slice(0, 10),
    buyerSigned: true,
    sellerSigned: false,
    transferStatus: "not_listed",
    transferPrice: null,
    transferDescription: null,
    createdAt: D(5),
    updatedAt: D(5),
  },
  {
    id: 4,
    title: "فيلا في حي الملقا",
    type: "real_estate",
    status: "active",
    amount: 120000,
    platformFee: 2400,
    currency: "SAR",
    buyerId: 1,
    sellerId: 5,
    buyerName: "أحمد الغامدي",
    sellerName: "فيصل الدوسري",
    description: "حجز فيلا في حي الملقا – أربع غرف نوم بمسبح",
    propertyAddress: "حي الملقا، طريق الملك فهد، الرياض",
    vehicleInfo: null,
    deadline: D(-25).slice(0, 10),
    buyerSigned: true,
    sellerSigned: true,
    transferStatus: "listed",
    transferPrice: 125000,
    transferDescription: "للتنازل بسبب سفر",
    createdAt: D(12),
    updatedAt: D(3),
  },
  {
    id: 5,
    title: "أرض في حي الياسمين",
    type: "real_estate",
    status: "cancelled",
    amount: 200000,
    platformFee: 4000,
    currency: "SAR",
    buyerId: 1,
    sellerId: 6,
    buyerName: "أحمد الغامدي",
    sellerName: "سعد الشمري",
    description: "حجز أرض سكنية في حي الياسمين بمساحة 400 متر مربع",
    propertyAddress: "حي الياسمين، الرياض",
    vehicleInfo: null,
    deadline: D(-80).slice(0, 10),
    buyerSigned: true,
    sellerSigned: true,
    transferStatus: "not_listed",
    transferPrice: null,
    transferDescription: null,
    createdAt: D(60),
    updatedAt: D(50),
  },
  {
    id: 6,
    title: "فورد رابتر 2023",
    type: "vehicle",
    status: "disputed",
    amount: 45000,
    platformFee: 900,
    currency: "SAR",
    buyerId: 1,
    sellerId: 7,
    buyerName: "أحمد الغامدي",
    sellerName: "ناصر العنزي",
    description: "حجز فورد رابتر 2023 – لون رمادي",
    propertyAddress: null,
    vehicleInfo: "فورد رابتر 2023 – لون رمادي – 12,000 كم",
    deadline: D(-35).slice(0, 10),
    buyerSigned: true,
    sellerSigned: true,
    transferStatus: "not_listed",
    transferPrice: null,
    transferDescription: null,
    createdAt: D(25),
    updatedAt: D(8),
  },
];

const mockContracts: Record<number, object> = {
  1: {
    id: 1, dealId: 1, buyerSigned: true, sellerSigned: true,
    buyerSignedAt: D(19), sellerSignedAt: D(18),
    terms: "يلتزم المشتري بدفع مبلغ العربون لحجز العقار، على أن يُخصم من قيمة الصفقة عند الإتمام. يلتزم البائع بعدم عرض العقار لطرف آخر طوال مدة سريان العقد.",
    refundConditions: "يُسترجع مبلغ العربون كاملاً للمشتري في حال تراجع البائع أو ظهور عيب جوهري في العقار.",
    forfeitureConditions: "يُصادر مبلغ العربون لصالح البائع في حال انسحاب المشتري دون عذر مشروع.",
    createdAt: D(20),
  },
  2: {
    id: 2, dealId: 2, buyerSigned: true, sellerSigned: true,
    buyerSignedAt: D(44), sellerSignedAt: D(44),
    terms: "يدفع المشتري عربوناً لحجز المركبة، ويلتزم البائع بعدم بيعها لطرف آخر. يتم الفحص الفني قبل الإتمام.",
    refundConditions: "يُسترجع العربون إذا ظهر عيب جوهري في المركبة أو رفض البائع الفحص الفني.",
    forfeitureConditions: "يُصادر العربون إذا تراجع المشتري عن الشراء دون سبب نظامي.",
    createdAt: D(45),
  },
  3: {
    id: 3, dealId: 3, buyerSigned: true, sellerSigned: false,
    buyerSignedAt: D(5), sellerSignedAt: null,
    terms: "يلتزم المشتري بدفع مبلغ العربون لحجز المحل التجاري لمدة 30 يوماً لإتمام إجراءات النقل.",
    refundConditions: "يُسترجع العربون كاملاً إذا تراجع البائع أو تعذّر نقل السجل التجاري.",
    forfeitureConditions: "يُصادر العربون إذا رفض المشتري الإتمام بعد استيفاء الشروط.",
    createdAt: D(5),
  },
  4: {
    id: 4, dealId: 4, buyerSigned: true, sellerSigned: true,
    buyerSignedAt: D(11), sellerSignedAt: D(11),
    terms: "يلتزم المشتري بدفع مبلغ العربون لحجز الفيلا، ويلتزم البائع بعدم عرضها لأي طرف آخر.",
    refundConditions: "يُسترجع العربون في حال وجود عيوب خفية أو مشاكل في الوثائق.",
    forfeitureConditions: "يُصادر العربون إذا تراجع المشتري دون عذر مشروع.",
    createdAt: D(12),
  },
  5: {
    id: 5, dealId: 5, buyerSigned: true, sellerSigned: true,
    buyerSignedAt: D(59), sellerSignedAt: D(58),
    terms: "يلتزم المشتري بدفع العربون لحجز الأرض لمدة 45 يوماً.",
    refundConditions: "يُسترجع العربون في حال وجود نزاعات على الأرض أو مشاكل في صك الملكية.",
    forfeitureConditions: "يُصادر العربون إذا تراجع المشتري بعد التحقق.",
    createdAt: D(60),
  },
  6: {
    id: 6, dealId: 6, buyerSigned: true, sellerSigned: true,
    buyerSignedAt: D(24), sellerSignedAt: D(24),
    terms: "يدفع المشتري عربوناً لحجز المركبة مع ضمان حق الفحص الفني.",
    refundConditions: "يُسترجع العربون إذا ثبت تزوير في المواصفات أو سجل الحوادث.",
    forfeitureConditions: "يُصادر العربون إذا رفض المشتري تسليم المركبة بعد اجتياز الفحص.",
    createdAt: D(25),
  },
};

const mockTimelines: Record<number, object[]> = {
  1: [
    { id: 1, dealId: 1, event: "created", description: "تم إنشاء الصفقة وإيداع مبلغ العربون في حساب الضمان", actorName: "المشتري", createdAt: D(20) },
    { id: 2, dealId: 1, event: "signed", description: "وقّع المشتري على العقد", actorName: "أحمد الغامدي", createdAt: D(19) },
    { id: 3, dealId: 1, event: "signed", description: "وقّع البائع على العقد وأصبحت الصفقة نشطة", actorName: "محمد العتيبي", createdAt: D(18) },
  ],
  2: [
    { id: 4, dealId: 2, event: "created", description: "تم إنشاء الصفقة وإيداع مبلغ العربون في حساب الضمان", actorName: "المشتري", createdAt: D(45) },
    { id: 5, dealId: 2, event: "signed", description: "وقّع الطرفان على العقد", actorName: null, createdAt: D(44) },
    { id: 6, dealId: 2, event: "completed", description: "تم إتمام الصفقة وتحويل مبلغ العربون للبائع تلقائياً", actorName: null, createdAt: D(30) },
  ],
  3: [
    { id: 7, dealId: 3, event: "created", description: "تم إنشاء الصفقة وإيداع مبلغ العربون في حساب الضمان", actorName: "المشتري", createdAt: D(5) },
    { id: 8, dealId: 3, event: "signed", description: "وقّع المشتري على العقد – بانتظار توقيع البائع", actorName: "أحمد الغامدي", createdAt: D(5) },
  ],
  4: [
    { id: 9, dealId: 4, event: "created", description: "تم إنشاء الصفقة وإيداع مبلغ العربون في حساب الضمان", actorName: "المشتري", createdAt: D(12) },
    { id: 10, dealId: 4, event: "signed", description: "وقّع الطرفان على العقد", actorName: null, createdAt: D(11) },
    { id: 11, dealId: 4, event: "listed_for_transfer", description: "تم عرض الصفقة في سوق التنازلات للعامة", actorName: null, createdAt: D(3) },
  ],
  5: [
    { id: 12, dealId: 5, event: "created", description: "تم إنشاء الصفقة وإيداع مبلغ العربون في حساب الضمان", actorName: "المشتري", createdAt: D(60) },
    { id: 13, dealId: 5, event: "signed", description: "وقّع الطرفان على العقد", actorName: null, createdAt: D(59) },
    { id: 14, dealId: 5, event: "cancelled", description: "تم إلغاء الصفقة. السبب: تعذّر نقل الملكية بسبب نزاع قانوني", actorName: null, createdAt: D(50) },
  ],
  6: [
    { id: 15, dealId: 6, event: "created", description: "تم إنشاء الصفقة وإيداع مبلغ العربون في حساب الضمان", actorName: "المشتري", createdAt: D(25) },
    { id: 16, dealId: 6, event: "signed", description: "وقّع الطرفان على العقد", actorName: null, createdAt: D(24) },
    { id: 17, dealId: 6, event: "dispute_opened", description: "تم فتح نزاع. السبب: المركبة لا تطابق المواصفات المتفق عليها", actorName: null, createdAt: D(8) },
  ],
};

const mockTemplates = [
  {
    id: 1, type: "real_estate", name: "عقد عربون شراء عقار",
    description: "قالب موثق لحجز عقار (فيلا/شقة/أرض) بعربون قابل للاسترجاع وفق الشروط النظامية.",
    terms: "يلتزم المشتري بدفع مبلغ العربون لحجز العقار محل الاتفاق، على أن يُخصم من إجمالي قيمة الصفقة عند الإتمام. يلتزم البائع بعدم عرض العقار لأي طرف آخر طوال مدة سريان العقد.",
    refundConditions: "يُسترجع مبلغ العربون كاملاً للمشتري في حال تراجع البائع، أو ظهور عيب جوهري في العقار، أو عدم اكتمال الإفراغ لأسباب تعود للبائع.",
    forfeitureConditions: "يُصادر مبلغ العربون لصالح البائع في حال انسحاب المشتري دون عذر مشروع خلال مدة العقد.",
  },
  {
    id: 2, type: "real_estate", name: "عقد عربون إيجار عقار",
    description: "قالب لحجز عقار للإيجار السنوي بعربون يضمن جدية الطرفين حتى توقيع عقد الإيجار.",
    terms: "يدفع المستأجر عربوناً لحجز الوحدة السكنية/التجارية لمدة أقصاها 14 يوماً لحين توقيع عقد الإيجار الرسمي عبر منصة إيجار. يُخصم العربون من قيمة الإيجار الأول.",
    refundConditions: "يُسترجع العربون كاملاً إذا رفض المالك إتمام العقد أو تبيّن عدم مطابقة الوحدة للمواصفات المتفق عليها.",
    forfeitureConditions: "يُصادر العربون إذا عدل المستأجر عن الإيجار دون سبب نظامي قبل انتهاء مدة الحجز.",
  },
  {
    id: 3, type: "vehicle", name: "عقد عربون شراء مركبة",
    description: "قالب لحجز مركبة (جديدة أو مستعملة) بعربون مع ضمان الفحص والنقل النظامي للملكية.",
    terms: "يدفع المشتري عربوناً لحجز المركبة الموصوفة في العقد، ويلتزم البائع بعدم بيعها لطرف آخر. يتم الفحص الفني قبل الإتمام، ويُخصم العربون من السعر النهائي.",
    refundConditions: "يُسترجع العربون إذا ظهر عيب جوهري في المركبة لم يُفصح عنه، أو رفض البائع الفحص الفني، أو تعذّر نقل الملكية نظامياً.",
    forfeitureConditions: "يُصادر العربون إذا تراجع المشتري عن الشراء دون سبب نظامي بعد اجتياز الفحص الفني.",
  },
  {
    id: 4, type: "business", name: "عقد عربون تنازل عن منشأة تجارية",
    description: "قالب لحجز منشأة تجارية (محل/مطعم/صيدلية) بعربون مع التزام بنقل السجل التجاري.",
    terms: "يدفع المشتري عربوناً لحجز المنشأة التجارية، ويلتزم البائع بعدم التنازل عنها لطرف آخر. يشمل العقد تسليم جميع التراخيص والسجلات التجارية خلال المدة المتفق عليها.",
    refundConditions: "يُسترجع العربون إذا تعذّر نقل السجل التجاري أو التراخيص، أو اكتُشفت ديون أو التزامات على المنشأة لم يُفصح عنها.",
    forfeitureConditions: "يُصادر العربون إذا تراجع المشتري عن الإتمام بعد استيفاء البائع لكافة الشروط والوثائق.",
  },
  {
    id: 5, type: "other", name: "عقد عربون عام",
    description: "قالب مرن لحجز أي أصل أو خدمة بعربون، قابل للتخصيص حسب طبيعة الصفقة.",
    terms: "يدفع الطرف الأول مبلغ العربون المتفق عليه لحجز الأصل/الخدمة محل الاتفاق لمدة محددة. يلتزم الطرف الثاني بعدم التفاوض مع أي طرف آخر خلال مدة سريان العقد.",
    refundConditions: "يُسترجع مبلغ العربون كاملاً في حال تراجع الطرف الثاني أو عدم الوفاء بالالتزامات المتفق عليها.",
    forfeitureConditions: "يُصادر مبلغ العربون لصالح الطرف الثاني في حال تراجع الطرف الأول دون عذر مشروع.",
  },
];

const mockMarketplace = [
  {
    id: 4,
    title: "فيلا في حي الملقا",
    type: "real_estate",
    amount: 120000,
    transferPrice: 125000,
    description: "حجز فيلا في حي الملقا – أربع غرف نوم بمسبح. للتنازل بسبب سفر.",
    propertyAddress: "حي الملقا، طريق الملك فهد، الرياض",
    vehicleInfo: null,
    buyerName: "أحمد الغامدي",
    sellerName: "فيصل الدوسري",
    deadline: D(-25).slice(0, 10),
    createdAt: D(12),
  },
];

// ─── Users ───────────────────────────────────────────────────────────────────
router.get("/users/me", (_req, res) => res.json(mockUser));
router.patch("/users/me", (_req, res) => res.json(mockUser));

// ─── Deals ───────────────────────────────────────────────────────────────────
router.get("/deals", (req, res) => {
  let deals = mockDeals;
  const { role, status, type } = req.query as Record<string, string>;
  if (role === "buyer") deals = deals.filter((d) => d.buyerId === 1);
  if (role === "seller") deals = deals.filter((d) => d.sellerId === 1);
  if (status) deals = deals.filter((d) => d.status === status);
  if (type) deals = deals.filter((d) => d.type === type);
  res.json(deals);
});

router.post("/deals", (req, res) => {
  const body = req.body;
  const newDeal = {
    ...mockDeals[0],
    id: 100,
    title: body.title ?? "صفقة جديدة",
    type: body.type ?? "other",
    status: "pending",
    amount: Number(body.amount) || 10000,
    platformFee: (Number(body.amount) || 10000) * 0.02,
    description: body.description ?? "",
    createdAt: NOW,
    updatedAt: NOW,
    buyerSigned: false,
    sellerSigned: false,
  };
  res.status(201).json(newDeal);
});

router.get("/deals/:id", (req, res) => {
  const deal = mockDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) { res.status(404).json({ error: "الصفقة غير موجودة" }); return; }
  res.json(deal);
});

router.patch("/deals/:id", (req, res) => {
  const deal = mockDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) { res.status(404).json({ error: "الصفقة غير موجودة" }); return; }
  res.json({ ...deal, ...req.body, updatedAt: NOW });
});

router.delete("/deals/:id", (req, res) => {
  const deal = mockDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) { res.status(404).json({ error: "الصفقة غير موجودة أو لا يمكن حذفها" }); return; }
  res.sendStatus(204);
});

router.post("/deals/:id/complete", (req, res) => {
  const deal = mockDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) { res.status(404).json({ error: "الصفقة غير موجودة" }); return; }
  res.json({ ...deal, status: "completed", updatedAt: NOW });
});

router.post("/deals/:id/cancel", (req, res) => {
  const deal = mockDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) { res.status(404).json({ error: "الصفقة غير موجودة" }); return; }
  res.json({ ...deal, status: "cancelled", updatedAt: NOW });
});

router.post("/deals/:id/forfeit", (req, res) => {
  const deal = mockDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) { res.status(404).json({ error: "الصفقة غير موجودة" }); return; }
  res.json({ ...deal, status: "forfeited", updatedAt: NOW });
});

// ─── Timeline ─────────────────────────────────────────────────────────────────
router.get("/deals/:id/timeline", (req, res) => {
  const id = Number(req.params.id);
  res.json(mockTimelines[id] ?? []);
});

// ─── Contracts ────────────────────────────────────────────────────────────────
router.get("/deals/:id/contract", (req, res) => {
  const id = Number(req.params.id);
  const contract = mockContracts[id];
  if (!contract) { res.status(404).json({ error: "العقد غير موجود" }); return; }
  res.json(contract);
});

router.post("/deals/:id/contract/sign", (req, res) => {
  const id = Number(req.params.id);
  const contract = mockContracts[id] ?? { id, dealId: id };
  res.json({ ...contract, buyerSigned: true, buyerSignedAt: NOW, sellerSigned: true, sellerSignedAt: NOW });
});

// ─── Disputes ─────────────────────────────────────────────────────────────────
router.get("/deals/:id/dispute", (req, res) => {
  if (Number(req.params.id) === 6) {
    res.json({
      id: 1, dealId: 6, reason: "المركبة لا تطابق المواصفات المتفق عليها",
      evidence: "صور تُظهر الاختلافات في المواصفات", status: "open",
      openedBy: 1, resolution: null, resolvedAt: null, createdAt: D(8),
    });
  } else {
    res.status(404).json({ error: "لا يوجد نزاع لهذه الصفقة" });
  }
});

router.post("/deals/:id/dispute", (req, res) => {
  res.status(201).json({
    id: 99, dealId: Number(req.params.id), reason: req.body.reason ?? "",
    evidence: req.body.evidence ?? null, status: "open",
    openedBy: 1, resolution: null, resolvedAt: null, createdAt: NOW,
  });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard/summary", (_req, res) => {
  res.json({
    totalDeals: 6,
    activeDeals: 2,
    completedDeals: 1,
    disputedDeals: 1,
    cancelledDeals: 1,
    pendingSignature: 1,
    totalAmountEscrowed: 170000,
    totalAmountCompleted: 15000,
    dealsAsbuyer: 6,
    dealsAsSeller: 0,
  });
});

router.get("/dashboard/activity", (_req, res) => {
  const all = Object.values(mockTimelines).flat() as Array<{
    id: number; dealId: number; event: string; description: string; actorName: string | null; createdAt: string;
  }>;
  const sorted = all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  const dealMap = Object.fromEntries(mockDeals.map((d) => [d.id, d]));
  res.json(sorted.map((e) => ({
    id: e.id, dealId: e.dealId,
    dealTitle: dealMap[e.dealId]?.title ?? "",
    event: e.event, description: e.description,
    amount: dealMap[e.dealId]?.amount ?? null,
    createdAt: e.createdAt,
  })));
});

// ─── Templates ────────────────────────────────────────────────────────────────
router.get("/templates", (req, res) => {
  const { type } = req.query as Record<string, string>;
  const results = type ? mockTemplates.filter((t) => t.type === type) : mockTemplates;
  res.json(results);
});

// ─── Transfers ────────────────────────────────────────────────────────────────
router.get("/transfers/marketplace", (req, res) => {
  const { type } = req.query as Record<string, string>;
  const results = type ? mockMarketplace.filter((d) => d.type === type) : mockMarketplace;
  res.json(results);
});

router.get("/transfers/my-listings", (_req, res) => {
  res.json(mockMarketplace);
});

router.get("/transfers/requests", (_req, res) => res.json([]));

router.post("/deals/:id/list-for-transfer", (req, res) => {
  const deal = mockDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) { res.status(404).json({ error: "الصفقة غير موجودة أو لا يمكن عرضها للتنازل" }); return; }
  res.json({ ...deal, transferStatus: "listed", transferPrice: req.body.price ?? deal.amount, updatedAt: NOW });
});

router.post("/deals/:id/unlist", (req, res) => {
  const deal = mockDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) { res.status(404).json({ error: "الصفقة غير موجودة" }); return; }
  res.json({ ...deal, transferStatus: "not_listed", transferPrice: null, updatedAt: NOW });
});

router.post("/deals/:id/request-transfer", (req, res) => {
  res.status(201).json({
    id: 99, dealId: Number(req.params.id), fromUserId: 1, toUserId: 2,
    fromUserName: "أحمد الغامدي", toUserName: "فيصل الدوسري",
    price: req.body.price ?? 0, message: req.body.message ?? null,
    status: "pending", createdAt: NOW, updatedAt: NOW,
  });
});

router.post("/transfers/:id/approve", (req, res) => {
  res.json({
    id: Number(req.params.id), dealId: 4, fromUserId: 1, toUserId: 2,
    fromUserName: "أحمد الغامدي", toUserName: "فيصل الدوسري",
    price: 125000, message: null,
    status: req.body.approved ? "approved" : "rejected",
    createdAt: D(2), updatedAt: NOW,
  });
});

export default router;
