import { NextResponse } from "next/server";
import { accountFromRequest, cleanEmail, setEmail } from "@/lib/accountStore";
import { fail, limited, readJson, sameOrigin } from "@/lib/apiGuard";

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return fail("Not allowed", 403);
  if (limited(req, "account-email", 10)) return fail("Too many requests", 429);
  const b = await readJson(req, 2_000);
  const given = typeof b?.email === "string" && b.email.trim() !== "";
  const email = given ? cleanEmail(b?.email) : null;
  if (given && !email) return fail("Enter a valid email", 400);
  try {
    const acc = await accountFromRequest(req);
    if (!acc) return fail("Not signed in", 401);
    if ((await setEmail(acc.id, email)) === "email-taken") return fail("That email already has an account", 409);
    return NextResponse.json({ email });
  } catch (e) {
    console.error("account api", e);
    return fail("Accounts are unavailable", 503);
  }
}
