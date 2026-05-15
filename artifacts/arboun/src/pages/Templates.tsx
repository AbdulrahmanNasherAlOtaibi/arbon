import { useState } from "react";
import { Link } from "wouter";
import { useListTemplates } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Car, Briefcase, FileText, ChevronLeft, PlusCircle } from "lucide-react";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  real_estate: { label: "عقار", icon: Building2, color: "text-blue-700 bg-blue-50" },
  vehicle: { label: "مركبة", icon: Car, color: "text-green-700 bg-green-50" },
  business: { label: "تجاري", icon: Briefcase, color: "text-purple-700 bg-purple-50" },
  other: { label: "أخرى", icon: FileText, color: "text-gray-700 bg-gray-50" },
};

const typeOptions = [
  { value: "", label: "الكل" },
  { value: "real_estate", label: "عقار" },
  { value: "vehicle", label: "مركبة" },
  { value: "business", label: "تجاري" },
  { value: "other", label: "أخرى" },
];

export default function Templates() {
  const [selectedType, setSelectedType] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: templates, isLoading } = useListTemplates(
    selectedType ? { type: selectedType as "real_estate" | "vehicle" | "business" | "other" } : {},
    { query: { queryKey: ["listTemplates", selectedType] } }
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">قوالب العقود</h2>
            <p className="text-muted-foreground mt-1">اختر القالب المناسب لنوع صفقتك وابدأ بحماية حقوقك فوراً</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedType(opt.value)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                selectedType === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-foreground hover:bg-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : !templates || templates.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد قوالب لهذا النوع</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => {
              const config = typeConfig[template.type] ?? typeConfig.other;
              const IconComponent = config.icon;
              const isExpanded = expandedId === template.id;

              return (
                <Card key={template.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : template.id)}
                    >
                      <div className={`p-3 rounded-xl ${config.color} shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                          </div>
                          <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${isExpanded ? "-rotate-90" : "rotate-90"}`} />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">الشروط العامة</p>
                          <p className="text-sm leading-relaxed bg-secondary/30 rounded-lg p-3">{template.terms}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                            <p className="text-xs font-semibold text-green-800 mb-1">شروط الاسترجاع</p>
                            <p className="text-xs text-green-700 leading-relaxed">{template.refundConditions}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                            <p className="text-xs font-semibold text-red-800 mb-1">شروط المصادرة</p>
                            <p className="text-xs text-red-700 leading-relaxed">{template.forfeitureConditions}</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Link href={`/deals/new?template=${template.id}&type=${template.type}`}>
                            <Button size="sm" className="gap-1.5">
                              <PlusCircle className="w-3.5 h-3.5" />
                              إنشاء صفقة بهذا القالب
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
