import Link from "next/link";
import { getDistrict } from "@/lib/data";
import type { Trip } from "@/lib/store";
import { LinkButton } from "../ui/Button";
import { CostBreakdownCard, TravelPlanCard } from "./TravelPlan";
import { PrintButton } from "./PrintButton";
import { FoodsRow, HomeRow, PlaceFactsLine, PlaceLink, StayRow, TravelRow } from "./DayDetails";
import { dayNarrative } from "@/lib/tripDay";
import { T, DN, DS } from "@/components/T";

const SLOTS = [["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"]] as const;

export function TripShareView({ trip }: { trip: Trip }) {
  const n = trip.days.length;
  const narr = dayNarrative(trip);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <p className="mb-5 rounded-2xl bg-moss px-4 py-2.5 text-center text-sm text-muted print:hidden"><T>A friend shared this trip plan with you.</T></p>
      <p className="eyebrow"><T>Shared trip</T></p>
      <h1 className="mt-1 font-display text-3xl font-semibold leading-tight md:text-5xl">{trip.name}</h1>
      <p className="mt-2 text-base font-semibold text-emerald">
        {n} {n === 1 ? "Day" : "Days"} · {n - 1} {n - 1 === 1 ? "Night" : "Nights"}
        {trip.origin ? <> · <T>starting from</T> <DS slug={trip.origin} /></> : null}
        {(trip.travelers ?? 1) > 1 ? ` · ${trip.travelers} travelers` : ""}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <PrintButton />
        <LinkButton href="/trips"><T>Plan your own trip</T></LinkButton>
      </div>

      <div className="mt-6">
        <TravelPlanCard trip={trip} />
        <CostBreakdownCard trip={trip} readOnly />
      </div>

      <section className="rounded-3xl border border-line bg-card p-5 shadow-soft md:p-7" aria-label="Day by day">
        <p className="eyebrow"><T>Itinerary</T></p>
        <ol className="mt-4 space-y-6">
          {trip.days.map((day, i) => {
            const d = getDistrict(day.districtSlug);
            const nr = narr[i];
            return (
              <li key={i} className="print:break-inside-avoid">
                <h2 className="font-display text-xl font-semibold">
                  <span className="text-emerald">Day {i + 1}</span> — {nr.arrive && <><span className="text-muted"><DS slug={nr.arrive.from} /></span> → </>}
                  <Link href={`/district/${day.districtSlug}`} className="hover:underline">{d && <DN d={d} />}</Link>
                </h2>
                <div className="mt-2 space-y-3">
                  {nr.arrive && <TravelRow leg={nr.arrive} />}
                  <FoodsRow foods={nr.foods} />
                  <div className="grid gap-2 sm:grid-cols-3">
                    {SLOTS.map(([key, label]) => (
                      <div key={key} className="rounded-2xl bg-white/70 px-3 py-2 ring-1 ring-line">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
                        <ul className="mt-0.5">
                          {day[key].length === 0 && <li className="text-sm text-muted"><T>Free time</T></li>}
                          {day[key].map((a) => (
                            <li key={a.id} className="py-0.5">
                              {a.kind === "place" && a.refId ? <><PlaceLink id={a.refId} label={a.label} /><PlaceFactsLine placeId={a.refId} /></> : <span className="text-sm font-semibold">{a.label}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {nr.ret && <TravelRow leg={nr.ret} />}
                  {nr.home && <HomeRow slug={nr.home} />}
                  {nr.stay && <StayRow stay={nr.stay} />}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
      <p className="mt-6 text-center text-xs text-muted"><T>Planned with Ghuri Bangladesh. Costs and distances are rough estimates.</T></p>
    </div>
  );
}
