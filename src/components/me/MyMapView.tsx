"use client";

import { useState } from "react";
import { Download, Frame, Home, Share2 } from "lucide-react";
import { useProgress, useStore, actions } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { uiActions } from "@/lib/ui";
import { buildShareSvg, downloadBlob, svgToPngBlob } from "@/lib/share";
import { useGate } from "@/lib/useGate";
import { districts } from "@/lib/data";
import { mapThemes } from "@/lib/mapThemes";
import { cn } from "@/lib/utils";
import { MapLegend, MapPanel } from "../map/MapPanel";
import { Button, LinkButton } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Progress } from "../ui/Progress";
import { Skeleton } from "../ui/Skeleton";
import { ShareDialog } from "../ShareDialog";
import { DistrictPicker } from "../DistrictPicker";
import { Achievements, PlaceGroup, SampleButton, useShareData } from "./parts";
import { T } from "@/components/T";

export function MyMapView() {
  const { t, dn } = useT();
  const s = useStore();
  const p = useProgress();
  const gate = useGate();
  const data = useShareData();
  const [share, setShare] = useState(false);

  const markers = [...p.visitedPlaces, ...p.wantPlaces, ...p.favPlaces].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i).map((x) => ({
    id: x.id, lat: x.lat, lng: x.lng, emoji: "📍", color: "#12805c", label: x.name,
    state: (s.placeMarks[x.id]?.favorite ? "favorite" : s.placeMarks[x.id]?.visited ? "visited" : "saved") as "favorite" | "visited" | "saved",
  }));
  const hasAny = p.visitedDistricts.length + p.wantDistricts.length + p.favDistricts.length + markers.length > 0;

  const download = gate(async () => {
    try {
      downloadBlob(await svgToPngBlob(buildShareSvg(data, s.lang === "bn")), "my-bangladesh.png");
    } catch {
      uiActions.toast("Couldn't create the image. Try again.");
    }
  });

  if (!s.hydrated) {
    return <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-6"><Skeleton className="h-16 w-2/3" /><Skeleton className="h-[480px] w-full rounded-3xl" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight md:text-6xl">{t("My Bangladesh")}</h1>
          <p className="mt-2 text-base text-muted md:text-lg">{t("Your journey, one district at a time.")}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-3">
        <div className="on-dark col-span-2 rounded-3xl bg-forest p-5 text-white shadow-lift md:col-span-1">
          <p className="font-display text-4xl font-semibold">{p.visitedDistricts.length} <span className="text-white/60">/ 64</span></p>
          <p className="text-sm text-white/85">{t("Districts")} {t("Visited")}</p>
          <Progress value={p.visitedDistricts.length} max={64} className="mt-3 bg-white/20" />
        </div>
        <div className="rounded-3xl border border-line bg-card p-5 shadow-soft"><p className="font-display text-4xl font-semibold text-water">{p.wantDistricts.length}</p><p className="text-sm text-muted">{t("Want to Visit")}</p></div>
        <div className="rounded-3xl border border-line bg-card p-5 shadow-soft"><p className="font-display text-4xl font-semibold text-[#b9740f]">{p.favorites}</p><p className="text-sm text-muted">{t("Favorites")}</p></div>
      </div>

      {!hasAny && (
        <div className="mt-6">
          <EmptyState emoji="🗺️" title={t("Your map is blank, for now")} text={t("Tap any district on the map to mark it as visited, want-to-visit or a favorite. Or load a sample journey to see how it looks.")} action={<SampleButton />} />
        </div>
      )}

      <div className="-mx-4 mt-6 overflow-hidden border-y border-line shadow-soft md:mx-0 md:rounded-[2rem] md:border">
        <MapPanel markers={markers} className="h-[62dvh] min-h-[440px] md:h-[680px]" />
      </div>
      <MapLegend className="mt-3 px-1" />

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-line bg-card p-4 shadow-soft md:flex-row md:items-center md:justify-between">
        <div role="radiogroup" aria-label={t("Map color theme")} className="flex flex-wrap gap-2">
          {mapThemes.map((th) => (
            <button
              key={th.key}
              role="radio"
              aria-checked={s.mapTheme === th.key}
              onClick={() => actions.setMapTheme(th.key)}
              className={cn("flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition active:scale-95", s.mapTheme === th.key ? "border-forest bg-moss ring-2 ring-forest" : "border-line hover:border-forest/40")}
            >
              <span className="flex -space-x-1.5">
                {[th.visited, th.want, th.favorite].map((c) => <span key={c} className="size-4 rounded-full border-2 border-white" style={{ background: c }} />)}
              </span>
              {th.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Button variant="secondary" onClick={download}><Download className="size-4" /> {t("Download My Map")}</Button>
          <LinkButton href="/wall-map" variant="secondary"><Frame className="size-4" /> <T>Create your own wall map</T></LinkButton>
          <Button onClick={gate(() => setShare(true))}><Share2 className="size-4" /> {t("Share My Bangladesh")}</Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-line bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="home-district" className="flex items-center gap-2 font-display text-lg font-semibold"><Home className="size-5 text-forest" aria-hidden /> <T>My home district</T></label>
        <select
          id="home-district"
          value={s.homeDistrict ?? ""}
          onChange={(e) => actions.setHomeDistrict(e.target.value || null)}
          className="h-11 rounded-xl border border-line bg-white px-3 text-base font-semibold outline-none focus:border-emerald sm:w-72"
        >
          <option value=""><T>Not set</T></option>
          {[...districts].sort((a, b) => a.name.localeCompare(b.name)).map((x) => <option key={x.slug} value={x.slug}>{dn(x)}</option>)}
        </select>
      </div>

      <DistrictPicker mode="mark" defaultOpen className="mt-8" />

      <section className="mt-14">
        <h2 className="mb-4 font-display text-2xl font-semibold">{t("Achievements")}</h2>
        <Achievements p={p} />
      </section>

      <div className="mt-14 space-y-14">
        <PlaceGroup title={t("My Visited Places")} places={p.visitedPlaces} empty={{ title: "No visited places yet", text: "Tap “I've Been Here” on any place to add it here." }} />
        <PlaceGroup title={t("Places I Want To Visit")} places={p.wantPlaces} empty={{ title: "No saved places yet", text: "Explore Bangladesh and save places you'd love to visit." }} />
        <PlaceGroup title={t("My Favorite Places")} places={p.favPlaces} empty={{ title: "No favorites yet", text: "Tap the heart on places you love most." }} />
      </div>

      {s.isSample && (
        <div className="mt-12 rounded-2xl border border-amber/40 bg-amber-soft p-4 text-sm">
          <T>You&apos;re viewing a sample journey.</T> <button className="font-semibold underline" onClick={() => { actions.reset(); uiActions.toast("Sample journey cleared"); }}><T>Clear it and start fresh</T></button>.
        </div>
      )}

      <ShareDialog open={share} onClose={() => setShare(false)} data={data} />
    </div>
  );
}
