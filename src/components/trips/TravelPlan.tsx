"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Bike, Bus, Car, Check, Footprints, MapPin, Minus, Plane, Plus, Route, Ship, Star, type LucideIcon } from "lucide-react";
import { districts, divisions, getDistrict, placesOf } from "@/lib/data";
import { categoryMeta } from "@/lib/categories";
import { actions, useStore } from "@/lib/store";
import type { Trip, TripDay } from "@/lib/store";
import { buildLegs, formatHours, roadKm, summarize, takaRange, transportPrefs, tripSequence, type TransportPref, type TravelMode } from "@/lib/travel";
import { levelOf, money, stayLevels, tripBreakdown, type StayLevel } from "@/lib/tripBudget";
import { cn } from "@/lib/utils";
import { Media } from "../Media";
import { BangladeshMap } from "../map/BangladeshMap";
import { T, DS, DN } from "@/components/T";
import { useT } from "@/lib/i18n";

export function OriginPicker({ origin, setOrigin }: { origin: string; setOrigin: (v: string) => void }) {
  const { t, dn } = useT();
  const d = getDistrict(origin);
  return (
    <div className="rounded-2xl border border-amber/40 bg-amber-soft p-4">
      <label htmlFor="origin-city" className="flex items-center gap-2 font-display text-lg font-semibold"><MapPin className="size-5 text-[#8a5a0a]" aria-hidden /> <T>Starting city</T></label>
      <p className="mt-0.5 text-sm text-muted"><T>Where does your trip begin? Distances and fares are worked out from here.</T></p>
      <select id="origin-city" value={origin} onChange={(e) => setOrigin(e.target.value)} className="mt-3 h-12 w-full rounded-xl border border-line bg-white px-3 text-base font-semibold outline-none focus:border-emerald">
        {sorted.map((x) => <option key={x.slug} value={x.slug}>{dn(x)} ({t(x.division)})</option>)}
      </select>
      {d && <p className="mt-2 text-xs font-medium text-[#8a5a0a]"><T>Starting from</T> <DN d={d} />. <T>It shows in amber on the map below.</T></p>}
    </div>
  );
}

