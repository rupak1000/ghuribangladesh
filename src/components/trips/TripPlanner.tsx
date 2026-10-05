"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Download, Info, Landmark, Leaf, Mountain, Palmtree, Plus, RefreshCw, Save, Search, Share2, Sparkles, Trash2, Users, Utensils, X, type LucideIcon } from "lucide-react";
import { districts, districtCategories, foodsOf, getDistrict, getFood, getPlace, placesOf, places, topPlaces } from "@/lib/data";
import { generateTrip, tripStyles, tripToText, type TripStyle } from "@/lib/planner";
import { estimateTripCost, formatCostRange } from "@/lib/tripCost";
import type { TransportPref } from "@/lib/travel";
import { CostBreakdownCard, DestinationPicker, OriginPicker, PopularPlaces, TravelOptions, TravelPlanCard, useBreakdown } from "./TravelPlan";
import { money, type StayLevel } from "@/lib/tripBudget";
import { DestinationMap } from "./DestinationMap";
import { PrintButton } from "./PrintButton";
import { FoodsRow, HomeRow, PlaceFactsLine, StayRow, TravelRow } from "./DayDetails";
import { dayNarrative } from "@/lib/tripDay";
import { ShareTripSheet } from "./ShareTripSheet";
import { actions, useStore, type Trip, type TripActivity, type TripDay } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { uiActions } from "@/lib/ui";
import { downloadBlob } from "@/lib/share";
import { cn } from "@/lib/utils";
import { useGate } from "@/lib/useGate";
import { Button } from "../ui/Button";
import { Media } from "../Media";
import { T, DN, DS } from "@/components/T";

const slots = ["morning", "afternoon", "evening"] as const;
type Slot = (typeof slots)[number];

