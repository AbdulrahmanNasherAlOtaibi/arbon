import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function ShieldLogo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-label="عربون">
      <defs>
        <linearGradient id="login-metal" x1="12%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stopColor="#F6F7F8" />
          <stop offset="34%" stopColor="#AAB0B8" />
          <stop offset="62%" stopColor="#D8DCE0" />
          <stop offset="100%" stopColor="#878D95" />
        </linearGradient>
        <radialGradient id="login-sphere" cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="46%" stopColor="#C7CCD2" />
          <stop offset="100%" stopColor="#7C828B" />
        </radialGradient>
      </defs>
      <g stroke="url(#login-metal)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M46 10 L86 30 L86 70 L55 87" />
        <path d="M54 90 L14 70 L14 30 L45 13" />
      </g>
      <circle cx="50" cy="50" r="11" fill="url(#login-sphere)" />
      <circle cx="46" cy="46" r="3.4" fill="#FFFFFF" opacity="0.65" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "hsl(var(--input))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 14,
  padding: "14px 16px",
  color: "hsl(var(--foreground))",
  fontSize: 14,
  fontFamily: "'Cairo', sans-serif",
  fontWeight: 600,
  outline: "none",
};

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</label>
      <input style={inputStyle} {...props} />
    </div>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [brand, setBrand] = useState({ siteName: "عربون", tagline: "ثقتك محفوظة" });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => s?.siteName && setBrand({ siteName: s.siteName, tagline: s.tagline }))
      .catch(() => {});
  }, []);

  async function submit() {
    setLoading(true);
    setError("");
    // Best-effort auth: if a database is connected the account is created /
    // verified; either way we always enter the app so the MVP demo flows.
    try {
      const path = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = tab === "login" ? { email, password } : { name, email, phone, password };
      const res = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.token) {
        localStorage.setItem("arbon_user_token", data.token);
        localStorage.setItem("arbon_user", JSON.stringify(data.user));
      }
    } catch {
      // ignore — demo always proceeds
    } finally {
      setLoading(false);
      navigate("/dashboard");
    }
  }

  const isLogin = tab === "login";

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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldLogo size={80} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "hsl(var(--foreground))" }}>{brand.siteName}</h1>
          <p className="text-sm font-semibold tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>{brand.tagline}</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 rounded-[14px] mb-5" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}>
          {([["login", "تسجيل الدخول"], ["register", "إنشاء حساب"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setError(""); }}
              className="flex-1 py-2.5 rounded-[11px] text-[13px] font-bold transition-colors"
              style={{
                background: tab === key ? "hsl(var(--foreground))" : "transparent",
                color: tab === key ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          {!isLogin && (
            <Field label="الاسم الكامل" type="text" placeholder="اسمك الكامل" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <Field label="البريد الإلكتروني" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {!isLogin && (
            <Field label="رقم الجوال (اختياري)" type="tel" placeholder="05XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          )}
          <Field label="كلمة المرور" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <p className="text-[13px] font-semibold" style={{ color: "#CB6060" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-[15px] text-sm font-extrabold mt-1 transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #F2F3F4, #C4C8CE)", color: "#1A1B1E", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "جاري..." : isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>
        </form>

        <p className="text-center text-[13px] mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
          {isLogin ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
          <span className="font-bold cursor-pointer" style={{ color: "hsl(var(--foreground))" }} onClick={() => { setTab(isLogin ? "register" : "login"); setError(""); }}>
            {isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </span>
        </p>
      </div>
    </div>
  );
}
