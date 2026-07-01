import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function ShieldLogo({ size = 72, logoUrl }: { size?: number; logoUrl?: string }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="logo"
        style={{ width: size, height: size, objectFit: "contain", borderRadius: Math.round(size * 0.2) }}
      />
    );
  }
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
  const [brand, setBrand] = useState({ siteName: "عربون", tagline: "ثقتك محفوظة", logoUrl: "" });
  const [online, setOnline] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => s?.siteName && setBrand({ siteName: s.siteName, tagline: s.tagline, logoUrl: s.logoUrl ?? "" }))
      .catch(() => {});
    fetch("/api/presence")
      .then((r) => r.json())
      .then((d) => typeof d?.online === "number" && setOnline(d.online))
      .catch(() => {});
  }, []);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      // On login, admin credentials route straight to the control panel.
      if (tab === "login") {
        const adminRes = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (adminRes.ok) {
          const data = await adminRes.json().catch(() => ({}));
          if (data?.token) {
            localStorage.setItem("arbon_admin_token", data.token);
            navigate("/admin");
            return;
          }
        }
      }
      // Regular user auth — best effort; the demo always enters the app.
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
      navigate("/dashboard");
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  const isRegister = tab === "register";

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
            <ShieldLogo size={80} logoUrl={brand.logoUrl} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "hsl(var(--foreground))" }}>{brand.siteName}</h1>
          <p className="text-sm font-semibold tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>{brand.tagline}</p>
          {online !== null && (
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full" style={{ background: "rgba(91,174,126,0.12)", border: "1px solid rgba(91,174,126,0.25)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "#5BAE7E" }} />
              <span className="text-[11.5px] font-bold" style={{ color: "#5BAE7E" }}>{online.toLocaleString("ar-SA")} متواجد الآن</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex p-1 rounded-[14px] mb-5 gap-1" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}>
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
          {isRegister && (
            <Field label="الاسم الكامل" type="text" placeholder="اسمك الكامل" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <Field label="البريد الإلكتروني" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {isRegister && (
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
            {loading ? "جاري..." : isRegister ? "إنشاء حساب" : "تسجيل الدخول"}
          </button>
        </form>

        <p className="text-center text-[13px] mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
          {isRegister ? "لديك حساب بالفعل؟ " : "ليس لديك حساب؟ "}
          <span className="font-bold cursor-pointer" style={{ color: "hsl(var(--foreground))" }} onClick={() => { setTab(isRegister ? "login" : "register"); setError(""); }}>
            {isRegister ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </span>
        </p>
      </div>
    </div>
  );
}
