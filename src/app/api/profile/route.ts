import { NextResponse } from "next/server";
import { publishProfile, removeProfile, sanitize } from "@/lib/profileStore";
import { limited, readJson, sameOrigin } from "@/lib/apiGuard";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  if (limited(req, "profile", 30)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const b = await readJson(req, 30_000);
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
  if (!sameOrigin(req)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  if (limited(req, "profile", 30)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const b = await readJson(req, 30_000);
  if (!b || typeof b.id !== "string" || typeof b.token !== "string") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    const ok = await removeProfile(b.id, b.token);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not allowed" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Profile storage is unavailable" }, { status: 503 });
  }
}
