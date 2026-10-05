"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getFood, getPlace, getDistrict } from "@/lib/data";
import { categoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { getMapTheme } from "@/lib/mapThemes";
import { BangladeshMap, type MapMarker } from "./BangladeshMap";
import { DistrictPreview } from "./DistrictPreview";
import { categoryDim, useDistrictStyle, useMarkerStates } from "./helpers";
import { Media } from "../Media";
import { Rating } from "../ui/Rating";
import { SaveIconButton, FoodActions } from "../Actions";
import { buttonClass } from "../ui/Button";
import type { Category } from "@/lib/types";
import { T, DN, DS } from "@/components/T";

interface Props {
  markers: MapMarker[];
  category?: Category | "all";
  dimmed?: (slug: string) => boolean;
  className?: string;
  fullBleed?: boolean;
  preview?: boolean;
  selected?: string | null;
  onSelect?: (slug: string | null) => void;
  onOverlay?: (open: boolean) => void;
}

function MarkerPopup({ id, onClose }: { id: string; onClose: () => void }) {
  const place = getPlace(id);
  const food = place ? undefined : getFood(id);
  const item = place ?? food;
  if (!item) return null;
  const d = getDistrict(item.districtSlug);
  const cat = place ? place.categories[0] : "food";
  return (
    <div
      className={cn(
        "z-[45] overflow-hidden bg-card shadow-float animate-sheet",
        "fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] rounded-t-3xl border-t border-line",
        "md:absolute md:inset-x-auto md:bottom-4 md:left-4 md:w-[340px] md:rounded-3xl md:animate-pop",
      )}
      role="dialog"
      aria-label={item.name}
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" />
      <div className="flex gap-3 p-3">
        <div className="size-24 shrink-0 overflow-hidden rounded-2xl">
          <Media id={item.id} seed={item.name} category={cat as Category} alt={item.name} />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <p className="text-xs font-semibold text-emerald"><span aria-hidden>{categoryMeta[cat as Category].emoji}</span> {d && <DN d={d} />}</p>
          <h3 className="font-display text-lg font-semibold leading-snug">{item.name}</h3>
          <Rating value={item.rating} />
        </div>
        <button onClick={onClose} aria-label="Close" className="absolute right-2 top-2 grid size-11 place-items-center rounded-full hover:bg-ink/5 md:right-3 md:top-3 md:size-9"><X className="size-4" /></button>
      </div>
      <p className="line-clamp-2 px-4 text-sm leading-relaxed text-muted">{item.blurb}</p>
      <div className="flex items-center gap-2 p-4 pt-3">
        {place ? (
          <>
            <Link href={`/place/${place.id}`} className={buttonClass("primary", "md", "flex-1")}><T>View place</T></Link>
            <SaveIconButton placeId={place.id} className="border border-line" />
          </>
        ) : (
          food && <FoodActions foodId={food.id} name={food.name} />
        )}
      </div>
    </div>
  );
}

export function MapPanel({ markers, category = "all", dimmed, className, fullBleed, preview = true, selected: selectedProp, onSelect, onOverlay }: Props) {
  const [inner, setInner] = useState<string | null>(null);
  const [marker, setMarker] = useState<string | null>(null);
  const selected = selectedProp !== undefined ? selectedProp : inner;
  const districtStyle = useDistrictStyle();
  const withState = useMarkerStates(markers);
  const theme = getMapTheme(useStore().mapTheme);

  const overlayOpen = !!marker || (preview && !!selected);
  useEffect(() => {
    onOverlay?.(overlayOpen);
  }, [overlayOpen, onOverlay]);

  const root = useRef<HTMLDivElement>(null);
  const select = (slug: string | null) => {
    setMarker(null);
    setInner(slug);
    onSelect?.(slug);
    if (slug && preview && window.matchMedia("(max-width: 767px)").matches) {
      root.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={root} className={cn("relative scroll-mt-16", className)}>
      <BangladeshMap
        className="h-full w-full"
        fullBleed={fullBleed}
        selected={selected}
        onSelect={select}
        markers={withState}
        onMarkerClick={(id) => setMarker(id)}
        districtStyle={districtStyle}
        baseFill={theme.base}
        dimmed={dimmed ?? categoryDim(category)}
      />
      {marker ? (
        <MarkerPopup id={marker} onClose={() => setMarker(null)} />
      ) : (
        preview && selected && <DistrictPreview slug={selected} onClose={() => select(null)} />
      )}
    </div>
  );
}

export function MapLegend({ className }: { className?: string }) {
  const theme = getMapTheme(useStore().mapTheme);
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted", className)}>
      <li className="flex items-center gap-1.5"><span className="size-3 rounded-full ring-2 ring-white" style={{ background: theme.visited }} /> Visited</li>
      <li className="flex items-center gap-1.5"><span className="size-3 rounded-full ring-2 ring-white" style={{ background: theme.want }} /> Want to Visit</li>
      <li className="flex items-center gap-1.5"><span className="size-3 rounded-full ring-2 ring-white" style={{ background: theme.favorite }} /> ⭐ Favorite</li>
    </ul>
  );
}
