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
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-teal-100 text-teal-800 border-teal-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  disputed: "bg-orange-100 text-orange-800 border-orange-200",
  refunded: "bg-blue-100 text-blue-800 border-blue-200",
  forfeited: "bg-red-100 text-red-800 border-red-200",
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

export function formatAmount(amount: number | string): string {
  const n = Number(amount);
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
