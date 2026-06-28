import { useState } from "react";
import { Link } from "wouter";
import { useListMarketplaceDeals, useRequestTransfer, useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatAmount, formatDate, typeLabel } from "@/lib/helpers";
import { Store, Building2, Car, Briefcase, FileText, Filter, Send, ChevronLeft } from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  real_estate: Building2,
  vehicle: Car,
  business: Briefcase,
  other: FileText,
};

const typeOptions = [
  { value: "", label: "الكل" },
  { value: "real_estate", label: "عقار" },
  { value: "vehicle", label: "مركبة" },
  { value: "business", label: "تجاري" },
  { value: "other", label: "أخرى" },
];

export default function TransferMarketplace() {
  const queryClient = useQueryClient();
  const { data: deals, isLoading } = useListMarketplaceDeals(
    {},
    { query: { queryKey: ["listMarketplaceDeals"] } }
  );
  const { data: me } = useGetMe();
  const requestTransfer = useRequestTransfer();

  const [selectedType, setSelectedType] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  const filtered = !deals
    ? []
    : selectedType
    ? deals.filter((d) => d.type === selectedType)
    : deals;

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
    } catch {
      // error shown by hook
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">سوق التنازلات</h2>
            <p className="text-muted-foreground mt-1">تصفح الصفقات المتاحة للتنازل وطلب التخاطر فيها</p>
          </div>
          <Link href="/transfers/my-listings">
            <Button variant="outline" className="gap-1.5">
              <Store className="w-4 h-4" />
              عروضي
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground mt-2" />
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedType(opt.value)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedType === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-foreground hover:bg-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="p-16 text-center">
              <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-lg font-semibold">لا توجد صفقات متاحة للتنازل</p>
              <p className="text-muted-foreground text-sm mt-1">سيتم إضافة صفقات جديدة هنا في أي وقت</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((deal) => {
              const IconComponent = typeIcons[deal.type] ?? FileText;
              return (
                <Card key={deal.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/8 shrink-0">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{deal.title}</h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border">
                            {typeLabel[deal.type] ?? deal.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{deal.description}</p>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="p-2.5 rounded-lg bg-secondary/50">
                            <p className="text-xs text-muted-foreground">مبلغ العربون</p>
                            <p className="text-sm font-bold">{formatAmount(deal.amount)}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-primary/8">
                            <p className="text-xs text-muted-foreground">سعر التنازل</p>
                            <p className="text-sm font-bold text-primary">{formatAmount(deal.transferPrice ?? 0)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-muted-foreground">
                            <p>المشتري الحالي: {deal.buyerName}</p>
                            <p>البائع: {deal.sellerName}</p>
                            <p>الموعد: {formatDate(deal.deadline)}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDeal(deal.id);
                              setPrice(String(deal.transferPrice));
                            }}
                          >
                            <Send className="w-3.5 h-3.5 ml-1.5" />
                            طلب تنازل
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Request Dialog */}
        <Dialog open={!!selectedDeal} onOpenChange={(open) => { if (!open) { setSelectedDeal(null); setPrice(""); setMessage(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>طلب تنازل</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                بتقديم هذا الطلب، تطلب الانتقال لمكانك كمشتري جديد في الصفقة. سيُراجع البائع الطلب ويمكنه الموافقة أو الرفض.
              </p>
              <div>
                <Label>السعر المقترح (ر.س)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="مثلا: 10000"
                />
              </div>
              <div>
                <Label>رسالة للبائع (اختياري)</Label>
                <Textarea
                  className="mt-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="رسالتك للبائع عند طلب التنازل..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedDeal(null)}>إلغاء</Button>
              <Button
                onClick={handleRequest}
                disabled={!price || requestTransfer.isPending}
              >
                {requestTransfer.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
