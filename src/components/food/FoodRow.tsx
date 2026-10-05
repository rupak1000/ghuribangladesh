import Link from "next/link";
import { getDistrict } from "@/lib/data";
import type { Food } from "@/lib/types";
import { FoodActions } from "../Actions";
import { Media } from "../Media";
import { Rating } from "../ui/Rating";
import { DN, DS, T, FN, FB } from "@/components/T";

export function FoodRow({ food }: { food: Food }) {
  const d = getDistrict(food.districtSlug);
  return (
    <article className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-3 rounded-2xl border border-line bg-card p-2.5 shadow-soft sm:grid-cols-[8rem_1fr] sm:gap-x-4 sm:p-3">
      <div className="relative aspect-square overflow-hidden rounded-xl sm:row-span-2 sm:aspect-auto sm:min-h-32">
        <Media id={food.id} seed={food.name} category="food" alt={food.name} />
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold leading-snug sm:text-lg"><FN f={food} /></h3>
            <p className="text-xs font-medium text-emerald"><FN f={food} alt /></p>
          </div>
          <Rating value={food.rating} className="shrink-0" />
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted sm:text-sm"><FB f={food} /></p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {d && <Link href={`/district/${d.slug}`} className="font-semibold text-emerald hover:underline"><DN d={d} /></Link>}
          <span className="rounded-full bg-amber-soft px-2 py-0.5 font-semibold text-forest">{food.price}</span>
        </div>
      </div>
      <div className="col-span-2 sm:col-span-1 sm:col-start-2 sm:self-end">
        <FoodActions foodId={food.id} name={food.name} />
      </div>
    </article>
  );
}
