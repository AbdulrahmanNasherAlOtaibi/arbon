import { useState } from "react";
import { useLocation } from "wouter";
import logoUrl from "@/assets/logo.png";

function ShieldLogo({ size = 72 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        background: "#191A1E",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <img src={logoUrl} alt="عربون" style={{ width: "84%", height: "84%", objectFit: "contain" }} />
    </span>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "hsl(var(--input))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 14,
    padding: "15px 16px",
    color: "hsl(var(--foreground))",
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
        background:
          "radial-gradient(70% 45% at 50% 8%, rgba(91,174,126,0.12), transparent 60%), radial-gradient(120% 90% at 50% 0%, hsl(var(--card)) 0%, hsl(var(--background)) 50%, hsl(var(--background)) 100%)",
      }}
    >
      <div className="w-full max-w-sm px-6">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <ShieldLogo size={80} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "hsl(var(--foreground))" }}>عربون</h1>
          <p className="text-sm font-semibold tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>ثقتك محفوظة</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>رقم الجوال</label>
            <input
              type="tel"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>كلمة المرور</label>
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
          <span className="text-[12.5px] font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
            نسيت كلمة المرور؟
          </span>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
          <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>أو</span>
          <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
        </div>

        {/* National ID */}
        <button
          className="w-full py-4 rounded-[15px] text-sm font-extrabold transition-transform active:scale-[0.98]"
          style={{ background: "transparent", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
          onClick={() => navigate("/dashboard")}
        >
          الدخول عبر نفاذ الوطني
        </button>

        <p className="text-center text-[13px] mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
          ليس لديك حساب؟{" "}
          <span className="font-bold cursor-pointer" style={{ color: "hsl(var(--foreground))" }}
            onClick={() => navigate("/dashboard")}>
            إنشاء حساب جديد
          </span>
        </p>
      </div>
    </div>
  );
}
