import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetDeal, useCreateDispute, getGetDealQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate, statusLabel, statusColor } from "@/lib/helpers";
import { AlertCircle, ChevronLeft, Shield, Clock } from "lucide-react";

interface Props {
  id: number;
}

export default function OpenDispute({ id }: Props) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: deal, isLoading } = useGetDeal(id, { query: { enabled: !!id } });
  const createDispute = useCreateDispute();

  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("يجب ذكر سبب النزاع");
      return;
    }
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
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-xl font-semibold">الصفقة غير موجودة</p>
          <Link href="/deals"><Button variant="outline" className="mt-4">العودة للصفقات</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link href={`/deals/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 group">
            <ChevronLeft className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            العودة للصفقة
          </Link>
          <h2 className="text-2xl font-bold">فتح نزاع</h2>
          <p className="text-muted-foreground mt-1">سيتم مراجعة نزاعك والبت فيه خلال 48 ساعة</p>
        </div>

        {/* Deal Info */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {deal.type === "real_estate" ? "🏠" : deal.type === "vehicle" ? "🚗" : deal.type === "business" ? "🏢" : "📄"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{deal.title}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusColor[deal.status] ?? ""}`}>
                    {statusLabel[deal.status] ?? deal.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatAmount(deal.amount)} · موعد الانتهاء: {formatDate(deal.deadline)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border border-orange-200 bg-orange-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">قبل فتح النزاع</p>
                <ul className="space-y-1 list-disc list-inside text-orange-700">
                  <li>تأكد من محاولة التواصل مع الطرف الآخر أولاً</li>
                  <li>ستُجمَّد الصفقة حتى صدور القرار</li>
                  <li>سيصدر قرار محايد خلال 48 ساعة</li>
                  <li>القرار الصادر ملزم لجميع الأطراف</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Process */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              آلية فض النزاع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { step: "١", title: "تقديم النزاع", desc: "يُقدم أحد الأطراف طلب النزاع مع الأسباب والأدلة" },
                { step: "٢", title: "إشعار الطرف الآخر", desc: "يُبلَّغ الطرف الآخر فور تقديم النزاع" },
                { step: "٣", title: "المراجعة المحايدة", desc: "تُراجع لجنة التحكيم جميع الأدلة والوثائق" },
                { step: "٤", title: "القرار خلال 48 ساعة", desc: "يصدر القرار الملزم ويُحوَّل المبلغ للمستحق" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">تفاصيل النزاع</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reason">سبب النزاع *</Label>
                <Textarea
                  id="reason"
                  className="mt-1"
                  placeholder="اشرح سبب النزاع بوضوح وتفصيل..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="evidence">الأدلة والمستندات الداعمة (اختياري)</Label>
                <Textarea
                  id="evidence"
                  className="mt-1"
                  placeholder="اذكر الأدلة المتوفرة لديك (صور، وثائق، كشوف حساب...)"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  rows={3}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link href={`/deals/${id}`} className="flex-1">
              <Button variant="outline" type="button" className="w-full">إلغاء</Button>
            </Link>
            <Button type="submit" className="flex-1 gap-2 bg-orange-600 hover:bg-orange-700" disabled={createDispute.isPending}>
              <AlertCircle className="w-4 h-4" />
              {createDispute.isPending ? "جاري فتح النزاع..." : "فتح النزاع رسمياً"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
