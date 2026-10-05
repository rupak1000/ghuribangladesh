import { getDistrict } from "./data";
import matrix from "@/data/road-matrix.json";

export type TransportPref = "budget" | "comfort" | "fast" | "car" | "bike" | "ferry" | "hike";

export interface TravelMode {
  key: "local" | "bus" | "ac" | "air" | "car" | "bike" | "ferry" | "hike";
  label: string;
  low: number;
  high: number;
  hours: number;
  note?: string;
}

export interface Leg {
  from: string;
  to: string;
  km: number;
  modes: TravelMode[];
  pick: TravelMode;
}

export interface TravelSummary {
  km: number;
  hours: number;
  low: number;
  high: number;
}

const AIRPORTS = new Set(["dhaka", "chattogram", "coxs-bazar", "sylhet", "jashore", "rajshahi", "barishal", "nilphamari"]);
const ROAD_FACTOR = 1.3;
/** Per-km bus fare ranges (taka), around the 3 taka per km typical of inter-district buses. */
const BUS_RATE: [number, number] = [2.4, 3.2];
const AC_RATE: [number, number] = [3.8, 5.2];

export const transportPrefs: { key: TransportPref; label: string; blurb: string }[] = [
  { key: "budget", label: "Budget bus", blurb: "Local and non-AC buses" },
  { key: "comfort", label: "AC bus", blurb: "Comfortable coaches" },
  { key: "fast", label: "Flight", blurb: "Where airports exist" },
  { key: "car", label: "Self-drive car", blurb: "Fuel and tolls, shared" },
  { key: "bike", label: "Motorbike", blurb: "Ride yourself, 2 per bike" },
  { key: "ferry", label: "Ferry / launch", blurb: "Rivers and the south" },
  { key: "hike", label: "Hiking", blurb: "On foot for short hops" },
];

const HUBS = new Set(["dhaka", "narayanganj", "munshiganj", "chandpur"]);
const WATER = new Set(["barishal", "bhola", "patuakhali", "jhalakathi", "pirojpur", "barguna", "khulna", "bagerhat", "shariatpur", "madaripur", "noakhali", "lakshmipur", "chandpur"]);

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const INDEX = new Map<string, number>((matrix.slugs as string[]).map((slug, i) => [slug, i]));

/** Road distance in km between two district headquarters, from a routing table (OpenStreetMap roads). */
export function roadKm(from: string, to: string): number {
  if (from === to) return 0;
  const i = INDEX.get(from);
  const j = INDEX.get(to);
  const routed = i !== undefined && j !== undefined ? (matrix.km as (number | null)[][])[i][j] : null;
  if (routed != null) return Math.max(1, Math.round(routed));
  const a = getDistrict(from);
  const b = getDistrict(to);
  if (!a || !b) return 0;
  return Math.max(5, Math.round((haversineKm(a, b) * ROAD_FACTOR) / 5) * 5);
}

/** Coordinates of a district headquarters town. */
export function hqOf(slug: string): [number, number] | undefined {
  const p = (matrix.hq as { [k: string]: number[] })[slug];
  return p ? [p[0], p[1]] : undefined;
}

export function haversineBetween(a: [number, number], b: [number, number]) {
  return haversineKm({ lat: a[0], lng: a[1] }, { lat: b[0], lng: b[1] });
}

/** Driving time in hours for a private car, from the same routing table. */
export function driveHours(from: string, to: string): number {
  const i = INDEX.get(from);
  const j = INDEX.get(to);
  const min = i !== undefined && j !== undefined ? (matrix.min as (number | null)[][])[i][j] : null;
  return min != null ? min / 60 : roadKm(from, to) / 50;
}

const money = (n: number) => (n >= 1000 ? Math.round(n / 50) * 50 : Math.round(n / 10) * 10);

function ferryAvailable(from: string, to: string, km: number) {
  if (km < 45) return false;
  return (HUBS.has(from) && WATER.has(to)) || (HUBS.has(to) && WATER.has(from)) || (WATER.has(from) && WATER.has(to));
}

