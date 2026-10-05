"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { divisions } from "@/lib/data";
import { districts, foods, foodsOf, getDistrict } from "@/lib/data";
import { useProgress, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { FoodCard } from "../Cards";
import { FoodRow } from "./FoodRow";
import { Chip } from "../ui/Chip";
import { MapPanel } from "../map/MapPanel";
import { foodMarkers } from "../map/helpers";
import { Progress } from "../ui/Progress";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { T, DN, DS } from "@/components/T";

const bnNum = (n: number) => String(n).replace(/\d/g, (c) => "০১২৩৪৫৬৭৮৯"[Number(c)]);

export function FoodView({ initialDistrict }: { initialDistrict?: string }) {
  const { t, dn, lang } = useT();
  const s = useStore();
  const p = useProgress();
  const [sel, setSel] = useState<string | null>(initialDistrict && getDistrict(initialDistrict) ? initialDistrict : null);
  const markers = useMemo(() => foodMarkers(), []);
  const d = sel ? getDistrict(sel) : null;
  const list = sel ? foodsOf(sel) : [];
  const top = useMemo(() => [...foods].sort((a, b) => b.rating - a.rating).slice(0, 10), []);
  const signature = useMemo(
    () => districts.map((x) => ({ d: x, food: [...foodsOf(x.slug)].sort((a, b) => b.rating - a.rating)[0] })).filter((x) => x.food),
    [],
  );
  const [division, setDivision] = useState<string>("All");
  const [shown, setShown] = useState(9);
  const filtered = signature.filter((x) => division === "All" || x.d.division === division);
  const withFood = new Set(foods.map((f) => f.districtSlug));
  const results = useRef<HTMLDivElement>(null);
  const pick = (slug: string | null) => {
    setSel(slug);
    if (slug && window.matchMedia("(max-width: 1023px)").matches) {
      setTimeout(() => results.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6 grid gap-5 md:mb-8 md:grid-cols-[1fr_340px] md:items-end md:gap-6">
        <div>
          <p className="eyebrow mb-1">{t("Food")}</p>
          <h1 className="font-display text-3xl font-semibold leading-tight md:text-6xl">{t("Taste Bangladesh")}</h1>
          <p className="mt-2 text-base text-muted md:text-lg">{t("Every district has a story. Every dish has a flavor.")}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4 shadow-soft md:p-5">
          {s.hydrated ? (
            <>
              <p className="text-sm font-semibold">{lang === "bn" ? <>আপনি <span className="text-emerald">{bnNum(p.tastedDistricts)}/৬৪</span> জেলার খাবারের স্বাদ নিয়েছেন</> : <><T>You&apos;ve tasted</T> <span className="text-emerald">{p.tastedDistricts}/64</span> districts</>}</p>
              <Progress value={p.tastedDistricts} max={64} tone="amber" className="mt-2.5" />
              <p className="mt-2 text-xs text-muted">{lang === "bn" ? `${bnNum(p.triedFoods.length)}টি খাবার চেখেছেন · তালিকায় ${bnNum(p.wantFoods.length)}টি` : `${p.triedFoods.length} dishes tried · ${p.wantFoods.length} on your list`}</p>
            </>
          ) : <Skeleton className="h-14" />}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
        <div className="-mx-4 overflow-hidden border-y border-line md:mx-0 md:rounded-3xl md:border">
          <MapPanel
            markers={markers}
            category="food"
            selected={sel}
            onSelect={pick}
            preview={false}
            className="h-[56dvh] min-h-[420px] lg:h-[640px]"
            dimmed={(slug) => !withFood.has(slug)}
          />
        </div>

        <div ref={results} className="flex min-w-0 scroll-mt-20 flex-col lg:h-[640px]">
          <div className="mb-3 flex items-start justify-between gap-3">
            {d ? (
              <div>
                <p className="eyebrow">{d.division}</p>
                <h2 className="font-display text-2xl font-semibold leading-tight">{dn(d)}</h2>
                <p className="text-sm text-muted">{list.length} favourite {list.length === 1 ? "dish" : "dishes"}</p>
              </div>
            ) : (
              <div>
                <h2 className="font-display text-2xl font-semibold leading-tight">{t("Pick a district on the map")}</h2>
                <p className="text-sm text-muted"><T>Tap a district to see its favourite dishes. Until then, here are the top-rated ones.</T></p>
              </div>
            )}
            {d && <Button variant="secondary" size="sm" onClick={() => setSel(null)} aria-label={t("Clear selection")}><X className="size-4" /> {t("Clear")}</Button>}
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] lg:pb-2">
            {d && list.length === 0 && <EmptyState emoji="🍽️" title={t("No dishes listed here yet")} text={t("Pick another district on the map to see what it is famous for.")} />}
            {(d ? list : top).map((f) => <FoodRow key={f.id} food={f} />)}
          </div>
        </div>
      </div>

      <section className="mt-14 md:mt-20" aria-labelledby="every-district">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-1">{t("All 64 districts")}</p>
            <h2 id="every-district" className="font-display text-3xl font-semibold leading-tight">{t("Every district's favourite dish")}</h2>
            <p className="mt-1 text-sm text-muted"><T>One signature dish from each district, picked by rating.</T></p>
          </div>
        </div>
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          {["All", ...divisions].map((x) => (
            <Chip key={x} active={division === x} onClick={() => { setDivision(x); setShown(9); }}>{x}</Chip>
          ))}
        </div>
        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, shown).map(({ d: dist, food }) => (
            <div key={food.id} className="animate-pop">
              <p className="mb-1.5 px-1 text-xs font-bold uppercase tracking-wider text-muted"><DN d={dist} /> · <T>{dist.division}</T></p>
              <FoodCard food={food} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-sm text-muted" aria-live="polite">Showing {Math.min(shown, filtered.length)} of {filtered.length} districts</p>
          {shown < filtered.length && (
            <Button variant="secondary" size="lg" onClick={() => setShown((n) => n + 9)}>{t("Load more")}</Button>
          )}
        </div>
      </section>
    </div>
  );
}
