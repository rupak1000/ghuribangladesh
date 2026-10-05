import { NextResponse } from "next/server";
import { accountFromRequest, getState, putState, sanitizeSnapshot } from "@/lib/accountStore";
import { fail, limited, readJson, sameOrigin } from "@/lib/apiGuard";

export async function GET(req: Request) {
  try {
    const acc = await accountFromRequest(req);
    if (!acc) return fail("Not signed in", 401);
    const s = await getState(acc.id);
    return NextResponse.json({ state: s?.data ?? null, updatedAt: s?.updatedAt ?? null });
  } catch (e) {
    console.error("account api", e);
    return fail("Accounts are unavailable", 503);
  }
}

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return fail("Not allowed", 403);
  if (limited(req, "account-state", 60)) return fail("Too many requests", 429);
  const b = await readJson(req, 300_000);
  const snapshot = sanitizeSnapshot(b?.snapshot);
  if (!snapshot) return fail("Invalid data", 400);
  try {
    const acc = await accountFromRequest(req);
    if (!acc) return fail("Not signed in", 401);
    return NextResponse.json({ updatedAt: await putState(acc.id, snapshot) });
  } catch (e) {
    console.error("account api", e);
    return fail("Accounts are unavailable", 503);
  }
}
