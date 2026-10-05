import { NextResponse } from "next/server";
import { sanitizeTrip, shareTrip } from "@/lib/tripStore";
import { limited, readJson, sameOrigin } from "@/lib/apiGuard";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  if (limited(req, "trip", 20)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await readJson(req, 60_000);
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
