import { useSettings } from "./settings-context";

export type TxKey =
  // Navigation
  | "nav_home"
  | "nav_deals"
  | "nav_transfers"
  | "nav_templates"
  | "nav_profile"
  // Profile page
  | "profile_title"
  | "profile_verified"
  | "profile_total_deals"
  | "profile_total_escrowed"
  | "profile_verify_id"
  | "profile_payment_methods"
  | "profile_transaction_history"
  | "profile_notification_settings"
  | "profile_support"
  | "profile_logout"
  | "profile_settings"
  // Settings page
  | "settings_title"
  | "settings_language"
  | "settings_theme"
  | "settings_theme_dark"
  | "settings_theme_light"
  | "settings_theme_system"
  | "settings_saved"
  | "settings_appearance"
  | "settings_preferences"
  // Common
  | "back";

const dict: Record<TxKey, { ar: string; en: string }> = {
  nav_home: { ar: "الرئيسية", en: "Home" },
  nav_deals: { ar: "الصفقات", en: "Deals" },
  nav_transfers: { ar: "التنازلات", en: "Transfers" },
  nav_templates: { ar: "النماذج", en: "Templates" },
  nav_profile: { ar: "الملف", en: "Profile" },

  profile_title: { ar: "الملف الشخصي", en: "Profile" },
  profile_verified: { ar: "هوية موثقة", en: "Verified" },
  profile_total_deals: { ar: "إجمالي الصفقات", en: "Total Deals" },
  profile_total_escrowed: { ar: "محجوز حالياً", en: "Currently Escrowed" },
  profile_verify_id: { ar: "التحقق من الهوية", en: "Verify Identity" },
  profile_payment_methods: { ar: "وسائل الدفع", en: "Payment Methods" },
  profile_transaction_history: { ar: "سجل العمليات", en: "Transaction History" },
  profile_notification_settings: { ar: "إعدادات الإشعارات", en: "Notification Settings" },
  profile_support: { ar: "الدعم والمساعدة", en: "Support & Help" },
  profile_logout: { ar: "تسجيل الخروج", en: "Log Out" },
  profile_settings: { ar: "الإعدادات", en: "Settings" },

  settings_title: { ar: "الإعدادات", en: "Settings" },
  settings_language: { ar: "اللغة", en: "Language" },
  settings_theme: { ar: "الألوان", en: "Theme" },
  settings_theme_dark: { ar: "الوضع الداكن", en: "Dark" },
  settings_theme_light: { ar: "الوضع الفاتح", en: "Light" },
  settings_theme_system: { ar: "على حسب النظام", en: "System" },
  settings_saved: { ar: "تم الحفظ تلقائياً", en: "Saved automatically" },
  settings_appearance: { ar: "المظهر", en: "Appearance" },
  settings_preferences: { ar: "التفضيلات", en: "Preferences" },

  back: { ar: "رجوع", en: "Back" },
};

export function t(key: TxKey, lang?: "ar" | "en"): string {
  const l = lang ?? "ar";
  return dict[key]?.[l] ?? dict[key]?.ar ?? key;
}

export function useTx() {
  const { language } = useSettings();
  return (key: TxKey) => t(key, language);
}
