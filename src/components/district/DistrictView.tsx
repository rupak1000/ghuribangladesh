"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { districtStats, experiencesOf, foodsOf, getDistrict, placesOf } from "@/lib/data";
import { categoryMeta } from "@/lib/categories";
import { useT } from "@/lib/i18n";
import { AddToMapButton, DistrictMarkChips } from "../Actions";
import { FoodCard, PlaceCard } from "../Cards";
import { PhotoHero } from "../Hero";
import { MapPanel } from "../map/MapPanel";
import { placeMarkers } from "../map/helpers";
import { EmptyState } from "../ui/EmptyState";
import { Tabs } from "../ui/Tabs";
import type { Category } from "@/lib/types";

type Tab = "overview" | "places" | "food" | "experiences" | "map";

function Head({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-2xl font-semibold leading-tight">{title}</h2>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function DistrictView({ slug, initialTab }: { slug: string; initialTab?: string }) {
  const { t, dn } = useT();
  const d = getDistrict(slug)!;
  const places = placesOf(slug);
  const foods = foodsOf(slug);
  const exps = experiencesOf(slug);
  const st = districtStats(slug);
  const valid: Tab[] = ["overview", "places", "food", "experiences", "map"];
  const [tab, setTab] = useState<Tab>(valid.includes(initialTab as Tab) ? (initialTab as Tab) : "overview");
  const top = [...places].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const hidden = places.filter((p) => p.hidden);
  const heroCat: Category = places[0]?.categories[0] ?? "nature";

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: t("Overview") },
    { key: "places", label: t("Places"), count: st.places },
    { key: "food", label: t("Food"), count: st.foods },
    { key: "experiences", label: t("Experiences"), count: st.experiences },
    { key: "map", label: t("Map") },
  ];

  return (
    <>
      <PhotoHero imageId={`district:${slug}`} seed={d.name} category={slug === "coxs-bazar" ? "beach" : heroCat} alt={d.name}>
        <nav className="mb-3 flex items-center gap-1 text-sm text-white/90" aria-label={t("Breadcrumb")}>
          <Link href="/explore" className="py-2 hover:underline">{t("Explore")}</Link><ChevronRight className="size-3.5" />
          <span>{d.division}</span>
        </nav>
        <h1 className="font-display text-4xl font-semibold leading-tight text-balance break-words sm:text-5xl md:text-7xl">{dn(d)}</h1>
        <p className="mt-2 max-w-2xl text-base leading-snug text-white/95 md:text-xl">{d.tagline}</p>
        <div className="mt-5 grid grid-cols-4 gap-3 md:mt-6 md:flex md:items-center md:gap-8">
          {[
            [st.places, "Places"], [st.foods, "Foods"], [st.experiences, "Experiences"], [st.hidden, "Hidden Gems"],
          ].map(([n, l]) => (
            <div key={l as string}>
              <p className="text-xl font-bold leading-none md:text-3xl">{n}</p>
              <p className="mt-1 text-[11px] font-medium leading-tight text-white/90 md:text-xs">{t(l as string)}</p>
            </div>
          ))}
          <div className="ml-auto hidden md:block"><AddToMapButton slug={slug} size="lg" /></div>
        </div>
      </PhotoHero>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-paper/95 px-4 backdrop-blur md:mx-0 md:px-0">
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
        </div>

        <div className="py-7 pb-40 md:py-10 md:pb-10">
          {tab === "overview" && (
            <div className="space-y-12 md:space-y-14">
              <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:gap-10">
                <div>
                  <Head title={`About ${d.name}`} />
                  <p className="max-w-prose text-base leading-[1.75] text-ink/90">{d.about}</p>
                  <div className="mt-5"><DistrictMarkChips slug={slug} /></div>
                </div>
                <div className="self-start rounded-3xl border border-emerald/10 bg-moss p-5 text-sm">
                  <p className="font-semibold">{d.division} Division</p>
                  <p className="mt-1 text-muted">{d.bn} · {d.lat.toFixed(2)}°N, {d.lng.toFixed(2)}°E</p>
                </div>
              </div>

              <section>
                <Head title={t("Top Places")} />
                <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                  {top.map((p) => <PlaceCard key={p.id} place={p} showDistrict={false} className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto" />)}
                </div>
              </section>

              <section>
                <Head title={t("Famous Food")} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{foods.map((f) => <FoodCard key={f.id} food={f} />)}</div>
              </section>

              {hidden.length > 0 && (
                <section>
                  <Head title={t("Hidden Gems")} sub="Lesser-known places worth the detour." />
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">{hidden.map((p) => <PlaceCard key={p.id} place={p} showDistrict={false} />)}</div>
                </section>
              )}

              {exps.length > 0 && (
                <section>
                  <Head title={t("Things To Do")} />
                  <ul className="grid gap-3 md:grid-cols-2">
                    {exps.map((e) => (
                      <li key={e.id} className="flex gap-4 rounded-2xl border border-line bg-card p-4 shadow-soft">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-soft text-xl">{categoryMeta[e.category].emoji}</span>
                        <div><p className="font-semibold">{e.title}</p><p className="text-sm text-muted">{e.blurb}</p></div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {tab === "places" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{places.map((p) => <PlaceCard key={p.id} place={p} showDistrict={false} />)}</div>
          )}

          {tab === "food" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{foods.map((f) => <FoodCard key={f.id} food={f} />)}</div>
          )}

          {tab === "experiences" &&
            (exps.length ? (
              <ul className="grid gap-3 md:grid-cols-2">
                {exps.map((e) => (
                  <li key={e.id} className="flex gap-4 rounded-2xl border border-line bg-card p-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-soft text-2xl">{categoryMeta[e.category].emoji}</span>
                    <div><p className="font-display text-lg font-semibold">{e.title}</p><p className="text-sm text-muted">{e.blurb}</p></div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState emoji="🧭" title={t("No experiences listed yet")} text={t("We're still collecting local experiences for this district. Check its places and food in the meantime.")} />
            ))}

          {tab === "map" && (
            <div className="-mx-4 overflow-hidden border-y border-line md:mx-0 md:rounded-3xl md:border">
              <MapPanel markers={placeMarkers("all", new Set(places.map((p) => p.id)))} selected={slug} preview={false} className="h-[62dvh] md:h-[600px]" />
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-card/95 p-3 backdrop-blur md:hidden">
        <AddToMapButton slug={slug} size="lg" className="w-full" />
      </div>
    </>
  );
}
