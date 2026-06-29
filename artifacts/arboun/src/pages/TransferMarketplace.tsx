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
          <h2 className="text-xl font-extrabold" style={{ color: "#E6E7E9" }}>سوق التنازلات</h2>
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
            <p className="text-sm" style={{ color: "#8A8F98" }}>لا توجد صفقات معروضة حالياً</p>
          </InkCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((deal) => (
              <div
                key={deal.id}
                className="rounded-[18px] p-4"
                style={{ background: "#2B2D31", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-[10.5px] font-bold px-3 py-1 rounded-full"
                    style={{ background: "#3C3F44", color: "#8A8F98" }}
                  >
                    {typeLabel[deal.type] ?? "أخرى"}
                  </span>
                  <span className="text-base font-extrabold" style={{ color: "#E6E7E9" }}>
                    {formatAmount(deal.transferPrice ?? deal.amount)}
                  </span>
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: "#E6E7E9" }}>{deal.title}</p>
                <p className="text-[11.5px] mb-3" style={{ color: "#8A8F98" }}>
                  📍 {deal.propertyAddress ?? deal.vehicleInfo ?? "متاح للتنازل"}
                </p>
                <div
                  className="flex justify-between items-center pt-3"
                  style={{ borderTop: "1px solid #33363B" }}
                >
                  <p className="text-[11px]" style={{ color: "#8A8F98" }}>
                    عربون محجوز: <span className="font-bold" style={{ color: "#E6E7E9" }}>{formatAmount(deal.amount)}</span>
                  </p>
                  <button
                    className="text-[11.5px] font-bold px-4 py-2 rounded-full"
                    style={{ background: "#E6E7E9", color: "#1A1B1E" }}
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
            style={{ background: "#212327", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#45484E" }} />
            <p className="font-extrabold text-base mb-1" style={{ color: "#E6E7E9" }}>طلب التنازل</p>
            {selectedDealData && (
              <p className="text-[12px] mb-5" style={{ color: "#8A8F98" }}>{selectedDealData.title}</p>
            )}
            <InkInput
              label="السعر المقترح (ريال)"
              value={price}
              onChange={setPrice}
              placeholder="مثلاً: 50000"
              type="number"
            />
            <InkTextarea
              label="رسالة إضافية (اختياري)"
              value={message}
              onChange={setMessage}
              placeholder="اكتب ملاحظاتك..."
              rows={2}
            />
            <div className="flex gap-3">
              <SecondaryBtn onClick={() => { setSelectedDeal(null); setPrice(""); setMessage(""); }}>
                إلغاء
              </SecondaryBtn>
              <PrimaryBtn onClick={handleRequest} disabled={requestTransfer.isPending || !price}>
                {requestTransfer.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
