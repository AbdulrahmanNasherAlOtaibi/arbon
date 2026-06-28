import { useState } from "react";
import { Link } from "wouter";
import { useListDeals } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate, statusLabel, statusColor, typeLabel } from "@/lib/helpers";
import { PlusCircle, ChevronLeft, Filter } from "lucide-react";

const statusOptions = [
  { value: "", label: "الكل" },
  { value: "pending", label: "معلق" },
  { value: "active", label: "نشط" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
  { value: "disputed", label: "متنازع عليه" },
  { value: "forfeited", label: "مصادر" },
];

const typeOptions = [
  { value: "", label: "الكل" },
  { value: "real_estate", label: "عقار" },
  { value: "vehicle", label: "مركبة" },
  { value: "business", label: "تجاري" },
  { value: "other", label: "أخرى" },
];

const roleOptions = [
  { value: "", label: "الكل" },
  { value: "buyer", label: "كمشتري" },
  { value: "seller", label: "كبائع" },
];

export default function Deals() {
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [role, setRole] = useState("");

  const { data: deals, isLoading } = useListDeals(
    {
      ...(status ? { status: status as "pending" | "active" | "completed" | "cancelled" | "disputed" | "refunded" | "forfeited" } : {}),
      ...(type ? { type: type as "real_estate" | "vehicle" | "business" | "other" } : {}),
      ...(role ? { role: role as "buyer" | "seller" } : {}),
    },
    { query: { queryKey: ["listDeals", status, type, role] } }
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">الصفقات</h2>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "..." : `${deals?.length ?? 0} صفقة`}
            </p>
          </div>
          <Link href="/deals/new">
            <Button className="gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              صفقة جديدة
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-sm text-muted-foreground ml-1">الحالة:</span>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      status === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-border mx-1" />
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-sm text-muted-foreground ml-1">النوع:</span>
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      type === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-border mx-1" />
              <div className="flex gap-1.5">
                <span className="text-sm text-muted-foreground ml-1">الدور:</span>
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRole(opt.value)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      role === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : !deals || deals.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="p-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-lg font-semibold">لا توجد صفقات</p>
              <p className="text-muted-foreground text-sm mt-1">أنشئ صفقتك الأولى الآن لتبدأ بحماية حقوقك</p>
              <Link href="/deals/new">
                <Button className="mt-4 gap-2">
                  <PlusCircle className="w-4 h-4" />
                  صفقة جديدة
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => (
              <Link key={deal.id} href={`/deals/${deal.id}`}>
                <Card className="border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-secondary shrink-0 text-xl">
                        {deal.type === "real_estate" ? "🏠" : deal.type === "vehicle" ? "🚗" : deal.type === "business" ? "🏢" : "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 flex-wrap">
                          <h3 className="font-semibold text-foreground text-base">{deal.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[deal.status] ?? ""}`}>
                            {statusLabel[deal.status] ?? deal.status}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border">
                            {typeLabel[deal.type] ?? deal.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{deal.description}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">المشتري: <span className="text-foreground font-medium">{deal.buyerName}</span></span>
                          <span className="text-xs text-muted-foreground">البائع: <span className="text-foreground font-medium">{deal.sellerName}</span></span>
                          <span className="text-xs text-muted-foreground">الموعد النهائي: <span className="text-foreground">{formatDate(deal.deadline)}</span></span>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-xl font-bold text-primary">{formatAmount(deal.amount)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">رسوم: {formatAmount(deal.platformFee ?? 0)}</p>
                        <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
