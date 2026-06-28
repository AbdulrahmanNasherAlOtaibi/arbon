import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, FileSignature, Store, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useGetMe();

  const navItems = [
    { href: "/", label: "لوحة القيادة", icon: LayoutDashboard },
    { href: "/deals", label: "الصفقات", icon: FileText },
    { href: "/transfers/marketplace", label: "سوق التنازلات", icon: Store },
    { href: "/templates", label: "النماذج", icon: FileSignature },
    { href: "/profile", label: "الملف الشخصي", icon: User },
  ];

  return (
    <div className="flex h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-l border-sidebar-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              ع
            </div>
            عربون
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">القائمة الرئيسية</p>
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-sidebar-primary/10 text-sidebar-primary" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          <div className="px-2">
            <Link href="/deals/new">
              <Button className="w-full justify-start gap-2 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                صفقة جديدة
              </Button>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary font-bold">
              {user?.name?.charAt(0) || "م"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || "مستخدم"}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.phone || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-foreground">
            {navItems.find(item => item.href === location || (item.href !== "/" && location.startsWith(item.href)))?.label || "عربون"}
          </h1>
          <div className="flex items-center gap-4">
            {/* Additional header actions could go here */}
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