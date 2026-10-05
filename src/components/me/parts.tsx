"use client";

import { actions, useProgress, useStore, type Progress as P } from "@/lib/store";
import { achievements, type Achievement } from "@/lib/achievements";
import type { Place } from "@/lib/types";
import { PlaceCard } from "../Cards";
import { T } from "../T";
import { EmptyState } from "../ui/EmptyState";
import { Progress } from "../ui/Progress";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import { uiActions } from "@/lib/ui";
import type { ShareData } from "@/lib/share";

export function useShareData(): ShareData {
  const s = useStore();
  const p = useProgress();
  return {
    name: s.user?.name ?? "A traveler",
    visited: p.visitedDistricts,
    want: p.wantDistricts,
    fav: p.favDistricts,
    places: p.visitedPlaces.length,
    foods: p.triedFoods.length,
    favorites: p.favorites,
    bio: s.user?.bio ?? "",
    theme: s.mapTheme,
    home: s.homeDistrict ?? undefined,
    visitedPlaces: p.visitedPlaces.map((x) => x.id),
    favPlaces: p.favPlaces.map((x) => x.id),
    triedFoods: p.triedFoods.map((x) => x.id),
  };
}

export function PlaceGroup({ title, places, empty }: { title: string; places: Place[]; empty: { title: string; text: string } }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl font-semibold">{title} <span className="ml-1 text-base font-sans font-medium text-muted">{places.length || ""}</span></h2>
      {places.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{places.map((p) => <PlaceCard key={p.id} place={p} />)}</div>
      ) : (
        <EmptyState emoji="🧭" title={empty.title} text={empty.text} href="/explore" cta="Explore Places" />
      )}
    </section>
  );
}

export function Achievements({ p }: { p: P }) {
  return <AchievementList list={achievements(p)} />;
}

export function AchievementList({ list }: { list: Achievement[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((a) => {
        const done = a.progress >= a.target;
        return (
          <li key={a.id} className={cn("rounded-2xl border p-4 transition", done ? "border-amber/60 bg-amber-soft" : "border-line bg-card shadow-soft")}>
            <div className="flex items-center gap-3">
              <span className={cn("grid size-11 place-items-center rounded-full text-xl", done ? "bg-amber" : "bg-moss opacity-70 grayscale")} aria-hidden>{a.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold"><T>{a.title}</T></p>
                <p className="truncate text-xs text-muted"><T>{done ? "Unlocked" : a.hint}</T></p>
              </div>
            </div>
            <Progress value={a.progress} max={a.target} tone={done ? "amber" : "emerald"} className="mt-3 h-1.5" />
            <p className="mt-1.5 text-right text-[11px] font-medium text-muted">{a.progress} / {a.target}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function SampleButton() {
  const s = useStore();
  return (
    <Button
      variant="secondary"
      onClick={() => {
        actions.loadSample();
        uiActions.toast(s.user ? "Sample journey loaded" : "Signed in as Demo Traveler with a sample journey");
      }}
    >
      <T>Try a sample journey</T>
    </Button>
  );
}
