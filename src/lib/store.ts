"use client";

import { useSyncExternalStore } from "react";
import { districts, getPlace, places, foods } from "./data";
import type { FoodMark, Mark } from "./types";
import type { TransportPref } from "./travel";
import type { StayLevel } from "./tripBudget";
import type { AccountSnapshot } from "./accountSnapshot";
export { achievements, type Achievement } from "./achievements";

export interface User {
  name: string;
  email: string;
  bio: string;
}

export interface TripActivity {
  id: string;
  label: string;
  kind: "place" | "food" | "custom";
  refId?: string;
}

export interface TripDay {
  title: string;
  districtSlug: string;
  morning: TripActivity[];
  afternoon: TripActivity[];
  evening: TripActivity[];
}

export interface Trip {
  id: string;
  name: string;
  style: string;
  days: TripDay[];
  createdAt: number;
  origin?: string;
  travelers?: number;
  returnToStart?: boolean;
  pref?: TransportPref;
  level?: StayLevel;
  exclude?: string[];
  rates?: { busKm?: number; room?: number; food?: number; local?: number; extrasPct?: number };
}

export type Lang = "en" | "bn";
type MarkSet<K extends string> = Record<string, Partial<Record<K, true>>>;

export interface State {
  hydrated: boolean;
  lang: Lang;
  mapTheme: string;
  homeDistrict: string | null;
  account: { email: string | null } | null;
  profileLink: { id: string; token: string } | null;
  user: User | null;
  districtMarks: MarkSet<Mark>;
  placeMarks: MarkSet<Mark>;
  foodMarks: MarkSet<FoodMark>;
  trips: Trip[];
  draftDistricts: string[];
  draftPlaces: string[];
  isSample: boolean;
}

const KEY = "ghuri:v1";

const INITIAL: State = {
  hydrated: false,
  lang: "en",
  mapTheme: "natural",
  homeDistrict: null,
  account: null,
  profileLink: null,
  user: null,
  districtMarks: {},
  placeMarks: {},
  foodMarks: {},
  trips: [],
  draftDistricts: [],
  draftPlaces: [],
  isSample: false,
};

let state: State = INITIAL;
let loaded = false;
const listeners = new Set<() => void>();

function load(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...INITIAL, ...JSON.parse(raw), hydrated: true };
  } catch {
    // storage unavailable or corrupt: start fresh
  }
  return { ...INITIAL, hydrated: true };
}

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  try {
    const { hydrated: _h, ...persist } = state;
    void _h;
    window.localStorage.setItem(KEY, JSON.stringify(persist));
  } catch {
    // ignore quota / privacy-mode errors
  }
  listeners.forEach((l) => l());
}

function getSnapshot(): State {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    state = load();
  }
  return state;
}

export const getLink = () => getSnapshot().profileLink;
export const getStoreState = () => getSnapshot();
export function subscribeStore(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    () => INITIAL,
  );
}

function toggleIn<K extends string>(marks: MarkSet<K>, id: string, mark: K): MarkSet<K> {
  const cur = { ...(marks[id] ?? {}) };
  if (cur[mark]) delete cur[mark];
  else cur[mark] = true;
  const next = { ...marks };
  if (Object.keys(cur).length) next[id] = cur;
  else delete next[id];
  return next;
}

function clearWant(marks: MarkSet<Mark>, slug: string): MarkSet<Mark> {
  if (!marks[slug]?.visited || !marks[slug]?.want) return marks;
  const { want: _w, ...rest } = marks[slug];
  void _w;
  return { ...marks, [slug]: rest };
}

