import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetTransferRequests, useApproveTransfer } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatAmount, formatDateTime, disputeStatusLabel } from "@/lib/helpers";
import { ArrowLeft, CheckCircle, XCircle, Inbox, AlertCircle } from "lucide-react";

export default function TransferRequests() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useGetTransferRequests({ query: { queryKey: ["getTransferRequests"] } });
  const approveTransfer = useApproveTransfer();

  const [pendingId, setPendingId] = useState<number | null>(null);
  const [approve, setApprove] = useState<boolean | null>(null);

  async function handleConfirm() {
    if (pendingId == null || approve == null) return;
    try {
      await approveTransfer.mutateAsync({
        id: pendingId,
        data: { approved: approve },
      });
      await queryClient.invalidateQueries({ queryKey: ["getTransferRequests"] });
      await queryClient.invalidateQueries({ queryKey: ["getMyListedDeals"] });
      await queryClient.invalidateQueries({ queryKey: ["listDeals"] });
      setPendingId(null);
      setApprove(null);
    } catch {
      // shown by hook
    }
  }

  const statusBadge: Record<string, string> = {
    pending:  "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  const statusLabelMap: Record<string, string> = {
    pending:  "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <Link href="/transfers/my-listings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 group">
            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            عروضي للتنازل
          </Link>
          <h2 className="text-2xl font-bold">طلبات التنازل</h2>
          <p className="text-muted-foreground mt-1">طلبات التنازل الواردة على صفقاتك المعروضة</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : !requests || requests.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="p-12 text-center">
              <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-lg font-semibold">لا توجد طلبات تنازل</p>
              <p className="text-muted-foreground text-sm mt-1">سيتم إشعارك فوراً عند وصول أي طلب</p>
              <Link href="/transfers/marketplace">
                <Button variant="outline" className="mt-4 gap-1.5">
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  سوق التنازلات
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">طلب تنازل الصفقة #{req.dealId}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge[req.status] ?? ""}`}>
                          {statusLabelMap[req.status] ?? req.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">المطلب</p>
                          <p className="font-medium">{req.fromUserName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">السعر المقترح</p>
                          <p className="font-bold text-primary">{formatAmount(req.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">التاريخ</p>
                          <p>{formatDateTime(req.createdAt)}</p>
                        </div>
                        {req.message && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">الرسالة</p>
                            <p className="text-sm bg-secondary/50 rounded-lg p-2 mt-1">{req.message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setPendingId(req.id); setApprove(false); }}
                          className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          رفض
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => { setPendingId(req.id); setApprove(true); }}
                          className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          قبول
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={pendingId !== null} onOpenChange={(open) => { if (!open) { setPendingId(null); setApprove(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد {approve ? "القبول" : "الرفض"}</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              {approve ? (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    بقبولك سيتم نقل الصفقة للمطلب الجديد ويصبح هو المشتري الرسمي. سيتم إنشاء عقد جديد بينه وبين البائع. هذا الإجراء لا يمكن التراجع عنه.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  برفضك سيتم إلغاء طلب التنازل. الصفقة ستبقى معروضة للآخرين للتنازل.
                </p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setPendingId(null); setApprove(null); }}>إلغاء</Button>
              <Button
                onClick={handleConfirm}
                disabled={approveTransfer.isPending}
                className={approve ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}
              >
                {approveTransfer.isPending ? "جاري..." : approve ? "قبول" : "رفض"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
