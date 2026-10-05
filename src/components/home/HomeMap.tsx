"use client";

import { useMemo, useState } from "react";
import { categories } from "@/lib/categories";
import { useT } from "@/lib/i18n";
import type { Category } from "@/lib/types";
import { Chip } from "../ui/Chip";
import { DistrictPicker } from "../DistrictPicker";
import { MapLegend, MapPanel } from "../map/MapPanel";
import { foodMarkers, placeMarkers } from "../map/helpers";

export function HomeMap() {
  const { t } = useT();
  const [cat, setCat] = useState<Category | "all">("all");
  const markers = useMemo(() => (cat === "food" ? foodMarkers() : placeMarkers(cat, undefined, cat === "all" ? 4.3 : 0)), [cat]);
  const chips: { key: Category | "all"; label: string }[] = [
    { key: "all", label: "All" },
    ...["nature", "history", "food", "adventure", "beach", "culture"].map((k) => ({ key: k as Category, label: k === "beach" ? "Beaches" : categories.find((c) => c.key === k)!.label })),
  ];
  return (
    <div className="-mx-4 overflow-hidden border-y border-line bg-card shadow-float md:mx-0 md:rounded-[2rem] md:border">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3.5 md:flex-wrap md:justify-center md:px-6 md:py-4" role="group" aria-label={t("Filter map by category")}>
        {chips.map((c) => (
          <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
            {c.key !== "all" && <span aria-hidden>{categories.find((x) => x.key === c.key)?.emoji}</span>}
            {t(c.label)}
          </Chip>
        ))}
      </div>
      <MapPanel markers={markers} category={cat} className="h-[68dvh] min-h-[460px] border-t border-line md:h-[640px]" />
      <MapLegend className="justify-center border-t border-line bg-moss/40 px-4 py-3" />
    </div>
  );
}
