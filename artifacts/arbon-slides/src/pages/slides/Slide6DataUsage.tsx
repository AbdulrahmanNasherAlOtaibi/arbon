export default function Slide6DataUsage() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse 65% 55% at 90% 30%, #1A1D22 0%, #0F1013 60%)",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #C0C4CC 50%, transparent)" }}
      />

      {/* Slide number */}
      <div
        className="absolute font-semibold"
        style={{ top: "4vh", right: "5vw", fontSize: "2.2vw", color: "#8A8F98" }}
      >
        06
      </div>

      {/* Title */}
      <div
        className="absolute font-black font-display"
        style={{
          top: "8vh",
          right: "6vw",
          left: "6vw",
          fontSize: "4.5vw",
          color: "#E8E9EB",
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
        }}
      >
        كيفية توفير البيانات واستخدامها
      </div>

      {/* Divider */}
      <div
        className="absolute"
        style={{ top: "21vh", right: "6vw", width: "8vw", height: "0.5vh", background: "#C0C4CC", borderRadius: 4 }}
      />

      {/* Two columns */}
      <div
        className="absolute flex gap-[3vw]"
        style={{ top: "25vh", right: "6vw", left: "6vw", height: "60vh" }}
      >
        {/* Provision column */}
        <div className="flex-1 flex flex-col gap-[2.5vh]">
          <div
            className="font-bold font-display"
            style={{ fontSize: "3vw", color: "#C0C4CC", marginBottom: "0.5vh" }}
          >
            كيفية توفير البيانات
          </div>
          <div
            className="rounded-xl p-[2vh_2vw]"
            style={{ background: "#1D2024", border: "1px solid #2E3136" }}
          >
            <div className="font-bold mb-[1vh]" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>قاعدة بيانات PostgreSQL</div>
            <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>مُستضافة على Replit مع اتصال آمن عبر DATABASE_URL</div>
          </div>
          <div
            className="rounded-xl p-[2vh_2vw]"
            style={{ background: "#1D2024", border: "1px solid #2E3136" }}
          >
            <div className="font-bold mb-[1vh]" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>بيانات تجريبية (Seed)</div>
            <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>
              مستخدمون وصفقات وعقود وأحداث جاهزة لأغراض الاختبار والعرض
            </div>
          </div>
          <div
            className="rounded-xl p-[2vh_2vw]"
            style={{ background: "#1D2024", border: "1px solid #2E3136" }}
          >
            <div className="font-bold mb-[1vh]" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>Session Secret</div>
            <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>
              متغيرات بيئية مشفّرة لإدارة جلسات المستخدمين بأمان
            </div>
          </div>
        </div>

        {/* Separator */}
        <div
          className="flex-shrink-0 self-stretch"
          style={{ width: "1px", background: "linear-gradient(180deg, transparent, #2E3136 30%, #2E3136 70%, transparent)" }}
        />

        {/* Usage column */}
        <div className="flex-1 flex flex-col gap-[2.5vh]">
          <div
            className="font-bold font-display"
            style={{ fontSize: "3vw", color: "#C0C4CC", marginBottom: "0.5vh" }}
          >
            كيفية استخدام البيانات
          </div>
          <div
            className="rounded-xl p-[2vh_2vw]"
            style={{ background: "#1D2024", border: "1px solid #2E3136" }}
          >
            <div className="font-bold mb-[1vh]" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>Drizzle ORM</div>
            <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>
              استعلامات آمنة ومكتوبة بالكامل مع schema يُفرض في وقت الترجمة
            </div>
          </div>
          <div
            className="rounded-xl p-[2vh_2vw]"
            style={{ background: "#1D2024", border: "1px solid #2E3136" }}
          >
            <div className="font-bold mb-[1vh]" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>OpenAPI + Zod</div>
            <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>
              عقد موحّد يتحقق من صحة المدخلات والمخرجات في كل طرفي التطبيق
            </div>
          </div>
          <div
            className="rounded-xl p-[2vh_2vw]"
            style={{ background: "#1D2024", border: "1px solid #2E3136" }}
          >
            <div className="font-bold mb-[1vh]" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>TanStack Query</div>
            <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>
              إدارة حالة البيانات مع caching ذكي وتحديث فوري للواجهة
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #C0C4CC 50%, transparent)" }}
      />
    </div>
  );
}
