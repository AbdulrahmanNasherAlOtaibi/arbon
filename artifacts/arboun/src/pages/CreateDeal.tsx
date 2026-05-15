import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateDeal, useListTemplates, getListDealsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Building2, Car, Briefcase, FileText, Shield, AlertCircle } from "lucide-react";

const dealTypes = [
  { value: "real_estate", label: "عقار", icon: Building2, desc: "شقق، فلل، أراضي، مكاتب" },
  { value: "vehicle", label: "مركبة", icon: Car, desc: "سيارات، دراجات، مركبات" },
  { value: "business", label: "تجاري", icon: Briefcase, desc: "محلات، مشاريع، امتيازات" },
  { value: "other", label: "أخرى", icon: FileText, desc: "معاملات أخرى متنوعة" },
];

export default function CreateDeal() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createDeal = useCreateDeal();
  const { data: templates } = useListTemplates();

  const [selectedType, setSelectedType] = useState<"real_estate" | "vehicle" | "business" | "other">("real_estate");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    sellerPhone: "",
    description: "",
    propertyAddress: "",
    vehicleInfo: "",
    deadline: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredTemplates = templates?.filter((t) => t.type === selectedType) ?? [];

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "العنوان مطلوب";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = "المبلغ يجب أن يكون رقماً موجباً";
    if (!form.sellerPhone.trim()) e.sellerPhone = "رقم جوال البائع مطلوب";
    if (!form.description.trim()) e.description = "وصف الصفقة مطلوب";
    if (!form.deadline) e.deadline = "الموعد النهائي مطلوب";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      const deal = await createDeal.mutateAsync({
        data: {
          title: form.title,
          type: selectedType,
          amount: Number(form.amount),
          sellerPhone: form.sellerPhone,
          description: form.description,
          ...(form.propertyAddress ? { propertyAddress: form.propertyAddress } : {}),
          ...(form.vehicleInfo ? { vehicleInfo: form.vehicleInfo } : {}),
          deadline: form.deadline,
          ...(selectedTemplate ? { templateId: selectedTemplate } : {}),
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      navigate(`/deals/${deal.id}`);
    } catch {
      setErrors({ submit: "حدث خطأ أثناء إنشاء الصفقة. يرجى المحاولة مجدداً." });
    }
  }

  const platformFee = Number(form.amount) > 0 ? (Number(form.amount) * 0.02).toFixed(2) : "0";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">صفقة جديدة</h2>
          <p className="text-muted-foreground mt-1">أنشئ عقد عربون محمي ومعتمد</p>
        </div>

        {/* Security Banner */}
        <Card className="border border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-primary/80">
              مبلغ العربون سيُحفظ في حساب ضمان مرخص من ساما. لا أحد يستطيع الوصول إليه إلا بعد إتمام الشروط المتفق عليها.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal Type */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">نوع الصفقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {dealTypes.map((dt) => (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() => { setSelectedType(dt.value as "real_estate" | "vehicle" | "business" | "other"); setSelectedTemplate(null); }}
                    className={`p-4 rounded-xl border-2 text-right transition-all ${
                      selectedType === dt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 bg-background"
                    }`}
                  >
                    <dt.icon className={`w-5 h-5 mb-2 ${selectedType === dt.value ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-sm">{dt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{dt.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          {filteredTemplates.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">قالب العقد</CardTitle>
                <CardDescription>اختر قالباً جاهزاً أو اتركه فارغاً لكتابة شروطك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className={`w-full p-3 rounded-lg border text-right text-sm transition-colors ${
                      selectedTemplate === null ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <p className="font-medium">بدون قالب</p>
                    <p className="text-xs text-muted-foreground">سأكتب الشروط بنفسي</p>
                  </button>
                  {filteredTemplates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`w-full p-3 rounded-lg border text-right text-sm transition-colors ${
                        selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deal Info */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">تفاصيل الصفقة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان الصفقة *</Label>
                <Input
                  id="title"
                  className="mt-1"
                  placeholder="مثال: شقة في حي النرجس - الرياض"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">مبلغ العربون (ر.س) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    className="mt-1"
                    placeholder="50000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    min="1"
                  />
                  {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
                  {Number(form.amount) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">رسوم المنصة (٢٪): {platformFee} ر.س</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="deadline">الموعد النهائي للصفقة *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    className="mt-1"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.deadline && <p className="text-xs text-destructive mt-1">{errors.deadline}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="sellerPhone">رقم جوال البائع *</Label>
                <Input
                  id="sellerPhone"
                  type="tel"
                  className="mt-1"
                  placeholder="05XXXXXXXX"
                  value={form.sellerPhone}
                  onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                  dir="ltr"
                />
                {errors.sellerPhone && <p className="text-xs text-destructive mt-1">{errors.sellerPhone}</p>}
              </div>

              <div>
                <Label htmlFor="description">وصف الصفقة *</Label>
                <Textarea
                  id="description"
                  className="mt-1"
                  placeholder="صف الصفقة بشكل واضح ومفصل..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
              </div>

              {selectedType === "real_estate" && (
                <div>
                  <Label htmlFor="propertyAddress">عنوان العقار</Label>
                  <Input
                    id="propertyAddress"
                    className="mt-1"
                    placeholder="الحي، الشارع، المدينة"
                    value={form.propertyAddress}
                    onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })}
                  />
                </div>
              )}

              {selectedType === "vehicle" && (
                <div>
                  <Label htmlFor="vehicleInfo">معلومات المركبة</Label>
                  <Input
                    id="vehicleInfo"
                    className="mt-1"
                    placeholder="الموديل، السنة، اللون، القاطع"
                    value={form.vehicleInfo}
                    onChange={(e) => setForm({ ...form, vehicleInfo: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 gap-2" disabled={createDeal.isPending}>
              {createDeal.isPending ? "جاري الإنشاء..." : "إنشاء الصفقة وإيداع العربون"}
              {!createDeal.isPending && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
