import { useState } from "react";
import { Link, useLocation } from "wouter";
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
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatAmount, formatDate, formatDateTime, statusLabel, statusColor, typeLabel, disputeStatusLabel } from "@/lib/helpers";
import {
  Shield, CheckCircle, XCircle, AlertCircle, Clock, FileText,
  User, ChevronLeft, Calendar, DollarSign, Building2, Tag
} from "lucide-react";

interface Props {
  id: number;
}

type ActionType = "complete" | "cancel" | "forfeit" | "list" | null;

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

    if (!reason.trim()) return;
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
        <div className="space-y-4 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto text-center py-16">
          <p className="text-xl font-semibold">الصفقة غير موجودة</p>
          <Link href="/deals"><Button variant="outline" className="mt-4">العودة للصفقات</Button></Link>
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

  const actionLabels: Record<string, string> = {
    complete: "تأكيد إتمام الصفقة",
    cancel: "إلغاء الصفقة وإسترجاع العربون",
    forfeit: "الانسحاب ومصادرة العربون للبائع",
    list: "عرض الصفقة في سوق التنازلات",
  };

  const actionColors: Record<string, string> = {
    complete: "bg-emerald-600 hover:bg-emerald-700 text-white",
    cancel:   "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    forfeit:  "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    list:     "bg-primary hover:bg-primary/90 text-primary-foreground",
  };

  const timelineIcons: Record<string, string> = {
    created:       "✦",
    buyer_signed:  "✎",
    seller_signed: "✎",
    completed:     "✓",
    cancelled:     "✗",
    disputed:      "!",
    forfeited:     "✗",
    dispute_opened:"!",
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back + Header */}
        <div>
          <Link href="/deals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 group">
            <ChevronLeft className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            الصفقات
          </Link>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="text-3xl">
              {deal.type === "real_estate" ? "🏠" : deal.type === "vehicle" ? "🚗" : deal.type === "business" ? "🏢" : "📄"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold">{deal.title}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColor[deal.status] ?? ""}`}>
                  {statusLabel[deal.status] ?? deal.status}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{typeLabel[deal.type] ?? deal.type}</p>
            </div>
          </div>
        </div>

        {/* Amount Card */}
        <Card className="border bg-primary/5 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مبلغ العربون المحجوز</p>
                  <p className="text-3xl font-bold text-primary">{formatAmount(deal.amount)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">رسوم المنصة (٢٪): {formatAmount(deal.platformFee ?? 0)} · العملة: {deal.currency}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">الموعد النهائي</p>
                <p className="font-semibold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {formatDate(deal.deadline)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">أطراف الصفقة</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">المشتري</p>
                </div>
                <p className="font-semibold">{deal.buyerName}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {deal.buyerSigned
                    ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /><span className="text-xs text-emerald-700">وقّع على العقد</span></>
                    : <><Clock className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs text-amber-700">لم يوقع بعد</span></>
                  }
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">البائع</p>
                </div>
                <p className="font-semibold">{deal.sellerName}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {deal.sellerSigned
                    ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /><span className="text-xs text-emerald-700">وقّع على العقد</span></>
                    : <><Clock className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs text-amber-700">لم يوقع بعد</span></>
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">تفاصيل الصفقة</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground leading-relaxed">{deal.description}</p>
            {deal.propertyAddress && (
              <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                <span className="text-muted-foreground">العنوان: </span>{deal.propertyAddress}
              </div>
            )}
            {deal.vehicleInfo && (
              <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                <span className="text-muted-foreground">المركبة: </span>{deal.vehicleInfo}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract */}
        {contract && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                العقد الرقمي
              </CardTitle>
              {canSign && (
                <Button size="sm" onClick={handleSign} disabled={signContract.isPending} className="gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {signContract.isPending ? "جاري التوقيع..." : "وقّع على العقد"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">الشروط العامة</p>
                <p className="text-sm leading-relaxed bg-secondary/30 rounded-lg p-3">{contract.terms}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-800 mb-1">شروط الاسترجاع</p>
                  <p className="text-xs text-emerald-700 leading-relaxed">{contract.refundConditions}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xs font-semibold text-red-800 mb-1">شروط المصادرة</p>
                  <p className="text-xs text-red-700 leading-relaxed">{contract.forfeitureConditions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {canAct && deal.status !== "completed" && deal.status !== "cancelled" && deal.status !== "forfeited" && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">الإجراءات المتاحة</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {isActive && (
                  <Button onClick={() => setActiveAction("complete")} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle className="w-4 h-4" />
                    إتمام الصفقة
                  </Button>
                )}
                <Button variant="outline" onClick={() => setActiveAction("cancel")} className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5">
                  <XCircle className="w-4 h-4" />
                  إلغاء الصفقة
                </Button>
                {isBuyer && (
                  <Button variant="outline" onClick={() => setActiveAction("forfeit")} className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5">
                    <AlertCircle className="w-4 h-4" />
                    الانسحاب
                  </Button>
                )}
                {deal.status === "active" && (
                  <Link href={`/deals/${id}/dispute`}>
                    <Button variant="outline" className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50">
                      <AlertCircle className="w-4 h-4" />
                      فتح نزاع
                    </Button>
                  </Link>
                )}
                {isBuyer && deal.transferStatus !== "listed" && deal.status === "active" && (
                  <Button variant="outline" onClick={() => { setActiveAction("list"); setListPrice(String(deal.amount ?? "")); }} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
                    <Tag className="w-4 h-4" />
                    عرض للتنازل
                  </Button>
                )}
                {isBuyer && deal.transferStatus === "listed" && (
                  <Button variant="outline" disabled className="gap-1.5 border-primary/30 text-primary bg-primary/5">
                    <Tag className="w-4 h-4" />
                    معروضة للتنازل
                  </Button>
                )}
                {isBuyer && deal.transferStatus === "listed" && (
                  <Button variant="outline" onClick={async () => {
                    await unlistForTransfer.mutateAsync({ id });
                    await invalidate();
                    await queryClient.invalidateQueries({ queryKey: ["getMyListedDeals"] });
                  }} disabled={unlistForTransfer.isPending} className="gap-1.5">
                    إلغاء العرض
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                عند الإتمام يُحوَّل المبلغ تلقائياً للبائع. عند الإلغاء يُعاد للمشتري. عند الانسحاب يُصادر للبائع.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {timeline && timeline.length > 0 && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">سجل النشاط</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute right-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {[...timeline].reverse().map((event) => (
                    <div key={event.id} className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-primary font-bold text-sm relative z-10 shrink-0">
                        {timelineIcons[event.event] ?? "·"}
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="text-sm font-medium">{event.description}</p>
                        {event.actorName && (
                          <p className="text-xs text-muted-foreground mt-0.5">{event.actorName}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(event.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Dialog */}
        <Dialog open={!!activeAction} onOpenChange={(open) => { if (!open) { setActiveAction(null); setReason(""); setListPrice(""); setListDesc(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{activeAction ? actionLabels[activeAction] : ""}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {activeAction === "complete" ? (
                <p className="text-sm text-muted-foreground">
                  بتأكيدك سيتم تحويل مبلغ {formatAmount(deal.amount)} للبائع تلقائياً. هذا الإجراء لا يمكن التراجع عنه.
                </p>
              ) : activeAction === "list" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    اكتب سعر التنازل والوصف، ثم أكّد لعرض الصفقة في سوق التنازلات. المشترون الجدد يمكنهم طلب التنازل منك.
                  </p>
                  <div className="p-3 rounded-lg bg-secondary border border-border space-y-2">
                    <p className="text-xs font-semibold text-foreground">تفاصيل العربون الحالية</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">مبلغ العربون المحجوز</span>
                      <span className="text-sm font-bold text-foreground">{formatAmount(deal.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">رسوم المنصة (٢٪)</span>
                      <span className="text-sm font-medium text-muted-foreground">{formatAmount(deal.platformFee ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="text-xs font-semibold text-foreground">العربون الصافي</span>
                      <span className="text-sm font-bold text-primary">{formatAmount((deal.amount ?? 0) - (deal.platformFee ?? 0))}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">سعر التنازل (ريال)</label>
                    <input
                      type="number"
                      placeholder="مثلاً: 50000"
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">وصف إضافي</label>
                    <Textarea
                      placeholder="اكتب تفاصيل إضافية عن التنازل..."
                      value={listDesc}
                      onChange={(e) => setListDesc(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {activeAction === "cancel"
                      ? "يرجى ذكر سبب الإلغاء. سيُعاد مبلغ العربون للمشتري."
                      : "يرجى ذكر سبب الانسحاب. سيُصادر مبلغ العربون لصالح البائع."}
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
              <Button variant="outline" onClick={() => { setActiveAction(null); setReason(""); setListPrice(""); setListDesc(""); }}>إلغاء</Button>
              <Button
                onClick={() => {
                  if (activeAction === "complete") {
                    setReason("تم الإتمام");
                  }
                  handleAction();
                }}
                disabled={actionLoading || (activeAction !== "complete" && activeAction !== "list" && !reason.trim())}
                className={activeAction ? actionColors[activeAction] : ""}
              >
                {actionLoading ? "جاري التنفيذ..." : "تأكيد"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
