import Link from "next/link";
import { Bike, Bus, Car, Clock, Footprints, Moon, Plane, Ship, Wallet, Utensils, CheckCircle2, type LucideIcon } from "lucide-react";
import { getDistrict } from "@/lib/data";
import type { Leg, TravelMode } from "@/lib/travel";
import { formatHours, takaRange } from "@/lib/travel";
import { placeFacts, type Stay } from "@/lib/tripDay";
import type { Food } from "@/lib/types";
import { T, DS, FN } from "@/components/T";

const ICONS: { [k in TravelMode["key"]]: LucideIcon } = { local: Bus, bus: Bus, ac: Bus, air: Plane, car: Car, bike: Bike, ferry: Ship, hike: Footprints };

export function TravelRow({ leg, label }: { leg: Leg; label?: string }) {
  const Icon = ICONS[leg.pick.key];
  const fare = leg.pick.low === 0 && leg.pick.high === 0 ? "Free" : takaRange(leg.pick.low, leg.pick.high);
  return (
    <div className="flex gap-3 rounded-2xl bg-forest px-3.5 py-3 text-white print:border print:border-ink print:bg-white print:text-ink">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 print:bg-moss"><Icon className="size-[18px]" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label ?? <><DS slug={leg.from} /> <T>to</T> <DS slug={leg.to} /></>}</p>
        <p className="text-xs opacity-90">
          By {leg.pick.label.toLowerCase()} · about {leg.km} km · {formatHours(leg.pick.hours)} · {fare} per person
        </p>
        {leg.pick.note && <p className="mt-0.5 text-[11px] opacity-75">{leg.pick.note}</p>}
      </div>
    </div>
  );
}

export function FoodsRow({ foods }: { foods: Food[] }) {
  if (!foods.length) return null;
  return (
    <div className="flex gap-3 rounded-2xl bg-amber-soft px-3.5 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white"><Utensils className="size-[18px] text-[#8a5a0a]" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-sm font-semibold"><T>Famous local food</T></p>
        <p className="text-sm text-ink/85">{foods.map((f, i) => <span key={f.id}>{i ? ", " : ""}<FN f={f} /></span>)}</p>
      </div>
    </div>
  );
}

export function StayRow({ stay }: { stay: Stay }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-moss px-3.5 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white"><Moon className="size-[18px] text-forest" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">Stay tonight: <DS slug={stay.district} /></p>
        <p className="text-sm text-ink/85">{stay.text}</p>
        {stay.note && <p className="text-xs text-muted">{stay.note}</p>}
      </div>
    </div>
  );
}

export function HomeRow({ slug }: { slug: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald/30 bg-emerald-soft px-3.5 py-3 text-sm font-semibold text-forest">
      <CheckCircle2 className="size-5 shrink-0" aria-hidden /> Trip complete. Back in <DS slug={slug} />.
    </div>
  );
}

export function PlaceFactsLine({ placeId }: { placeId: string }) {
  const f = placeFacts(placeId);
  if (!f) return null;
  return (
    <div className="mt-0.5 text-xs text-muted">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
        <span className="inline-flex items-center gap-1"><Clock className="size-3" aria-hidden /> {f.time}</span>
        <span className="inline-flex items-center gap-1"><Wallet className="size-3" aria-hidden /> {f.budget}</span>
      </p>
      {f.access && <p>{f.access}</p>}
    </div>
  );
}

export function PlaceLink({ id, label }: { id: string; label: string }) {
  return <Link href={`/place/${id}`} className="text-sm font-semibold hover:underline">{label}</Link>;
}
