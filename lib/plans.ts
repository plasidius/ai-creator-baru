// Sumber kebenaran harga paket — HARUS sama dengan app/pricing/page.tsx
// Jangan pernah percaya `amount`/`price` yang dikirim dari client/browser.
export const PLAN_PRICES: Record<string, number> = {
  free: 0,
  pro: 99000,
  premium: 199000,
};

export function getPlanPrice(plan: string): number | null {
  if (!(plan in PLAN_PRICES)) return null;
  return PLAN_PRICES[plan];
}