import { buildLegs, tripSequence, type Leg } from "./travel";
import type { Trip } from "./store";

export type StayLevel = "economy" | "budget" | "standard" | "comfort";

interface Level {
  key: StayLevel;
  label: string;
  blurb: string;
  stayText: string;
  room: number;
  food: number;
  local: number;
}

/** Per-room-night, per-person-day food and per-person-day local transport, in taka. */
export const stayLevels: Level[] = [
  { key: "economy", label: "Economy", blurb: "Dorms, cheap lodges, street food", stayText: "Guesthouse or dormitory", room: 900, food: 400, local: 300 },
  { key: "budget", label: "Budget", blurb: "Guesthouses, local eateries", stayText: "Budget hotel", room: 1800, food: 600, local: 450 },
  { key: "standard", label: "Medium", blurb: "Good hotels, mixed dining", stayText: "Mid-range hotel", room: 2800, food: 800, local: 600 },
  { key: "comfort", label: "Comfort", blurb: "Resorts, restaurants", stayText: "Resort or upscale hotel", room: 6000, food: 1600, local: 1200 },
];

/** Popular holiday districts cost more per night than the typical district. */
const PRICE_FACTOR: { [slug: string]: number } = {
  "coxs-bazar": 1.3, bandarban: 1.25, rangamati: 1.2, sylhet: 1.1, moulvibazar: 1.1, patuakhali: 1.1, dhaka: 1.15, chattogram: 1.1,
};

export const OTHER_SHARE = 0.1;
export const RANGE_DOWN = 0.85;
export const RANGE_UP = 1.2;

export type LineKey = "travel" | "stay" | "food" | "local" | "other";

export interface Line {
  key: LineKey;
  label: string;
  formula: string;
  amount: number;
  included: boolean;
}

export interface Breakdown {
  lines: Line[];
  total: number;
  perPerson: number;
  low: number;
  high: number;
  travelers: number;
  nights: number;
  legs: Leg[];
}

export const levelOf = (trip: Pick<Trip, "level">) => stayLevels.find((l) => l.key === (trip.level ?? "standard")) ?? stayLevels[2];

/** Room price for one night in a district at the trip's level. */
export const roomPrice = (slug: string, level: Level) => Math.round((level.room * (PRICE_FACTOR[slug] ?? 1)) / 50) * 50;

const r10 = (n: number) => Math.round(n / 10) * 10;
const fmt = (n: number) => `৳${n.toLocaleString("en-US")}`;

export function tripLegs(trip: Trip): Leg[] {
  if (!trip.origin) return [];
  return buildLegs(tripSequence(trip.origin, trip.days.map((d) => d.districtSlug), !!trip.returnToStart), trip.pref ?? "budget", trip.travelers ?? 1);
}

/** Estimate for the whole group, built from simple per-unit rates so every number can be checked by hand. */
export function tripBreakdown(trip: Trip): Breakdown {
  const t = Math.max(1, trip.travelers ?? 1);
  const level = levelOf(trip);
  const days = trip.days.length;
  const rooms = Math.ceil(t / 2);
  const legs = tripLegs(trip);

  const rates = trip.rates ?? {};
  const busKm = rates.busKm;
  const fareOf = (l: Leg) =>
    busKm && (l.pick.key === "bus" || l.pick.key === "ac" || l.pick.key === "local") ? r10(Math.max(30, l.km * busKm)) : r10((l.pick.low + l.pick.high) / 2);
  const farePerPerson = legs.reduce((sum, l) => sum + fareOf(l), 0);
  const travel = farePerPerson * t;

  const nightDistricts = trip.days.slice(0, -1).map((d) => d.districtSlug);
  const nights = nightDistricts.length;
  const stay = nightDistricts.reduce((sum, slug) => sum + rooms * (rates.room ?? roomPrice(slug, level)), 0);
  const avgRoom = nights ? Math.round(stay / nights / rooms / 50) * 50 : level.room;

  const foodDay = rates.food ?? level.food;
  const localDay = rates.local ?? level.local;
  const extrasShare = rates.extrasPct !== undefined ? rates.extrasPct / 100 : OTHER_SHARE;
  const food = days * t * foodDay;
  const local = days * t * localDay;
  const subtotal = travel + stay + food + local;
  const other = r10(subtotal * extrasShare);

  const lines: Line[] = [
    {
      key: "travel",
      label: "Travel between districts",
      formula: legs.length ? `${fmt(farePerPerson)} per person${t > 1 ? ` × ${t} people` : ""}, ${legs.length} ${legs.length === 1 ? "leg" : "legs"}${busKm ? `, bus at ${fmt(busKm)}/km (your price)` : ""}` : "No travel between districts",
      amount: travel,
      included: true,
    },
    {
      key: "stay",
      label: "Where you stay",
      formula: nights ? `${nights} ${nights === 1 ? "night" : "nights"} × ${rooms} ${rooms === 1 ? "room" : "rooms"} × ${fmt(rates.room ?? avgRoom)}${rates.room ? " (your price)" : ""}` : "No overnight stay",
      amount: stay,
      included: true,
    },
    { key: "food", label: "Food & drink", formula: `${days} ${days === 1 ? "day" : "days"} × ${t} ${t === 1 ? "person" : "people"} × ${fmt(foodDay)}${rates.food ? " (your price)" : ""}`, amount: food, included: true },
    { key: "local", label: "Local transport", formula: `CNG, auto, rickshaw or boat · ${days} ${days === 1 ? "day" : "days"} × ${t} ${t === 1 ? "person" : "people"} × ${fmt(localDay)}${rates.local ? " (your price)" : ""}`, amount: local, included: true },
    { key: "other", label: "Entry fees & extras", formula: `${rates.extrasPct !== undefined ? "" : "About "}${Math.round(extrasShare * 100)}% of the items above${rates.extrasPct !== undefined ? " (your setting)" : ""}`, amount: other, included: true },
  ];

  const off = new Set(trip.exclude ?? []);
  for (const l of lines) l.included = !off.has(l.key);
  const total = lines.filter((l) => l.included).reduce((sum, l) => sum + l.amount, 0);
  const perPerson = r10(total / t);

  return { lines, total, perPerson, low: r10(perPerson * RANGE_DOWN), high: r10(perPerson * RANGE_UP), travelers: t, nights, legs };
}

export const money = fmt;
