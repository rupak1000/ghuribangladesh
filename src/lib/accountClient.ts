"use client";

import { actions, getStoreState, subscribeStore, type State } from "./store";
import type { AccountSnapshot } from "./accountSnapshot";

const SYNCED_KEY = "ghuri:synced";

export function buildSnapshot(s: State): AccountSnapshot {
  return {
    v: 1,
    districtMarks: s.districtMarks,
    placeMarks: s.placeMarks,
    foodMarks: s.foodMarks,
    trips: s.trips,
    profile: { name: s.user?.name ?? "Traveler", bio: s.user?.bio ?? "", homeDistrict: s.homeDistrict, mapTheme: s.mapTheme, lang: s.lang },
  };
}

export const hasLocalData = (s: State) => Object.keys(s.districtMarks).length + Object.keys(s.placeMarks).length + Object.keys(s.foodMarks).length + s.trips.length > 0;

const json = (o: unknown) => JSON.stringify(o);

function remember(snap: AccountSnapshot) {
  try {
    window.localStorage.setItem(SYNCED_KEY, json(snap));
  } catch {
    // storage unavailable
  }
}
function remembered(): string | null {
  try {
    return window.localStorage.getItem(SYNCED_KEY);
  } catch {
    return null;
  }
}

async function call<T>(url: string, method: string, body?: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(url, { method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? json(body) : undefined, credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, data: data as T } : { ok: false, error: (data as { error?: string }).error ?? "Something went wrong", status: res.status };
  } catch {
    return { ok: false, error: "Can't reach the server. Try again.", status: 0 };
  }
}

export async function createOnlineAccount(email: string): Promise<{ ok: true } | { error: string }> {
  const s = getStoreState();
  const snapshot = buildSnapshot(s);
  const r = await call<{ email: string | null }>("/api/account", "POST", { email, snapshot });
  if (!r.ok) return { error: r.error };
  remember(snapshot);
  actions.setAccount({ email: r.data.email });
  return { ok: true };
}

/** Signs in. The online map replaces this device's map unless `keepLocal` is set, which uploads this device's map instead. */
export async function signInOnline(email: string, keepLocal: boolean): Promise<{ ok: true; needsChoice?: boolean } | { error: string }> {
  const r = await call<{ email: string; state: AccountSnapshot | null }>("/api/account/login", "POST", { email });
  if (!r.ok) return { error: r.error };
  actions.setAccount({ email: r.data.email });
  const server = r.data.state;
  const local = getStoreState();
  if (keepLocal || !server) {
    const snap = buildSnapshot(local);
    await call("/api/account/state", "PUT", { snapshot: snap });
    remember(snap);
  } else {
    actions.applySnapshot(server);
    remember(server);
  }
  if (!getStoreState().user) actions.signIn({ name: "Traveler", email, bio: "" });
  return { ok: true };
}

export async function signOutOnline() {
  await call("/api/account/logout", "POST", {});
  actions.setAccount(null);
  try {
    window.localStorage.removeItem(SYNCED_KEY);
  } catch {
    // ignore
  }
}

export async function deleteOnlineAccount(): Promise<{ ok: true } | { error: string }> {
  const r = await call("/api/account", "DELETE");
  if (!r.ok) return { error: r.error };
  actions.setAccount(null);
  try {
    window.localStorage.removeItem(SYNCED_KEY);
  } catch {
    // ignore
  }
  return { ok: true };
}

export async function updateOnlineEmail(email: string): Promise<{ ok: true } | { error: string }> {
  const r = await call<{ email: string | null }>("/api/account/email", "PUT", { email });
  if (!r.ok) return { error: r.error };
  actions.setAccount({ email: r.data.email });
  return { ok: true };
}

/** Pulls the online copy when this device has no unsynced edits, otherwise pushes this device's copy (last write wins). */
async function reconcile(): Promise<boolean> {
  const r = await call<{ state: AccountSnapshot | null }>("/api/account/state", "GET");
  if (!r.ok) {
    if (r.status === 401) actions.setAccount(null);
    return false;
  }
  const local = buildSnapshot(getStoreState());
  const server = r.data.state;
  if (!server) {
    await call("/api/account/state", "PUT", { snapshot: local });
    remember(local);
    return true;
  }
  if (json(server) === json(local)) {
    remember(local);
    return true;
  }
  if (remembered() === json(local)) {
    actions.applySnapshot(server);
    remember(server);
  } else {
    await call("/api/account/state", "PUT", { snapshot: local });
    remember(local);
  }
  return true;
}

let started = false;

/** Keeps the signed-in account's online copy in step with this device. Safe to call more than once. */
export function startAccountSync() {
  if (started) return;
  started = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ready = false;
  const push = async () => {
    const s = getStoreState();
    if (!s.account || !ready) return;
    const snap = buildSnapshot(s);
    if (json(snap) === remembered()) return;
    const r = await call("/api/account/state", "PUT", { snapshot: snap });
    if (r.ok) remember(snap);
    else if (!r.ok && r.status === 401) actions.setAccount(null);
  };
  subscribeStore(() => {
    clearTimeout(timer);
    timer = setTimeout(push, 1500);
  });
  const boot = async () => {
    if (getStoreState().account) ready = await reconcile();
    else ready = true;
  };
  void boot();
  window.addEventListener("focus", () => {
    if (getStoreState().account) void reconcile();
  });
}
