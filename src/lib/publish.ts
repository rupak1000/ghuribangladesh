"use client";

import { actions, getLink } from "./store";
import type { ShareData } from "./share";

type Result = { ok: true; id: string } | { ok: false; error: string };

async function call(method: "POST" | "DELETE", payload: object): Promise<Response> {
  return fetch("/api/profile", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
}

export async function publishProfile(data: ShareData): Promise<Result> {
  try {
    const link = getLink();
    let res = await call("POST", { data, id: link?.id, token: link?.token });
    if (res.status === 403) res = await call("POST", { data });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: typeof json.error === "string" ? json.error : "Could not publish" };
    actions.setProfileLink({ id: json.id, token: json.token });
    return { ok: true, id: json.id };
  } catch {
    return { ok: false, error: "Could not reach the server" };
  }
}

export async function unpublishProfile(): Promise<boolean> {
  const link = getLink();
  if (!link) return true;
  try {
    const res = await call("DELETE", { id: link.id, token: link.token });
    if (!res.ok) return false;
    actions.setProfileLink(null);
    return true;
  } catch {
    return false;
  }
}

export async function publishTrip(trip: object): Promise<Result> {
  try {
    const res = await fetch("/api/trip", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ trip }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: typeof json.error === "string" ? json.error : "Could not share" };
    return { ok: true, id: json.id };
  } catch {
    return { ok: false, error: "Could not reach the server" };
  }
}
