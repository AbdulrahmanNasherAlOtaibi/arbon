import { Link, useLocation } from "wouter";
import { useGetMe, useGetDashboardSummary } from "@workspace/api-client-react";
import { Layout, InkCard } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/helpers";
import { useTx } from "@/lib/translations";

export default function Profile() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: summary } = useGetDashboardSummary();
  const tx = useTx();

  const menuItems = [
    { icon: "🪪", label: tx("profile_verify_id"), sub: "موثقة عبر نفاذ الوطني" },
    { icon: "💳", label: tx("profile_payment_methods"), sub: "بطاقتان محفوظتان" },
    { icon: "📜", label: tx("profile_transaction_history"), sub: `${summary?.totalDeals ?? 0} عملية موثقة` },
    { icon: "🔔", label: tx("profile_notification_settings"), sub: "" },
    { icon: "🛟", label: tx("profile_support"), sub: "" },
  ];

  return (
    <Layout>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>{tx("profile_title")}</h2>
          <Link href="/settings">
            <button
              className="w-10 h-10 rounded-[13px] flex items-center justify-center text-lg"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
            >
              ⚙️
            </button>
          </Link>
        </div>

        {/* Avatar + Name */}
        {userLoading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-5 w-36" />
          </div>
        ) : user ? (
          <div className="flex flex-col items-center pb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold mb-3"
              style={{
                background: "linear-gradient(140deg, hsl(var(--secondary)), hsl(var(--muted)))",
                border: "2px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            >
              {user.name.charAt(0)}
            </div>
            <p className="text-lg font-extrabold" style={{ color: "hsl(var(--foreground))" }}>{user.name}</p>
            <span
              className="inline-flex items-center gap-1.5 mt-2 text-[11.5px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: "rgba(91,174,126,0.14)", color: "#5BAE7E" }}
            >
              ✓ {tx("profile_verified")}
            </span>
          </div>
        ) : null}

        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <InkCard className="text-center py-4">
              <p className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>{summary.totalDeals}</p>
              <p className="text-[11px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{tx("profile_total_deals")}</p>
            </InkCard>
            <InkCard className="text-center py-4">
              <p className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>{formatAmount(summary.totalAmountEscrowed)}</p>
              <p className="text-[11px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{tx("profile_total_escrowed")}</p>
            </InkCard>
          </div>
        )}

        {/* Menu */}
        <div className="space-y-2 mb-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 rounded-[15px] p-4 text-right"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
            >
              <div
                className="w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
                style={{ background: "hsl(var(--secondary))" }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold" style={{ color: "hsl(var(--foreground))" }}>{item.label}</p>
                {item.sub && (
                  <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{item.sub}</p>
                )}
              </div>
              <span className="text-lg" style={{ color: "hsl(var(--muted-foreground))" }}>‹</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          className="w-full flex items-center gap-3 rounded-[15px] p-4 text-right mt-2"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
          onClick={() => navigate("/")}
        >
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
            style={{ background: "rgba(203,96,96,0.14)" }}
          >
            🚪
          </div>
          <p className="text-[13.5px] font-bold" style={{ color: "#CB6060" }}>{tx("profile_logout")}</p>
        </button>

        <div className="h-4" />
      </div>
    </Layout>
  );
}
