import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { districts, foods, places } from "./data";
import { mapThemes } from "./mapThemes";
import { sanitizeTrip } from "./tripStore";
import type { AccountSnapshot, MarkMap } from "./accountSnapshot";
import type { FoodMark, Mark } from "./types";

export const SESSION_COOKIE = "ghuri_session";
export const SESSION_DAYS = 90;
const MAX_ACCOUNTS = 20000;

const districtSlugs = new Set(districts.map((d) => d.slug));
const placeIds = new Set(places.map((p) => p.id));
const foodIds = new Set(foods.map((f) => f.id));
const themeKeys = new Set(mapThemes.map((t) => t.key));

const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max) : "");

export const cleanEmail = (v: unknown): string | null => {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  return e.length >= 5 && e.length <= 120 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(e) ? e : null;
};

function marks<K extends string>(raw: unknown, known: Set<string>, keys: readonly K[]): MarkMap<K> {
  const out: MarkMap<K> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, m] of Object.entries(raw as { [k: string]: unknown })) {
    if (!known.has(id) || !m || typeof m !== "object") continue;
    const entry: Partial<Record<K, true>> = {};
    for (const k of keys) if ((m as { [k: string]: unknown })[k] === true) entry[k] = true;
    if (Object.keys(entry).length) out[id] = entry;
  }
  return out;
}

export function sanitizeSnapshot(raw: unknown): AccountSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { [k: string]: unknown };
  const p = (r.profile && typeof r.profile === "object" ? r.profile : {}) as { [k: string]: unknown };
  const trips = (Array.isArray(r.trips) ? r.trips.slice(0, 50) : []).flatMap((t) => {
    const clean = sanitizeTrip(t);
    if (!clean) return [];
    const src = t as { id?: unknown; createdAt?: unknown };
    return [{ ...clean, id: text(src.id, 40) || `t${Date.now().toString(36)}`, createdAt: Number.isFinite(Number(src.createdAt)) ? Number(src.createdAt) : Date.now() }];
  });
  return {
    v: 1,
    districtMarks: marks<Mark>(r.districtMarks, districtSlugs, ["visited", "want", "favorite"]),
    placeMarks: marks<Mark>(r.placeMarks, placeIds, ["visited", "want", "favorite"]),
    foodMarks: marks<FoodMark>(r.foodMarks, foodIds, ["tried", "want", "favorite"]),
    trips,
    profile: {
      name: text(p.name, 40) || "Traveler",
      bio: text(p.bio, 80),
      homeDistrict: typeof p.homeDistrict === "string" && districtSlugs.has(p.homeDistrict) ? p.homeDistrict : null,
      mapTheme: typeof p.mapTheme === "string" && themeKeys.has(p.mapTheme) ? p.mapTheme : "natural",
      lang: p.lang === "bn" ? "bn" : "en",
    },
  };
}

async function openSession(accountId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await db.session.create({ data: { id: randomBytes(12).toString("hex"), accountId, tokenHash: sha(token), expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) } });
  return token;
}

/** Creates an account and returns a signed-in session token. */
export async function createAccount(snapshot: AccountSnapshot | null, email: string | null): Promise<{ sessionToken: string } | "full" | "email-taken"> {
  if ((await db.account.count()) >= MAX_ACCOUNTS) return "full";
  const id = randomBytes(12).toString("hex");
  try {
    await db.account.create({
      data: {
        id,
        email,
        ...(snapshot ? { state: { create: { data: snapshot as unknown as Prisma.InputJsonValue } } } : {}),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return "email-taken";
    throw e;
  }
  return { sessionToken: await openSession(id) };
}

/** Signs in by email alone. The email is not verified (no way to send mail yet), see ADR-0005. */
export async function login(email: string): Promise<{ sessionToken: string; email: string; accountId: string } | null> {
  const acc = await db.account.findUnique({ where: { email } });
  if (!acc) return null;
  return { sessionToken: await openSession(acc.id), email, accountId: acc.id };
}

/** The only place an account id comes from: the session cookie, never a client-supplied id. */
export async function accountFromRequest(req: Request): Promise<{ id: string; token: string } | null> {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([0-9a-f]{64})`));
  if (!m) return null;
  const s = await db.session.findUnique({ where: { tokenHash: sha(m[1]) } });
  if (!s || s.expiresAt.getTime() < Date.now()) return null;
  return { id: s.accountId, token: m[1] };
}

export async function endSession(token: string) {
  await db.session.deleteMany({ where: { tokenHash: sha(token) } });
}

export async function accountInfo(id: string) {
  const a = await db.account.findUnique({ where: { id }, select: { email: true, createdAt: true } });
  return a ? { email: a.email, createdAt: a.createdAt.getTime() } : null;
}

export async function setEmail(id: string, email: string | null): Promise<"ok" | "email-taken"> {
  try {
    await db.account.update({ where: { id }, data: { email } });
    return "ok";
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return "email-taken";
    throw e;
  }
}

export async function getState(id: string): Promise<{ data: AccountSnapshot; updatedAt: number } | null> {
  const row = await db.accountState.findUnique({ where: { accountId: id } });
  return row ? { data: row.data as unknown as AccountSnapshot, updatedAt: row.updatedAt.getTime() } : null;
}

export async function putState(id: string, snapshot: AccountSnapshot): Promise<number> {
  const json = snapshot as unknown as Prisma.InputJsonValue;
  const row = await db.accountState.upsert({ where: { accountId: id }, create: { accountId: id, data: json }, update: { data: json, updatedAt: new Date() } });
  return row.updatedAt.getTime();
}

export async function deleteAccount(id: string) {
  await db.account.delete({ where: { id } });
}
