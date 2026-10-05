import { NextResponse } from "next/server";
import { accountFromRequest, accountInfo, cleanEmail, createAccount, deleteAccount, sanitizeSnapshot } from "@/lib/accountStore";
import { clearSession, fail, limited, readJson, sameOrigin, setSession } from "@/lib/apiGuard";

export async function GET(req: Request) {
  const acc = await accountFromRequest(req);
  const info = acc && (await accountInfo(acc.id));
  return NextResponse.json({ signedIn: !!info, email: info?.email ?? null });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Not allowed", 403);
  if (limited(req, "account-create", 10)) return fail("Too many requests", 429);
  const b = await readJson(req, 300_000);
  if (!b) return fail("Invalid request", 400);
  const emailGiven = typeof b.email === "string" && b.email.trim() !== "";
  const email = emailGiven ? cleanEmail(b.email) : null;
  if (emailGiven && !email) return fail("Enter a valid email", 400);
  const snapshot = sanitizeSnapshot(b.snapshot);
  try {
    const res = await createAccount(snapshot, email);
    if (res === "full") return fail("Accounts are full", 507);
    if (res === "email-taken") return fail("That email already has an account. Sign in with it instead.", 409);
    const out = NextResponse.json({ email });
    setSession(out, req, res.sessionToken);
    return out;
  } catch (e) {
    console.error("account api", e);
    return fail("Accounts are unavailable", 503);
  }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return fail("Not allowed", 403);
  if (limited(req, "account-delete", 10)) return fail("Too many requests", 429);
  try {
    const acc = await accountFromRequest(req);
    if (!acc) return fail("Not signed in", 401);
    await deleteAccount(acc.id);
    const out = NextResponse.json({ ok: true });
    clearSession(out, req);
    return out;
  } catch (e) {
    console.error("account api", e);
    return fail("Accounts are unavailable", 503);
  }
}
