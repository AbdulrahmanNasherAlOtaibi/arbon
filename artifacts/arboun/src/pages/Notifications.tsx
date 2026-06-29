import { useLocation } from "wouter";
import { Layout, PageHeader } from "@/components/Layout";

const notifications = [
  { icon: "💸", bg: "rgba(91,174,126,0.14)", label: "تم دفع العربون", sub: "صفقة سيارة لكزس ES — 25,000 ر.س", time: "قبل ساعة" },
  { icon: "✓", bg: "rgba(91,174,126,0.14)", label: "اكتملت الصفقة", sub: "محل تجاري - حي العليا — 80,000 ر.س", time: "أمس" },
  { icon: "⏳", bg: "rgba(208,168,79,0.14)", label: "بانتظار تأكيدك", sub: "أرض تجارية - شمال الرياض", time: "أمس" },
  { icon: "✕", bg: "rgba(203,96,96,0.14)", label: "أُلغيت الصفقة", sub: "سيارة جمس يوكن — استُرجع العربون", time: "قبل 3 أيام" },
  { icon: "🔔", bg: "#3C3F44", label: "تذكير: مدة الحجز", sub: "تبقّى 12 يوماً على صفقة حي النرجس", time: "قبل 3 أيام" },
];

export default function Notifications() {
  const [, navigate] = useLocation();

  return (
    <Layout>
      <PageHeader title="الإشعارات" onBack={() => navigate("/dashboard")} />

      <div className="px-5 pb-6 space-y-2">
        {notifications.map((n, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-[15px] p-4"
            style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
              style={{ background: n.bg }}
            >
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-bold truncate" style={{ color: "#C4C8CE" }}>{n.label}</p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: "#6B7178" }}>{n.sub}</p>
            </div>
            <span className="text-[11px] flex-shrink-0" style={{ color: "#6B7178" }}>{n.time}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}
