import { NextResponse } from "next/server";
import { sanitizeTrip, shareTrip } from "@/lib/tripStore";

const hits = new Map<string, { n: number; reset: number }>();

function limited(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  return ++h.n > 20;
}

export async function POST(req: Request) {
  if (limited(req)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (Number(req.headers.get("content-length") ?? 0) > 60_000) return NextResponse.json({ error: "Trip is too large" }, { status: 413 });
  let body: { [k: string]: unknown } | null = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const trip = sanitizeTrip(body?.trip);
  if (!trip) return NextResponse.json({ error: "Invalid trip" }, { status: 400 });
  try {
    const id = await shareTrip(trip);
    if (id === "full") return NextResponse.json({ error: "Trip storage is full" }, { status: 507 });
    return NextResponse.json({ id, path: `/trip/${id}` });
  } catch {
    return NextResponse.json({ error: "Trip storage is unavailable" }, { status: 503 });
  }
}
