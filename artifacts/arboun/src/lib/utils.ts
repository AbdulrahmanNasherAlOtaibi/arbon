import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSaudiRiyal(amount: number | null | undefined): string {
  if (amount == null) return "٠ ر.س"
  const formatted = new Intl.NumberFormat('ar-SA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  
  return `${formatted} ر.س`
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ""
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return ""
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

export const dealStatusColors = {
  pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  completed: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  disputed: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  refunded: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  forfeited: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
} as const;

export const dealStatusLabels = {
  pending: "معلق",
  active: "نشط",
  completed: "مكتمل",
  cancelled: "ملغي",
  disputed: "متنازع عليه",
  refunded: "مسترجع",
  forfeited: "مصادر",
} as const;

export const dealTypeLabels = {
  real_estate: "عقار",
  vehicle: "مركبة",
  business: "تجاري",
  other: "أخرى",
} as const;

export const disputeStatusLabels = {
  open: "مفتوح",
  under_review: "قيد المراجعة",
  resolved_buyer: "لصالح المشتري",
  resolved_seller: "لصالح البائع",
  closed: "مغلق"
} as const;