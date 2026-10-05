import { foodsOf, getDistrict, placesOf } from "./data";
import type { Place } from "./types";
import type { Trip, TripActivity, TripDay } from "./store";
import type { StayLevel } from "./tripBudget";
import { levelOf, money, tripBreakdown } from "./tripBudget";
import { buildLegs, formatHours, orderStops, summarize, taka, takaRange, tripSequence, type TransportPref } from "./travel";

export type TripStyle = "relaxed" | "adventure" | "food" | "nature" | "history" | "family";

export const tripStyles: { key: TripStyle; label: string; emoji: string; blurb: string }[] = [
  { key: "relaxed", label: "Relaxed", emoji: "🌅", blurb: "Beaches, lakes and slow mornings" },
  { key: "adventure", label: "Adventure", emoji: "🏔️", blurb: "Hills, treks and wild places" },
  { key: "food", label: "Food", emoji: "🍛", blurb: "Eat your way through each district" },
  { key: "nature", label: "Nature", emoji: "🌿", blurb: "Forests, rivers and wildlife" },
  { key: "history", label: "History", emoji: "🏛️", blurb: "Forts, ruins and old towns" },
  { key: "family", label: "Family", emoji: "👨‍👩‍👧", blurb: "Easy, varied days for all ages" },
];

const styleName: Record<TripStyle, string> = {
  relaxed: "Relaxed", adventure: "Adventure", food: "Food", nature: "Nature", history: "History", family: "Family",
};

function styleScore(p: Place, style: TripStyle): number {
  const c = p.categories;
  switch (style) {
    case "relaxed": return (c.includes("beach") ? 1.2 : 0) + (c.includes("nature") ? 0.8 : 0) + (c.includes("culture") ? 0.5 : 0) - (c.includes("adventure") ? 0.8 : 0);
    case "adventure": return (c.includes("adventure") ? 1.5 : 0) + (c.includes("nature") ? 0.5 : 0) + (c.includes("wildlife") ? 0.4 : 0);
    case "food": return (c.includes("food") ? 1.5 : 0) + (c.includes("culture") ? 0.5 : 0);
    case "nature": return (c.includes("nature") ? 1.2 : 0) + (c.includes("wildlife") ? 1 : 0) + (c.includes("beach") ? 0.4 : 0);
    case "history": return (c.includes("history") ? 1.5 : 0) + (c.includes("culture") ? 0.8 : 0);
    case "family": return p.styles.includes("family") ? 1.2 : 0;
  }
}

function nearestOrder(slugs: string[]): string[] {
  if (slugs.length < 3) return slugs;
  const rest = slugs.slice(1);
  const out = [slugs[0]];
  while (rest.length) {
    const cur = getDistrict(out[out.length - 1])!;
    rest.sort((a, b) => {
      const da = getDistrict(a)!;
      const db = getDistrict(b)!;
      return Math.hypot(da.lat - cur.lat, da.lng - cur.lng) - Math.hypot(db.lat - cur.lat, db.lng - cur.lng);
    });
    out.push(rest.shift()!);
  }
  return out;
}

let uid = 0;
const act = (label: string, kind: TripActivity["kind"], refId?: string): TripActivity => ({ id: `a${Date.now().toString(36)}${uid++}`, label, kind, refId });

export function allocateDays(slugs: string[], days: number, keepOrder = false): { slug: string; days: number }[] {
  const used = (keepOrder ? slugs : nearestOrder(slugs)).slice(0, days);
  const base = Math.floor(days / used.length);
  let extra = days - base * used.length;
  const weighted = [...used].sort((a, b) => placesOf(b).length - placesOf(a).length);
  const bonus = new Map<string, number>();
  for (const s of weighted) {
    bonus.set(s, extra > 0 ? 1 : 0);
    extra--;
  }
  return used.map((s) => ({ slug: s, days: base + (bonus.get(s) ?? 0) }));
}

export interface TravelOptions {
  origin?: string;
  keepOrder?: boolean;
  travelers?: number;
  returnToStart?: boolean;
  pref?: TransportPref;
  level?: StayLevel;
}

