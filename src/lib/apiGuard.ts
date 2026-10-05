import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_DAYS } from "./accountStore";

const hits = new Map<string, { n: number; reset: number }>();

/** Per-IP rate limit, kept in memory (one server process). */
export function limited(req: Request, bucket: string, max: number): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + 60_000 });
    return false;
  }
  return ++h.n > max;
}

/** Rejects cross-site requests: a browser always sends Origin on cross-origin POST/PUT/DELETE. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

/** Reads a JSON object body, stopping as soon as it passes `maxBytes` (a missing or false Content-Length is not trusted). */
export async function readJson(req: Request, maxBytes: number): Promise<{ [k: string]: unknown } | null> {
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes || !req.body) return null;
  try {
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const v = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return v && typeof v === "object" && !Array.isArray(v) ? (v as { [k: string]: unknown }) : null;
  } catch {
    return null;
  }
}

const secure = (req: Request) => (req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "")) === "https";

export function setSession(res: NextResponse, req: Request, token: string) {
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: secure(req), path: "/", maxAge: SESSION_DAYS * 86_400 });
}

export function clearSession(res: NextResponse, req: Request) {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: secure(req), path: "/", maxAge: 0 });
}

export const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
