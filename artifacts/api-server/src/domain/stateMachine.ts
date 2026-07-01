export type DealStatus =
  | "pending"
  | "active"
  | "completed"
  | "cancelled"
  | "disputed"
  | "refunded"
  | "forfeited";

/**
 * Allowed deal status transitions. Any transition not listed here is rejected —
 * a status can never jump to an arbitrary state.
 */
const TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  pending: ["active", "cancelled"],
  active: ["completed", "disputed", "cancelled", "forfeited"],
  disputed: ["refunded", "forfeited", "active"],
  completed: [],
  cancelled: [],
  refunded: [],
  forfeited: [],
};

export function canTransition(from: DealStatus, to: DealStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export class TransitionError extends Error {
  readonly statusCode = 409;
  constructor(from: DealStatus, to: DealStatus) {
    super(`انتقال غير مسموح للصفقة من الحالة "${from}" إلى "${to}"`);
    this.name = "TransitionError";
  }
}

export function assertTransition(from: DealStatus, to: DealStatus): void {
  if (!canTransition(from, to)) {
    throw new TransitionError(from, to);
  }
}
