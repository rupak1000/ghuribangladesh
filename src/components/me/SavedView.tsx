"use client";

import { useState } from "react";
import { useProgress, useStore } from "@/lib/store";
import { districts } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { DistrictCard, FoodCard, PlaceCard } from "../Cards";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { Tabs } from "../ui/Tabs";

type Tab = "places" | "foods" | "districts";

export function SavedView() {
  const { t } = useT();
  const s = useStore();
  const p = useProgress();
  const [tab, setTab] = useState<Tab>("places");
  const wantDistricts = districts.filter((d) => p.wantDistricts.includes(d.slug));

  if (!s.hydrated) return <div className="mx-auto max-w-5xl space-y-4 px-4 py-10"><Skeleton className="h-10 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="font-display text-3xl font-semibold md:text-5xl">{t("Saved")}</h1>
      <Tabs
        className="mt-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { key: "places", label: t("Places"), count: p.wantPlaces.length },
          { key: "foods", label: t("Foods"), count: p.wantFoods.length },
          { key: "districts", label: t("Districts"), count: wantDistricts.length },
        ]}
      />
      <div className="py-8">
        {tab === "places" &&
          (p.wantPlaces.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{p.wantPlaces.map((x) => <PlaceCard key={x.id} place={x} />)}</div>
          ) : (
            <EmptyState emoji="🔖" title={t("No saved places yet")} text={`${t("Your next adventure is waiting.")} ${t("Explore Bangladesh and save places you'd love to visit.")}`} href="/explore" cta={t("Explore Places")} />
          ))}
        {tab === "foods" &&
          (p.wantFoods.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{p.wantFoods.map((x) => <FoodCard key={x.id} food={x} />)}</div>
          ) : (
            <EmptyState emoji="🍛" title={t("No dishes on your list")} text={t("Tap “Want to Try” on dishes you'd love to taste.")} href="/food" cta="Taste Bangladesh" />
          ))}
        {tab === "districts" &&
          (wantDistricts.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{wantDistricts.map((d) => <DistrictCard key={d.slug} district={d} />)}</div>
          ) : (
            <EmptyState emoji="🗺️" title={t("No districts on your wish-list")} text={t("Add districts to your map as “Want to Visit”.")} href="/" cta={t("Open the map")} />
          ))}
      </div>
    </div>
  );
}
