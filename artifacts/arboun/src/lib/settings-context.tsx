import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type Language = "ar" | "en";

interface Settings {
  theme: Theme;
  language: Language;
}

interface SettingsContextValue {
  theme: Theme;
  language: Language;
  effectiveTheme: "dark" | "light";
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
}

const STORAGE_KEY = "arbon-settings";

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        theme: ["dark", "light", "system"].includes(parsed.theme as string)
          ? (parsed.theme as Theme)
          : "system",
        language: ["ar", "en"].includes(parsed.language as string)
          ? (parsed.language as Language)
          : "ar",
      };
    }
  } catch {
    // ignore
  }
  return { theme: "system", language: "ar" };
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const effectiveTheme: "dark" | "light" =
    settings.theme === "system" ? getSystemTheme() : settings.theme;

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
    document.documentElement.setAttribute("dir", settings.language === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", settings.language);
  }, [settings, effectiveTheme]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute("data-theme", getSystemTheme());
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [settings.theme]);

  return (
    <SettingsContext.Provider
      value={{
        theme: settings.theme,
        language: settings.language,
        effectiveTheme,
        setTheme: (t) => setSettings((s) => ({ ...s, theme: t })),
        setLanguage: (l) => setSettings((s) => ({ ...s, language: l })),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