export function DestinationPicker({ origin }: { origin: string }) {
  const { dn } = useT();
  const { draftDistricts } = useStore();
  return (
    <div className="mt-4 rounded-2xl border border-emerald/25 bg-emerald-soft/50 p-4">
      <label htmlFor="destination-city" className="flex items-center gap-2 font-display text-lg font-semibold"><Plus className="size-5 text-forest" aria-hidden /> <T>Add a destination</T></label>
      <p className="mt-0.5 text-sm text-muted"><T>Pick a district from the list. Add as many as you like.</T></p>
      <select
        id="destination-city"
        value=""
        onChange={(e) => e.target.value && actions.toggleDraftDistrict(e.target.value)}
        className="mt-3 h-12 w-full rounded-xl border border-line bg-white px-3 text-base font-semibold outline-none focus:border-emerald"
      >
        <option value=""><T>Choose a destination…</T></option>
        {divisions.map((div) => (
          <optgroup key={div} label={`${div} Division`}>
            {sorted.filter((x) => x.division === div && x.slug !== origin && !draftDistricts.includes(x.slug)).map((x) => <option key={x.slug} value={x.slug}>{dn(x)}</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

const sorted = [...districts].sort((a, b) => a.name.localeCompare(b.name));

const prefIcon: { [k in TransportPref]: LucideIcon } = { budget: Bus, comfort: Bus, fast: Plane, car: Car, bike: Bike, ferry: Ship, hike: Footprints };
const modeIcon = (m: TravelMode): LucideIcon => ({ local: Bus, bus: Bus, ac: Bus, air: Plane, car: Car, bike: Bike, ferry: Ship, hike: Footprints })[m.key];

interface OptionsProps {
  origin: string;
  travelers: number;
  setTravelers: (n: number) => void;
  returnToStart: boolean;
  setReturnToStart: (v: boolean) => void;
  pref: TransportPref;
  setPref: (p: TransportPref) => void;
  level: StayLevel;
  setLevel: (l: StayLevel) => void;
  optimize: boolean;
  setOptimize: (v: boolean) => void;
  selected: string[];
}

export function TravelOptions(p: OptionsProps) {
  return (
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold"><Route className="size-5 text-emerald" aria-hidden /> Travel</h3>
      <div className="mt-3">
        <p className="text-sm font-medium" id="travelers-label"><T>Travelers</T></p>
        <div className="mt-1 flex h-11 items-center gap-3" role="group" aria-labelledby="travelers-label">
          <button aria-label="Fewer travelers" disabled={p.travelers <= 1} onClick={() => p.setTravelers(p.travelers - 1)} className="grid size-11 place-items-center rounded-full border border-line bg-white hover:border-emerald/40 disabled:opacity-40"><Minus className="size-4" /></button>
          <span className="w-8 text-center text-lg font-semibold" aria-live="polite">{p.travelers}</span>
          <button aria-label="More travelers" disabled={p.travelers >= 20} onClick={() => p.setTravelers(p.travelers + 1)} className="grid size-11 place-items-center rounded-full border border-line bg-white hover:border-emerald/40 disabled:opacity-40"><Plus className="size-4" /></button>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium" id="pref-label"><T>How will you get around?</T></p>
      <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-labelledby="pref-label">
        {transportPrefs.map((x) => {
          const Icon = prefIcon[x.key];
          return (
            <button
              key={x.key}
              role="radio"
              aria-checked={p.pref === x.key}
              onClick={() => p.setPref(x.key)}
              className={cn("flex min-h-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl border px-2 py-2 text-center transition active:scale-[0.98]", p.pref === x.key ? "border-forest bg-forest text-white shadow-soft" : "border-line bg-white hover:border-forest/40 hover:bg-moss")}
            >
              <Icon className="size-5" aria-hidden />
              <span className="text-sm font-semibold leading-tight">{x.label}</span>
              <span className={cn("text-[11px] leading-tight", p.pref === x.key ? "text-white/80" : "text-muted")}>{x.blurb}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-muted"><T>Where your choice isn&apos;t possible, such as a ferry with no waterway, the plan falls back to a bus. Every option stays listed on each leg.</T></p>

      <p className="mt-4 text-sm font-medium" id="level-label"><T>Stay &amp; food level</T></p>
      <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-labelledby="level-label">
        {stayLevels.map((x) => (
          <button
            key={x.key}
            role="radio"
            aria-checked={p.level === x.key}
            onClick={() => p.setLevel(x.key)}
            className={cn("rounded-2xl border px-2 py-2.5 text-center transition active:scale-[0.98]", p.level === x.key ? "border-forest bg-forest text-white shadow-soft" : "border-line bg-white hover:border-forest/40 hover:bg-moss")}
          >
            <span className="block text-sm font-semibold">{x.label}</span>
            <span className={cn("block text-[11px] leading-tight", p.level === x.key ? "text-white/80" : "text-muted")}>{x.blurb}</span>
          </button>
        ))}
      </div>

      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
        <input type="checkbox" checked={p.returnToStart} onChange={(e) => p.setReturnToStart(e.target.checked)} className="size-5 accent-[#137a58]" />
        Return to <DS slug={p.origin} /> at the end
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
        <input type="checkbox" checked={p.optimize} onChange={(e) => p.setOptimize(e.target.checked)} className="size-5 accent-[#137a58]" />
        <T>Shortest route between my destinations</T>
      </label>

      {!p.optimize && p.selected.length > 1 && (
        <ol className="mt-2 space-y-1.5" aria-label="Destination order">
          {p.selected.map((slug, i) => (
            <li key={slug} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 text-sm">
              <span className="grid size-6 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">{i + 1}</span>
              <span className="flex-1 font-medium"><DS slug={slug} /></span>
              <button aria-label={`Move $<DS slug={slug} /> up`} disabled={i === 0} onClick={() => actions.moveDraftDistrict(slug, -1)} className="grid size-9 place-items-center rounded-full hover:bg-moss disabled:opacity-30"><ArrowUp className="size-4" /></button>
              <button aria-label={`Move $<DS slug={slug} /> down`} disabled={i === p.selected.length - 1} onClick={() => actions.moveDraftDistrict(slug, 1)} className="grid size-9 place-items-center rounded-full hover:bg-moss disabled:opacity-30"><ArrowDown className="size-4" /></button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function useTravel(trip: Trip) {
  return useMemo(() => {
    const travelers = trip.travelers ?? 1;
    const seq = tripSequence(trip.origin, trip.days.map((d) => d.districtSlug), !!trip.returnToStart);
    const legs = trip.origin ? buildLegs(seq, trip.pref ?? "budget", travelers) : [];
    return { legs, sum: summarize(legs), travelers };
  }, [trip.origin, trip.days, trip.returnToStart, trip.pref, trip.travelers]);
}

export function useBreakdown(trip: Trip) {
  return useMemo(() => tripBreakdown(trip), [trip]);
}

function RouteMapView({ trip }: { trip: Trip }) {
  const route = tripSequence(trip.origin, trip.days.map((d) => d.districtSlug), !!trip.returnToStart);
  const stops = new Set(route);
  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-2xl border border-line">
        <BangladeshMap
          className="h-[320px] md:h-[380px]"
          route={route}
          districtStyle={(slug) => (slug === trip.origin ? { fill: "#e9a23b" } : stops.has(slug) ? { fill: "#137a58" } : {})}
        />
      </div>
      <p className="mt-2 text-xs text-muted"><T>Amber S is where you start. Numbers show your stops in order, and each dashed line shows the approximate road distance.</T></p>
    </div>
  );
}

export function TravelPlanCard({ trip }: { trip: Trip }) {
  const { legs, sum, travelers } = useTravel(trip);
  if (!trip.origin) return null;
  const pref = transportPrefs.find((x) => x.key === (trip.pref ?? "budget"));

  return (
    <section className="mb-4 rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7" aria-label="Travel route and cost">
      <p className="eyebrow"><T>Travel route &amp; cost</T></p>
      <h2 className="mt-1 font-display text-2xl font-semibold leading-tight"><T>From</T> <DS slug={trip.origin} /></h2>
      <p className="mt-1 text-sm text-muted">{pref?.label} · {pref?.blurb} · {travelers} {travelers === 1 ? "traveler" : "travelers"}</p>

      {legs.length > 0 && <RouteMapView trip={trip} />}

      {legs.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-moss px-4 py-3 text-sm text-muted"><T>Your trip stays in</T> <DS slug={trip.origin} />. <T>There is no intercity travel to price. Pick destinations elsewhere to see distances and fares.</T></p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-moss px-2 py-3"><dt className="text-[11px] font-semibold text-muted"><T>Distance</T></dt><dd className="font-display text-xl font-semibold">~{sum.km.toLocaleString("en-US")} km</dd></div>
            <div className="rounded-2xl bg-moss px-2 py-3"><dt className="text-[11px] font-semibold text-muted"><T>Travel time</T></dt><dd className="font-display text-xl font-semibold">~{formatHours(sum.hours)}</dd></div>
            <div className="rounded-2xl bg-forest px-2 py-3 text-white"><dt className="text-[11px] font-semibold text-white/75"><T>Cost / person</T></dt><dd className="font-display text-lg font-semibold leading-tight">{takaRange(sum.low, sum.high)}</dd></div>
          </dl>
          {travelers > 1 && <p className="mt-2 text-center text-sm font-semibold text-forest">For {travelers} travelers: {takaRange(sum.low * travelers, sum.high * travelers)}</p>}

          <ol className="mt-5 space-y-3">
            {legs.map((l, i) => (
              <li key={`${l.from}-${l.to}-${i}`} className="rounded-2xl border border-line bg-white p-3.5">
                <p className="flex flex-wrap items-center gap-x-2 font-semibold">
                  <span className="grid size-6 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">{i + 1}</span>
                  <DS slug={l.from} /> <ArrowRight className="size-4 text-emerald" aria-label="to" /> <DS slug={l.to} />
                </p>
                <p className="mt-1 text-sm text-muted">~{l.km} km by road · ~{formatHours(l.pick.hours)} by {l.pick.label.toLowerCase()}</p>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {l.modes.map((m) => {
                    const Icon = modeIcon(m);
                    const on = m.key === l.pick.key;
                    return (
                      <li key={m.key} title={m.note} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", on ? "bg-emerald text-white" : "bg-moss text-ink")}>
                        <Icon className="size-3.5" aria-hidden /> {m.label} · {m.low === 0 && m.high === 0 ? "Free" : takaRange(m.low, m.high)}
                      </li>
                    );
                  })}
                </ul>
                {l.pick.note && <p className="mt-2 text-xs text-muted">{l.pick.note}</p>}
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="mt-4 text-xs text-muted"><T>Distances are approximate road distances between district centres. Fares are typical per-person ranges and change by operator, season and class. Self-drive costs are fuel and tolls, split across the car or bike.</T></p>
    </section>
  );
}

const RATE_FIELDS: { key: "busKm" | "room" | "food" | "local" | "extrasPct"; label: string; unit: string; step: number }[] = [
  { key: "busKm", label: "Bus fare", unit: "৳ per km", step: 0.1 },
  { key: "room", label: "Hotel room", unit: "৳ per night", step: 50 },
  { key: "food", label: "Food", unit: "৳ per person per day", step: 50 },
  { key: "local", label: "Local transport", unit: "৳ per person per day", step: 50 },
  { key: "extrasPct", label: "Entry fees & extras", unit: "% of the rest", step: 1 },
];

function RatesEditor({ trip, setTrip }: { trip: Trip; setTrip: (t: Trip) => void }) {
  const level = levelOf(trip);
  const rates = trip.rates ?? {};
  const defaults = { busKm: 2.8, room: level.room, food: level.food, local: level.local, extrasPct: 10 };
  const set = (key: keyof typeof defaults, raw: string) => {
    const v = raw === "" ? undefined : Number(raw);
    const next = { ...rates, [key]: v !== undefined && Number.isFinite(v) && v >= 0 ? v : undefined };
    setTrip({ ...trip, rates: Object.values(next).some((x) => x !== undefined) ? next : undefined });
  };
  const used = Object.values(rates).some((x) => x !== undefined);
  return (
    <details className="mt-3 rounded-2xl border border-line bg-white px-4 py-1 print:hidden" open={used}>
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Use your own prices {used && <span className="ml-1 rounded-full bg-emerald-soft px-2 py-0.5 text-xs text-forest">in use</span>}</summary>
      <p className="pb-2 text-xs text-muted"><T>Prices here are typical, not live. If you have a real quote, a hotel rate or a ticket price, type it in and the total updates. Leave a box empty to keep the estimate.</T></p>
      <div className="grid gap-3 pb-3 sm:grid-cols-2">
        {RATE_FIELDS.map((f) => (
          <label key={f.key} className="block text-xs font-semibold">
            {f.label} <span className="font-normal text-muted">({f.unit})</span>
            <input maxLength={120}
              type="number"
              inputMode="decimal"
              min={0}
              step={f.step}
              value={rates[f.key] ?? ""}
              placeholder={String(defaults[f.key])}
              onChange={(e) => set(f.key, e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm font-medium outline-none focus:border-emerald"
            />
          </label>
        ))}
      </div>
      {used && <button onClick={() => setTrip({ ...trip, rates: undefined })} className="mb-3 min-h-11 text-sm font-semibold text-emerald underline underline-offset-4"><T>Back to estimates</T></button>}
    </details>
  );
}

export function CostBreakdownCard({ trip, setTrip, readOnly }: { trip: Trip; setTrip?: (t: Trip) => void; readOnly?: boolean }) {
  const b = useBreakdown(trip);
  const level = levelOf(trip);
  const toggle = (key: string) => {
    const off = new Set(trip.exclude ?? []);
    if (off.has(key)) off.delete(key);
    else off.add(key);
    setTrip?.({ ...trip, exclude: [...off] });
  };
  const partial = b.lines.some((l) => !l.included);
  return (
    <section className="mb-4 rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7 print:break-inside-avoid" aria-label="Cost breakdown">
      <p className="eyebrow">Estimate · {level.label} level</p>
      <h2 className="mt-1 font-display text-2xl font-semibold leading-tight"><T>What this trip may cost</T></h2>
      <p className="mt-1 text-sm text-muted">
        {readOnly ? "Worked out from simple rates, so every line can be checked. These are estimates, not live prices." : "Worked out from typical rates, not live prices. Enter your own quotes below for exact numbers, or untick anything you'll cover another way."}
      </p>
      {!readOnly && setTrip && <RatesEditor trip={trip} setTrip={setTrip} />}
      <ul className="mt-3 divide-y divide-line">
        {b.lines.map((l) => (
          <li key={l.key}>
            <label className={cn("flex items-start gap-3 py-3", !readOnly && "min-h-14 cursor-pointer")}>
              {!readOnly && <input type="checkbox" checked={l.included} onChange={() => toggle(l.key)} aria-label={`Include ${l.label} in the total`} className="mt-0.5 size-5 shrink-0 accent-[#137a58]" />}
              <span className={cn("min-w-0 flex-1", !l.included && "opacity-50")}>
                <span className="block font-semibold">{l.label}</span>
                <span className="block text-xs text-muted">{l.formula}</span>
              </span>
              <span className={cn("shrink-0 text-right font-semibold tabular-nums", !l.included && "line-through opacity-50")}>{money(l.amount)}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-2 rounded-2xl bg-forest px-4 py-3 text-white print:border print:border-ink print:bg-white print:text-ink">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold opacity-80">Total{partial ? " (selected items)" : ""}{b.travelers > 1 ? ` · ${b.travelers} people` : ""}</p>
          <p className="font-display text-2xl font-semibold tabular-nums">{money(b.total)}</p>
        </div>
        {b.total > 0 && (
          <p className="mt-1 text-sm opacity-85">
            About {money(b.perPerson)} per person. In practice it could be {money(b.low)} to {money(b.high)}.
          </p>
        )}
      </div>
      <p className="mt-3 text-xs text-muted">
        <T>Distances, times, fares and hotel prices are estimates. They change with the road, the season and bargaining, so check the latest before you go. Rooms are shared by two. Tips and shopping are not included.</T>
      </p>
    </section>
  );
}

function activityId() {
  return `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function PopularPlaces({ trip, setTrip }: { trip: Trip; setTrip: (t: Trip) => void }) {
  const inPlan = useMemo(() => new Set(trip.days.flatMap((d) => (["morning", "afternoon", "evening"] as const).flatMap((s) => d[s].map((a) => a.refId ?? "")))), [trip]);
  const stops = useMemo(() => [...new Set(trip.days.map((d) => d.districtSlug))], [trip.days]);

  const groups = useMemo(
    () =>
      stops.map((slug) => {
        const top = [...placesOf(slug)].sort((a, b) => b.rating - a.rating).slice(0, 4);
        const nearby = districts
          .filter((d) => d.slug !== slug && !stops.includes(d.slug) && roadKm(slug, d.slug) <= 90)
          .flatMap((d) => placesOf(d.slug))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        return { slug, top, nearby };
      }),
    [stops],
  );

  const add = (slug: string, placeId: string, name: string) => {
    const i = trip.days.findIndex((d) => d.districtSlug === slug);
    if (i < 0) return;
    const days: TripDay[] = trip.days.map((d, j) => (j === i ? { ...d, afternoon: [...d.afternoon, { id: activityId(), label: name, kind: "place", refId: placeId }] } : d));
    setTrip({ ...trip, days });
  };

  return (
    <section className="mt-4 rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7 print:hidden" aria-label="Popular places around your stops">
      <p className="eyebrow"><T>Popular places to visit</T></p>
      <h2 className="mt-1 font-display text-2xl font-semibold leading-tight"><T>Around your stops</T></h2>
      <p className="mt-1 text-sm text-muted"><T>Top-rated places in each district you&apos;ll visit, and a few close by. Add any to your plan.</T></p>
      <div className="mt-5 space-y-6">
        {groups.map(({ slug, top, nearby }) => (
          <div key={slug}>
            <h3 className="font-display text-lg font-semibold"><Link href={`/district/${slug}`} className="hover:underline"><DS slug={slug} /></Link></h3>
            <ul className="mt-2 space-y-2">
              {[...top, ...nearby].map((p, idx) => {
                const added = inPlan.has(p.id);
                const near = idx >= top.length;
                return (
                  <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2">
                    <Link href={`/place/${p.id}`} className="relative size-16 shrink-0 overflow-hidden rounded-xl" aria-label={p.name}>
                      <Media id={p.id} seed={p.name} category={p.categories[0]} alt={p.name} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/place/${p.id}`} className="block truncate font-semibold hover:underline">{p.name}</Link>
                      <p className="flex items-center gap-1.5 text-xs text-muted">
                        <Star className="size-3 fill-amber text-amber" aria-hidden /> {p.rating.toFixed(1)} · {categoryMeta[p.categories[0]].label}
                        {near && <span className="rounded-full bg-moss px-2 py-0.5 font-semibold text-forest">Nearby · <DS slug={p.districtSlug} /></span>}
                      </p>
                    </div>
                    <button
                      onClick={() => add(slug, p.id, p.name)}
                      disabled={added}
                      aria-label={added ? `${p.name} is in your plan` : `Add ${p.name} to your plan`}
                      className={cn("inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition active:scale-95", added ? "bg-emerald-soft text-forest" : "bg-forest text-white hover:bg-forest-2")}
                    >
                      {added ? <><Check className="size-4" /> <T>In plan</T></> : <><Plus className="size-4" /> Add</>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
