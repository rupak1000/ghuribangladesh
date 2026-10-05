"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { districtStats, getDistrict } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Media } from "../Media";
import { AddToMapButton, DistrictMarkChips } from "../Actions";
import { buttonClass } from "../ui/Button";

/** Floating card on desktop, bottom sheet on mobile (above the bottom nav). */
export function DistrictPreview({ slug, onClose, className }: { slug: string; onClose: () => void; className?: string }) {
  const { t, dn } = useT();
  const d = getDistrict(slug);
  if (!d) return null;
  const st = districtStats(slug);
  return (
    <div
      className={cn(
        "z-[45] overflow-hidden bg-card shadow-float animate-sheet",
        "fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] max-h-[46dvh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-line",
        "md:absolute md:inset-x-auto md:bottom-4 md:left-4 md:max-h-none md:w-[340px] md:rounded-3xl md:animate-pop",
        className,
      )}
      role="dialog"
      aria-label={d.name}
    >
      <div className="relative h-20 md:h-36">
        <Media id={`district:${slug}`} seed={d.name} category={slug === "coxs-bazar" ? "beach" : "nature"} alt={d.name} />
        <div className="scrim-bottom absolute inset-0" />
        <button onClick={onClose} aria-label={t("Close")} className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-white/95 text-ink shadow-soft hover:bg-white md:right-3 md:top-3 md:size-9">
          <X className="size-4" />
        </button>
        <div className="absolute inset-x-4 bottom-3 text-white">
          <h3 className="font-display text-2xl font-semibold leading-tight">{dn(d)}</h3>
          <p className="text-xs font-medium text-white/90">{d.division} Division</p>
        </div>
      </div>
      <div className="space-y-3 p-3.5 md:space-y-3.5 md:p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [st.places, t("Places")],
            [st.foods, t("Foods")],
            [st.experiences, t("Experiences")],
          ].map(([n, l]) => (
            <div key={l as string} className="rounded-xl bg-moss py-1.5 md:py-2.5">
              <p className="text-lg font-bold leading-none">{n}</p>
              <p className="mt-1 text-[11px] font-medium text-muted">{l}</p>
            </div>
          ))}
        </div>
        <p className="line-clamp-2 hidden text-sm leading-relaxed text-muted md:block">{d.tagline}</p>
        <div className="flex gap-2">
          <Link href={`/district/${slug}`} className={buttonClass("primary", "md", "flex-1")}>{t("Explore District")}</Link>
          <AddToMapButton slug={slug} className="flex-1" />
        </div>
        <DistrictMarkChips slug={slug} />
      </div>
    </div>
  );
}
