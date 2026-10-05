"use client";

import { useMemo, useState } from "react";
import { List, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { categories, divisionBn, styles } from "@/lib/categories";
import { divisions, getDistrict, places } from "@/lib/data";
import { useT } from "@/lib/i18n";
import type { Category, Division, Style } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlaceCard } from "../Cards";
import { MapPanel } from "../map/MapPanel";
import { placeMarkers } from "../map/helpers";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { EmptyState } from "../ui/EmptyState";
import { Sheet } from "../ui/Sheet";

interface Filters { cats: Category[]; styles: Style[]; regions: Division[] }
const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-xs font-bold uppercase tracking-wider text-muted">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function FilterPanel({ f, set }: { f: Filters; set: (f: Filters) => void }) {
  const { t, lang } = useT();
  const active = f.cats.length + f.styles.length + f.regions.length;
  return (
    <div className="space-y-6">
      <FilterGroup title={t("Type")}>
        {categories.filter((c) => c.key !== "food").map((c) => (
          <Chip key={c.key} active={f.cats.includes(c.key)} onClick={() => set({ ...f, cats: toggle(f.cats, c.key) })} className="h-10 px-3.5 md:h-9">
            <span aria-hidden>{c.emoji}</span>{lang === "bn" ? c.bn : c.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Experience">
        {styles.map((s) => (
          <Chip key={s.key} active={f.styles.includes(s.key)} onClick={() => set({ ...f, styles: toggle(f.styles, s.key) })} className="h-10 px-3.5 md:h-9">{lang === "bn" ? s.bn : s.label}</Chip>
        ))}
      </FilterGroup>
      <FilterGroup title={t("Region")}>
        {divisions.map((d) => (
          <Chip key={d} active={f.regions.includes(d)} onClick={() => set({ ...f, regions: toggle(f.regions, d) })} className="h-10 px-3.5 md:h-9">{lang === "bn" ? divisionBn[d] : d}</Chip>
        ))}
      </FilterGroup>
      {active > 0 && <Button variant="ghost" size="sm" onClick={() => set({ cats: [], styles: [], regions: [] })}>{t("Clear")} ({active})</Button>}
    </div>
  );
}

export function ExploreView({ initialCategory }: { initialCategory?: Category }) {
  const { t } = useT();
  const [f, setF] = useState<Filters>({ cats: initialCategory ? [initialCategory] : [], styles: [], regions: [] });
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [sheet, setSheet] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const results = useMemo(
    () =>
      places
        .filter((p) => !f.cats.length || p.categories.some((c) => f.cats.includes(c)))
        .filter((p) => !f.styles.length || p.styles.some((s) => f.styles.includes(s)))
        .filter((p) => !f.regions.length || f.regions.includes(getDistrict(p.districtSlug)!.division))
        .sort((a, b) => b.rating - a.rating),
    [f],
  );
  const ids = useMemo(() => new Set(results.map((r) => r.id)), [results]);
  const markers = useMemo(() => placeMarkers(f.cats.length === 1 ? f.cats[0] : "all", ids), [f.cats, ids]);
  const districtsWith = useMemo(() => new Set(results.map((r) => r.districtSlug)), [results]);
  const dim = f.cats.length || f.styles.length || f.regions.length ? (slug: string) => !districtsWith.has(slug) : undefined;
  const filtering = f.cats.length + f.styles.length + f.regions.length > 0;

  const grid = results.length ? (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">{results.slice(0, 60).map((p) => <PlaceCard key={p.id} place={p} />)}</div>
  ) : (
    <EmptyState emoji="🔍" title={t("No places match those filters")} text={t("Try removing a filter or two to widen your search.")} action={<Button onClick={() => setF({ cats: [], styles: [], regions: [] })}>{t("Clear")}</Button>} />
  );

  return (
    <div className="mx-auto max-w-7xl md:px-6 md:py-8">
      <div className="flex h-12 items-baseline gap-2 overflow-hidden px-4 pt-2.5 md:block md:h-auto md:px-0 md:pb-6 md:pt-0">
        <h1 className="font-display text-xl font-semibold md:text-4xl">{t("Explore")}</h1>
        <p className="truncate text-sm text-muted md:mt-1 md:text-base">{results.length} places across {districtsWith.size} districts{filtering ? " match your filters" : ""}.</p>
      </div>

      <div className="md:grid md:grid-cols-[240px_1fr] md:gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="hidden self-start rounded-3xl border border-line bg-card p-5 shadow-soft md:sticky md:top-24 md:block md:max-h-[calc(100dvh-7rem)] md:overflow-y-auto">
          <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold"><SlidersHorizontal className="size-4" /> {t("Filters")}</h2>
          <FilterPanel f={f} set={setF} />
        </aside>

        <div className="min-w-0">
          <div className={cn("relative md:block", mobileView === "map" ? "block" : "hidden")}>
            <div className="overflow-hidden border-b border-line md:rounded-3xl md:border">
              <MapPanel markers={markers} dimmed={dim} onOverlay={setOverlay} fullBleed className="h-[calc(100dvh-4rem-4.25rem-3rem)] min-h-[420px] md:h-[540px]" />
            </div>
          </div>

          <div className={cn("px-4 pb-nav pt-4 md:mt-8 md:block md:px-0 md:pb-0 md:pt-0", mobileView === "list" ? "block" : "hidden")}>{grid}</div>
        </div>
      </div>

      <div className={cn("on-dark fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom)+0.75rem)] z-30 flex justify-center transition duration-200 md:hidden", overlay && mobileView === "map" && "pointer-events-none translate-y-4 opacity-0")}>
        <div className="flex overflow-hidden rounded-full bg-forest text-white shadow-float">
          <button onClick={() => setMobileView("map")} aria-pressed={mobileView === "map"} className={cn("flex h-12 items-center gap-1.5 px-4 text-sm font-semibold transition", mobileView === "map" && "bg-white/15")}><MapIcon className="size-4" /> {t("Map")}</button>
          <button onClick={() => setMobileView("list")} aria-pressed={mobileView === "list"} className={cn("flex h-12 items-center gap-1.5 px-4 text-sm font-semibold transition", mobileView === "list" && "bg-white/15")}><List className="size-4" /> List · {results.length}</button>
          <button onClick={() => setSheet(true)} className="flex h-12 items-center gap-1.5 border-l border-white/20 px-4 text-sm font-semibold"><SlidersHorizontal className="size-4" /> {t("Filters")}{filtering && <span className="grid size-5 place-items-center rounded-full bg-amber text-[11px] font-bold text-forest">{f.cats.length + f.styles.length + f.regions.length}</span>}</button>
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title={t("Filters")}>
        <h2 className="mb-5 font-display text-xl font-semibold">{t("Filters")}</h2>
        <FilterPanel f={f} set={setF} />
        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-line bg-card px-5 pt-3"><Button size="lg" className="w-full" onClick={() => setSheet(false)}>Show {results.length} places</Button></div>
      </Sheet>
    </div>
  );
}
