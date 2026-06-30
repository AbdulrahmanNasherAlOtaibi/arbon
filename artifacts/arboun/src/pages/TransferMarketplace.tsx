import { useState } from "react";
import { useListMarketplaceDeals, useRequestTransfer, useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Layout,
  FilterChip,
  InkCard,
  PrimaryBtn,
  SecondaryBtn,
  InkInput,
  InkTextarea,
} from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, typeLabel } from "@/lib/helpers";

const typeOptions = [
  { value: "", label: "الكل" },
  { value: "real_estate", label: "عقار" },
  { value: "vehicle", label: "سيارات" },
  { value: "business", label: "تجاري" },
];

const typeIcons: Record<string, string> = {
  real_estate: "🏠",
  vehicle: "🚗",
  business: "🏪",
  other: "📦",
};

export default function TransferMarketplace() {
  const queryClient = useQueryClient();
  const { data: deals, isLoading } = useListMarketplaceDeals({}, { query: { queryKey: ["listMarketplaceDeals"] } });
  const { data: me } = useGetMe();
  const requestTransfer = useRequestTransfer();

  const [selectedType, setSelectedType] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  const filtered = !deals ? [] : selectedType ? deals.filter((d) => d.type === selectedType) : deals;

  async function handleRequest() {
    if (!selectedDeal || !price) return;
    try {
      await requestTransfer.mutateAsync({
        id: selectedDeal,
        data: { dealId: selectedDeal, price: Number(price), ...(message ? { message } : {}) },
      });
      await queryClient.invalidateQueries({ queryKey: ["getTransferRequests"] });
      setSelectedDeal(null);
      setPrice("");
      setMessage("");
    } catch {}
  }

  const selectedDealData = deals?.find((d) => d.id === selectedDeal);

  return (
    <Layout>
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>سوق التنازلات</h2>
          <button
            className="w-10 h-10 rounded-[13px] flex items-center justify-center"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: "hsl(var(--muted-foreground))" }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-1">
          {typeOptions.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={selectedType === opt.value}
              onClick={() => setSelectedType(opt.value)}
            />
          ))}
        </div>

        {/* Market cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-[18px]" />)}
          </div>
        ) : filtered.length === 0 ? (
          <InkCard className="text-center py-12">
            <p className="text-3xl mb-2">🔁</p>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>لا توجد صفقات معروضة حالياً</p>
          </InkCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((deal) => (
              <div
                key={deal.id}
                className="rounded-[18px] p-4"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-[10.5px] font-bold px-3 py-1 rounded-full"
                    style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
                  >
                    {typeLabel[deal.type] ?? "أخرى"}
                  </span>
                  <span className="text-base font-extrabold" style={{ color: "hsl(var(--foreground))" }}>
                    {formatAmount(deal.transferPrice ?? deal.amount)}
                  </span>
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: "hsl(var(--foreground))" }}>{deal.title}</p>
                <p className="text-[11.5px] mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                  📍 {deal.propertyAddress ?? deal.vehicleInfo ?? "متاح للتنازل"}
                </p>
                <div
                  className="flex justify-between items-center pt-3"
                  style={{ borderTop: "1px solid hsl(var(--border))" }}
                >
                  <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    عربون محجوز: <span className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{formatAmount(deal.amount)}</span>
                  </p>
                  <button
                    className="text-[11.5px] font-bold px-4 py-2 rounded-full"
                    style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))" }}
                    onClick={() => { setSelectedDeal(deal.id); setPrice(String(deal.transferPrice ?? deal.amount)); }}
                  >
                    طلب التنازل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transfer Request Overlay */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div
            className="w-full rounded-t-3xl p-6"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "hsl(var(--border))" }} />
            <p className="font-extrabold text-base mb-1" style={{ color: "hsl(var(--foreground))" }}>طلب التنازل</p>
            {selectedDealData && (
              <p className="text-[12px] mb-5" style={{ color: "hsl(var(--muted-foreground))" }}>{selectedDealData.title}</p>
            )}
            <InkInput
              label="السعر المقترح (ريال)"
              value={price}
              onChange={setPrice}
              placeholder="مثلاً: 50000"
              type="number"
            />
            <InkTextarea
              label="رسالة (اختياري)"
              value={message}
              onChange={setMessage}
              placeholder="أخبر البائع لماذا تريد التنازل..."
              rows={2}
            />
            <PrimaryBtn onClick={handleRequest} disabled={requestTransfer.isPending}>
              {requestTransfer.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
            </PrimaryBtn>
            <div className="h-2" />
            <SecondaryBtn onClick={() => setSelectedDeal(null)}>إلغاء</SecondaryBtn>
          </div>
        </div>
      )}
    </Layout>
  );
}
