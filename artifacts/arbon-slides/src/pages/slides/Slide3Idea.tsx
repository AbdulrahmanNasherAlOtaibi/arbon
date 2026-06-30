export default function Slide3Idea() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse 60% 60% at 80% 40%, #1A1D22 0%, #0F1013 55%)",
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
        03
      </div>

      {/* Title */}
      <div
        className="absolute font-black font-display"
        style={{ top: "8vh", right: "6vw", fontSize: "5vw", color: "#E8E9EB", letterSpacing: "-0.01em" }}
      >
        وصف الفكرة
      </div>

      {/* Subtitle */}
      <div
        className="absolute font-semibold"
        style={{ top: "17.5vh", right: "6vw", fontSize: "2.8vw", color: "#8A8F98" }}
      >
        منصة الضامن الرقمي لعقود العربون في السوق السعودي
      </div>

      {/* Divider */}
      <div
        className="absolute"
        style={{ top: "24vh", right: "6vw", width: "8vw", height: "0.5vh", background: "#C0C4CC", borderRadius: 4 }}
      />

      {/* Three feature cards */}
      <div
        className="absolute flex gap-[2.5vw]"
        style={{ top: "28vh", right: "6vw", left: "6vw", height: "38vh" }}
      >
        {/* Card 1 */}
        <div
          className="flex-1 flex flex-col justify-between rounded-2xl p-[3vh_2.5vw]"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div>
            <svg width="4.5vw" height="4.5vw" viewBox="0 0 48 48" fill="none" style={{ minWidth: 36, minHeight: 36 }}>
              <rect width="48" height="48" rx="12" fill="rgba(192,196,204,0.1)" />
              <path d="M24 8 L38 16 V28 C38 36 32 42 24 44 C16 42 10 36 10 28 V16 Z" stroke="#C0C4CC" strokeWidth="2" fill="none" />
            </svg>
            <div className="font-bold font-display mt-[2vh]" style={{ fontSize: "3vw", color: "#E8E9EB" }}>حجز العربون</div>
            <p className="mt-[1.5vh] leading-relaxed" style={{ fontSize: "2.5vw", color: "#8A8F98" }}>
              المشتري يدفع العربون للمنصة التي تحتفظ به بشكل آمن حتى اكتمال الصفقة
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div
          className="flex-1 flex flex-col justify-between rounded-2xl p-[3vh_2.5vw]"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div>
            <svg width="4.5vw" height="4.5vw" viewBox="0 0 48 48" fill="none" style={{ minWidth: 36, minHeight: 36 }}>
              <rect width="48" height="48" rx="12" fill="rgba(192,196,204,0.1)" />
              <path d="M14 24 L20 30 L34 18" stroke="#C0C4CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="8" y="8" width="32" height="32" rx="4" stroke="#C0C4CC" strokeWidth="2" fill="none" />
            </svg>
            <div className="font-bold font-display mt-[2vh]" style={{ fontSize: "3vw", color: "#E8E9EB" }}>عقد رقمي</div>
            <p className="mt-[1.5vh] leading-relaxed" style={{ fontSize: "2.5vw", color: "#8A8F98" }}>
              توقيع الطرفين إلكترونياً على عقد موثّق بطابع زمني وقابل للاستخدام قانونياً
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div
          className="flex-1 flex flex-col justify-between rounded-2xl p-[3vh_2.5vw]"
          style={{ background: "#1D2024", border: "1px solid #2E3136" }}
        >
          <div>
            <svg width="4.5vw" height="4.5vw" viewBox="0 0 48 48" fill="none" style={{ minWidth: 36, minHeight: 36 }}>
              <rect width="48" height="48" rx="12" fill="rgba(192,196,204,0.1)" />
              <path d="M24 8 C16 8 10 14 10 22 C10 30 16 36 24 36 C32 36 38 30 38 22 C38 14 32 8 24 8 Z" stroke="#C0C4CC" strokeWidth="2" fill="none" />
              <path d="M19 22 L23 26 L30 19" stroke="#C0C4CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="font-bold font-display mt-[2vh]" style={{ fontSize: "3vw", color: "#E8E9EB" }}>سوق التنازلات</div>
            <p className="mt-[1.5vh] leading-relaxed" style={{ fontSize: "2.5vw", color: "#8A8F98" }}>
              منصة داخلية للتنازل عن الصفقات النشطة لأطراف أخرى بأسعار يحددها الأطراف
            </p>
          </div>
        </div>
      </div>

      {/* Process flow bar */}
      <div
        className="absolute flex items-center gap-0"
        style={{ bottom: "10vh", right: "6vw", left: "6vw" }}
      >
        <div
          className="flex-1 text-center py-[1.5vh] rounded-r-xl font-semibold"
          style={{ background: "#1D2024", border: "1px solid #2E3136", fontSize: "2.5vw", color: "#C0C4CC" }}
        >
          دفع العربون
        </div>
        <div style={{ color: "#3C3F44", fontSize: "2.5vw", padding: "0 0.5vw" }}>←</div>
        <div
          className="flex-1 text-center py-[1.5vh] font-semibold"
          style={{ background: "#1D2024", border: "1px solid #2E3136", fontSize: "2.5vw", color: "#C0C4CC" }}
        >
          توقيع العقد
        </div>
        <div style={{ color: "#3C3F44", fontSize: "2.5vw", padding: "0 0.5vw" }}>←</div>
        <div
          className="flex-1 text-center py-[1.5vh] font-semibold"
          style={{ background: "#1D2024", border: "1px solid #2E3136", fontSize: "2.5vw", color: "#C0C4CC" }}
        >
          تأكيد الإتمام
        </div>
        <div style={{ color: "#3C3F44", fontSize: "2.5vw", padding: "0 0.5vw" }}>←</div>
        <div
          className="flex-1 text-center py-[1.5vh] rounded-l-xl font-bold"
          style={{ background: "rgba(91,174,126,0.12)", border: "1px solid rgba(91,174,126,0.3)", fontSize: "2.5vw", color: "#5BAE7E" }}
        >
          تحويل المبلغ
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
