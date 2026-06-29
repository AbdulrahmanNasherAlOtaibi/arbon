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
  pending:   "pill-warning",
  active:    "pill-success",
  completed: "pill-success",
  cancelled: "pill-muted",
  disputed:  "pill-warning",
  refunded:  "pill-muted",
  forfeited: "pill-danger",
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
