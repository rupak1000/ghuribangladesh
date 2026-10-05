import { getPlace } from "./data";

export interface CostRange {
  low: number;
  high: number;
  counted: number;
}

const DAY_HIGH_CAP = 15000;
const DAY_LOW_CAP = 8000;

export function parseBudget(budget: string): { low: number; high: number } | null {
  if (/free/i.test(budget)) return { low: 0, high: 0 };
  const nums = (budget.match(/\d[\d,]*/g) ?? []).map((n) => Number(n.replace(/,/g, ""))).filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  return { low: Math.min(...nums), high: Math.max(...nums) };
}

/**
 * Rough per-person estimate. Each place is counted once across the trip using its typical
 * budget range; a single day's total is capped (high at ৳15,000, low at ৳8,000) so a day
 * with several premium stops is not inflated. Places without a parsable budget are skipped.
 */
export function estimateTripCost(days: string[][]): CostRange {
  const seen = new Set<string>();
  let low = 0;
  let high = 0;
  let counted = 0;
  for (const ids of days) {
    let dl = 0;
    let dh = 0;
    for (const id of ids) {
      if (!id || seen.has(id)) continue;
      const b = getPlace(id) && parseBudget(getPlace(id)!.budget);
      if (!b) continue;
      seen.add(id);
      counted++;
      dl += b.low;
      dh += b.high;
    }
    low += Math.min(dl, DAY_LOW_CAP);
    high += Math.min(dh, DAY_HIGH_CAP);
  }
  return { low: Math.min(low, high), high, counted };
}

const round = (n: number) => (n >= 1000 ? Math.round(n / 100) * 100 : n);
const fmt = (n: number) => `৳${round(n).toLocaleString("en-US")}`;

export function formatCostRange(c: CostRange): string {
  if (!c.counted) return "—";
  if (c.high === 0) return "Free";
  return c.low === c.high ? fmt(c.high) : `${fmt(c.low)} – ${fmt(c.high).slice(1)}`;
}
