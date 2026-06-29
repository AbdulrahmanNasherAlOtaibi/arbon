import { useState } from "react";
import { useLocation } from "wouter";

function ShieldLogo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="login-lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F2F3F4" />
          <stop offset="48%" stopColor="#9DA2AA" />
          <stop offset="100%" stopColor="#CBCFD4" />
        </linearGradient>
      </defs>
      <path d="M50 4 L90 26 V62 C90 79 72 91 50 96 C28 91 10 79 10 62 V26 Z" fill="url(#login-lg)" />
      <circle cx="50" cy="21" r="5.5" fill="#1A1B1E" opacity="0.55" />
      <rect x="41" y="45" width="18" height="18" rx="2" fill="#1A1B1E" opacity="0.55" transform="rotate(45 50 54)" />
    </svg>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#2B2D31",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "15px 16px",
    color: "#E6E7E9",
    fontSize: 14,
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 600,
    outline: "none",
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `
          radial-gradient(1200px 600px at 80% -10%, rgba(80,84,92,0.25), transparent 60%),
          radial-gradient(900px 500px at 10% 110%, rgba(60,63,68,0.3), transparent 55%),
          #0C0D0F
        `,
      }}
    >
      <div className="w-full max-w-sm px-6">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <ShieldLogo size={72} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "#E6E7E9" }}>عربون</h1>
          <p className="text-sm font-semibold" style={{ color: "#8A8F98" }}>ثقتك محفوظة</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-bold mb-2" style={{ color: "#A8ADB5" }}>رقم الجوال</label>
            <input
              type="tel"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-bold mb-2" style={{ color: "#A8ADB5" }}>كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Login button */}
        <button
          className="w-full py-4 rounded-[15px] text-sm font-extrabold mt-5 transition-transform active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #F2F3F4, #C4C8CE)", color: "#1A1B1E" }}
          onClick={() => navigate("/dashboard")}
        >
          تسجيل الدخول
        </button>

        <div className="text-center mt-4">
          <span className="text-[12.5px] font-semibold" style={{ color: "#8A8F98" }}>
            نسيت كلمة المرور؟
          </span>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "#3C3F44" }} />
          <span className="text-[11px]" style={{ color: "#6B7178" }}>أو</span>
          <div className="flex-1 h-px" style={{ background: "#3C3F44" }} />
        </div>

        {/* National ID */}
        <button
          className="w-full py-4 rounded-[15px] text-sm font-extrabold transition-transform active:scale-[0.98]"
          style={{ background: "transparent", border: "1px solid #45484E", color: "#A8ADB5" }}
          onClick={() => navigate("/dashboard")}
        >
          الدخول عبر نفاذ الوطني
        </button>

        <p className="text-center text-[13px] mt-6" style={{ color: "#8A8F98" }}>
          ليس لديك حساب؟{" "}
          <span className="font-bold cursor-pointer" style={{ color: "#E6E7E9" }}
            onClick={() => navigate("/dashboard")}>
            إنشاء حساب جديد
          </span>
        </p>
      </div>
    </div>
  );
}
