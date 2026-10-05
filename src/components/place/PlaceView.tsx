"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Tag, Wallet, ChevronRight } from "lucide-react";
import { getDistrict, nearbyFoods, nearbyPlaces, getPlace } from "@/lib/data";
import { categoryMeta, styles } from "@/lib/categories";
import { imageFor } from "@/lib/images";
import { useT } from "@/lib/i18n";
import { PlaceActions } from "../Actions";
import { FoodCard, PlaceCard } from "../Cards";
import { PhotoHero } from "../Hero";
import { Media } from "../Media";
import { MapPanel } from "../map/MapPanel";
import { placeMarkers } from "../map/helpers";
import { Rating } from "../ui/Rating";
import { T, DN, DS } from "@/components/T";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl font-semibold leading-tight">{title}</h2>
      {children}
    </section>
  );
}

export function PlaceView({ id }: { id: string }) {
  const { t, dn } = useT();
  const place = getPlace(id)!;
  const d = getDistrict(place.districtSlug)!;
  const near = nearbyPlaces(place, 4);
  const nearFood = nearbyFoods(place, 3);
  const img = imageFor(place.id);

  const info = [
    { icon: CalendarDays, label: t("Best time to visit"), value: place.bestTime },
    { icon: Wallet, label: t("Estimated budget"), value: place.budget.startsWith("Free") ? place.budget : `${place.budget} / person` },
    { icon: MapPin, label: t("Location"), value: `${dn(d)}, ${d.division}` },
    { icon: Tag, label: t("Category"), value: place.categories.map((c) => categoryMeta[c].label).join(" · ") },
  ];

  return (
    <>
      <PhotoHero imageId={place.id} seed={place.name} category={place.categories[0]} alt={place.name}>
        <nav className="mb-3 flex items-center gap-1 text-sm text-white/90" aria-label={t("Breadcrumb")}>
          <Link href={`/district/${d.slug}`} className="py-2 hover:underline">{dn(d)}</Link><ChevronRight className="size-3.5" /><span>{t("Place")}</span>
        </nav>
        <h1 className="font-display text-3xl font-semibold leading-tight text-balance break-words sm:text-4xl md:text-6xl">{place.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-white/90">
          <Link href={`/district/${d.slug}`} className="font-medium underline-offset-4 hover:underline">{dn(d)}</Link>
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur"><Rating value={place.rating} className="text-white" /></span>
        </div>
      </PhotoHero>

      <div className="mx-auto max-w-7xl px-4 py-8 pb-40 md:px-6 md:py-12 md:pb-12">
        <div className="hidden md:block"><PlaceActions placeId={place.id} /></div>

        <div className="mt-2 grid gap-10 md:mt-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-12">
            <Section title={t("About")}>
              <p className="max-w-prose text-base leading-[1.75] text-ink/90">{place.blurb}</p>
              <p className="mt-3 max-w-prose text-base leading-[1.75] text-ink/90">
                {place.hidden ? "A lesser-known stop that rewards travellers who take the detour. " : ""}
                <DN d={d} /> <T>is in</T> <T>{d.division}</T> <T>Division</T>. <T>Best time to visit:</T> {place.bestTime}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {place.styles.map((s) => (
                  <span key={s} className="rounded-full bg-moss px-3 py-1 text-xs font-semibold text-forest">{styles.find((x) => x.key === s)?.label}</span>
                ))}
              </div>
            </Section>

            <Section title={t("Things to do")}>
              <ul className="space-y-2.5">
                {place.thingsToDo.map((x) => (
                  <li key={x} className="flex gap-3 rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed shadow-soft"><span className="mt-1 size-2 shrink-0 rounded-full bg-emerald" aria-hidden />{x}</li>
                ))}
              </ul>
            </Section>

            <Section title={t("Photos")}>
              <div className="overflow-hidden rounded-3xl border border-line">
                <div className="aspect-[16/9]"><Media id={place.id} seed={place.name} category={place.categories[0]} alt={place.name} /></div>
              </div>
              {img ? (
                <p className="mt-2 text-xs text-muted">
                  Photo: {img.author}, {img.license}, via <a className="underline" href={img.page} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>.
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted"><T>No photograph is available for this place yet. This is an illustration.</T></p>
              )}
            </Section>

            <Section title={t("Map")}>
              <div className="overflow-hidden rounded-3xl border border-line">
                <MapPanel markers={placeMarkers("all", new Set([place.id, ...near.map((n) => n.id)]))} selected={d.slug} preview={false} className="h-[420px]" />
              </div>
            </Section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-card p-5 shadow-soft md:p-6">
              <dl className="space-y-4">
                {info.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-soft text-forest"><Icon className="size-4" /></span>
                    <div><dt className="text-xs text-muted">{label}</dt><dd className="text-sm font-semibold">{value}</dd></div>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        <div className="mt-16 space-y-12">
          <Section title={t("Nearby places")}>
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
              {near.map((p) => <PlaceCard key={p.id} place={p} className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-auto" />)}
            </div>
          </Section>
          <Section title={t("Food nearby")}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{nearFood.map((f) => <FoodCard key={f.id} food={f} />)}</div>
          </Section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-card/95 p-3 backdrop-blur md:hidden">
        <PlaceActions placeId={place.id} compact />
      </div>
    </>
  );
}
