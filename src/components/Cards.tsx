import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { District, Food, Place } from "@/lib/types";
import { categoryMeta } from "@/lib/categories";
import { districtStats, getDistrict } from "@/lib/data";
import { Media } from "./Media";
import { Rating } from "./ui/Rating";
import { SaveIconButton, FoodActions } from "./Actions";
import { cn } from "@/lib/utils";
import { T, DN, DS, FN, FB } from "@/components/T";

export function PlaceCard({ place, className, showDistrict = true }: { place: Place; className?: string; showDistrict?: boolean }) {
  const d = getDistrict(place.districtSlug);
  const cat = categoryMeta[place.categories[0]];
  return (
    <article className={cn("group relative overflow-hidden rounded-2xl border border-line bg-card shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift", className)}>
      <Link href={`/place/${place.id}`} className="block" aria-label={place.name}>
        <div className="relative aspect-[4/3] overflow-hidden bg-moss">
          <Media id={place.id} seed={place.name} category={place.categories[0]} alt={place.name} className="transition duration-500 group-hover:scale-[1.04]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest/45 to-transparent" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-forest shadow-soft">
            <span aria-hidden>{cat.emoji}</span> {cat.label}
          </span>
          {place.hidden && (
            <span className="absolute left-3 top-3 rounded-full bg-amber px-2.5 py-1 text-[11px] font-bold text-forest shadow-soft"><T>Hidden gem</T></span>
          )}
        </div>
        <div className="space-y-1.5 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold leading-snug">{place.name}</h3>
            <Rating value={place.rating} className="mt-0.5 shrink-0" />
          </div>
          {showDistrict && d && (
            <p className="flex items-center gap-1 text-sm text-muted"><MapPin className="size-3.5 shrink-0" aria-hidden /> <DN d={d} /> · <T>{d.division}</T></p>
          )}
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{place.blurb}</p>
        </div>
      </Link>
      <SaveIconButton placeId={place.id} className="absolute right-3 top-3" />
    </article>
  );
}

export function FoodCard({ food, showActions = true }: { food: Food; showActions?: boolean }) {
  const d = getDistrict(food.districtSlug);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-soft transition duration-300 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-amber-soft">
        <Media id={food.id} seed={food.name} category="food" alt={food.name} className="transition duration-500 group-hover:scale-[1.04]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-forest/60 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-amber px-3 py-1 text-xs font-bold text-forest shadow-soft">{food.price}</span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 shadow-soft"><Rating value={food.rating} /></span>
        {d && (
          <Link href={`/district/${d.slug}`} className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-forest/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-forest">
            <MapPin className="size-3" aria-hidden /> <DN d={d} />
          </Link>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-xl font-semibold leading-snug"><FN f={food} /></h3>
          <p className="text-sm font-medium text-emerald"><FN f={food} alt /></p>
        </div>
        <p className="text-sm leading-relaxed text-muted"><FB f={food} /></p>
        {showActions && <div className="mt-auto pt-1"><FoodActions foodId={food.id} name={food.name} /></div>}
      </div>
    </article>
  );
}

export function DistrictCard({ district, className }: { district: District; className?: string }) {
  const st = districtStats(district.slug);
  return (
    <Link
      href={`/district/${district.slug}`}
      className={cn("group relative block overflow-hidden rounded-2xl shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-forest">
        <Media id={`district:${district.slug}`} seed={district.name} category={district.slug === "coxs-bazar" ? "beach" : "nature"} alt={district.name} className="transition duration-500 group-hover:scale-[1.05]" />
        <div className="scrim-bottom absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-xs font-semibold text-white/90">{district.division} Division</p>
          <h3 className="font-display text-2xl font-semibold leading-tight"><DN d={district} /></h3>
          <p className="mt-1 text-xs font-medium text-white/90">{st.places} places · {st.foods} foods</p>
        </div>
      </div>
    </Link>
  );
}

export function DistrictTile({ district, className }: { district: District; className?: string }) {
  const st = districtStats(district.slug);
  return (
    <Link
      href={`/district/${district.slug}`}
      className={cn("group block rounded-3xl border border-line bg-card p-2 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift", className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <Media id={`district:${district.slug}`} seed={district.name} category="nature" alt={district.name} className="transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="px-2.5 pb-2.5 pt-3">
        <p className="eyebrow">{district.division}</p>
        <h3 className="font-display text-xl font-semibold leading-tight"><DN d={district} /></h3>
        <p className="mt-1 text-sm text-muted">{st.places} places · {st.foods} foods</p>
      </div>
    </Link>
  );
}

export function SeeMoreTile({ href, title, sub, className }: { href: string; title: string; sub: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("group flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-line bg-moss/60 p-6 text-center transition hover:border-emerald hover:bg-emerald-soft", className)}
    >
      <span className="grid size-12 place-items-center rounded-full bg-forest text-white transition group-hover:translate-x-0.5"><ArrowRight className="size-5" /></span>
      <span className="font-display text-xl font-semibold leading-tight"><T>{title}</T></span>
      <span className="text-sm text-muted"><T>{sub}</T></span>
    </Link>
  );
}
