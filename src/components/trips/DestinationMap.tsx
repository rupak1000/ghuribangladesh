"use client";

import { Lightbulb } from "lucide-react";
import { getDistrict } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { uiActions } from "@/lib/ui";
import { orderStops } from "@/lib/travel";
import { BangladeshMap } from "../map/BangladeshMap";
import { T } from "@/components/T";

export function DestinationMap({ origin, optimize, returnToStart }: { origin: string; optimize: boolean; returnToStart: boolean }) {
  const { t, dn } = useT();
  const { draftDistricts } = useStore();
  const chosen = new Set(draftDistricts);
  const stops = optimize ? orderStops(origin, draftDistricts) : draftDistricts.filter((x) => x !== origin);
  const toggle = (slug: string) => {
    const d = getDistrict(slug);
    if (!d) return;
    if (slug === origin) {
      uiActions.toast(`${dn(d)} is your starting city`);
      return;
    }
    const had = chosen.has(slug);
    actions.toggleDraftDistrict(slug);
    uiActions.toast(had ? `Removed ${dn(d)} from your trip` : `Added ${dn(d)} to your trip`);
  };
  const route = stops.length ? [origin, ...stops, ...(returnToStart ? [origin] : [])] : undefined;

  return (
    <div>
      <h3 className="mb-2 font-display text-lg font-semibold"><T>Pick destinations on the map</T></h3>
      <div className="overflow-hidden rounded-2xl border border-line">
        <BangladeshMap
          className="h-[340px] md:h-[420px]"
          route={route}
          districtStyle={(slug) => (slug === origin ? { fill: "#e9a23b", star: true } : chosen.has(slug) ? { fill: "#137a58" } : {})}
          onSelect={(slug) => slug && toggle(slug)}
        />
      </div>
      <p className="mt-2 flex items-start gap-2 text-sm text-muted">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
        <span>{t("Tip: you can also select a district by clicking it directly on the map.")} <span className="font-medium text-[#8a5a0a]"><T>Amber S = your starting city. Numbers show the order of your route, with the distance on each leg.</T></span></span>
      </p>
    
    </div>
  );
}
