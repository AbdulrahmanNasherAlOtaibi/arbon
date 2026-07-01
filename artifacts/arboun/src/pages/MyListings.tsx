import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMyListedDeals, useListForTransfer, useUnlistForTransfer } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatAmount, formatDate, typeLabel } from "@/lib/helpers";
import { Store, ArrowLeft, Eye, XCircle, Tag, PlusCircle } from "lucide-react";

const typeIcons: Record<string, string> = {
  real_estate: "🏠",
  vehicle:     "🚗",
  business:    "🏢",
  other:       "📄",
};

export default function MyListings() {
  const queryClient = useQueryClient();
  const { data: listings, isLoading } = useGetMyListedDeals({ query: { queryKey: ["getMyListedDeals"] } });
  const listForTransfer = useListForTransfer();
  const unlistForTransfer = useUnlistForTransfer();

  const [listingDeal, setListingDeal] = useState<number | null>(null);
  const [listPrice, setListPrice] = useState("");
  const [listDesc, setListDesc] = useState("");

  async function handleList() {
    if (!listingDeal) return;
    try {
      await listForTransfer.mutateAsync({
        id: listingDeal,
        data: {
          ...(listPrice ? { price: Number(listPrice) } : {}),
          ...(listDesc ? { description: listDesc } : {}),
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["getMyListedDeals"] });
      await queryClient.invalidateQueries({ queryKey: ["listDeals"] });
      setListingDeal(null);
      setListPrice("");
      setListDesc("");
    } catch {
      // shown by hook
    }
  }

  async function handleUnlist(id: number) {
    try {
      await unlistForTransfer.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["getMyListedDeals"] });
      await queryClient.invalidateQueries({ queryKey: ["listDeals"] });
    } catch {
      // shown by hook
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/transfers/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 group">
              <ArrowLeft className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              سوق التنازلات
            </Link>
            <h2 className="text-2xl font-bold">عروضي للتنازل</h2>
            <p className="text-muted-foreground mt-1">الصفقات المعروضة للتنازل والطلبات الواردة</p>
          </div>
          <Link href="/transfers/requests">
            <Button variant="outline" className="gap-1.5">
              <Eye className="w-4 h-4" />
              طلبات التنازل
            </Button>
          </Link>
        </div>

        {/* Active Listings */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4" />
              صفقات معروضة حالياً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
              </div>
            ) : !listings || listings.length === 0 ? (
              <div className="text-center py-8">
                <Store className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">لا توجد صفقات معروضة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((deal) => (
                  <div key={deal.id} className="p-4 rounded-lg border bg-background flex items-start gap-4">
                    <div className="text-2xl shrink-0">{typeIcons[deal.type] ?? "📄"}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{deal.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">معروضة</span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>العربون: <span className="font-bold">{formatAmount(deal.amount)}</span></span>
                        <span>سعر التنازل: <span className="font-bold text-primary">{formatAmount(deal.transferPrice ?? 0)}</span></span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">البائع: {deal.sellerName} · الموعد: {formatDate(deal.deadline)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlist(deal.id)}
                      disabled={unlistForTransfer.isPending}
                      className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/5 shrink-0"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      إلغاء العرض
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to list */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">كيف أعرض صفقة للتنازل؟</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>اذهب للصفقة التي تريد التنازل عنها</li>
              <li>اضغط زر "عرض للتنازل" في صفحة تفاصيل الصفقة</li>
              <li>اختر السعر المقترح والوصف</li>
              <li>تابع الطلبات الواردة وابدأ بقبولها أو رفضها</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-3">
              عند التنازل، ينتقل مبلغ العربون إلى المشتري الجديد ويُنشأ عقد جديد بينه وبين البائع.
            </p>
          </CardContent>
        </Card>

        {/* List Dialog */}
        <Dialog open={!!listingDeal} onOpenChange={(open) => { if (!open) { setListingDeal(null); setListPrice(""); setListDesc(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>عرض للتنازل</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                عند عرض الصفقة في سوق التنازلات، يستطيع مشترون آخرون رؤيتها وتقديم طلب تنازل.
              </p>
              <div>
                <Label>سعر التنازل (ر.س)</Label>
                <Input type="number" className="mt-1" value={listPrice} onChange={(e) => setListPrice(e.target.value)} placeholder="مثلاً: 5000" />
              </div>
              <div>
                <Label>وصف العرض (اختياري)</Label>
                <Textarea className="mt-1" value={listDesc} onChange={(e) => setListDesc(e.target.value)} placeholder="وصف قصير للعرض..." rows={2} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setListingDeal(null)}>إلغاء</Button>
              <Button onClick={handleList} disabled={listForTransfer.isPending || !listPrice}>
                {listForTransfer.isPending ? "جاري..." : "عرض للتنازل"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