const styleIcons: Record<TripStyle, LucideIcon> = {
  relaxed: Palmtree, adventure: Mountain, food: Utensils, nature: Leaf, history: Landmark, family: Users,
};

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Steps({ active, hasTrip }: { active: 1 | 2 | 3; hasTrip: boolean }) {
  const { t } = useT();
  const items = [
    { n: 1, label: t("Select Places"), id: "step-select" },
    { n: 2, label: t("Customize"), id: "step-customize" },
    { n: 3, label: t("Itinerary"), id: "itinerary" },
  ];
  return (
    <ol className="mt-6 flex items-center gap-2 md:gap-3" aria-label={t("Progress")}>
      {items.map((it, i) => {
        const disabled = it.n === 3 && !hasTrip;
        return (
          <li key={it.n} className="flex min-w-0 flex-1 items-center gap-2 md:gap-3 last:flex-none">
            <button
              disabled={disabled}
              onClick={() => scrollTo(it.id)}
              aria-current={active === it.n ? "step" : undefined}
              className="flex min-h-11 min-w-0 items-center gap-2 text-sm font-semibold disabled:cursor-not-allowed"
            >
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold", active === it.n ? "bg-forest text-white" : active > it.n ? "bg-emerald text-white" : "border border-line bg-card text-muted")}>
                {active > it.n ? <Check className="size-4" aria-hidden /> : it.n}
              </span>
              <span className={cn("truncate", active === it.n ? "text-forest" : "text-muted", active !== it.n && "max-sm:hidden")}>{it.label}</span>
            </button>
            {i < items.length - 1 && <span className="h-px min-w-3 flex-1 bg-line" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function Thumb({ id, slug, className }: { id: string; slug: string; className?: string }) {
  const d = getDistrict(slug);
  const p = getPlace(id);
  return (
    <span className={cn("block shrink-0 overflow-hidden rounded-xl bg-moss", className)}>
      <Media id={id} seed={id} category={p?.categories[0] ?? (d ? districtCategories(slug)[0] : undefined) ?? "nature"} alt="" />
    </span>
  );
}

function Finder() {
  const { t, dn } = useT();
  const s = useStore();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const k = q.trim().toLowerCase();
    const dRes = (k ? districts.filter((d) => d.name.toLowerCase().includes(k) || d.bn.includes(k)) : []).filter((d) => !s.draftDistricts.includes(d.slug)).slice(0, 4);
    const pRes = (k ? places.filter((p) => p.name.toLowerCase().includes(k)) : topPlaces(12)).filter((p) => !s.draftPlaces.includes(p.id)).slice(0, k ? 6 : 5);
    return { dRes, pRes };
  }, [q, s.draftDistricts, s.draftPlaces]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only"><T>Search districts and places</T></span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search a district or place…")} className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-base outline-none focus:border-emerald md:h-11 md:text-sm" />
      </label>
      <p className="mb-1 mt-3 text-xs font-bold uppercase tracking-wider text-muted">{q.trim() ? "Matches" : "Popular places"}</p>
      <ul className="divide-y divide-line">
        {results.dRes.map((d) => (
          <li key={d.slug}>
            <button onClick={() => { actions.toggleDraftDistrict(d.slug); setQ(""); }} className="flex min-h-14 w-full items-center gap-3 py-2 text-left">
              <Thumb id={d.slug} slug={d.slug} className="size-11" />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{dn(d)}</span><span className="block text-xs text-muted">District · {d.division}</span></span>
              <span className="grid size-9 place-items-center rounded-full bg-moss text-forest" aria-hidden><Plus className="size-4" /></span>
              <span className="sr-only">Add district {d.name}</span>
            </button>
          </li>
        ))}
        {results.pRes.map((p) => (
          <li key={p.id}>
            <button onClick={() => { actions.toggleDraftPlace(p.id); setQ(""); }} className="flex min-h-14 w-full items-center gap-3 py-2 text-left">
              <Thumb id={p.id} slug={p.districtSlug} className="size-11" />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.name}</span><span className="block truncate text-xs text-muted"><DS slug={p.districtSlug} /></span></span>
              <span className="grid size-9 place-items-center rounded-full bg-moss text-forest" aria-hidden><Plus className="size-4" /></span>
              <span className="sr-only">Add place {p.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {q.trim() && !results.dRes.length && !results.pRes.length && <p className="py-3 text-sm text-muted">No district or place matches “{q}”.</p>}
    </div>
  );
}

function Selected() {
  const { t, dn } = useT();
  const s = useStore();
  const bare = s.draftDistricts.filter((slug) => !s.draftPlaces.some((id) => getPlace(id)?.districtSlug === slug));
  const count = s.draftPlaces.length + bare.length;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Your Selected Places ({count})</h3>
        {count > 0 && <button onClick={() => actions.clearDraft()} className="min-h-11 px-2 text-sm font-semibold text-emerald hover:underline"><T>Clear all</T></button>}
      </div>
      {count === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-moss/50 px-4 py-5 text-sm text-muted">{t("Turn your saved places into an adventure.")} Add a district or place below.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white px-3">
          {s.draftPlaces.map((id) => {
            const p = getPlace(id);
            if (!p) return null;
            return (
              <li key={id} className="flex min-h-14 items-center gap-3 py-2">
                <Thumb id={p.id} slug={p.districtSlug} className="size-11" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.name}</span><span className="block truncate text-xs text-muted"><DS slug={p.districtSlug} /></span></span>
                <button onClick={() => actions.toggleDraftPlace(id)} aria-label={`Remove ${p.name}`} className="grid size-11 place-items-center rounded-full text-muted hover:bg-moss hover:text-ink"><X className="size-4" /></button>
              </li>
            );
          })}
          {bare.map((slug) => {
            const d = getDistrict(slug);
            if (!d) return null;
            return (
              <li key={slug} className="flex min-h-14 items-center gap-3 py-2">
                <Thumb id={slug} slug={slug} className="size-11" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{dn(d)}</span><span className="block truncate text-xs text-muted">Whole district · {placesOf(slug).length} places</span></span>
                <button onClick={() => actions.toggleDraftDistrict(slug)} aria-label={`Remove ${d.name}`} className="grid size-11 place-items-center rounded-full text-muted hover:bg-moss hover:text-ink"><X className="size-4" /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function slotNote(a: TripActivity): string | null {
  if (a.kind === "place" && a.refId) {
    const p = getPlace(a.refId);
    return p ? (p.thingsToDo[0] ?? p.blurb) : null;
  }
  if (a.kind === "food" && a.refId) {
    const f = getFood(a.refId);
    return f ? `Local favourite · ${f.price}` : null;
  }
  return null;
}

function ActivityRow({ a, onRemove }: { a: TripActivity; onRemove: () => void }) {
  const note = slotNote(a);
  return (
    <li className="flex items-start gap-2 rounded-xl py-1">
      <div className="min-w-0 flex-1">
        {a.kind === "place" && a.refId ? <Link href={`/place/${a.refId}`} className="text-sm font-semibold hover:underline">{a.label}</Link> : <span className="text-sm font-semibold">{a.label}</span>}
        {a.kind === "place" && a.refId ? <PlaceFactsLine placeId={a.refId} /> : null}
        {note && <p className="line-clamp-2 text-xs text-muted">{note}</p>}
      </div>
      <button onClick={onRemove} aria-label={`Remove ${a.label}`} className="-my-1 grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-moss hover:text-ink print:hidden md:size-9"><X className="size-4" /></button>
    </li>
  );
}

function AddStop({ day, used, onAdd }: { day: TripDay; used: Set<string>; onAdd: (slot: Slot, a: TripActivity) => void }) {
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<Slot>("afternoon");
  const [text, setText] = useState("");
  const options = useMemo(
    () => [
      ...placesOf(day.districtSlug).filter((p) => !used.has(p.id)).map((p) => ({ id: p.id, label: p.name, kind: "place" as const })),
      ...foodsOf(day.districtSlug).filter((f) => !used.has(f.id)).map((f) => ({ id: f.id, label: lang === "bn" ? f.bn : f.name, kind: "food" as const })),
    ],
    [day.districtSlug, used, lang],
  );
  const mk = (label: string, kind: TripActivity["kind"], refId?: string): TripActivity => ({ id: `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, label, kind, refId });
  if (!open) return <button onClick={() => setOpen(true)} className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-emerald hover:underline"><Plus className="size-4" aria-hidden /><T>Add stop</T></button>;
  return (
    <div className="mt-2 space-y-2 rounded-2xl bg-moss/60 p-3">
      <div className="flex gap-2">
        <select aria-label={t("Time of day")} value={slot} onChange={(e) => setSlot(e.target.value as Slot)} className="h-11 rounded-full border border-line bg-white px-3 text-sm">
          {slots.map((sl) => <option key={sl} value={sl}>{t(sl[0].toUpperCase() + sl.slice(1))}</option>)}
        </select>
        {options.length > 0 && (
          <select
            aria-label={t("Add a suggestion")}
            value=""
            onChange={(e) => {
              const o = options.find((x) => x.id === e.target.value);
              if (o) onAdd(slot, mk(o.label, o.kind, o.id));
            }}
            className="h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-3 text-sm"
          >
            <option value="">+ Place or food…</option>
            {options.map((o) => <option key={o.id} value={o.id}>{o.kind === "food" ? `${o.label} (food)` : o.label}</option>)}
          </select>
        )}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) {
            onAdd(slot, mk(text.trim(), "custom"));
            setText("");
          }
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Or write your own")} aria-label={t("Custom activity")} className="h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm outline-none focus:border-emerald" />
        <button aria-label={t("Add custom activity")} className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-white hover:bg-forest-2"><Plus className="size-4" /></button>
      </form>
      <button onClick={() => setOpen(false)} className="min-h-11 text-sm font-semibold text-muted hover:underline"><T>Done</T></button>
    </div>
  );
}

function tripPlaceDays(trip: Trip): string[][] {
  return trip.days.map((d) => slots.flatMap((sl) => d[sl]).filter((a) => a.kind === "place" && a.refId).map((a) => a.refId!));
}

function CostLine({ trip, className }: { trip: Trip; className?: string }) {
  const b = useBreakdown(trip);
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-muted"><T>Total Cost (est.) · per person</T></p>
      <p className="font-display text-xl font-semibold text-forest">~{money(b.perPerson)}</p>
    </div>
  );
}

function Itinerary({ trip, setTrip, onRegenerate, onSave, saved }: { trip: Trip; setTrip: (t: Trip) => void; onRegenerate: () => void; onSave: () => void; saved: boolean }) {
  const { t } = useT();
  const used = useMemo(() => new Set(trip.days.flatMap((d) => slots.flatMap((sl) => d[sl].map((a) => a.refId ?? "")))), [trip]);
  const patchDay = (i: number, fn: (d: TripDay) => TripDay) => setTrip({ ...trip, days: trip.days.map((d, j) => (j === i ? fn(d) : d)) });
  const n = trip.days.length;
  const narr = useMemo(() => dayNarrative(trip), [trip]);

  const [shareOpen, setShareOpen] = useState(false);

  return (
    <section id="itinerary" className="scroll-mt-24 animate-pop rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7" aria-label={t("Suggested itinerary")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow"><T>Suggested Itinerary</T></p>
          <input
            value={trip.name}
            onChange={(e) => setTrip({ ...trip, name: e.target.value })}
            aria-label={t("Trip name")}
            className="-ml-2 mt-1 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 font-display text-2xl font-semibold hover:border-line focus:bg-white"
          />
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-emerald">
            {n} {n === 1 ? "Day" : "Days"} · {n - 1} {n - 1 === 1 ? "Night" : "Nights"}
            <span title={t("Stops are suggested from place ratings, your trip style and pinned places. Edit freely.")} className="inline-flex" role="img" aria-label={t("Stops are suggested from place ratings, your trip style and pinned places. Edit freely.")}><Info className="size-4 text-muted" /></span>
          </p>
        </div>
        <Button variant="ghost" size="sm" className="print:hidden" onClick={onRegenerate}><RefreshCw className="size-4" aria-hidden /> <T>Regenerate</T></Button>
      </div>

      <ol className="mt-6">
        {trip.days.map((day, i) => {
          const d = getDistrict(day.districtSlug)!;
          const nr = narr[i];
          const from = nr.arrive ? getDistrict(nr.arrive.from) : null;
          return (
            <li key={i} className="relative pb-6 pl-9 last:pb-0 print:break-inside-avoid">
              {i < n - 1 && <span className="absolute bottom-0 left-[11px] top-7 w-0.5 bg-emerald/25" aria-hidden />}
              <span className="absolute left-0 top-1 grid size-6 place-items-center rounded-full bg-forest text-[11px] font-bold text-white" aria-hidden>{i + 1}</span>
              <h3 className="font-display text-lg font-semibold leading-snug">
                <span className="text-emerald">{t("Day")} {i + 1}</span> —{" "}
                {from && <><span className="text-muted"><DN d={from} /></span> <span aria-label="to">→</span> </>}
                <Link href={`/district/${d.slug}`} className="hover:underline"><DN d={d} /></Link>
              </h3>
              <div className="mt-3 space-y-3">
                {nr.arrive && <TravelRow leg={nr.arrive} />}
                <FoodsRow foods={nr.foods} />
                {slots.map((sl) => (
                  <div key={sl} className="rounded-2xl bg-white/70 px-3 py-2 ring-1 ring-line">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{t(sl[0].toUpperCase() + sl.slice(1))}</p>
                    <ul>
                      {day[sl].length === 0 && <li className="py-1 text-sm text-muted"><T>Free time</T></li>}
                      {day[sl].map((a) => (
                        <ActivityRow key={a.id} a={a} onRemove={() => patchDay(i, (x) => ({ ...x, [sl]: x[sl].filter((y) => y.id !== a.id) }))} />
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="print:hidden"><AddStop day={day} used={used} onAdd={(sl, a) => patchDay(i, (x) => ({ ...x, [sl]: [...x[sl], a] }))} /></div>
                {nr.ret && <TravelRow leg={nr.ret} />}
                {nr.home && <HomeRow slug={nr.home} />}
                {nr.stay && <StayRow stay={nr.stay} />}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <div>
          <CostLine trip={trip} />
          <p className="max-w-xs text-xs text-muted"><T>Estimate only: travel, stay, food and activities per person. See the cost breakdown above.</T></p>
        </div>
        <Button size="lg" className="max-lg:hidden print:hidden" onClick={onSave}><Save className="size-4" aria-hidden /> {saved ? "Update Trip Plan" : "Save Trip Plan"}</Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => setShareOpen(true)}><Share2 className="size-4" aria-hidden /> <T>Share with friends</T></Button>
        <PrintButton />
        <Button variant="secondary" onClick={() => downloadBlob(new Blob([tripToText(trip)], { type: "text/plain" }), `${trip.name.replace(/\s+/g, "-").toLowerCase()}.txt`)}><Download className="size-4" aria-hidden /> {t("Export itinerary")}</Button>
      </div>
      {shareOpen && <ShareTripSheet trip={trip} onClose={() => setShareOpen(false)} />}
    </section>
  );
}

export function TripPlanner() {
  const { t } = useT();
  const gate = useGate();
  const s = useStore();
  const [style, setStyle] = useState<TripStyle>("relaxed");
  const [days, setDays] = useState(5);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [origin, setOrigin] = useState("dhaka");
  const [travelers, setTravelers] = useState(1);
  const [returnToStart, setReturnToStart] = useState(true);
  const [pref, setPref] = useState<TransportPref>("budget");
  const [optimize, setOptimize] = useState(true);
  const [level, setLevel] = useState<StayLevel>("standard");

  const selected = s.draftDistricts;
  const saved = !!trip && s.trips.some((x) => x.id === trip.id);
  const active: 1 | 2 | 3 = trip ? 3 : selected.length ? 2 : 1;
  const dropped = Math.max(0, selected.length - days);

  const generate = () => {
    if (!selected.length) return;
    setTrip(generateTrip(selected, style, days, s.draftPlaces, { origin, keepOrder: !optimize, travelers, returnToStart, pref, level }));
    setTimeout(() => scrollTo("itinerary"), 50);
  };
  const save = gate(() => {
    if (!trip) return;
    actions.saveTrip(trip);
    uiActions.toast("Trip saved");
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-44 md:px-6 md:py-12 lg:pb-12">
      <h1 className="font-display text-3xl font-semibold leading-tight md:text-5xl">{t("Plan Your Trip")}</h1>
      <p className="mt-2 text-base text-muted md:text-lg">{t("Turn your saved places into an adventure.")}</p>
      <div className="print:hidden"><Steps active={active} hasTrip={!!trip} /></div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="space-y-4 print:hidden">
          <section id="step-select" className="scroll-mt-24 space-y-5 rounded-3xl border border-line bg-card p-5 shadow-soft md:p-6">
            <OriginPicker origin={origin} setOrigin={setOrigin} />
            <DestinationPicker origin={origin} />
            <Selected />
            <DestinationMap origin={origin} optimize={optimize} returnToStart={returnToStart} />
            <Finder />
          </section>

          <section id="step-customize" className="scroll-mt-24 rounded-3xl border border-line bg-card p-5 shadow-soft md:p-6">
            <h3 className="font-display text-lg font-semibold">Filters · {t("Trip style")}</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {tripStyles.map((x) => {
                const Icon = styleIcons[x.key];
                return (
                  <button
                    key={x.key}
                    aria-pressed={style === x.key}
                    onClick={() => setStyle(x.key)}
                    title={x.blurb}
                    className={cn("flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-sm font-semibold transition active:scale-[0.98]", style === x.key ? "border-forest bg-forest text-white shadow-soft" : "border-line bg-white text-ink hover:border-forest/40 hover:bg-moss")}
                  >
                    <Icon className="size-5" aria-hidden />
                    {t(x.label)}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">{tripStyles.find((x) => x.key === style)?.blurb}</p>

            <TravelOptions origin={origin} travelers={travelers} setTravelers={setTravelers} returnToStart={returnToStart} setReturnToStart={setReturnToStart} pref={pref} setPref={setPref} level={level} setLevel={setLevel} optimize={optimize} setOptimize={setOptimize} selected={selected} />

            <h3 className="mt-6 font-display text-lg font-semibold">{t("Duration")}</h3>
            <div className="mt-2 flex items-center gap-4">
              <p className="w-28 shrink-0 font-display text-3xl font-semibold">{days}<span className="ml-1 font-sans text-sm font-medium text-muted">day{days > 1 ? "s" : ""}</span></p>
              <input type="range" min={1} max={14} value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label={t("Trip duration in days")} className="h-11 w-full accent-[#137a58]" />
            </div>
            {dropped > 0 && <p className="mt-2 text-sm font-medium text-[#8a5a0a]">With {days} day{days > 1 ? "s" : ""} we can cover {days} of your {selected.length} destinations. Add days to include them all.</p>}

            <Button size="lg" className="mt-6 hidden w-full lg:inline-flex" disabled={!selected.length} onClick={generate}>
              <Sparkles className="size-4" aria-hidden /> {selected.length ? "Generate Trip Plan" : "Pick a district to start"}
            </Button>
          </section>
        </div>

        <div className="lg:sticky lg:top-24">
          {trip ? (
            <>
              <TravelPlanCard trip={trip} />
              <CostBreakdownCard trip={trip} setTrip={setTrip} />
              <Itinerary trip={trip} setTrip={setTrip} onRegenerate={generate} onSave={save} saved={saved} />
              <PopularPlaces trip={trip} setTrip={setTrip} />
            </>
          ) : (
            <section id="itinerary" className="rounded-3xl border border-dashed border-emerald/25 bg-moss/50 px-6 py-12 text-center">
              <h2 className="font-display text-xl font-semibold"><T>Suggested Itinerary</T></h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{selected.length ? "Ready when you are. Generate a plan to see your day-by-day route and estimated cost." : "Pick a district or place to start. Your day-by-day plan will appear here."}</p>
            </section>
          )}
        </div>
      </div>

      {s.trips.length > 0 && (
        <section className="mt-14 print:hidden">
          <h2 className="mb-4 font-display text-2xl font-semibold"><T>Saved trips</T></h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.trips.map((tr) => (
              <li key={tr.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4 shadow-soft">
                <button className="min-h-11 min-w-0 flex-1 text-left" onClick={() => { setTrip(tr); setTimeout(() => scrollTo("itinerary"), 50); }}>
                  <p className="truncate font-semibold">{tr.name}</p>
                  <p className="truncate text-xs text-muted">{[...new Set(tr.days.map((d) => d.districtSlug))].map((sl, i) => <span key={sl}>{i ? " · " : ""}<DS slug={sl} /></span>)}</p>
                </button>
                <button aria-label={`Delete ${tr.name}`} onClick={() => { actions.deleteTrip(tr.id); if (trip?.id === tr.id) setTrip(null); }} className="grid size-11 place-items-center rounded-full text-muted hover:bg-moss hover:text-ink"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] md:bottom-0 z-30 flex items-center gap-3 border-t border-line bg-card/95 p-3 backdrop-blur lg:hidden print:hidden">
        {trip ? (
          <>
            <CostLine trip={trip} className="min-w-0 flex-1" />
            <Button size="lg" onClick={save}><Save className="size-4" aria-hidden /> {saved ? "Update" : "Save Trip Plan"}</Button>
          </>
        ) : (
          <Button size="lg" className="w-full" disabled={!selected.length} onClick={generate}><Sparkles className="size-4" aria-hidden /> {selected.length ? "Generate Trip Plan" : "Pick a district to start"}</Button>
        )}
      </div>
    </div>
  );
}
