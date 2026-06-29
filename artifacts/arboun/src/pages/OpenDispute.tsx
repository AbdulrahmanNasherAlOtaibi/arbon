import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetDeal, useCreateDispute, getGetDealQueryKey } from "@workspace/api-client-react";
import {
  Layout,
  PageHeader,
  InkCard,
  Pill,
  PrimaryBtn,
  SecondaryBtn,
  statusToPillVariant,
} from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate, statusLabel, typeIcon } from "@/lib/helpers";

interface Props { id: number; }

const reasons = [
  "تراجع الطرف الآخر عن الصفقة",
  "عدم الالتزام بالشروط المتفق عليها",
  "سبب آخر",
];

export default function OpenDispute({ id }: Props) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: deal, isLoading } = useGetDeal(id);
  const createDispute = useCreateDispute();

  const [selectedReason, setSelectedReason] = useState(0);
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    const reason = reasons[selectedReason];
    try {
      await createDispute.mutateAsync({
        id,
        data: { reason, ...(evidence.trim() ? { evidence } : {}) },
      });
      await queryClient.invalidateQueries({ queryKey: getGetDealQueryKey(id) });
      navigate(`/deals/${id}`);
    } catch {
      setError("حدث خطأ أثناء فتح النزاع. يرجى المحاولة مجدداً.");
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <PageHeader title="فتح نزاع" onBack={() => navigate(`/deals/${id}`)} />
        <div className="px-5 space-y-3">
          <Skeleton className="h-24 rounded-[18px]" />
          <Skeleton className="h-40 rounded-[18px]" />
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout>
        <PageHeader title="فتح نزاع" onBack={() => navigate("/deals")} />
        <div className="px-5 text-center py-16">
          <p className="font-semibold" style={{ color: "#8A8F98" }}>الصفقة غير موجودة</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader title="فتح نزاع" onBack={() => navigate(`/deals/${id}`)} />

      <div className="px-5 pb-8 space-y-4">
        {/* Info */}
        <p className="text-[12.5px] leading-relaxed" style={{ color: "#8A8F98" }}>
          سيتولى محكّم معتمد دراسة الحالة وإصدار قرار خلال 48 ساعة. سيتم تجميد المبلغ حتى صدور القرار.
        </p>

        {/* Deal card */}
        <InkCard className="flex items-center gap-3 p-4">
          <div
            className="w-11 h-11 rounded-[13px] flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "#3C3F44" }}
          >
            {typeIcon[deal.type] ?? "📄"}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: "#E6E7E9" }}>{deal.title}</p>
            <p className="text-[11.5px] mt-0.5" style={{ color: "#8A8F98" }}>
              {formatAmount(deal.amount)} · {formatDate(deal.deadline)}
            </p>
          </div>
          <Pill variant={statusToPillVariant(deal.status)}>{statusLabel[deal.status] ?? deal.status}</Pill>
        </InkCard>

        {/* Reason selection */}
        <div>
          <label className="block text-[12.5px] font-bold mb-3" style={{ color: "#A8ADB5" }}>سبب النزاع</label>
          <div className="space-y-2">
            {reasons.map((r, i) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedReason(i)}
                className="w-full text-right py-4 px-4 rounded-[14px] text-sm font-semibold transition-all"
                style={
                  selectedReason === i
                    ? { background: "#E6E7E9", color: "#1A1B1E", border: "1px solid #E6E7E9" }
                    : { background: "#2B2D31", color: "#A8ADB5", border: "1px solid rgba(255,255,255,0.07)" }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <div>
          <label className="block text-[12.5px] font-bold mb-2" style={{ color: "#A8ADB5" }}>تفاصيل إضافية</label>
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="اشرح المشكلة باختصار..."
            rows={4}
            className="w-full rounded-[14px] px-4 py-4 text-sm font-semibold outline-none resize-none"
            style={{
              background: "#2B2D31",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#E6E7E9",
            }}
          />
        </div>

        {/* Attach */}
        <InkCard className="text-center py-6 cursor-pointer">
          <p className="text-2xl mb-2">📎</p>
          <p className="text-xs" style={{ color: "#8A8F98" }}>اضغط لإرفاق صور أو مستندات داعمة</p>
        </InkCard>

        {error && (
          <p className="text-[12px] text-center font-semibold" style={{ color: "#CB6060" }}>{error}</p>
        )}

        <PrimaryBtn onClick={handleSubmit} disabled={createDispute.isPending}>
          {createDispute.isPending ? "جاري فتح النزاع..." : "تقديم النزاع"}
        </PrimaryBtn>
        <SecondaryBtn onClick={() => navigate(`/deals/${id}`)}>إلغاء</SecondaryBtn>
      </div>
    </Layout>
  );
}
