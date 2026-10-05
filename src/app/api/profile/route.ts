import { NextResponse } from "next/server";
import { publishProfile, removeProfile, sanitize } from "@/lib/profileStore";

const hits = new Map<string, { n: number; reset: number }>();

function limited(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  return ++h.n > 30;
}

async function body(req: Request) {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 30_000) return null;
  try {
    return (await req.json()) as { [k: string]: unknown };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (limited(req)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const b = await body(req);
  const data = sanitize(b?.data);
  if (!b || !data) return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  try {
    const id = typeof b.id === "string" ? b.id : undefined;
    const token = typeof b.token === "string" ? b.token : undefined;
    const res = await publishProfile(data, id, token);
    if (res === "forbidden") return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    if (res === "full") return NextResponse.json({ error: "Profile storage is full" }, { status: 507 });
    return NextResponse.json({ id: res.id, token: res.token, path: `/u/${res.id}` });
  } catch {
    return NextResponse.json({ error: "Profile storage is unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  if (limited(req)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const b = await body(req);
  if (!b || typeof b.id !== "string" || typeof b.token !== "string") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    const ok = await removeProfile(b.id, b.token);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not allowed" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Profile storage is unavailable" }, { status: 503 });
  }
}
