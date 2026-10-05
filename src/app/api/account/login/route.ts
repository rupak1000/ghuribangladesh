import { NextResponse } from "next/server";
import { cleanEmail, getState, login } from "@/lib/accountStore";
import { fail, limited, readJson, sameOrigin, setSession } from "@/lib/apiGuard";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Not allowed", 403);
  if (limited(req, "account-login", 8)) return fail("Too many attempts. Try again in a minute.", 429);
  const b = await readJson(req, 2_000);
  const email = cleanEmail(b?.email);
  if (!email) return fail("Enter your email", 400);
  try {
    const res = await login(email);
    if (!res) return fail("No online map found for that email", 404);
    const state = await getState(res.accountId);
    const out = NextResponse.json({ email: res.email, state: state?.data ?? null });
    setSession(out, req, res.sessionToken);
    return out;
  } catch (e) {
    console.error("account api", e);
    return fail("Accounts are unavailable", 503);
  }
}
