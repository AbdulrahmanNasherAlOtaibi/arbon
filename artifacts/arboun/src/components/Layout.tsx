import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useGetMe } from "@workspace/api-client-react";
import { useTx } from "@/lib/translations";

/** Site brand (name + tagline + logo) controlled from the admin panel. */
function useBrand() {
  const [brand, setBrand] = useState({ siteName: "عربون", tagline: "ثقتك محفوظة", logoUrl: "" });
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => s?.siteName && setBrand({ siteName: s.siteName, tagline: s.tagline, logoUrl: s.logoUrl ?? "" }))
      .catch(() => {});
  }, []);
  return brand;
}

function ShieldLogo({ size = 32, logoUrl }: { size?: number; logoUrl?: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="logo" style={{ width: size, height: size, objectFit: "contain", borderRadius: Math.round(size * 0.2) }} />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-label="عربون">
      <defs>
        <linearGradient id="arboun-metal-h" x1="12%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stopColor="#F6F7F8" />
          <stop offset="34%" stopColor="#AAB0B8" />
          <stop offset="62%" stopColor="#D8DCE0" />
          <stop offset="100%" stopColor="#878D95" />
        </linearGradient>
        <radialGradient id="arboun-sphere-h" cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="46%" stopColor="#C7CCD2" />
          <stop offset="100%" stopColor="#7C828B" />
        </radialGradient>
      </defs>
      {/* two interlocking hexagonal halves */}
      <g stroke="url(#arboun-metal-h)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M46 10 L86 30 L86 70 L55 87" />
        <path d="M54 90 L14 70 L14 30 L45 13" />
      </g>
      {/* central sphere */}
      <circle cx="50" cy="50" r="11" fill="url(#arboun-sphere-h)" />
      <circle cx="46" cy="46" r="3.4" fill="#FFFFFF" opacity="0.65" />
    </svg>
  );
}

const NAV_ROUTES = ["/dashboard", "/deals", "/transfers/marketplace", "/templates", "/profile", "/settings"];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const tx = useTx();
  const brand = useBrand();

  const navItems = [
    {
      href: "/dashboard",
      label: tx("nav_home"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
        </svg>
      ),
    },
    {
      href: "/deals",
      label: tx("nav_deals"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      ),
    },
    {
      href: "/transfers/marketplace",
      label: tx("nav_transfers"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M7 16V4M7 4l-3 3M7 4l3 3M17 8v12M17 20l3-3M17 20l-3-3" />
        </svg>
      ),
    },
    {
      href: "/templates",
      label: tx("nav_templates"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M14 3v4a1 1 0 001 1h4M6 3h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: tx("nav_profile"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

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
      style={{
        background:
          "radial-gradient(90% 55% at 50% -8%, rgba(91,174,126,0.10), transparent 60%), radial-gradient(130% 95% at 50% -5%, hsl(var(--card)) 0%, hsl(var(--background)) 55%, hsl(var(--background)) 100%)",
      }}
      dir="rtl"
    >
      {/* Top bar for nav pages */}
      {showNav && (
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
          style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--card-border))" }}
        >
          <div className="flex items-center gap-2.5">
            <ShieldLogo size={30} logoUrl={brand.logoUrl} />
            <div className="leading-none">
              <p className="font-extrabold text-base leading-none" style={{ color: "hsl(var(--foreground))" }}>{brand.siteName}</p>
              <p className="text-[9px] mt-0.5 tracking-widest" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>{brand.tagline}</p>
            </div>
          </div>
          <Link href="/notifications">
            <button
              className="relative w-10 h-10 rounded-[13px] flex items-center justify-center"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: "hsl(var(--muted-foreground))" }}>
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute top-2 left-2.5 w-2 h-2 rounded-full bg-[#CB6060] border-2" style={{ borderColor: "hsl(var(--input))" }} />
            </button>
          </Link>
        </header>
      )}

      {/* Page content */}
      <main
        className={cn("flex-1 overflow-y-auto scrollbar-none", showNav && "pb-24")}
        style={{ background: "hsl(var(--background))" }}
      >
        {children}
      </main>

      {/* Bottom Nav */}
      {showNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pt-3 pb-6"
          style={{
            background: "hsl(var(--sidebar))",
            borderTop: "1px solid hsl(var(--sidebar-border))",
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
                  <span style={{ color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{item.icon}</span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                  >
                    {item.label}
                  </span>
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

/* ── Sub-components reused across pages ──────────────────────────── */

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
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: "hsl(var(--muted-foreground))" }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      ) : (
        <div className="w-10" />
      )}
      <span className="font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>{title}</span>
      {right ?? <div className="w-10" />}
    </div>
  );
}

export function InkCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("rounded-[18px] p-4", className)}
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
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
    muted:   { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" },
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
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-[13px] flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "hsl(var(--secondary))" }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: "hsl(var(--foreground))" }}>{title}</p>
          <p className="text-[11.5px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{sub}</p>
        </div>
        <p className="font-extrabold text-sm flex-shrink-0" style={{ color: "hsl(var(--foreground))" }}>{amount}</p>
      </div>
      {/* Progress bar */}
      <div className="flex gap-1 mt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{ background: i < progress ? "hsl(var(--foreground))" : "hsl(var(--border))" }}
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
          ? { background: "hsl(var(--foreground))", color: "hsl(var(--background))" }
          : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
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
      style={{ background: "transparent", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
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
      <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[14px] px-4 py-4 text-sm font-semibold outline-none"
        style={{
          background: "hsl(var(--input))",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))",
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
      <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-[14px] px-4 py-4 text-sm font-semibold outline-none resize-none"
        style={{
          background: "hsl(var(--input))",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))",
        }}
      />
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex justify-between items-center py-3 text-sm"
      style={{ borderBottom: "1px solid hsl(var(--border))" }}
    >
      <span style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
      <span className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{value}</span>
    </div>
  );
}
