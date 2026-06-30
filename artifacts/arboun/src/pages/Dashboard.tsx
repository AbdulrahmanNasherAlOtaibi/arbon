import { Link, useLocation } from "wouter";
import {
  useGetDashboardSummary,
  useGetRecentActivity,
  useGetMe,
} from "@workspace/api-client-react";
import {
  Layout,
  InkCard,
  Pill,
  DealCard,
  statusToPillVariant,
} from "@/components/Layout";
import { formatAmount, formatDateTime, statusLabel, typeIcon } from "@/lib/helpers";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: me } = useGetMe();

  return (
    <Layout>
      <div className="px-5 py-2 space-y-5">
        {/* Greeting */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
              أهلاً،{" "}
              <span style={{ color: "hsl(var(--foreground))" }}>
                {me?.name?.split(" ")[0] ?? "مستخدم"}
              </span>
            </p>
          </div>
          <Link href="/deals/new">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            >
              <span className="text-base">＋</span>
              صفقة جديدة
            </button>
          </Link>
        </div>

        {/* Balance Card */}
        {summaryLoading ? (
          <Skeleton className="h-44 rounded-3xl" />
        ) : summary ? (
          <div
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(150deg, hsl(var(--secondary)) 0%, hsl(var(--muted)) 55%, hsl(var(--background)) 100%)",
              border: "1px solid hsl(var(--border))",
            }}
          >
            {/* Glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: -60,
                left: -40,
                width: 220,
                height: 220,
                background: "radial-gradient(circle, rgba(220,224,230,0.1), transparent 65%)",
              }}
            />
            {/* Shield watermark */}
            <svg
              className="absolute"
              style={{ bottom: -30, left: -10, opacity: 0.06, transform: "rotate(-12deg)" }}
              width="140"
              height="160"
              viewBox="0 0 100 100"
            >
              <path d="M50 4 L90 26 V62 C90 79 72 91 50 96 C28 91 10 79 10 62 V26 Z" fill="#E6E7E9" />
            </svg>

            <p
              className="flex items-center gap-2 text-[13px] font-semibold mb-2 relative z-10"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              🛡️ الرصيد المحجوز
            </p>
            <p
              className="font-extrabold mb-5 relative z-10"
              style={{ fontSize: 34, color: "hsl(var(--foreground))", letterSpacing: -1 }}
            >
              {summary.totalAmountEscrowed.toLocaleString("ar-SA")}
              <span className="text-lg font-semibold ml-2" style={{ color: "hsl(var(--muted-foreground))" }}>ر.س</span>
            </p>
            <div className="flex gap-3 relative z-10">
              {[
                { n: summary.activeDeals, l: "صفقات نشطة" },
                { n: summary.completedDeals, l: "صفقات مكتملة" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="flex-1 rounded-[14px] p-3"
                  style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
                >
                  <p className="text-lg font-extrabold" style={{ color: "hsl(var(--foreground))" }}>{s.n}</p>
                  <p className="text-[11px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "➕", label: "صفقة جديدة", href: "/deals/new" },
            { icon: "🔁", label: "سوق التنازلات", href: "/transfers/marketplace" },
            { icon: "📄", label: "النماذج", href: "/templates" },
          ].map((qa) => (
            <Link key={qa.href} href={qa.href}>
              <div
                className="rounded-[16px] py-4 flex flex-col items-center gap-2"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
              >
                <div
                  className="w-10 h-10 rounded-[11px] flex items-center justify-center text-lg"
                  style={{ background: "hsl(var(--secondary))" }}
                >
                  {qa.icon}
                </div>
                <span className="text-[11.5px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>{qa.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Deals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold" style={{ color: "hsl(var(--foreground))" }}>آخر الصفقات</h3>
            <Link href="/deals">
              <span className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>عرض الكل</span>
            </Link>
          </div>

          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-[18px]" />)}
            </div>
          ) : activity && activity.length > 0 ? (
            activity.slice(0, 5).map((event) => (
              <DealCard
                key={event.id}
                icon={event.dealTitle?.includes("سيارة") || event.dealTitle?.includes("لكزس") || event.dealTitle?.includes("تويوتا") ? "🚗"
                  : event.dealTitle?.includes("أرض") || event.dealTitle?.includes("تجاري") || event.dealTitle?.includes("محل") ? "🏢"
                  : "🏠"}
                title={event.dealTitle ?? "صفقة"}
                sub={formatDateTime(event.createdAt)}
                amount={event.amount ? formatAmount(event.amount) : ""}
                status={
                  event.event === "completed" || event.event === "buyer_signed" || event.event === "seller_signed"
                    ? "success"
                    : event.event === "cancelled" || event.event === "forfeited"
                    ? event.event === "forfeited" ? "danger" : "muted"
                    : event.event === "disputed"
                    ? "warning"
                    : "warning"
                }
                statusText={event.description ?? ""}
                progress={
                  event.event === "completed" ? 4
                  : event.event === "seller_signed" || event.event === "buyer_signed" ? 3
                  : event.event === "created" ? 1
                  : 2
                }
                onClick={() => navigate(`/deals/${event.dealId}`)}
              />
            ))
          ) : (
            <InkCard className="text-center py-10">
              <p className="text-2xl mb-2">🔒</p>
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>لا يوجد نشاط بعد</p>
              <Link href="/deals/new">
                <p className="text-xs mt-2 font-bold" style={{ color: "hsl(var(--foreground))" }}>أنشئ أول صفقة →</p>
              </Link>
            </InkCard>
          )}
        </div>
      </div>
    </Layout>
  );
}
