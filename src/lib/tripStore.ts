import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { districts, foods, places } from "./data";
import { slugify } from "./utils";
import type { Trip, TripActivity, TripDay } from "./store";

const MAX_TRIPS = 5000;

const districtSlugs = new Set(districts.map((d) => d.slug));
const refIds = new Set([...places.map((p) => p.id), ...foods.map((f) => f.id)]);
const PREFS = new Set(["budget", "comfort", "fast", "car", "bike", "ferry", "hike"]);
const LEVELS = new Set(["economy", "budget", "standard", "comfort"]);
const EXCLUDE = new Set(["travel", "stay", "food", "local", "other"]);
const SLOTS = ["morning", "afternoon", "evening"] as const;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max) : "");

function activities(v: unknown): TripActivity[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 12).flatMap((a, i) => {
    if (!a || typeof a !== "object") return [];
    const r = a as { [k: string]: unknown };
    const label = text(r.label, 90);
    if (!label) return [];
    const kind = r.kind === "place" || r.kind === "food" ? r.kind : "custom";
    const refId = typeof r.refId === "string" && refIds.has(r.refId) ? r.refId : undefined;
    return [{ id: `s${i}${randomBytes(2).toString("hex")}`, label, kind: refId ? kind : "custom", refId } as TripActivity];
  });
}

function cleanRates(v: unknown): Trip["rates"] {
  if (!v || typeof v !== "object") return undefined;
  const r = v as { [k: string]: unknown };
  const num = (x: unknown, max: number) => (typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= max ? x : undefined);
  const out = { busKm: num(r.busKm, 100), room: num(r.room, 500000), food: num(r.food, 100000), local: num(r.local, 100000), extrasPct: num(r.extrasPct, 100) };
  return Object.values(out).some((x) => x !== undefined) ? out : undefined;
}

export function sanitizeTrip(raw: unknown): Trip | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { [k: string]: unknown };
  if (!Array.isArray(r.days) || r.days.length < 1 || r.days.length > 30) return null;
  const days: TripDay[] = [];
  for (const d of r.days) {
    if (!d || typeof d !== "object") return null;
    const o = d as { [k: string]: unknown };
    if (typeof o.districtSlug !== "string" || !districtSlugs.has(o.districtSlug)) return null;
    days.push({
      title: text(o.title, 60),
      districtSlug: o.districtSlug,
      morning: activities(o.morning),
      afternoon: activities(o.afternoon),
      evening: activities(o.evening),
    });
  }
  const travelers = Number(r.travelers);
  return {
    id: "shared",
    name: text(r.name, 60) || "My Bangladesh trip",
    style: text(r.style, 20),
    days,
    createdAt: Date.now(),
    origin: typeof r.origin === "string" && districtSlugs.has(r.origin) ? r.origin : undefined,
    travelers: Number.isFinite(travelers) ? Math.min(20, Math.max(1, Math.round(travelers))) : 1,
    returnToStart: r.returnToStart === true,
    pref: typeof r.pref === "string" && PREFS.has(r.pref) ? (r.pref as Trip["pref"]) : "budget",
    level: typeof r.level === "string" && LEVELS.has(r.level) ? (r.level as Trip["level"]) : "standard",
    rates: cleanRates(r.rates),
    exclude: Array.isArray(r.exclude) ? r.exclude.filter((x): x is string => typeof x === "string" && EXCLUDE.has(x)) : [],
  };
}


export async function getSharedTrip(id: string): Promise<Trip | null> {
  const row = await db.sharedTrip.findUnique({ where: { id } });
  return row ? (row.data as unknown as Trip) : null;
}

export async function shareTrip(trip: Trip): Promise<string | "full"> {
  if ((await db.sharedTrip.count()) >= MAX_TRIPS) return "full";
  const base = slugify(trip.name).slice(0, 24) || "trip";
  const json = trip as unknown as Prisma.InputJsonValue;
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = `${base}-${randomBytes(3).toString("hex")}`;
    try {
      await db.sharedTrip.create({ data: { id, data: json } });
      return id;
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  throw new Error("Could not allocate a trip id");
}
