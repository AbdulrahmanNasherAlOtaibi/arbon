export default function Slide8Challenges() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, #191C21 0%, #0F1013 55%)",
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
        08
      </div>

      {/* Title */}
      <div
        className="absolute font-black font-display"
        style={{
          top: "8vh",
          right: "6vw",
          fontSize: "4.5vw",
          color: "#E8E9EB",
          letterSpacing: "-0.01em",
        }}
      >
        التحديات والخطط المستقبلية
      </div>

      {/* Divider */}
      <div
        className="absolute"
        style={{ top: "21vh", right: "6vw", width: "8vw", height: "0.5vh", background: "#C0C4CC", borderRadius: 4 }}
      />

      {/* Two columns */}
      <div
        className="absolute flex gap-[3vw]"
        style={{ top: "25vh", right: "6vw", left: "6vw", height: "58vh" }}
      >
        {/* Challenges */}
        <div className="flex-1 flex flex-col gap-[2.5vh]">
          <div
            className="font-bold font-display"
            style={{ fontSize: "3vw", color: "#CB6060", marginBottom: "0.5vh" }}
          >
            التحديات الحالية
          </div>
          <div
            className="rounded-xl p-[2vh_2vw] flex-1"
            style={{ background: "rgba(203,96,96,0.06)", border: "1px solid rgba(203,96,96,0.18)" }}
          >
            <div className="flex flex-col gap-[2.5vh]">
              <div>
                <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>ربط نفاذ الوطني</div>
                <div className="mt-[0.5vh]" style={{ fontSize: "2.4vw", color: "#8A8F98" }}>
                  الوصول إلى API نفاذ لإتمام التحقق الفعلي من الهوية
                </div>
              </div>
              <div style={{ height: "1px", background: "#2E3136" }} />
              <div>
                <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>بوابة الدفع</div>
                <div className="mt-[0.5vh]" style={{ fontSize: "2.4vw", color: "#8A8F98" }}>
                  تكامل فعلي مع Moyasar أو STC Pay لمعالجة المدفوعات
                </div>
              </div>
              <div style={{ height: "1px", background: "#2E3136" }} />
              <div>
                <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>التحكيم الآلي</div>
                <div className="mt-[0.5vh]" style={{ fontSize: "2.4vw", color: "#8A8F98" }}>
                  بناء منظومة التحكيم الفعلي وتوصيل المحكّمين المعتمدين
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future plans */}
        <div className="flex-1 flex flex-col gap-[2.5vh]">
          <div
            className="font-bold font-display"
            style={{ fontSize: "3vw", color: "#5BAE7E", marginBottom: "0.5vh" }}
          >
            خارطة الطريق
          </div>
          <div
            className="rounded-xl p-[2vh_2vw] flex-1"
            style={{ background: "rgba(91,174,126,0.06)", border: "1px solid rgba(91,174,126,0.18)" }}
          >
            <div className="flex flex-col gap-[2vh]">
              <div className="flex items-start gap-[1.5vw]">
                <div
                  className="flex-shrink-0 font-black rounded-lg flex items-center justify-center"
                  style={{ width: "3.5vw", height: "3.5vw", background: "rgba(91,174,126,0.15)", color: "#5BAE7E", fontSize: "2vw" }}
                >
                  1
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>الأسبوعان القادمان</div>
                  <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>تكامل بوابة الدفع وتفعيل التوثيق</div>
                </div>
              </div>
              <div style={{ height: "1px", background: "#2E3136" }} />
              <div className="flex items-start gap-[1.5vw]">
                <div
                  className="flex-shrink-0 font-black rounded-lg flex items-center justify-center"
                  style={{ width: "3.5vw", height: "3.5vw", background: "rgba(91,174,126,0.15)", color: "#5BAE7E", fontSize: "2vw" }}
                >
                  2
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>الشهر القادم</div>
                  <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>تطبيق جوال وربط نفاذ الوطني</div>
                </div>
              </div>
              <div style={{ height: "1px", background: "#2E3136" }} />
              <div className="flex items-start gap-[1.5vw]">
                <div
                  className="flex-shrink-0 font-black rounded-lg flex items-center justify-center"
                  style={{ width: "3.5vw", height: "3.5vw", background: "rgba(91,174,126,0.15)", color: "#5BAE7E", fontSize: "2vw" }}
                >
                  3
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize: "2.6vw", color: "#E8E9EB" }}>الإطلاق التجريبي</div>
                  <div style={{ fontSize: "2.4vw", color: "#8A8F98" }}>Beta محدود مع شريحة أولى من المستخدمين</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom — Shield watermark + tagline */}
      <div
        className="absolute flex items-center justify-center gap-[2vw]"
        style={{ bottom: "3vh", left: "50%", transform: "translateX(-50%)" }}
      >
        <svg width="3.5vw" height="4vw" viewBox="0 0 100 115" fill="none" style={{ opacity: 0.25, minWidth: 24 }}>
          <path d="M50 5 L92 28 V66 C92 84 73 97 50 102 C27 97 8 84 8 66 V28 Z" fill="#C0C4CC" />
        </svg>
        <span style={{ fontSize: "2.4vw", color: "#3C3F44", fontFamily: "'Cairo',sans-serif", fontWeight: 600 }}>
          عربون — ثقتك محفوظة
        </span>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #C0C4CC 50%, transparent)" }}
      />
    </div>
  );
}
