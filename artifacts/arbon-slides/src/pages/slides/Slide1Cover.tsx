export default function Slide1Cover() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #252830 0%, #0F1013 60%)",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Top decorative line */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #C0C4CC 50%, transparent)" }}
      />

      {/* Corner number label */}
      <div
        className="absolute top-[4vh] left-[5vw] font-display font-semibold"
        style={{ fontSize: "2.2vw", color: "#8A8F98", letterSpacing: "0.08em" }}
      >
        01
      </div>

      {/* Shield SVG — center stage */}
      <div className="absolute" style={{ top: "10vh", left: "50%", transform: "translateX(-50%)" }}>
        <svg width="9vw" height="10.5vw" viewBox="0 0 100 115" fill="none" style={{ minWidth: 80, minHeight: 90 }}>
          <defs>
            <linearGradient id="shield-lg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0F1F2" />
              <stop offset="50%" stopColor="#A8ADB5" />
              <stop offset="100%" stopColor="#CBCFD4" />
            </linearGradient>
          </defs>
          <path d="M50 5 L92 28 V66 C92 84 73 97 50 102 C27 97 8 84 8 66 V28 Z" fill="url(#shield-lg)" />
          <path d="M50 18 L80 35 V62 C80 75 67 84 50 88 C33 84 20 75 20 62 V35 Z" fill="#1A1C20" />
          <circle cx="50" cy="48" r="8" stroke="#C0C4CC" strokeWidth="2.5" fill="none" />
          <line x1="50" y1="56" x2="50" y2="68" stroke="#C0C4CC" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Project name */}
      <div
        className="absolute font-display font-black text-center"
        style={{
          top: "28vh",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "9vw",
          color: "#E8E9EB",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          textShadow: "0 0 60px rgba(200,204,212,0.15)",
          whiteSpace: "nowrap",
        }}
      >
        عربون
      </div>

      {/* Tagline */}
      <div
        className="absolute text-center font-display font-semibold"
        style={{
          top: "44vh",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "3.2vw",
          color: "#8A8F98",
          whiteSpace: "nowrap",
          letterSpacing: "0.04em",
        }}
      >
        ثقتك محفوظة
      </div>

      {/* Divider */}
      <div
        className="absolute"
        style={{
          top: "56vh",
          left: "25vw",
          right: "25vw",
          height: "1px",
          background: "linear-gradient(90deg, transparent, #3C3F44 50%, transparent)",
        }}
      />

      {/* Team name */}
      <div
        className="absolute text-center font-display font-semibold"
        style={{
          top: "59vh",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "2.6vw",
          color: "#C0C4CC",
          whiteSpace: "nowrap",
        }}
      >
        فريق عربون
      </div>

      {/* Team members row */}
      <div
        className="absolute flex gap-[4vw] justify-center"
        style={{ top: "67vh", left: "50%", transform: "translateX(-50%)" }}
      >
        <div className="text-center" style={{ fontSize: "2.3vw", color: "#8A8F98", fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>اسم العضو</div>
        <div className="text-center" style={{ fontSize: "2.3vw", color: "#8A8F98", fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>اسم العضو</div>
        <div className="text-center" style={{ fontSize: "2.3vw", color: "#8A8F98", fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>اسم العضو</div>
        <div className="text-center" style={{ fontSize: "2.3vw", color: "#8A8F98", fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>اسم العضو</div>
      </div>

      {/* Bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #C0C4CC 50%, transparent)" }}
      />
    </div>
  );
}
