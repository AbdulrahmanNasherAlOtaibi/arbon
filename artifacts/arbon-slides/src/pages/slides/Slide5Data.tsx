export default function Slide5Data() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse 55% 65% at 10% 60%, #19191E 0%, #0F1013 55%)",
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
        style={{ top: "3vh", right: "5vw", fontSize: "2.2vw", color: "#8A8F98" }}
      >
        05
      </div>

      {/* Title */}
      <div
        className="absolute font-black font-display"
        style={{ top: "6vh", right: "6vw", fontSize: "5vw", color: "#E8E9EB", letterSpacing: "-0.01em" }}
      >
        البيانات المستخدمة
      </div>

      {/* Subtitle */}
      <div
        className="absolute"
        style={{ top: "17vh", right: "6vw", width: "38vw", fontSize: "2.6vw", color: "#8A8F98", lineHeight: 1.5 }}
      >
        البيانات المُولَّدة والمُدارة داخل قاعدة البيانات الرئيسية خلال دورة حياة كل صفقة
      </div>

      {/* Left: Data source box */}
      <div
        className="absolute rounded-xl p-[2.5vh_2.5vw]"
        style={{
          top: "34vh",
          right: "6vw",
          width: "38vw",
          background: "#1D2024",
          border: "1px solid #2E3136",
        }}
      >
        <div className="font-bold mb-[1.5vh]" style={{ fontSize: "2.6vw", color: "#C0C4CC" }}>مصادر البيانات</div>
        <div className="flex flex-col gap-[1.2vh]">
          <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>· إدخال المستخدم المباشر عند التسجيل</div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>· بيانات مُولَّدة تلقائياً عند إنشاء الصفقة</div>
          <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>· بيانات تجريبية (Seed Data) للاختبار</div>
        </div>
      </div>

      {/* Right: Data types — 5 cards stacked */}
      <div
        className="absolute flex flex-col gap-[1.6vh]"
        style={{ top: "8vh", left: "6vw", width: "44vw", bottom: "5vh" }}
      >
        {/* Item 1 */}
        <div
          className="flex items-start gap-[1.5vw] rounded-xl p-[1.8vh_2vw]"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div
            className="flex-shrink-0 font-bold flex items-center justify-center rounded-lg"
            style={{ width: "3vw", height: "3vw", background: "rgba(192,196,204,0.1)", color: "#C0C4CC", fontSize: "1.8vw", marginTop: "0.2vh" }}
          >
            1
          </div>
          <div>
            <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>بيانات المستخدمين</div>
            <div style={{ fontSize: "2.3vw", color: "#8A8F98", marginTop: "0.4vh" }}>الاسم · الجوال · الهوية الوطنية · حالة التحقق</div>
          </div>
        </div>

        {/* Item 2 */}
        <div
          className="flex items-start gap-[1.5vw] rounded-xl p-[1.8vh_2vw]"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div
            className="flex-shrink-0 font-bold flex items-center justify-center rounded-lg"
            style={{ width: "3vw", height: "3vw", background: "rgba(192,196,204,0.1)", color: "#C0C4CC", fontSize: "1.8vw", marginTop: "0.2vh" }}
          >
            2
          </div>
          <div>
            <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>بيانات الصفقات</div>
            <div style={{ fontSize: "2.3vw", color: "#8A8F98", marginTop: "0.4vh" }}>النوع · المبلغ · الطرفان · الموعد · الحالة</div>
          </div>
        </div>

        {/* Item 3 */}
        <div
          className="flex items-start gap-[1.5vw] rounded-xl p-[1.8vh_2vw]"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div
            className="flex-shrink-0 font-bold flex items-center justify-center rounded-lg"
            style={{ width: "3vw", height: "3vw", background: "rgba(192,196,204,0.1)", color: "#C0C4CC", fontSize: "1.8vw", marginTop: "0.2vh" }}
          >
            3
          </div>
          <div>
            <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>العقود الرقمية</div>
            <div style={{ fontSize: "2.3vw", color: "#8A8F98", marginTop: "0.4vh" }}>الشروط · حالات الاسترجاع والمصادرة</div>
          </div>
        </div>

        {/* Item 4 */}
        <div
          className="flex items-start gap-[1.5vw] rounded-xl p-[1.8vh_2vw]"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div
            className="flex-shrink-0 font-bold flex items-center justify-center rounded-lg"
            style={{ width: "3vw", height: "3vw", background: "rgba(192,196,204,0.1)", color: "#C0C4CC", fontSize: "1.8vw", marginTop: "0.2vh" }}
          >
            4
          </div>
          <div>
            <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>سجل الأحداث</div>
            <div style={{ fontSize: "2.3vw", color: "#8A8F98", marginTop: "0.4vh" }}>التوقيت · هوية المنفذ · وصف كل خطوة</div>
          </div>
        </div>

        {/* Item 5 */}
        <div
          className="flex items-start gap-[1.5vw] rounded-xl p-[1.8vh_2vw]"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div
            className="flex-shrink-0 font-bold flex items-center justify-center rounded-lg"
            style={{ width: "3vw", height: "3vw", background: "rgba(192,196,204,0.1)", color: "#C0C4CC", fontSize: "1.8vw", marginTop: "0.2vh" }}
          >
            5
          </div>
          <div>
            <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>طلبات التنازل</div>
            <div style={{ fontSize: "2.3vw", color: "#8A8F98", marginTop: "0.4vh" }}>السعر · الحالة · الأطراف · التاريخ</div>
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
