import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { districts, foods, places } from "./data";
import { mapThemes } from "./mapThemes";
import { slugify } from "./utils";
import type { ShareData } from "./share";

interface Entry {
  data: ShareData;
  tokenHash: string;
  updatedAt: number;
}

const FILE = path.join(process.cwd(), ".data", "profiles.json");
const MAX_PROFILES = 5000;
let queue: Promise<unknown> = Promise.resolve();

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

async function load(): Promise<{ [id: string]: Entry }> {
  try {
    return JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function save(db: { [id: string]: Entry }) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(db));
  await rename(tmp, FILE);
}

function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export function getProfile(id: string): Promise<{ data: ShareData; updatedAt: number } | null> {
  return load().then((db) => (db[id] ? { data: db[id].data, updatedAt: db[id].updatedAt } : null));
}

export function publishProfile(data: ShareData, id?: string, token?: string): Promise<{ id: string; token: string } | "forbidden" | "full"> {
  return exclusive(async () => {
    const db = await load();
    if (id && db[id]) {
      const given = Buffer.from(hashToken(token ?? ""));
      const stored = Buffer.from(db[id].tokenHash);
      if (given.length !== stored.length || !timingSafeEqual(given, stored)) return "forbidden";
      db[id] = { ...db[id], data, updatedAt: Date.now() };
      await save(db);
      return { id, token: token! };
    }
    if (Object.keys(db).length >= MAX_PROFILES) return "full";
    const base = slugify(data.name).slice(0, 24) || "traveler";
    let newId = "";
    do newId = `${base}-${randomBytes(2).toString("hex")}`;
    while (db[newId]);
    const newToken = randomBytes(24).toString("hex");
    db[newId] = { data, tokenHash: hashToken(newToken), updatedAt: Date.now() };
    await save(db);
    return { id: newId, token: newToken };
  });
}

export function removeProfile(id: string, token: string): Promise<boolean> {
  return exclusive(async () => {
    const db = await load();
    if (!db[id]) return true;
    const given = Buffer.from(hashToken(token));
    const stored = Buffer.from(db[id].tokenHash);
    if (given.length !== stored.length || !timingSafeEqual(given, stored)) return false;
    delete db[id];
    await save(db);
    return true;
  });
}
