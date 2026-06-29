import HeroImage from "@/components/HeroImage";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@workspace/api-client-react";
import { Shield, ArrowLeft, Handshake, Store, FileText } from "lucide-react";

export default function Landing() {
  const { data: user } = useGetMe();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navbar */}
      <nav className="h-16 border-b border-border bg-background flex items-center justify-between px-8">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            ع
          </div>
          عربون
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                الدخول للتطبيق
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                تسجيل الدخول
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              إدار مبلغ العربون الرقمي
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              احمي صفقتك بشكل آمن. عربون يؤمن إيداع العربون في الصفقات العقارية والمركبات والأعمال من خلال الخانوق الرقمية المبرمجة.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Link href="/deals/new">
                <Button size="lg" className="gap-2">
                  <Shield className="w-5 h-5" />
                  إنشاء صفقة جديدة
                </Button>
              </Link>
              <Link href="/transfers/marketplace">
                <Button size="lg" variant="outline" className="gap-2">
                  <Store className="w-5 h-5" />
                  سوق التنازلات
                </Button>
              </Link>
            </div>
          </div>

          <HeroImage />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">كيف يعمل عربون؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-background border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Handshake className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">إنشاء الصفقة</h3>
              <p className="text-sm text-muted-foreground">
                اختر نموذجاً جاهزاً أو أنشئ صفقة مخصصة للعقار أو المركبة أو الأعمال.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-background border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">حجز العربون</h3>
              <p className="text-sm text-muted-foreground">
                ادفع العربون في الخانوق الرقمية وامضي عليه حتى انتهاء الصفقة أو التنازل.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-background border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">العقد الرقمي</h3>
              <p className="text-sm text-muted-foreground">
                وقّع البائع والمشتري على العقد الرقمي المخصص إلكترونيّاً مع وصف الشروط والالتزامات.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">ابدأ بحماية صفقاتك اليوم</h2>
          <p className="text-muted-foreground mb-6">
            انضم لأكثر من 10,000 مستخدم يوثقون بعربون في صفقاتهم الرقمية.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="w-5 h-5" />
              الدخول إلى التطبيق
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              ع
            </div>
            عربون
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 عربون — إدار مبلغ العربون الرقمي
          </p>
        </div>
      </footer>
    </div>
  );
}