export const actions = {
  setLang(lang: Lang) {
    set({ lang });
  },
  setMapTheme(mapTheme: string) {
    set({ mapTheme });
  },
  setAccount(account: { email: string | null } | null) {
    set({ account });
  },
  applySnapshot(snap: AccountSnapshot) {
    const cur = getSnapshot();
    set({
      districtMarks: snap.districtMarks,
      placeMarks: snap.placeMarks,
      foodMarks: snap.foodMarks,
      trips: snap.trips,
      homeDistrict: snap.profile.homeDistrict,
      mapTheme: snap.profile.mapTheme,
      lang: snap.profile.lang,
      user: { name: snap.profile.name, email: cur.account?.email ?? cur.user?.email ?? "", bio: snap.profile.bio },
      isSample: false,
    });
  },
  setHomeDistrict(homeDistrict: string | null) {
    set({ homeDistrict });
  },
  setProfileLink(profileLink: { id: string; token: string } | null) {
    set({ profileLink });
  },
  signIn(user: User) {
    set({ user });
  },
  signOut() {
    set({ user: null });
  },
  toggleDistrict(slug: string, mark: Mark) {
    const dm = toggleIn(getSnapshot().districtMarks, slug, mark);
    set({ districtMarks: mark === "visited" ? clearWant(dm, slug) : dm });
  },
  setDistrictsVisited(slugs: string[], on: boolean) {
    const dm = { ...getSnapshot().districtMarks };
    for (const slug of slugs) {
      const { want: _w, visited: _v, ...rest } = dm[slug] ?? {};
      void _w;
      void _v;
      const next = on ? { ...rest, visited: true as const } : rest;
      if (Object.keys(next).length) dm[slug] = next;
      else delete dm[slug];
    }
    set({ districtMarks: dm });
  },
  togglePlace(id: string, mark: Mark) {
    const s = getSnapshot();
    const pm = toggleIn(s.placeMarks, id, mark);
    let dm = s.districtMarks;
    const slug = getPlace(id)?.districtSlug;
    if (mark === "visited" && pm[id]?.visited && slug && !dm[slug]?.visited) {
      dm = clearWant({ ...dm, [slug]: { ...(dm[slug] ?? {}), visited: true } }, slug);
    }
    set({ placeMarks: pm, districtMarks: dm });
  },
  toggleFood(id: string, mark: FoodMark) {
    set({ foodMarks: toggleIn(getSnapshot().foodMarks, id, mark) });
  },
  toggleDraftDistrict(slug: string) {
    const s = getSnapshot();
    const has = s.draftDistricts.includes(slug);
    set({
      draftDistricts: has ? s.draftDistricts.filter((x) => x !== slug) : [...s.draftDistricts, slug],
      draftPlaces: has ? s.draftPlaces.filter((id) => getPlace(id)?.districtSlug !== slug) : s.draftPlaces,
    });
  },
  toggleDraftPlace(id: string) {
    const s = getSnapshot();
    const slug = getPlace(id)?.districtSlug;
    if (!slug) return;
    const has = s.draftPlaces.includes(id);
    set({
      draftPlaces: has ? s.draftPlaces.filter((x) => x !== id) : [...s.draftPlaces, id],
      draftDistricts: s.draftDistricts.includes(slug) ? s.draftDistricts : [...s.draftDistricts, slug],
    });
  },
  moveDraftDistrict(slug: string, dir: -1 | 1) {
    const list = [...getSnapshot().draftDistricts];
    const i = list.indexOf(slug);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set({ draftDistricts: list });
  },
  clearDraft() {
    set({ draftDistricts: [], draftPlaces: [] });
  },
  saveTrip(trip: Trip) {
    const s = getSnapshot();
    const exists = s.trips.some((t) => t.id === trip.id);
    set({ trips: exists ? s.trips.map((t) => (t.id === trip.id ? trip : t)) : [trip, ...s.trips] });
  },
  deleteTrip(id: string) {
    set({ trips: getSnapshot().trips.filter((t) => t.id !== id) });
  },
  loadSample() {
    const visited = ["dhaka", "coxs-bazar", "sylhet", "chattogram", "moulvibazar", "bogura", "cumilla", "gazipur", "narayanganj", "tangail", "rajshahi", "khulna"];
    const want = ["bandarban", "rangamati", "sunamganj", "patuakhali", "bagerhat", "naogaon", "dinajpur", "panchagarh"];
    const fav = ["coxs-bazar", "sylhet"];
    const dm: MarkSet<Mark> = {};
    visited.forEach((s) => (dm[s] = { visited: true }));
    want.forEach((s) => (dm[s] = { want: true }));
    fav.forEach((s) => (dm[s] = { ...(dm[s] ?? {}), favorite: true }));
    const pm: MarkSet<Mark> = {};
    for (const p of places) {
      if (visited.includes(p.districtSlug) && p.rating >= 4.3) pm[p.id] = { visited: true };
      else if (want.includes(p.districtSlug) && p.rating >= 4.5) pm[p.id] = { want: true };
    }
    for (const id of Object.keys(pm)) {
      const p = getPlace(id);
      if (p && fav.includes(p.districtSlug) && p.rating >= 4.6) pm[id] = { ...pm[id], favorite: true };
    }
    const fm: MarkSet<FoodMark> = {};
    for (const f of foods) {
      if (visited.includes(f.districtSlug) && f.rating >= 4.4) fm[f.id] = { tried: true };
      else if (want.includes(f.districtSlug) && f.rating >= 4.4) fm[f.id] = { want: true };
    }
    set({
      user: { name: "Demo Traveler", email: "demo@ghuri.local", bio: "Explorer · Foodie · Traveler" },
      districtMarks: dm,
      placeMarks: pm,
      foodMarks: fm,
      isSample: true,
    });
  },
  reset() {
    set({ ...INITIAL, hydrated: true, lang: getSnapshot().lang, mapTheme: getSnapshot().mapTheme, homeDistrict: getSnapshot().homeDistrict, account: getSnapshot().account, profileLink: getSnapshot().profileLink, user: getSnapshot().user, isSample: false });
  },
};

export function useProgress() {
  const s = useStore();
  const visitedDistricts = districts.filter((d) => s.districtMarks[d.slug]?.visited).map((d) => d.slug);
  const wantDistricts = districts.filter((d) => s.districtMarks[d.slug]?.want).map((d) => d.slug);
  const favDistricts = districts.filter((d) => s.districtMarks[d.slug]?.favorite).map((d) => d.slug);
  const visitedPlaces = places.filter((p) => s.placeMarks[p.id]?.visited);
  const wantPlaces = places.filter((p) => s.placeMarks[p.id]?.want);
  const favPlaces = places.filter((p) => s.placeMarks[p.id]?.favorite);
  const triedFoods = foods.filter((f) => s.foodMarks[f.id]?.tried);
  const wantFoods = foods.filter((f) => s.foodMarks[f.id]?.want);
  const favFoods = foods.filter((f) => s.foodMarks[f.id]?.favorite);
  const triedDistricts = new Set(triedFoods.map((f) => f.districtSlug));
  return {
    visitedDistricts, wantDistricts, favDistricts,
    visitedPlaces, wantPlaces, favPlaces,
    triedFoods, wantFoods, favFoods,
    tastedDistricts: triedDistricts.size,
    favorites: favPlaces.length + favDistricts.length,
  };
}

export type Progress = ReturnType<typeof useProgress>;