export function generateTrip(slugs: string[], style: TripStyle, days: number, pinned: string[], opts: TravelOptions = {}): Trip {
  const pinnedSet = new Set(pinned);
  const ordered = opts.keepOrder ? slugs : opts.origin ? orderStops(opts.origin, slugs) : slugs;
  const plan = allocateDays(ordered, days, !!opts.origin || !!opts.keepOrder);
  const tripDays: TripDay[] = [];

  for (const { slug, days: n } of plan) {
    const d = getDistrict(slug)!;
    const ranked = placesOf(slug)
      .map((p) => ({ p, s: p.rating + styleScore(p, style) + (pinnedSet.has(p.id) ? 3 : 0) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p);
    const foods = foodsOf(slug);
    const queue = [...ranked];
    for (let i = 0; i < n; i++) {
      const pick = () => queue.shift();
      const morning = pick();
      const afternoon = pick();
      const evening = pick();
      const food = foods[(i + (style === "food" ? 0 : 1)) % Math.max(1, foods.length)];
      const nextFood = foods[(i + 1) % Math.max(1, foods.length)];
      const day: TripDay = {
        title: `${d.name}`,
        districtSlug: slug,
        morning: morning ? [act(morning.name, "place", morning.id)] : [act(`Morning walk through ${d.name}`, "custom")],
        afternoon: [],
        evening: [],
      };
      if (style === "food" && food) {
        day.afternoon = [act(`${food.name} (${d.name})`, "food", food.id)];
        if (afternoon) day.afternoon.push(act(afternoon.name, "place", afternoon.id));
        day.evening = nextFood && nextFood.id !== food.id ? [act(`${nextFood.name} (${d.name})`, "food", nextFood.id)] : evening ? [act(evening.name, "place", evening.id)] : [];
      } else {
        day.afternoon = afternoon ? [act(afternoon.name, "place", afternoon.id)] : food ? [act(`Local lunch: ${food.name}`, "food", food.id)] : [];
        day.evening = evening
          ? [act(evening.name, "place", evening.id)]
          : food ? [act(`Dinner: ${food.name}`, "food", food.id)] : [act(`Stroll a local bazaar in ${d.name}`, "custom")];
        if (evening && food) day.evening.push(act(`Dinner: ${food.name}`, "food", food.id));
      }
      if (!day.evening.length) day.evening = [act(`Relax and watch the sunset in ${d.name}`, "custom")];
      tripDays.push(day);
    }
  }

  return {
    id: `trip-${Date.now().toString(36)}`,
    name: `${days} Day ${styleName[style]} Trip`,
    style,
    days: tripDays,
    createdAt: Date.now(),
    origin: opts.origin,
    travelers: opts.travelers ?? 1,
    returnToStart: opts.returnToStart ?? false,
    pref: opts.pref ?? "budget",
    level: opts.level ?? "standard",
  };
}

export function tripToText(trip: Trip): string {
  const lines = [trip.name, "Planned with Ghuri Bangladesh", ""];
  if (trip.origin) {
    const legs = buildLegs(tripSequence(trip.origin, trip.days.map((d) => d.districtSlug), !!trip.returnToStart), trip.pref ?? "budget", trip.travelers ?? 1);
    const sum = summarize(legs);
    lines.push(`Travel from ${getDistrict(trip.origin)?.name ?? trip.origin} (approx. road distances, per person)`);
    for (const l of legs) lines.push(`  ${getDistrict(l.from)?.name} to ${getDistrict(l.to)?.name}: ~${l.km} km, ~${formatHours(l.pick.hours)} by ${l.pick.label}, ${takaRange(l.pick.low, l.pick.high)}`);
    lines.push(`  Total: ~${sum.km} km, ~${formatHours(sum.hours)}, ${takaRange(sum.low, sum.high)} per person${(trip.travelers ?? 1) > 1 ? ` (${taka(sum.low * (trip.travelers ?? 1))} – ${taka(sum.high * (trip.travelers ?? 1)).slice(1)} for ${trip.travelers} travelers)` : ""}`, "");
  }
  trip.days.forEach((d, i) => {
    lines.push(`Day ${i + 1} — ${getDistrict(d.districtSlug)?.name ?? d.title}`);
    (["morning", "afternoon", "evening"] as const).forEach((slot) => {
      lines.push(`  ${slot[0].toUpperCase() + slot.slice(1)}: ${d[slot].map((a) => a.label).join("; ") || "Free time"}`);
    });
    lines.push("");
  });
  const b = tripBreakdown(trip);
  lines.push(`Estimated cost (${levelOf(trip).label.toLowerCase()} level, ${b.travelers} ${b.travelers === 1 ? "traveler" : "travelers"})`);
  for (const l of b.lines) lines.push(`  ${l.included ? "[x]" : "[ ]"} ${l.label}: ${money(l.amount)} (${l.formula})`);
  lines.push(`  Total: ${money(b.total)} · about ${money(b.perPerson)} per person, likely ${money(b.low)} to ${money(b.high)}`);
  return lines.join("\n");
}
