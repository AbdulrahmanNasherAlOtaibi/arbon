import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, FileSignature, Store, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "./ui/button";

function ArbounIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 2L36 9V22C36 31 29 38.5 20 42C11 38.5 4 31 4 22V9L20 2Z"
        fill="white"
        fillOpacity="0.12"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 14L25 20L20 26L15 20L20 14Z"
        fill="white"
        fillOpacity="0.85"
      />
      <circle cx="20" cy="20" r="2" fill="white" />
    </svg>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useGetMe();

  const navItems = [
    { href: "/dashboard",              label: "لوحة القيادة",  icon: LayoutDashboard },
    { href: "/deals",                  label: "الصفقات",       icon: FileText },
    { href: "/transfers/marketplace",  label: "سوق التنازلات", icon: Store },
    { href: "/templates",              label: "النماذج",       icon: FileSignature },
    { href: "/profile",                label: "الملف الشخصي",  icon: User },
  ];

  return (
    <div className="flex h-screen bg-secondary/40" dir="rtl">
      {/* Sidebar — dark charcoal matching brand */}
      <aside className="w-64 bg-sidebar border-l border-sidebar-border flex flex-col shrink-0">

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border gap-3">
          <ArbounIcon className="w-8 h-9 shrink-0" />
          <div className="leading-tight">
            <p className="font-bold text-lg text-white leading-none tracking-wide">عربون</p>
            <p className="text-[10px] text-white/40 leading-none mt-0.5 tracking-widest">تقتك محفوظة</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-sidebar-foreground/35 uppercase tracking-widest px-3 pt-2 pb-3">
            القائمة الرئيسية
          </p>
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-white" : "text-sidebar-foreground/40"
                  )}
                />
                {item.label}
              </Link>
            );
          })}

          {/* New Deal CTA */}
          <div className="pt-4 px-0">
            <Link href="/deals/new">
              <Button
                className="w-full justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 shadow-none"
                variant="outline"
              >
                <PlusCircle className="w-4 h-4" />
                صفقة جديدة
              </Button>
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors cursor-default">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0) || "م"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{user?.name || "مستخدم"}</p>
              <p className="text-xs text-sidebar-foreground/40 truncate">{user?.phone || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8 shrink-0">
          <h1 className="text-base font-semibold text-foreground">
            {navItems.find(
              (item) =>
                item.href === location ||
                (item.href !== "/dashboard" && location.startsWith(item.href))
            )?.label || "عربون"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">تقتك محفوظة</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
