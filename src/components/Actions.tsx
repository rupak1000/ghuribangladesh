"use client";

import { Bookmark, Check, Heart, Plus, Utensils } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { useGate } from "@/lib/useGate";
import { useT } from "@/lib/i18n";
import { uiActions } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { getDistrict, getPlace } from "@/lib/data";
import type { FoodMark, Mark } from "@/lib/types";

export function SaveIconButton({ placeId, className }: { placeId: string; className?: string }) {
  const s = useStore();
  const gate = useGate();
  const { t } = useT();
  const saved = !!s.placeMarks[placeId]?.want;
  const name = getPlace(placeId)?.name ?? "";
  return (
    <button
      aria-pressed={saved}
      aria-label={`${t("Save")} ${name}`}
      onClick={gate(() => {
        actions.togglePlace(placeId, "want");
        uiActions.toast(saved ? "Removed from saved" : `Saved ${name}`);
      })}
      className={cn(
        "grid size-11 place-items-center rounded-full bg-white/95 text-ink shadow-soft backdrop-blur transition hover:scale-105 active:scale-90 md:size-10",
        saved && "bg-amber text-forest",
        className,
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}

export function PlaceActions({ placeId, compact }: { placeId: string; compact?: boolean }) {
  const s = useStore();
  const gate = useGate();
  const { t } = useT();
  const m = s.placeMarks[placeId] ?? {};
  const name = getPlace(placeId)?.name ?? "";
  const inTrip = s.draftPlaces.includes(placeId);

  const mark = (k: Mark, onMsg: string) =>
    gate(() => {
      actions.togglePlace(placeId, k);
      uiActions.toast(m[k] ? "Removed" : onMsg);
    });

  const iconOnly = compact ? "size-11 px-0" : undefined;
  return (
    <div className={cn("flex flex-wrap gap-2", compact && "flex-nowrap")}>
      <Button variant={m.want ? "amber" : "secondary"} className={iconOnly} onClick={mark("want", `Saved ${name}`)} aria-pressed={!!m.want} aria-label={t("Save")} title={t("Save")}>
        <Bookmark className={cn("size-4", m.want && "fill-current")} /> {!compact && t("Save")}
      </Button>
      <Button variant={m.visited ? "primary" : "secondary"} className={compact ? "min-w-0 flex-1 px-3" : undefined} onClick={mark("visited", `Marked ${name} as visited`)} aria-pressed={!!m.visited}>
        <Check className="size-4" /> {t("I've Been Here")}
      </Button>
      <Button variant={m.favorite ? "amber" : "secondary"} className={iconOnly} onClick={mark("favorite", "Added to favorites")} aria-label="Favorite" title="Favorite" aria-pressed={!!m.favorite}>
        <Heart className={cn("size-4", m.favorite && "fill-current")} />
      </Button>
      <Button
        variant="secondary"
        className={iconOnly}
        aria-pressed={inTrip}
        aria-label={t("Add to Trip")}
        title={t("Add to Trip")}
        onClick={() => {
          actions.toggleDraftPlace(placeId);
          uiActions.toast(inTrip ? "Removed from trip" : "Added to your trip draft");
        }}
      >
        {inTrip ? <Check className="size-4" /> : <Plus className="size-4" />} {!compact && t("Add to Trip")}
      </Button>
    </div>
  );
}

export function FoodActions({ foodId, name }: { foodId: string; name: string }) {
  const s = useStore();
  const gate = useGate();
  const { t } = useT();
  const m = s.foodMarks[foodId] ?? {};
  const mark = (k: FoodMark, msg: string) =>
    gate(() => {
      actions.toggleFood(foodId, k);
      uiActions.toast(m[k] ? "Removed" : msg);
    });
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button size="sm" variant={m.tried ? "primary" : "secondary"} onClick={mark("tried", `Nice, you tried ${name}`)} aria-pressed={!!m.tried}>
        <Utensils className="size-3.5" /> {m.tried ? t("Tried") : t("I've Tried This")}
      </Button>
      <Button size="sm" variant={m.want ? "amber" : "secondary"} onClick={mark("want", `${name} added to your list`)} aria-pressed={!!m.want}>
        {t("Want to Try")}
      </Button>
      <Button size="sm" variant={m.favorite ? "amber" : "secondary"} onClick={mark("favorite", "Added to favorites")} aria-label="Favorite" aria-pressed={!!m.favorite}>
        <Heart className={cn("size-3.5", m.favorite && "fill-current")} />
      </Button>
    </div>
  );
}

const districtMarks: { key: Mark; label: string; icon: string }[] = [
  { key: "visited", label: "Visited", icon: "🟢" },
  { key: "want", label: "Want to Visit", icon: "🔵" },
  { key: "favorite", label: "Favorite", icon: "⭐" },
];

export function DistrictMarkChips({ slug }: { slug: string }) {
  const s = useStore();
  const gate = useGate();
  const { t, dn } = useT();
  const m = s.districtMarks[slug] ?? {};
  const d = getDistrict(slug);
  return (
    <div className="flex flex-wrap gap-1.5">
      {districtMarks.map((x) => (
        <button
          key={x.key}
          aria-pressed={!!m[x.key]}
          onClick={gate(() => {
            actions.toggleDistrict(slug, x.key);
            uiActions.toast(m[x.key] ? "Removed from My Map" : `${d ? dn(d) : ""} updated on My Map`);
          })}
          className={cn(
            "inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition active:scale-95 md:h-10",
            m[x.key] ? "border-forest bg-forest text-white" : "border-line bg-card hover:border-forest/40 hover:bg-moss",
          )}
        >
          <span aria-hidden>{x.icon}</span> {t(x.label)}
        </button>
      ))}
    </div>
  );
}

export function AddToMapButton({ slug, className, size }: { slug: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const s = useStore();
  const gate = useGate();
  const { t } = useT();
  const marks = s.districtMarks[slug];
  const on = !!marks && Object.keys(marks).length > 0;
  return (
    <Button
      variant={on ? "secondary" : "primary"}
      size={size}
      className={className}
      onClick={gate(() => {
        if (on) {
          const next = (["visited", "want", "favorite"] as Mark[]).filter((k) => marks?.[k]);
          next.forEach((k) => actions.toggleDistrict(slug, k));
          uiActions.toast("Removed from My Map");
        } else {
          actions.toggleDistrict(slug, "want");
          uiActions.toast("Added to My Map as Want to Visit");
        }
      })}
    >
      {on ? <Check className="size-4" /> : <Plus className="size-4" />} {on ? t("On My Map") : t("Add to My Map")}
    </Button>
  );
}
