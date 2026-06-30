import { useLocation } from "wouter";
import { Layout, PageHeader } from "@/components/Layout";
import { useSettings } from "@/lib/settings-context";
import { useTx } from "@/lib/translations";
import { cn } from "@/lib/utils";

export default function Settings() {
  const [, navigate] = useLocation();
  const { theme, language, setTheme, setLanguage } = useSettings();
  const tx = useTx();

  const themeOptions: { value: "dark" | "light" | "system"; label: string; icon: string }[] = [
    { value: "dark", label: tx("settings_theme_dark"), icon: "☽" },
    { value: "light", label: tx("settings_theme_light"), icon: "☼" },
    { value: "system", label: tx("settings_theme_system"), icon: "⚙️" },
  ];

  const langOptions: { value: "ar" | "en"; label: string }[] = [
    { value: "ar", label: "العربية" },
    { value: "en", label: "English" },
  ];

  return (
    <Layout>
      <div className="px-5 py-4 pb-28">
        <PageHeader title={tx("settings_title")} onBack={() => navigate("/profile")} />

        {/* Preferences section */}
        <div className="mb-6">
          <p className="text-xs font-bold mb-3 px-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {tx("settings_preferences")}
          </p>

          {/* Language */}
          <div
            className="rounded-[18px] p-4 mb-3"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
          >
            <p className="text-[13.5px] font-bold mb-3" style={{ color: "hsl(var(--foreground))" }}>
              {tx("settings_language")}
            </p>
            <div className="flex gap-2">
              {langOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  className={cn(
                    "flex-1 py-3 rounded-[13px] text-sm font-bold transition-all"
                  )}
                  style={
                    language === opt.value
                      ? { background: "hsl(var(--foreground))", color: "hsl(var(--background))" }
                      : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appearance section */}
        <div className="mb-6">
          <p className="text-xs font-bold mb-3 px-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {tx("settings_appearance")}
          </p>

          {/* Theme */}
          <div
            className="rounded-[18px] p-4"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
          >
            <p className="text-[13.5px] font-bold mb-3" style={{ color: "hsl(var(--foreground))" }}>
              {tx("settings_theme")}
            </p>
            <div className="flex gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex-1 py-3 rounded-[13px] text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  )}
                  style={
                    theme === opt.value
                      ? { background: "hsl(var(--foreground))", color: "hsl(var(--background))" }
                      : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }
                  }
                >
                  <span className="text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Saved indicator */}
        <p className="text-center text-[11px] font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
          {tx("settings_saved")}
        </p>
      </div>
    </Layout>
  );
}
