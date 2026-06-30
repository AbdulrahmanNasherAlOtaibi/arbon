import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useGetDashboardSummary } from "@workspace/api-client-react";
import { Layout, InkCard } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/helpers";
import { useTx } from "@/lib/translations";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";

type Sheet = "identity" | "payment" | "support" | "appearance" | null;

export default function Profile() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: summary } = useGetDashboardSummary();
  const tx = useTx();
  const { theme, language, setTheme, setLanguage } = useSettings();
  const [sheet, setSheet] = useState<Sheet>(null);

  const menuItems: { icon: string; label: string; sub: string; action: () => void }[] = [
    {
      icon: "🪪",
      label: tx("profile_verify_id"),
      sub: "موثقة عبر نفاذ الوطني",
      action: () => setSheet("identity"),
    },
    {
      icon: "💳",
      label: tx("profile_payment_methods"),
      sub: "بطاقتان محفوظتان",
      action: () => setSheet("payment"),
    },
    {
      icon: "📜",
      label: tx("profile_transaction_history"),
      sub: `${summary?.totalDeals ?? 0} عملية موثقة`,
      action: () => navigate("/deals"),
    },
    {
      icon: "🔔",
      label: tx("profile_notification_settings"),
      sub: "",
      action: () => navigate("/notifications"),
    },
    {
      icon: "🎨",
      label: language === "ar" ? "اللغة والمظهر" : "Language & Appearance",
      sub: language === "ar"
        ? (theme === "dark" ? "داكن" : theme === "light" ? "فاتح" : "تلقائي") + " · " + "العربية"
        : (theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System") + " · English",
      action: () => setSheet("appearance"),
    },
    {
      icon: "🛟",
      label: tx("profile_support"),
      sub: "",
      action: () => setSheet("support"),
    },
  ];

  const themeOptions: { value: "dark" | "light" | "system"; label: string; icon: string }[] = [
    { value: "dark", label: language === "ar" ? "داكن" : "Dark", icon: "☽" },
    { value: "light", label: language === "ar" ? "فاتح" : "Light", icon: "☀︎" },
    { value: "system", label: language === "ar" ? "تلقائي" : "System", icon: "⚙︎" },
  ];

  const langOptions: { value: "ar" | "en"; label: string }[] = [
    { value: "ar", label: "العربية" },
    { value: "en", label: "English" },
  ];

  return (
    <Layout>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>
            {tx("profile_title")}
          </h2>
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
            <p className="text-lg font-extrabold" style={{ color: "hsl(var(--foreground))" }}>
              {user.name}
            </p>
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
              <p className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>
                {summary.totalDeals}
              </p>
              <p className="text-[11px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                {tx("profile_total_deals")}
              </p>
            </InkCard>
            <InkCard className="text-center py-4">
              <p className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>
                {formatAmount(summary.totalAmountEscrowed)}
              </p>
              <p className="text-[11px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                {tx("profile_total_escrowed")}
              </p>
            </InkCard>
          </div>
        )}

        {/* Menu */}
        <div className="space-y-2 mb-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 rounded-[15px] p-4 text-right active:opacity-70 transition-opacity"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
            >
              <div
                className="w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
                style={{ background: "hsl(var(--secondary))" }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[13.5px] font-bold" style={{ color: "hsl(var(--foreground))" }}>
                  {item.label}
                </p>
                {item.sub && (
                  <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {item.sub}
                  </p>
                )}
              </div>
              <span className="text-lg" style={{ color: "hsl(var(--muted-foreground))" }}>‹</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          className="w-full flex items-center gap-3 rounded-[15px] p-4 text-right mt-2 active:opacity-70 transition-opacity"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
          onClick={() => navigate("/")}
        >
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
            style={{ background: "rgba(203,96,96,0.14)" }}
          >
            🚪
          </div>
          <p className="text-[13.5px] font-bold" style={{ color: "#CB6060" }}>
            {tx("profile_logout")}
          </p>
        </button>

        <div className="h-4" />
      </div>

      {/* Bottom sheets */}
      {sheet && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setSheet(null)}
        >
          <div
            className="w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto scrollbar-none"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* drag handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "hsl(var(--border))" }} />

            {/* ── Identity sheet ── */}
            {sheet === "identity" && (
              <>
                <p className="text-center text-base font-extrabold mb-4" style={{ color: "hsl(var(--foreground))" }}>
                  🪪 {tx("profile_verify_id")}
                </p>
                <div
                  className="rounded-[15px] p-4 mb-3 flex items-center gap-3"
                  style={{ background: "rgba(91,174,126,0.10)", border: "1px solid rgba(91,174,126,0.25)" }}
                >
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#5BAE7E" }}>هوية موثقة</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                      تم التوثيق عبر نفاذ الوطني بتاريخ ١٥ محرم ١٤٤٨
                    </p>
                  </div>
                </div>
                <InkCard>
                  <p className="text-[13px] font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>
                    {user?.name ?? "—"}
                  </p>
                  <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    رقم الهوية: ••••••••12
                  </p>
                </InkCard>
              </>
            )}

            {/* ── Payment sheet ── */}
            {sheet === "payment" && (
              <>
                <p className="text-center text-base font-extrabold mb-4" style={{ color: "hsl(var(--foreground))" }}>
                  💳 {tx("profile_payment_methods")}
                </p>
                {[
                  { label: "فيزا •••• 4242", sub: "تنتهي 12/27", icon: "💳" },
                  { label: "ماستركارد •••• 8881", sub: "تنتهي 09/26", icon: "🏦" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="flex items-center gap-3 rounded-[14px] p-4 mb-2"
                    style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                  >
                    <span className="text-xl">{card.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>{card.label}</p>
                      <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{card.sub}</p>
                    </div>
                  </div>
                ))}
                <button
                  className="w-full rounded-[14px] py-3.5 mt-2 text-sm font-bold"
                  style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", border: "1px dashed hsl(var(--border))" }}
                >
                  + إضافة بطاقة جديدة
                </button>
              </>
            )}

            {/* ── Support sheet ── */}
            {sheet === "support" && (
              <>
                <p className="text-center text-base font-extrabold mb-4" style={{ color: "hsl(var(--foreground))" }}>
                  🛟 {tx("profile_support")}
                </p>
                {[
                  { icon: "💬", label: "المحادثة الفورية", sub: "متاح 24/7" },
                  { icon: "📧", label: "البريد الإلكتروني", sub: "support@arbon.sa" },
                  { icon: "📞", label: "الهاتف", sub: "920-000-000" },
                  { icon: "📖", label: "مركز المساعدة", sub: "الأسئلة الشائعة والدليل" },
                ].map((ch) => (
                  <div
                    key={ch.label}
                    className="flex items-center gap-3 rounded-[14px] p-4 mb-2"
                    style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                  >
                    <div
                      className="w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: "hsl(var(--card))" }}
                    >
                      {ch.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>{ch.label}</p>
                      <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{ch.sub}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── Appearance sheet ── */}
            {sheet === "appearance" && (
              <>
                <p className="text-center text-base font-extrabold mb-5" style={{ color: "hsl(var(--foreground))" }}>
                  🎨 {language === "ar" ? "اللغة والمظهر" : "Language & Appearance"}
                </p>

                {/* Language */}
                <p className="text-xs font-bold mb-2 px-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {language === "ar" ? "اللغة" : "Language"}
                </p>
                <div className="flex gap-2 mb-5">
                  {langOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLanguage(opt.value)}
                      className="flex-1 py-3 rounded-[13px] text-sm font-bold transition-all"
                      style={
                        language === opt.value
                          ? { background: "hsl(var(--foreground))", color: "hsl(var(--background))" }
                          : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Theme */}
                <p className="text-xs font-bold mb-2 px-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {language === "ar" ? "المظهر" : "Theme"}
                </p>
                <div className="flex gap-2 mb-2">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className="flex-1 py-3 rounded-[13px] text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={
                        theme === opt.value
                          ? { background: "hsl(var(--foreground))", color: "hsl(var(--background))" }
                          : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }
                      }
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-center text-[11px] mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {language === "ar" ? "يُحفظ تلقائياً" : "Saved automatically"}
                </p>
              </>
            )}

            {/* Close */}
            <button
              className="w-full mt-5 py-3.5 rounded-[14px] text-sm font-bold"
              style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
              onClick={() => setSheet(null)}
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
