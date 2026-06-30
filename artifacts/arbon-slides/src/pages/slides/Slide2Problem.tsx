export default function Slide2Problem() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse 70% 50% at 20% 50%, #1A1C21 0%, #0F1013 55%)",
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
        02
      </div>

      {/* Title */}
      <div
        className="absolute font-black font-display"
        style={{ top: "6vh", right: "6vw", fontSize: "5vw", color: "#E8E9EB", letterSpacing: "-0.01em" }}
      >
        المشكلة وحلها
      </div>

      {/* Divider under title */}
      <div
        className="absolute"
        style={{
          top: "17vh",
          right: "6vw",
          width: "8vw",
          height: "0.5vh",
          background: "#C0C4CC",
          borderRadius: 4,
        }}
      />

      {/* Two columns */}
      <div
        className="absolute flex gap-[3vw]"
        style={{ top: "20vh", right: "6vw", left: "6vw", height: "74vh" }}
      >
        {/* Problem column */}
        <div
          className="flex-1 rounded-2xl p-[3vh_3vw]"
          style={{ background: "rgba(203,96,96,0.08)", border: "1px solid rgba(203,96,96,0.2)" }}
        >
          <div
            className="font-bold font-display mb-[2vh]"
            style={{ fontSize: "3.2vw", color: "#CB6060" }}
          >
            المشكلة
          </div>
          <div className="flex flex-col gap-[2.5vh]">
            <div className="flex items-start gap-[1.2vw]">
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
                style={{ width: "2.8vw", height: "2.8vw", background: "rgba(203,96,96,0.15)", color: "#CB6060", fontSize: "1.8vw", marginTop: "0.3vh" }}
              >
                1
              </div>
              <p style={{ fontSize: "2.6vw", color: "#C4C8CE", lineHeight: 1.4 }}>
                غياب منصة موثوقة تحجز الأموال وتضمن الالتزام
              </p>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
                style={{ width: "2.8vw", height: "2.8vw", background: "rgba(203,96,96,0.15)", color: "#CB6060", fontSize: "1.8vw", marginTop: "0.3vh" }}
              >
                2
              </div>
              <p style={{ fontSize: "2.6vw", color: "#C4C8CE", lineHeight: 1.4 }}>
                النزاعات تُحسم بالتقاضي المطوّل لا بآليات محددة
              </p>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
                style={{ width: "2.8vw", height: "2.8vw", background: "rgba(203,96,96,0.15)", color: "#CB6060", fontSize: "1.8vw", marginTop: "0.3vh" }}
              >
                3
              </div>
              <p style={{ fontSize: "2.6vw", color: "#C4C8CE", lineHeight: 1.4 }}>
                انعدام التوثيق الرقمي المعتمد للعقود العرفية
              </p>
            </div>
          </div>
        </div>

        {/* Solution column */}
        <div
          className="flex-1 rounded-2xl p-[3vh_3vw]"
          style={{ background: "rgba(91,174,126,0.08)", border: "1px solid rgba(91,174,126,0.2)" }}
        >
          <div
            className="font-bold font-display mb-[2vh]"
            style={{ fontSize: "3.2vw", color: "#5BAE7E" }}
          >
            الحل
          </div>
          <div className="flex flex-col gap-[2.5vh]">
            <div className="flex items-start gap-[1.2vw]">
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{ width: "2.8vw", height: "2.8vw", background: "rgba(91,174,126,0.15)", color: "#5BAE7E", fontSize: "1.8vw", marginTop: "0.3vh" }}
              >
                ✓
              </div>
              <p style={{ fontSize: "2.6vw", color: "#C4C8CE", lineHeight: 1.4 }}>
                حجز العربون رقمياً بضمان المنصة حتى اكتمال الصفقة
              </p>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{ width: "2.8vw", height: "2.8vw", background: "rgba(91,174,126,0.15)", color: "#5BAE7E", fontSize: "1.8vw", marginTop: "0.3vh" }}
              >
                ✓
              </div>
              <p style={{ fontSize: "2.6vw", color: "#C4C8CE", lineHeight: 1.4 }}>
                عقود رقمية موثّقة بتوقيع الطرفين وطابع زمني
              </p>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{ width: "2.8vw", height: "2.8vw", background: "rgba(91,174,126,0.15)", color: "#5BAE7E", fontSize: "1.8vw", marginTop: "0.3vh" }}
              >
                ✓
              </div>
              <p style={{ fontSize: "2.6vw", color: "#C4C8CE", lineHeight: 1.4 }}>
                آلية نزاع محكّمة تفضّ الخلافات خلال 48 ساعة
              </p>
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
