import { useLocation } from "wouter";
import { useGetMe, useGetDashboardSummary } from "@workspace/api-client-react";
import { Layout, InkCard } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/helpers";

export default function Profile() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: summary } = useGetDashboardSummary();

  const menuItems = [
    { icon: "🪪", label: "التحقق من الهوية", sub: "موثقة عبر نفاذ الوطني" },
    { icon: "💳", label: "وسائل الدفع", sub: "بطاقتان محفوظتان" },
    { icon: "📜", label: "سجل العمليات", sub: `${summary?.totalDeals ?? 0} عملية موثقة` },
    { icon: "🔔", label: "إعدادات الإشعارات", sub: "" },
    { icon: "🛟", label: "الدعم والمساعدة", sub: "" },
  ];

  return (
    <Layout>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold" style={{ color: "#E6E7E9" }}>الملف الشخصي</h2>
          <button
            className="w-10 h-10 rounded-[13px] flex items-center justify-center text-lg"
            style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            ⚙️
          </button>
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
                background: "linear-gradient(140deg, #4E5258, #33363B)",
                border: "2px solid rgba(255,255,255,0.1)",
                color: "#E6E7E9",
              }}
            >
              {user.name.charAt(0)}
            </div>
            <p className="text-lg font-extrabold" style={{ color: "#E6E7E9" }}>{user.name}</p>
            <span
              className="inline-flex items-center gap-1.5 mt-2 text-[11.5px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: "rgba(91,174,126,0.14)", color: "#5BAE7E" }}
            >
              ✓ هوية موثقة
            </span>
          </div>
        ) : null}

        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <InkCard className="text-center py-4">
              <p className="text-xl font-extrabold text-white">{summary.totalDeals}</p>
              <p className="text-[11px] mt-1" style={{ color: "#8A8F98" }}>إجمالي الصفقات</p>
            </InkCard>
            <InkCard className="text-center py-4">
              <p className="text-xl font-extrabold text-white">{formatAmount(summary.totalAmountEscrowed)}</p>
              <p className="text-[11px] mt-1" style={{ color: "#8A8F98" }}>محجوز حالياً</p>
            </InkCard>
          </div>
        )}

        {/* Menu */}
        <div className="space-y-2 mb-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 rounded-[15px] p-4 text-right"
              style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div
                className="w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
                style={{ background: "#3C3F44" }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold" style={{ color: "#C4C8CE" }}>{item.label}</p>
                {item.sub && (
                  <p className="text-[11px] mt-0.5" style={{ color: "#6B7178" }}>{item.sub}</p>
                )}
              </div>
              <span className="text-lg" style={{ color: "#6B7178" }}>‹</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          className="w-full flex items-center gap-3 rounded-[15px] p-4 text-right mt-2"
          style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.04)" }}
          onClick={() => navigate("/")}
        >
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
            style={{ background: "rgba(203,96,96,0.14)" }}
          >
            🚪
          </div>
          <p className="text-[13.5px] font-bold" style={{ color: "#CB6060" }}>تسجيل الخروج</p>
        </button>

        <div className="h-4" />
      </div>
    </Layout>
  );
}
