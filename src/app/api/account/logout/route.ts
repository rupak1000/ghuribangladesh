import { NextResponse } from "next/server";
import { accountFromRequest, endSession } from "@/lib/accountStore";
import { clearSession, fail, sameOrigin } from "@/lib/apiGuard";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Not allowed", 403);
  try {
    const acc = await accountFromRequest(req);
    if (acc) await endSession(acc.token);
  } catch {
    // still clear the cookie below
  }
  const out = NextResponse.json({ ok: true });
  clearSession(out, req);
  return out;
}