export function legModes(from: string, to: string, travelers = 1): TravelMode[] {
  const km = roadKm(from, to);
  const drive = driveHours(from, to);
  const people = Math.max(1, travelers);
  const share = (perKm: [number, number], capacity: number) => {
    const vehicles = Math.ceil(people / capacity);
    return [money((km * perKm[0] * vehicles) / people), money((km * perKm[1] * vehicles) / people)] as const;
  };
  const modes: TravelMode[] = [];
  if (km < 45) {
    modes.push({ key: "local", label: "Local bus / CNG", low: money(Math.max(30, km * 5)), high: money(Math.max(80, km * 12)), hours: Math.max(0.5, drive * 1.5) });
  } else {
    modes.push(
      { key: "bus", label: "Bus (non-AC)", low: money(Math.max(60, km * BUS_RATE[0])), high: money(Math.max(100, km * BUS_RATE[1])), hours: drive * 1.4 },
      { key: "ac", label: "Bus (AC)", low: money(Math.max(150, km * AC_RATE[0])), high: money(Math.max(250, km * AC_RATE[1])), hours: drive * 1.25 },
    );
  }
  const [carLow, carHigh] = share([11, 16], 4);
  modes.push({ key: "car", label: "Self-drive car", low: carLow, high: carHigh, hours: drive * 1.1, note: "Fuel and tolls only, shared by up to 4 people per car. Car hire or rental is extra." });
  const [bikeLow, bikeHigh] = share([3, 5], 2);
  modes.push({ key: "bike", label: "Motorbike", low: bikeLow, high: bikeHigh, hours: drive * 1.3, note: "Fuel and tolls only, 2 people per bike. Rent a bike is extra. Wear a helmet." });
  if (ferryAvailable(from, to, km)) {
    modes.push({ key: "ferry", label: "Ferry / launch", low: money(Math.max(150, km * 2)), high: money(Math.max(500, km * 9)), hours: km / 22 + 1, note: "Deck seat to cabin berth. Slower than the road, but a classic river journey." });
  }
  if (km <= 40) {
    modes.push({ key: "hike", label: "Hike / walk", low: 0, high: 0, hours: Math.max(0.5, km / 4), note: "On foot. Only sensible for short hops, ideally with a local guide in the hills." });
  }
  if (km >= 150 && AIRPORTS.has(from) && AIRPORTS.has(to)) {
    modes.push({ key: "air", label: "Domestic flight", low: 4000, high: 9500, hours: 3.5, note: "About 1 hour in the air, plus roughly 2.5 hours for the airport." });
  }
  return modes;
}

function pickMode(modes: TravelMode[], pref: TransportPref): TravelMode {
  const by = (k: TravelMode["key"]) => modes.find((m) => m.key === k);
  const ground = by("bus") ?? by("local") ?? modes[0];
  switch (pref) {
    case "fast": return by("air") ?? by("ac") ?? ground;
    case "comfort": return by("ac") ?? ground;
    case "car": return by("car") ?? ground;
    case "bike": return by("bike") ?? ground;
    case "ferry": return by("ferry") ?? ground;
    case "hike": return by("hike") ?? ground;
    default: return ground;
  }
}

export function buildLegs(sequence: string[], pref: TransportPref, travelers = 1): Leg[] {
  const legs: Leg[] = [];
  for (let i = 1; i < sequence.length; i++) {
    const from = sequence[i - 1];
    const to = sequence[i];
    if (from === to) continue;
    const modes = legModes(from, to, travelers);
    legs.push({ from, to, km: roadKm(from, to), modes, pick: pickMode(modes, pref) });
  }
  return legs;
}

export function summarize(legs: Leg[]): TravelSummary {
  return legs.reduce(
    (t, l) => ({ km: t.km + l.km, hours: t.hours + l.pick.hours, low: t.low + l.pick.low, high: t.high + l.pick.high }),
    { km: 0, hours: 0, low: 0, high: 0 },
  );
}

/** Visit order that always goes to the nearest unvisited stop next, starting from the origin. */
export function orderStops(origin: string, stops: string[]): string[] {
  const left = stops.filter((s) => s !== origin);
  const out: string[] = [];
  let cur = origin;
  while (left.length) {
    left.sort((a, b) => roadKm(cur, a) - roadKm(cur, b));
    cur = left.shift()!;
    out.push(cur);
  }
  return out;
}

/** Stops in the order a trip visits them, collapsing repeated days in one district. */
export function tripSequence(origin: string | undefined, days: string[], returnToStart: boolean): string[] {
  const seq: string[] = [];
  if (origin) seq.push(origin);
  for (const d of days) if (seq[seq.length - 1] !== d) seq.push(d);
  if (returnToStart && origin && seq[seq.length - 1] !== origin) seq.push(origin);
  return seq;
}

export const taka = (n: number) => `৳${(n >= 1000 ? Math.round(n / 50) * 50 : n).toLocaleString("en-US")}`;
export const takaRange = (low: number, high: number) => (low === high ? taka(high) : `${taka(low)} – ${taka(high).slice(1)}`);

export function formatHours(h: number): string {
  const total = Math.round(h * 2) / 2;
  const whole = Math.floor(total);
  return total % 1 ? `${whole ? `${whole}½` : "½"} h` : `${whole} h`;
}
