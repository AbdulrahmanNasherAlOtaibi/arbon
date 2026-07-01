import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetDeal,
  useGetDealContract,
  useGetDealTimeline,
  useSignContract,
  useCompleteDeal,
  useCancelDeal,
  useForfeitDeal,
  useGetMe,
  useListForTransfer,
  useUnlistForTransfer,
  getGetDealQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentActivityQueryKey,
} from "@workspace/api-client-react";
import {
  Layout,
  PageHeader,
  InkCard,
  Pill,
  PrimaryBtn,
  SecondaryBtn,
  DangerBtn,
  InfoRow,
  statusToPillVariant,
} from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatAmount, formatDate, formatDateTime, statusLabel, typeIcon } from "@/lib/helpers";

interface Props { id: number; }
type ActionType = "complete" | "cancel" | "forfeit" | "list" | null;

const stepLabels = ["محجوز", "تم الدفع", "تم التأكيد", "مكتملة"];

function statusToStep(status: string): number {
  const map: Record<string, number> = {
    pending: 1,
    active: 2,
    completed: 4,
    cancelled: 1,
    disputed: 2,
    forfeited: 1,
  };
  return map[status] ?? 1;
}

export default function DealDetail({ id }: Props) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: deal, isLoading } = useGetDeal(id);
  const { data: contract } = useGetDealContract(id);
  const { data: timeline } = useGetDealTimeline(id);
  const { data: me } = useGetMe();

  const signContract = useSignContract();
  const completeDeal = useCompleteDeal();
  const cancelDeal = useCancelDeal();
  const forfeitDeal = useForfeitDeal();
  const listForTransfer = useListForTransfer();
  const unlistForTransfer = useUnlistForTransfer();

  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [listPrice, setListPrice] = useState("");
  const [listDesc, setListDesc] = useState("");
  const [showContract, setShowContract] = useState(false);

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetDealQueryKey(id) }),
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() }),
    ]);
  }

  async function handleSign() {
    await signContract.mutateAsync({ id });
    await invalidate();
  }

  async function handleAction() {
    if (activeAction === "list") {
      setActionLoading(true);
      try {
        await listForTransfer.mutateAsync({
          id,
          data: {
            ...(listPrice ? { price: Number(listPrice) } : {}),
            ...(listDesc ? { description: listDesc } : {}),
          },
        });
        await invalidate();
        await queryClient.invalidateQueries({ queryKey: ["getMyListedDeals"] });
        setActiveAction(null);
        setListPrice("");
        setListDesc("");
      } finally {
        setActionLoading(false);
      }
      return;
    }
    if (!reason.trim() && activeAction !== "complete") return;
    setActionLoading(true);
    try {
      if (activeAction === "complete") {
        await completeDeal.mutateAsync({ id });
      } else if (activeAction === "cancel") {
        await cancelDeal.mutateAsync({ id, data: { reason } });
      } else if (activeAction === "forfeit") {
        await forfeitDeal.mutateAsync({ id, data: { reason } });
      }
      await invalidate();
      setActiveAction(null);
      setReason("");
    } finally {
      setActionLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <PageHeader title="تفاصيل الصفقة" onBack={() => navigate("/deals")} />
        <div className="px-5 space-y-3">
          <Skeleton className="h-32 rounded-[18px]" />
          <Skeleton className="h-48 rounded-[18px]" />
          <Skeleton className="h-48 rounded-[18px]" />
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout>
        <PageHeader title="تفاصيل الصفقة" onBack={() => navigate("/deals")} />
        <div className="px-5 text-center py-16">
          <p className="font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>الصفقة غير موجودة</p>
          <button className="mt-4 text-sm font-bold" style={{ color: "hsl(var(--foreground))" }} onClick={() => navigate("/deals")}>
            العودة للصفقات
          </button>
        </div>
      </Layout>
    );
  }

  const isBuyer = me?.id === deal.buyerId;
  const isSeller = me?.id === deal.sellerId;
  const isActive = deal.status === "active";
  const isPending = deal.status === "pending";
  const canSign = (isBuyer && !deal.buyerSigned) || (isSeller && !deal.sellerSigned);
  const canAct = (isActive || isPending) && (isBuyer || isSeller);
  const currentStep = statusToStep(deal.status);

  const actionLabels: Record<string, string> = {
    complete: "تأكيد إتمام الصفقة",
    cancel: "الانسحاب واسترداد العربون",
    forfeit: "الانسحاب واسترداد العربون",
    list: "عرض الصفقة للتنازل",
  };

  return (
    <Layout>
      <PageHeader
        title="تفاصيل الصفقة"
        onBack={() => navigate("/deals")}
        right={
          <button
            className="w-10 h-10 rounded-[13px] flex items-center justify-center text-lg"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
          >
            ⋯
          </button>
        }
      />

      <div className="px-5 pb-8 space-y-4">
        {/* Hero */}
        <div className="text-center py-4">
          <div
            className="w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl mx-auto mb-3"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
          >
            {typeIcon[deal.type] ?? "📄"}
          </div>
          <p className="text-3xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>
            {Number(deal.amount ?? 0).toLocaleString("ar-SA")}
            <span className="text-lg font-semibold mr-1" style={{ color: "hsl(var(--muted-foreground))" }}> ر.س</span>
          </p>
          <p className="text-[13px] mt-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>{deal.title}</p>
        </div>

        {/* Stepper */}
        <div className="flex relative">
          {stepLabels.map((label, i) => {
            const step = i + 1;
            const isDone = step < currentStep;
            const isCur = step === currentStep;
            return (
              <div key={label} className="flex-1 flex flex-col items-center relative">
                {/* connector line */}
                {i > 0 && (
                  <div
                    className="absolute top-[15px] right-1/2 w-full h-0.5"
                    style={{ background: step <= currentStep ? "hsl(var(--foreground))" : "hsl(var(--border))", zIndex: 1 }}
                  />
                )}
                {/* circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold relative z-10 mb-2"
                  style={
                    isDone
                      ? { background: "hsl(var(--foreground))", color: "hsl(var(--background))", border: "2px solid hsl(var(--background))" }
                      : isCur
                      ? { background: "hsl(var(--background))", color: "hsl(var(--foreground))", border: "2px solid hsl(var(--foreground))" }
                      : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", border: "2px solid hsl(var(--background))" }
                  }
                >
                  {isDone ? "✓" : step}
                </div>
                <span
                  className="text-[9.5px] font-semibold text-center"
                  style={{ color: isDone || isCur ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status pill */}
        <div className="text-center">
          <Pill variant={statusToPillVariant(deal.status)}>
            {statusLabel[deal.status] ?? deal.status}
          </Pill>
        </div>

        {/* Info boxes */}
        <InkCard className="py-0 px-0 overflow-hidden">
          <div className="px-4 last-of-type:border-b-0">
            <InfoRow label="رقم الصفقة" value={`#AR-${deal.id}`} />
            <InfoRow label="المشتري" value={deal.buyerName ?? "-"} />
            <InfoRow label="البائع" value={deal.sellerName ?? "-"} />
            <InfoRow label="تاريخ الإنشاء" value={formatDate(deal.createdAt ?? new Date().toISOString())} />
            <InfoRow label="الموعد النهائي" value={formatDate(deal.deadline)} />
          </div>
        </InkCard>

        <InkCard className="py-0 px-0 overflow-hidden">
          <div className="px-4">
            <InfoRow label="قيمة العربون" value={formatAmount(deal.amount)} />
            <InfoRow label="رسوم المنصة (٢٪)" value={formatAmount(deal.platformFee ?? 0)} />
            <div className="flex justify-between items-center py-3 text-sm">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>صافي المبلغ للبائع</span>
              <span className="font-extrabold" style={{ color: "hsl(var(--foreground))" }}>
                {formatAmount((deal.amount ?? 0) - (deal.platformFee ?? 0))}
              </span>
            </div>
          </div>
        </InkCard>

        {/* Sign contract */}
        {canSign && (
          <PrimaryBtn onClick={handleSign} disabled={signContract.isPending}>
            {signContract.isPending ? "جاري التوقيع..." : "✎ توقيع على العقد"}
          </PrimaryBtn>
        )}

        {/* Contract */}
        {contract && (
          <>
            <PrimaryBtn onClick={() => setShowContract(true)}>عرض العقد الرقمي</PrimaryBtn>

            {/* Contract sheet */}
            {showContract && (
              <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.7)" }}>
                <div
                  className="w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto scrollbar-none"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                >
                  <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "hsl(var(--border))" }} />
                  <div className="text-center mb-5">
                    <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>عقد عربون موثق</p>
                    <p className="text-[11px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>#AR-{deal.id} · موثّق إلكترونياً</p>
                  </div>
                  <InkCard className="mb-4">
                    <InfoRow label="البائع" value={deal.sellerName ?? "-"} />
                    <InfoRow label="المشتري" value={deal.buyerName ?? "-"} />
                    <InfoRow label="العربون" value={formatAmount(deal.amount)} />
                  </InkCard>
                  <InkCard className="mb-4">
                    <p className="text-[13px] font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>شروط الاسترجاع والمصادرة</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {contract.refundConditions}
                    </p>
                    <div className="h-px my-3" style={{ background: "hsl(var(--border))" }} />
                    <p className="text-[12px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {contract.forfeitureConditions}
                    </p>
                  </InkCard>
                  <div
                    className="flex items-center justify-center gap-2 text-[11.5px] font-bold mb-5"
                    style={{ color: "#5BAE7E" }}
                  >
                    🔏 موثّق بطابع زمني · مقبول في المحاكم
                  </div>
                  <SecondaryBtn onClick={() => setShowContract(false)}>العودة للصفقة</SecondaryBtn>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        {canAct && deal.status !== "completed" && deal.status !== "cancelled" && deal.status !== "forfeited" && (
          <div className="space-y-2">
            {isActive && (
              <button
                className="w-full py-4 rounded-[15px] text-sm font-extrabold"
                style={{ background: "rgba(91,174,126,0.14)", color: "#5BAE7E", border: "1px solid rgba(91,174,126,0.2)" }}
                onClick={() => setActiveAction("complete")}
              >
                ✓ إتمام الصفقة
              </button>
            )}
            {deal.status === "active" && (
              <DangerBtn onClick={() => navigate(`/deals/${id}/dispute`)}>
                فتح نزاع
              </DangerBtn>
            )}
            <DangerBtn onClick={() => setActiveAction("cancel")}>الانسحاب واسترداد العربون</DangerBtn>
            {isBuyer && deal.transferStatus !== "listed" && deal.status === "active" && (
              <SecondaryBtn onClick={() => { setActiveAction("list"); setListPrice(String(deal.amount ?? "")); }}>
                عرض للتنازل
              </SecondaryBtn>
            )}
            {isBuyer && deal.transferStatus === "listed" && (
              <SecondaryBtn onClick={async () => {
                await unlistForTransfer.mutateAsync({ id });
                await invalidate();
              }} disabled={unlistForTransfer.isPending}>
                إلغاء عرض التنازل
              </SecondaryBtn>
            )}
          </div>
        )}

        {/* Timeline */}
        {timeline && timeline.length > 0 && (
          <div className="mt-4">
            <p className="text-[15px] font-bold mb-3" style={{ color: "hsl(var(--foreground))" }}>سجل النشاط</p>
            <div className="space-y-2">
              {[...timeline].reverse().map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-[15px] p-4"
                  style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}
                  >
                    {event.event === "completed" ? "✓"
                      : event.event === "cancelled" || event.event === "forfeited" ? "✕"
                      : event.event === "disputed" || event.event === "dispute_opened" ? "!"
                      : "·"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>{event.description}</p>
                    {event.actorName && (
                      <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{event.actorName}</p>
                    )}
                    <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{formatDateTime(event.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={!!activeAction} onOpenChange={(open) => { if (!open) { setActiveAction(null); setReason(""); } }}>
        <DialogContent style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(var(--foreground))" }}>{activeAction ? actionLabels[activeAction] : ""}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {activeAction === "complete" ? (
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                بتأكيدك سيتم تحويل مبلغ {formatAmount(deal.amount)} للبائع تلقائياً. هذا الإجراء لا يمكن التراجع عنه.
              </p>
            ) : activeAction === "list" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>سعر التنازل (ريال)</label>
                  <input
                    type="number"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>وصف إضافي</label>
                  <Textarea value={listDesc} onChange={(e) => setListDesc(e.target.value)} rows={2} placeholder="..." />
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {activeAction === "cancel"
                    ? "يجب ذكر سبب الانسحاب. سيُعاد مبلغ العربون للمشتري بالكامل."
                    : "يجب ذكر السبب. سيُعاد مبلغ العربون للمشتري بالكامل."}
                </p>
                <Textarea
                  placeholder="اكتب السبب هنا..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
              onClick={() => { setActiveAction(null); setReason(""); }}
            >
              إلغاء
            </button>
            <button
              className="px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
              style={{
                background: activeAction === "complete" ? "rgba(91,174,126,0.2)" : activeAction === "list" ? "hsl(var(--foreground))" : "rgba(203,96,96,0.2)",
                color: activeAction === "complete" ? "#5BAE7E" : activeAction === "list" ? "hsl(var(--background))" : "#CB6060",
              }}
              onClick={() => {
                if (activeAction === "complete") setReason("تم الإتمام");
                handleAction();
              }}
              disabled={actionLoading || (activeAction !== "complete" && activeAction !== "list" && !reason.trim())}
            >
              {actionLoading ? "جاري التنفيذ..." : "تأكيد"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
