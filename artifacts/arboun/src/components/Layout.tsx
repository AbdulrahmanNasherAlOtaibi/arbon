import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useGetMe } from "@workspace/api-client-react";

function ShieldLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="arboun-lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F2F3F4" />
          <stop offset="48%" stopColor="#9DA2AA" />
          <stop offset="100%" stopColor="#CBCFD4" />
        </linearGradient>
      </defs>
      <path d="M50 4 L90 26 V62 C90 79 72 91 50 96 C28 91 10 79 10 62 V26 Z" fill="url(#arboun-lg)" />
      <circle cx="50" cy="21" r="5.5" fill="#1A1B1E" opacity="0.55" />
      <rect x="41" y="45" width="18" height="18" rx="2" fill="#1A1B1E" opacity="0.55" transform="rotate(45 50 54)" />
    </svg>
  );
}

const NAV_ROUTES = ["/dashboard", "/deals", "/transfers/marketplace", "/templates", "/profile"];

const navItems = [
  {
    href: "/dashboard",
    label: "الرئيسية",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    href: "/deals",
    label: "الصفقات",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    href: "/transfers/marketplace",
    label: "التنازلات",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M7 16V4M7 4l-3 3M7 4l3 3M17 8v12M17 20l3-3M17 20l-3-3" />
      </svg>
    ),
  },
  {
    href: "/templates",
    label: "النماذج",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 3v4a1 1 0 001 1h4M6 3h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "الملف",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: user } = useGetMe();

  const showNav = NAV_ROUTES.some((r) =>
    r === "/deals" ? location === "/deals" : location === r || (r !== "/dashboard" && location.startsWith(r))
  );

  const activeNav = navItems.find((item) =>
    item.href === "/deals"
      ? location === "/deals"
      : location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href))
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0C0D0F" }}
      dir="rtl"
    >
      {/* Top bar for nav pages */}
      {showNav && (
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
          style={{ background: "#1A1B1E", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            <ShieldLogo size={30} />
            <div className="leading-none">
              <p className="font-extrabold text-base text-white leading-none">عربون</p>
              <p className="text-[9px] text-white/35 mt-0.5 tracking-widest">ثقتك محفوظة</p>
            </div>
          </div>
          <Link href="/notifications">
            <button
              className="relative w-10 h-10 rounded-[13px] flex items-center justify-center"
              style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#A8ADB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute top-2 left-2.5 w-2 h-2 rounded-full bg-[#CB6060] border-2 border-[#2B2D31]" />
            </button>
          </Link>
        </header>
      )}

      {/* Page content */}
      <main
        className={cn("flex-1 overflow-y-auto scrollbar-none", showNav && "pb-24")}
        style={{ background: "#1A1B1E" }}
      >
        {children}
      </main>

      {/* Bottom Nav */}
      {showNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pt-3 pb-6"
          style={{
            background: "linear-gradient(to top, #212327 75%, rgba(33,35,39,0.92))",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(16px)",
          }}
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/deals"
                ? location === "/deals"
                : location === item.href ||
                  (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <button className="flex flex-col items-center gap-1.5 flex-1 min-w-[56px]">
                  <span style={{ color: isActive ? "#E6E7E9" : "#6B7178" }}>{item.icon}</span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: isActive ? "#E6E7E9" : "#6B7178" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isActive ? "#E6E7E9" : "transparent" }}
                  />
                </button>
              </Link>
            );
          })}
        </nav>
      )}

      {/* User hint — hidden on nav pages (shown in profile instead) */}
      {!showNav && user && (
        <div className="sr-only">{user.name}</div>
      )}
    </div>
  );
}

/* ── Sub-components reused across pages ─────────────────────── */

export function PageHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      {onBack ? (
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-[13px] flex items-center justify-center"
          style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#A8ADB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      ) : (
        <div className="w-10" />
      )}
      <span className="font-bold text-base" style={{ color: "#E6E7E9" }}>{title}</span>
      {right ?? <div className="w-10" />}
    </div>
  );
}

