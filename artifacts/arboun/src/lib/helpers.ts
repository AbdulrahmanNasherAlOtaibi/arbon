export const statusLabel: Record<string, string> = {
  pending: "معلق",
  active: "نشط",
  completed: "مكتمل",
  cancelled: "ملغي",
  disputed: "متنازع عليه",
  refunded: "مسترجع",
  forfeited: "مصادر",
};

export const statusColor: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800 border-amber-200",
  active:    "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  disputed:  "bg-amber-100 text-amber-800 border-amber-200",
  refunded:  "bg-sky-100 text-sky-800 border-sky-200",
  forfeited: "bg-red-100 text-red-700 border-red-200",
};

export const typeLabel: Record<string, string> = {
  real_estate: "عقار",
  vehicle: "مركبة",
  business: "تجاري",
  other: "أخرى",
};

export const typeIcon: Record<string, string> = {
  real_estate: "🏠",
  vehicle: "🚗",
  business: "🏢",
  other: "📄",
};

export function formatAmount(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return n.toLocaleString("ar-SA") + " ر.س";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const disputeStatusLabel: Record<string, string> = {
  open: "مفتوح",
  under_review: "قيد المراجعة",
  resolved_buyer: "محلول لصالح المشتري",
  resolved_seller: "محلول لصالح البائع",
  closed: "مغلق",
};
