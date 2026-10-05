import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { districts, foods, places } from "./data";
import { mapThemes } from "./mapThemes";
import { slugify } from "./utils";
import type { ShareData } from "./share";

const MAX_PROFILES = 5000;

const districtSlugs = new Set(districts.map((d) => d.slug));
const placeIds = new Set(places.map((p) => p.id));
const foodIds = new Set(foods.map((f) => f.id));
const themeKeys = new Set(mapThemes.map((t) => t.key));

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
const onlyKnown = (v: unknown, known: Set<string>) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && known.has(x)))] : []);
const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max) : "");

export function sanitize(raw: unknown): ShareData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { [k: string]: unknown };
  const name = text(r.name, 40);
  if (name.length < 2) return null;
  const visitedPlaces = onlyKnown(r.visitedPlaces, placeIds);
  const triedFoods = onlyKnown(r.triedFoods, foodIds);
  const favPlaces = onlyKnown(r.favPlaces, placeIds);
  const fav = onlyKnown(r.fav, districtSlugs);
  return {
    name,
    bio: text(r.bio, 80),
    home: typeof r.home === "string" && districtSlugs.has(r.home) ? r.home : undefined,
    theme: typeof r.theme === "string" && themeKeys.has(r.theme) ? r.theme : "emerald",
    visited: onlyKnown(r.visited, districtSlugs),
    want: onlyKnown(r.want, districtSlugs),
    fav,
    visitedPlaces,
    favPlaces,
    triedFoods,
    places: visitedPlaces.length,
    foods: triedFoods.length,
    favorites: favPlaces.length + fav.length,
  };
}

const sameToken = (given: string, storedHash: string) => {
  const a = Buffer.from(hashToken(given));
  const b = Buffer.from(storedHash);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function getProfile(id: string): Promise<{ data: ShareData; updatedAt: number } | null> {
  const row = await db.profile.findUnique({ where: { id } });
  return row ? { data: row.data as unknown as ShareData, updatedAt: row.updatedAt.getTime() } : null;
}

export async function publishProfile(data: ShareData, id?: string, token?: string): Promise<{ id: string; token: string } | "forbidden" | "full"> {
  const json = data as unknown as Prisma.InputJsonValue;
  if (id) {
    const row = await db.profile.findUnique({ where: { id } });
    if (row) {
      if (!sameToken(token ?? "", row.tokenHash)) return "forbidden";
      await db.profile.update({ where: { id }, data: { data: json, updatedAt: new Date() } });
      return { id, token: token! };
    }
  }
  if ((await db.profile.count()) >= MAX_PROFILES) return "full";
  const base = slugify(data.name).slice(0, 24) || "traveler";
  const newToken = randomBytes(24).toString("hex");
  for (let attempt = 0; attempt < 5; attempt++) {
    const newId = `${base}-${randomBytes(2).toString("hex")}`;
    try {
      await db.profile.create({ data: { id: newId, tokenHash: hashToken(newToken), data: json } });
      return { id: newId, token: newToken };
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  throw new Error("Could not allocate a profile id");
}

export async function removeProfile(id: string, token: string): Promise<boolean> {
  const row = await db.profile.findUnique({ where: { id } });
  if (!row) return true;
  if (!sameToken(token, row.tokenHash)) return false;
  await db.profile.delete({ where: { id } });
  return true;
}
