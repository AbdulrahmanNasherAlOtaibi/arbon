import { useState } from "react";
import { useLocation } from "wouter";
import { useListDeals } from "@workspace/api-client-react";
import {
  Layout,
  FilterChip,
  DealCard,
  InkCard,
  statusToPillVariant,
} from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate, statusLabel, typeIcon } from "@/lib/helpers";

const statusOptions = [
  { value: "", label: "الكل" },
  { value: "active", label: "نشطة" },
  { value: "completed", label: "مكتملة" },
  { value: "cancelled", label: "ملغاة" },
  { value: "disputed", label: "متنازع" },
];

const statusToPill: Record<string, "success" | "warning" | "danger" | "muted"> = {
  pending: "warning",
  active: "success",
  completed: "success",
  cancelled: "muted",
  disputed: "warning",
  refunded: "muted",
  forfeited: "danger",
};

const progressMap: Record<string, number> = {
  pending: 1,
  active: 2,
  completed: 4,
  cancelled: 1,
  disputed: 2,
  forfeited: 1,
};

export default function Deals() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState("");

  const { data: deals, isLoading } = useListDeals(
    status ? { status: status as "pending" | "active" | "completed" | "cancelled" | "disputed" | "refunded" | "forfeited" } : {},
    { query: { queryKey: ["listDeals", status] } }
  );

  return (
    <Layout>
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold" style={{ color: "#E6E7E9" }}>الصفقات</h2>
          <button
            className="w-10 h-10 rounded-[13px] flex items-center justify-center"
            style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#A8ADB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4 pb-1">
          {statusOptions.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={status === opt.value}
              onClick={() => setStatus(opt.value)}
            />
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-[18px]" />)}
          </div>
        ) : !deals || deals.length === 0 ? (
          <InkCard className="text-center py-12 mt-4">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-semibold text-sm" style={{ color: "#8A8F98" }}>لا توجد صفقات</p>
          </InkCard>
        ) : (
          <div>
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                icon={typeIcon[deal.type] ?? "📄"}
                title={deal.title}
                sub={`${deal.buyerName ?? ""} · #AR-${deal.id}`}
                amount={formatAmount(deal.amount)}
                status={statusToPill[deal.status] ?? "muted"}
                statusText={statusLabel[deal.status] ?? deal.status}
                progress={progressMap[deal.status] ?? 2}
                onClick={() => navigate(`/deals/${deal.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
