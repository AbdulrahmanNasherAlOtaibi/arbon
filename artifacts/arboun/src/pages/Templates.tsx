import { useState } from "react";
import { useLocation } from "wouter";
import { useListTemplates } from "@workspace/api-client-react";
import { Layout, FilterChip, InkCard } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";

const typeOptions = [
  { value: "", label: "الكل" },
  { value: "real_estate", label: "عقار" },
  { value: "vehicle", label: "مركبة" },
  { value: "business", label: "تجاري" },
  { value: "other", label: "أخرى" },
];

const typeDisplay: Record<string, { icon: string; label: string }> = {
  real_estate: { icon: "🏠", label: "عقار" },
  vehicle: { icon: "🚗", label: "مركبة" },
  business: { icon: "🏪", label: "تجاري" },
  other: { icon: "📦", label: "أخرى" },
};

export default function Templates() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState("");

  const { data: templates, isLoading } = useListTemplates(
    selectedType ? { type: selectedType as "real_estate" | "vehicle" | "business" | "other" } : {},
    { query: { queryKey: ["listTemplates", selectedType] } }
  );

  return (
    <Layout>
      <div className="px-5 py-4">
        <div className="mb-4">
          <h2 className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>قوالب العقود</h2>
          <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            اختر القالب المناسب لنوع صفقتك وابدأ إنشاء عقد رقمي موثق
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-1">
          {typeOptions.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={selectedType === opt.value}
              onClick={() => setSelectedType(opt.value)}
            />
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-[18px]" />)}
          </div>
        ) : !templates || templates.length === 0 ? (
          <InkCard className="text-center py-12">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>لا توجد قوالب</p>
          </InkCard>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => {
              const d = typeDisplay[template.type] ?? { icon: "📦", label: "أخرى" };
              return (
                <button
                  key={template.id}
                  className="w-full flex items-center gap-4 rounded-[18px] p-4 text-right"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
                  onClick={() => navigate(`/deals/new?template=${template.id}&type=${template.type}`)}
                >
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "hsl(var(--secondary))" }}
                  >
                    {d.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>{template.name}</p>
                    <p className="text-[11.5px] mt-1 leading-snug" style={{ color: "hsl(var(--muted-foreground))" }}>{template.description}</p>
                  </div>
                  <span className="text-lg flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>‹</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