export function InkCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("rounded-[18px] p-4", className)}
      style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  variant = "muted",
}: {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "muted";
}) {
  const styles: Record<string, React.CSSProperties> = {
    success: { background: "rgba(91,174,126,0.14)", color: "#5BAE7E" },
    warning: { background: "rgba(208,168,79,0.14)", color: "#D0A84F" },
    danger:  { background: "rgba(203,96,96,0.14)",  color: "#CB6060" },
    muted:   { background: "rgba(255,255,255,0.07)", color: "#8A8F98" },
  };
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full"
      style={styles[variant]}
    >
      {children}
    </span>
  );
}

export function statusToPillVariant(status: string): "success" | "warning" | "danger" | "muted" {
  const map: Record<string, "success" | "warning" | "danger" | "muted"> = {
    active: "success",
    completed: "success",
    pending: "warning",
    disputed: "warning",
    cancelled: "muted",
    refunded: "muted",
    forfeited: "danger",
  };
  return map[status] ?? "muted";
}

export function DealCard({
  icon,
  title,
  sub,
  amount,
  status,
  statusText,
  progress,
  onClick,
}: {
  icon: string;
  title: string;
  sub: string;
  amount: string;
  status: "success" | "warning" | "danger" | "muted";
  statusText: string;
  progress: number;
  onClick?: () => void;
}) {
  return (
    <button
      className="w-full text-right rounded-[18px] p-4 mb-3 block"
      style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.05)" }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-[13px] flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "#3C3F44" }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: "#E6E7E9" }}>{title}</p>
          <p className="text-[11.5px] mt-0.5" style={{ color: "#8A8F98" }}>{sub}</p>
        </div>
        <p className="font-extrabold text-sm flex-shrink-0" style={{ color: "#E6E7E9" }}>{amount}</p>
      </div>
      {/* Progress bar */}
      <div className="flex gap-1 mt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{ background: i < progress ? "#C4C8CE" : "#45484E" }}
          />
        ))}
      </div>
      <div className="mt-3 text-right">
        <Pill variant={status}>{statusText}</Pill>
      </div>
    </button>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap text-xs font-bold px-4 py-2 rounded-full flex-shrink-0"
      style={
        active
          ? { background: "#E6E7E9", color: "#1A1B1E" }
          : { background: "#2B2D31", color: "#A8ADB5", border: "1px solid rgba(255,255,255,0.05)" }
      }
    >
      {label}
    </button>
  );
}

export function PrimaryBtn({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn("w-full py-4 rounded-[15px] text-sm font-extrabold transition-transform active:scale-[0.98] disabled:opacity-50", className)}
      style={{ background: "linear-gradient(135deg, #F2F3F4, #C4C8CE)", color: "#1A1B1E" }}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-[15px] text-sm font-extrabold transition-transform active:scale-[0.98] disabled:opacity-50"
      style={{ background: "transparent", border: "1px solid #45484E", color: "#A8ADB5" }}
    >
      {children}
    </button>
  );
}

export function DangerBtn({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-[15px] text-sm font-extrabold transition-transform active:scale-[0.98] disabled:opacity-50"
      style={{ background: "transparent", border: "1px solid rgba(203,96,96,0.35)", color: "#CB6060" }}
    >
      {children}
    </button>
  );
}

export function InkInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <label className="block text-[12.5px] font-bold mb-2" style={{ color: "#A8ADB5" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[14px] px-4 py-4 text-sm font-semibold outline-none"
        style={{
          background: "#2B2D31",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "#E6E7E9",
        }}
      />
    </div>
  );
}

export function InkTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-bold mb-2" style={{ color: "#A8ADB5" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-[14px] px-4 py-4 text-sm font-semibold outline-none resize-none"
        style={{
          background: "#2B2D31",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "#E6E7E9",
        }}
      />
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex justify-between items-center py-3 text-sm"
      style={{ borderBottom: "1px solid #33363B" }}
    >
      <span style={{ color: "#8A8F98" }}>{label}</span>
      <span className="font-bold" style={{ color: "#E6E7E9" }}>{value}</span>
    </div>
  );
}
