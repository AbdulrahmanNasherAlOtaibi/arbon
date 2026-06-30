import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateDeal, getListDealsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import {
  Layout,
  PageHeader,
  PrimaryBtn,
  InkInput,
  InkTextarea,
} from "@/components/Layout";
import { formatAmount } from "@/lib/helpers";

const dealTypes = [
  { value: "real_estate", label: "عقار", icon: "🏠" },
  { value: "vehicle", label: "سيارة", icon: "🚗" },
  { value: "business", label: "تجاري", icon: "🏪" },
  { value: "other", label: "أخرى", icon: "📦" },
];

export default function CreateDeal() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createDeal = useCreateDeal();

  const [selectedType, setSelectedType] = useState<"real_estate" | "vehicle" | "business" | "other">("real_estate");
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

  const amount = Number(form.amount) || 0;
  const fee = Math.round(amount * 0.02);
  const net = amount - fee;

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  }

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
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      const deal = await createDeal.mutateAsync({
        data: {
          title: form.title,
          type: selectedType,
          amount: Number(form.amount),
          sellerPhone: form.sellerPhone,
          description: form.description,
          deadline: new Date(form.deadline).toISOString(),
          ...(form.propertyAddress ? { propertyAddress: form.propertyAddress } : {}),
          ...(form.vehicleInfo ? { vehicleInfo: form.vehicleInfo } : {}),
        },
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }),
      ]);
      navigate(`/deals/${deal.id}`);
    } catch {}
  }

  const inputSt: React.CSSProperties = {
    width: "100%",
    background: "hsl(var(--input))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 14,
    padding: "15px 16px",
    color: "hsl(var(--foreground))",
    fontSize: 14,
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 600,
    outline: "none",
  };

  return (
    <Layout>
      <PageHeader title="صفقة جديدة" onBack={() => navigate("/deals")} />

      <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-4">
        {/* Deal type */}
        <div>
          <label className="block text-[12.5px] font-bold mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>نوع الصفقة</label>
          <div className="grid grid-cols-4 gap-2">
            {dealTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value as "real_estate" | "vehicle" | "business" | "other")}
                className="flex flex-col items-center gap-1.5 py-3 rounded-[14px] transition-all"
                style={
                  selectedType === t.value
                    ? { background: "hsl(var(--foreground))", color: "hsl(var(--background))", border: "1px solid hsl(var(--foreground))" }
                    : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-[11px] font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>عنوان الصفقة</label>
          <input
            style={inputSt}
            placeholder="مثال: شقة - حي النرجس"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          {errors.title && <p className="text-[11px] mt-1" style={{ color: "#CB6060" }}>{errors.title}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>قيمة العربون (ريال)</label>
          <input
            style={inputSt}
            type="number"
            placeholder="100,000"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
          />
          {errors.amount && <p className="text-[11px] mt-1" style={{ color: "#CB6060" }}>{errors.amount}</p>}
        </div>

        {/* Seller phone */}
        <div>
          <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>رقم جوال البائع</label>
          <input
            style={inputSt}
            type="tel"
            placeholder="05XXXXXXXX"
            value={form.sellerPhone}
            onChange={(e) => set("sellerPhone", e.target.value)}
            dir="ltr"
          />
          {errors.sellerPhone && <p className="text-[11px] mt-1" style={{ color: "#CB6060" }}>{errors.sellerPhone}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>وصف الصفقة</label>
          <textarea
            style={{ ...inputSt, borderRadius: 14, resize: "none" } as React.CSSProperties}
            placeholder="اكتب تفاصيل الصفقة..."
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          {errors.description && <p className="text-[11px] mt-1" style={{ color: "#CB6060" }}>{errors.description}</p>}
        </div>

        {/* Extra fields by type */}
        {selectedType === "real_estate" && (
          <div>
            <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>عنوان العقار</label>
            <input style={inputSt} placeholder="الحي، المدينة..." value={form.propertyAddress} onChange={(e) => set("propertyAddress", e.target.value)} />
          </div>
        )}
        {selectedType === "vehicle" && (
          <div>
            <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>معلومات المركبة</label>
            <input style={inputSt} placeholder="الماركة، الموديل، السنة..." value={form.vehicleInfo} onChange={(e) => set("vehicleInfo", e.target.value)} />
          </div>
        )}

        {/* Deadline */}
        <div>
          <label className="block text-[12.5px] font-bold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>الموعد النهائي</label>
          <input style={inputSt} type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
          {errors.deadline && <p className="text-[11px] mt-1" style={{ color: "#CB6060" }}>{errors.deadline}</p>}
        </div>

        {/* Summary card */}
        {amount > 0 && (
          <div
            className="rounded-[18px] p-5"
            style={{
              background: "linear-gradient(150deg, hsl(var(--secondary)), hsl(var(--muted)))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>قيمة العربون المحجوز</p>
            <p className="text-2xl font-extrabold mb-2" style={{ color: "hsl(var(--foreground))" }}>
              {amount.toLocaleString("ar-SA")}
              <span className="text-sm font-semibold ml-1" style={{ color: "hsl(var(--muted-foreground))" }}>ر.س</span>
            </p>
            <p
              className="text-[11px] pt-3"
              style={{ color: "hsl(var(--muted-foreground))", borderTop: "1px solid hsl(var(--border))" }}
            >
              رسوم المنصة ٢٪ ({fee.toLocaleString("ar-SA")} ر.س) · صافي للبائع {net.toLocaleString("ar-SA")} ر.س
            </p>
          </div>
        )}

        <PrimaryBtn type="submit" disabled={createDeal.isPending}>
          {createDeal.isPending ? "جاري إنشاء الصفقة..." : "إنشاء الصفقة وحفظ العربون"}
        </PrimaryBtn>
      </form>
    </Layout>
  );
}
