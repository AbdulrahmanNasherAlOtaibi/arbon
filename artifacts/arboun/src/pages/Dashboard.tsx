import { Link } from "wouter";
import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDateTime, statusLabel, statusColor, typeLabel } from "@/lib/helpers";
import { PlusCircle, TrendingUp, Shield, AlertCircle, CheckCircle, Clock, Briefcase } from "lucide-react";

function StatCard({ title, value, icon: Icon, sub, color = "text-foreground" }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="p-2.5 rounded-lg bg-primary/8">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const eventIcons: Record<string, React.ElementType> = {
  created: PlusCircle,
  completed: CheckCircle,
  cancelled: AlertCircle,
  disputed: AlertCircle,
  buyer_signed: Shield,
  seller_signed: Shield,
  forfeited: AlertCircle,
  default: Clock,
};

const eventColors: Record<string, string> = {
  created: "text-blue-600 bg-blue-50",
  completed: "text-teal-600 bg-teal-50",
  cancelled: "text-gray-500 bg-gray-50",
  disputed: "text-orange-600 bg-orange-50",
  buyer_signed: "text-green-600 bg-green-50",
  seller_signed: "text-green-600 bg-green-50",
  forfeited: "text-red-600 bg-red-50",
  default: "text-primary bg-primary/8",
};

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">لوحة القيادة</h2>
            <p className="text-muted-foreground mt-1">نظرة عامة على صفقاتك وأنشطتك</p>
          </div>
          <Link href="/deals/new">
            <Button className="gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              صفقة جديدة
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="إجمالي الصفقات" value={summary.totalDeals} icon={Briefcase} sub={`${summary.dealsAsbuyer} كمشتري · ${summary.dealsAsSeller} كبائع`} />
              <StatCard title="صفقات نشطة" value={summary.activeDeals} icon={TrendingUp} color="text-green-700" sub="في حساب الضمان" />
              <StatCard title="صفقات مكتملة" value={summary.completedDeals} icon={CheckCircle} color="text-teal-700" />
              <StatCard title="بانتظار التوقيع" value={summary.pendingSignature} icon={Clock} color="text-amber-700" />
            </div>

            {/* Amounts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border bg-primary/5 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي المبالغ المحجوزة</p>
                      <p className="text-3xl font-bold text-primary mt-0.5">{formatAmount(summary.totalAmountEscrowed)}</p>
                      <p className="text-xs text-muted-foreground mt-1">محفوظة في حسابات الضمان</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border bg-teal-50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-teal-100">
                      <CheckCircle className="w-6 h-6 text-teal-700" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي المبالغ المكتملة</p>
                      <p className="text-3xl font-bold text-teal-700 mt-0.5">{formatAmount(summary.totalAmountCompleted)}</p>
                      <p className="text-xs text-muted-foreground mt-1">تم تحويلها بنجاح</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {summary.disputedDeals > 0 && (
              <Card className="border border-orange-200 bg-orange-50 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                  <p className="text-sm text-orange-800">
                    لديك <span className="font-bold">{summary.disputedDeals}</span> صفقة متنازع عليها قيد المراجعة. سيتم البت فيها خلال 48 ساعة.
                  </p>
                  <Link href="/deals?status=disputed" className="mr-auto">
                    <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-100 shrink-0">
                      عرض التفاصيل
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold mb-4">النشاط الأخير</h3>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : activity && activity.length > 0 ? (
            <Card className="border shadow-sm divide-y divide-border">
              {activity.slice(0, 8).map((event) => {
                const IconComponent = eventIcons[event.event] ?? eventIcons.default;
                const colorClass = eventColors[event.event] ?? eventColors.default;
                return (
                  <Link key={event.id} href={`/deals/${event.dealId}`}>
                    <div className="p-4 flex items-start gap-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className={`p-2 rounded-full ${colorClass} shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{event.dealTitle}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                      </div>
                      {event.amount && (
                        <p className="text-sm font-bold text-primary shrink-0">{formatAmount(event.amount)}</p>
                      )}
                      <p className="text-xs text-muted-foreground shrink-0 mr-2">{formatDateTime(event.createdAt)}</p>
                    </div>
                  </Link>
                );
              })}
            </Card>
          ) : (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">لا يوجد نشاط حتى الآن</p>
                <Link href="/deals/new">
                  <Button variant="outline" size="sm" className="mt-4">
                    أنشئ أول صفقة
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
