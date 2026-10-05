"use client";

import { useCallback, useMemo } from "react";
import { districtCategories, foods, getDistrict, places } from "@/lib/data";
import { categoryMeta } from "@/lib/categories";
import { hash } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { getMapTheme } from "@/lib/mapThemes";
import type { Category } from "@/lib/types";
import type { DistrictStyle, MapMarker } from "./BangladeshMap";


export function useDistrictStyle() {
  const s = useStore();
  const theme = getMapTheme(s.mapTheme);
  return useCallback(
    (slug: string): DistrictStyle => {
      const m = s.districtMarks[slug];
      if (m?.favorite) return { fill: theme.favorite, star: true };
      if (m?.visited) return { fill: theme.visited };
      if (m?.want) return { fill: theme.want };
      return {};
    },
    [s.districtMarks, theme],
  );
}

export function placeMarkers(filter: Category | "all", ids?: Set<string>, minRating = 0): MapMarker[] {
  const s = ids;
  return places
    .filter((p) => (filter === "all" || p.categories.includes(filter as Category)) && (!s || s.has(p.id)) && p.rating >= minRating)
    .map((p) => {
      const cat = filter !== "all" && p.categories.includes(filter as Category) ? (filter as Category) : p.categories[0];
      const meta = categoryMeta[cat];
      return { id: p.id, lat: p.lat, lng: p.lng, emoji: meta.emoji, color: meta.color, label: p.name };
    });
}

export function foodMarkers(): MapMarker[] {
  return foods.map((f) => {
    const d = getDistrict(f.districtSlug)!;
    const j = hash(f.id);
    return {
      id: f.id,
      lat: d.lat + (((j % 100) - 50) / 100) * 0.12,
      lng: d.lng + ((((j >> 7) % 100) - 50) / 100) * 0.12,
      emoji: "🍛",
      color: categoryMeta.food.color,
      label: f.name,
    };
  });
}

export function useMarkerStates(markers: MapMarker[]): MapMarker[] {
  const s = useStore();
  return useMemo(
    () =>
      markers.map((m) => {
        const pm = s.placeMarks[m.id];
        const fm = s.foodMarks[m.id];
        const state = pm?.favorite || fm?.favorite ? "favorite" : pm?.visited || fm?.tried ? "visited" : pm?.want || fm?.want ? "saved" : undefined;
        return state ? { ...m, state } : m;
      }),
    [markers, s.placeMarks, s.foodMarks],
  );
}

export function categoryDim(filter: Category | "all") {
  return (slug: string) => filter !== "all" && !districtCategories(slug).includes(filter as Category);
}

