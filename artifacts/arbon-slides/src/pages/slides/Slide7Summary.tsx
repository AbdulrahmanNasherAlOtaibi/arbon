export default function Slide7Summary() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, #1C2025 0%, #0F1013 55%)",
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
        07
      </div>

      {/* Title */}
      <div
        className="absolute font-black font-display"
        style={{ top: "6vh", right: "6vw", fontSize: "5vw", color: "#E8E9EB", letterSpacing: "-0.01em" }}
      >
        ملخص
      </div>

      {/* Divider */}
      <div
        className="absolute"
        style={{ top: "17vh", right: "6vw", width: "8vw", height: "0.5vh", background: "#C0C4CC", borderRadius: 4 }}
      />

      {/* Description text */}
      <div
        className="absolute font-semibold leading-relaxed"
        style={{ top: "20vh", right: "6vw", width: "50vw", fontSize: "2.8vw", color: "#C0C4CC", lineHeight: 1.6 }}
      >
        منصة رقمية سعودية لإدارة عقود العربون تجمع الحجز الآمن للأموال والتوثيق القانوني وآلية النزاع في منتج واحد متكامل.
      </div>

      {/* What we accomplished */}
      <div
        className="absolute rounded-xl p-[2.5vh_2.5vw]"
        style={{
          top: "40vh",
          right: "6vw",
          width: "50vw",
          background: "#1D2024",
          border: "1px solid #2E3136",
        }}
      >
        <div className="font-bold mb-[1.8vh]" style={{ fontSize: "2.8vw", color: "#C0C4CC" }}>ما أنجزناه</div>
        <div className="flex flex-col gap-[1.5vh]">
          <div style={{ fontSize: "2.5vw", color: "#8A8F98" }}>· واجهة مستخدم داكنة متكاملة لجميع شاشات التطبيق</div>
          <div style={{ fontSize: "2.5vw", color: "#8A8F98" }}>· API كامل مع 30+ مسار موثق بـ OpenAPI وZod</div>
          <div style={{ fontSize: "2.5vw", color: "#8A8F98" }}>· قاعدة بيانات مع schema كامل وبيانات تجريبية</div>
        </div>
      </div>

      {/* Right: Key figures — stacked 3 */}
      <div
        className="absolute flex flex-col gap-[2.5vh]"
        style={{ top: "18vh", left: "6vw", width: "35vw", bottom: "5vh" }}
      >
        <div
          className="rounded-xl flex-1 flex flex-col items-center justify-center"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div className="font-black font-display" style={{ fontSize: "8vw", color: "#E8E9EB", lineHeight: 1 }}>5</div>
          <div className="mt-[0.8vh]" style={{ fontSize: "2.5vw", color: "#8A8F98" }}>شاشات رئيسية</div>
        </div>
        <div
          className="rounded-xl flex-1 flex flex-col items-center justify-center"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div className="font-black font-display" style={{ fontSize: "8vw", color: "#E8E9EB", lineHeight: 1 }}>7</div>
          <div className="mt-[0.8vh]" style={{ fontSize: "2.5vw", color: "#8A8F98" }}>جداول قاعدة بيانات</div>
        </div>
        <div
          className="rounded-xl flex-1 flex flex-col items-center justify-center"
          style={{ background: "rgba(91,174,126,0.08)", border: "1px solid rgba(91,174,126,0.25)" }}
        >
          <div className="font-black font-display" style={{ fontSize: "4.5vw", color: "#5BAE7E", lineHeight: 1.15 }}>
            Monorepo
          </div>
          <div className="mt-[0.8vh]" style={{ fontSize: "2.5vw", color: "#8A8F98" }}>بنية كاملة ومنظّمة</div>
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
