import { useGetMe, useGetDashboardSummary } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate } from "@/lib/helpers";
import { User, Phone, Mail, Shield, CheckCircle, Clock, Briefcase, TrendingUp } from "lucide-react";

export default function Profile() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold">الملف الشخصي</h2>
          <p className="text-muted-foreground mt-1">معلوماتك الشخصية وإحصائيات حسابك</p>
        </div>

        {/* Profile Card */}
        {userLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : user ? (
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{user.name}</h3>
                      {user.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3 h-3" />
                          موثق
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          قيد التوثيق
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">رقم الهوية: {user.nationalId}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span dir="ltr">{user.phone}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span dir="ltr">{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>عضو منذ {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Identity Verification */}
        <Card className="border border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">حماية هويتك</p>
              <p className="text-sm text-muted-foreground mt-1">
                جميع الأطراف في منصة عربون موثقون بهوياتهم الوطنية وفق اشتراطات ساما. يضمن ذلك حقوقك القانونية ويحمل كل طرف مسؤوليته كاملاً.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {summaryLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : summary ? (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">إحصائيات حسابي</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <Briefcase className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold">{summary.totalDeals}</p>
                  <p className="text-xs text-muted-foreground">إجمالي الصفقات</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <CheckCircle className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-teal-700">{summary.completedDeals}</p>
                  <p className="text-xs text-muted-foreground">صفقات مكتملة</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold">{formatAmount(summary.totalAmountCompleted)}</p>
                  <p className="text-xs text-muted-foreground">إجمالي المبالغ المكتملة</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold">{formatAmount(summary.totalAmountEscrowed)}</p>
                  <p className="text-xs text-muted-foreground">مبالغ في حساب الضمان</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Platform Trust */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">لماذا عربون؟</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: Shield, title: "حساب ضمان مرخص من ساما", desc: "مبلغك محفوظ لدى مزود مدفوعات مرخص تحت إشراف ساما" },
                { icon: CheckCircle, title: "عقود رقمية ملزمة", desc: "عقودنا موثقة ومعتمدة بتوقيع رقمي قانوني" },
                { icon: Clock, title: "فض نزاعات خلال 48 ساعة", desc: "لجنة محايدة تبت في النزاعات سريعاً وبعدالة" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/8 shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
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
      </div>
    </Layout>
  );
}
