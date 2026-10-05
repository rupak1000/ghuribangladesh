import Link from "next/link";
import { ArrowRight, Compass, Map as MapIcon, Route, Utensils } from "lucide-react";
import { HeroSlideshow, type Slide } from "@/components/home/HeroSlideshow";
import heroPhotos from "@/data/hero.json";
import { DistrictTile, FoodCard, SeeMoreTile } from "@/components/Cards";
import { HeroSearch } from "@/components/home/HeroSearch";
import { HomeMap } from "@/components/home/HomeMap";
import { DistrictPicker } from "@/components/DistrictPicker";
import { YourBangladesh } from "@/components/home/YourBangladesh";
import { LinkButton } from "@/components/ui/Button";
import { getDistrict, getFood } from "@/lib/data";
import { T } from "@/components/T";

const popular = ["coxs-bazar", "sylhet", "bandarban", "rangamati", "moulvibazar"].map((s) => getDistrict(s)!);
const trending = ["bogura--bogura-doi", "cumilla--cumilla-rasmalai", "chandpur--chandpur-hilsa", "tangail--porabari-chomchom", "moulvibazar--seven-layer-tea"].map((id) => getFood(id)!);

const heroSlides: Slide[] = heroPhotos;

function SectionHead({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow"><T>{eyebrow}</T></p>
        <h2 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-4xl"><T>{title}</T></h2>
      </div>
      {href && (
        <Link href={href} className="flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <span><T>{cta ?? ""}</T></span> <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

const quick = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/food", label: "Food", icon: Utensils },
  { href: "/my-map", label: "My Map", icon: MapIcon },
  { href: "/trips", label: "Trip Planner", icon: Route },
];

export default function HomePage() {
  return (
    <>
      <section className="on-dark relative isolate overflow-hidden bg-forest text-white">
        <HeroSlideshow slides={heroSlides} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest/75 via-forest/55 to-forest" />
        <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-12 text-center md:pb-36 md:pt-24">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur">
            <Compass className="size-3.5" aria-hidden /> 64 districts · <T>Places</T> · <T>Food</T>
          </p>
          <h1 className="font-display text-[2.5rem] font-semibold leading-[1.08] text-balance md:text-7xl">
            <T>Discover Bangladesh. Your way.</T>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
            <T>Explore 64 districts, discover unforgettable places and local flavors, and build your own Bangladesh journey.</T>
          </p>
          <div className="mt-8 md:mt-10"><HeroSearch /></div>
          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {quick.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.97]">
                  <Icon className="size-4" aria-hidden /> <T>{label}</T>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 md:-mt-20 md:px-6">
        <HomeMap />
        <DistrictPicker mode="browse" defaultOpen className="mt-6" />
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-16 md:space-y-24 md:px-6 md:pt-28">
        <section>
          <SectionHead eyebrow="Popular Destinations" title="Where to next?" href="/explore" cta="Explore all" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
            {popular.map((d, i) => (
              <DistrictTile key={d.slug} district={d} className={i >= 4 ? "hidden sm:block" : undefined} />
            ))}
            <SeeMoreTile href="/explore" title="See all 64 districts" sub="Explore every district" className="col-span-2 min-h-32 sm:col-span-1 sm:min-h-48" />
          </div>
        </section>

        <section>
          <SectionHead eyebrow="Trending Food" title="Taste Bangladesh" href="/food" cta="Food map" />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {trending.map((f, i) => (
              <div key={f.id} className={i >= 3 ? "hidden sm:block" : undefined}><FoodCard food={f} /></div>
            ))}
            <SeeMoreTile href="/food" title="See more food" sub="Favourite dish of all 64 districts" className="min-h-32 sm:min-h-full" />
          </div>
        </section>

        <section><YourBangladesh /></section>

        <section className="grid items-center gap-4 rounded-3xl border border-line bg-card p-6 shadow-soft md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <p className="eyebrow"><T>New here?</T></p>
            <h2 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-3xl"><T>See how everything works</T></h2>
            <p className="mt-1 text-muted"><T>A short guide to the map, saving places, trip costs, sharing your profile and printing a wall map.</T></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/help" size="lg"><T>Help &amp; guide</T></LinkButton>
            <LinkButton href="/wall-map" variant="secondary" size="lg"><T>Make a wall map</T></LinkButton>
          </div>
        </section>

        <section className="on-dark overflow-hidden rounded-3xl bg-forest p-7 text-white shadow-lift md:p-14">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-amber"><T>Plan Your Next Adventure</T></p>
              <h2 className="mt-2 max-w-xl font-display text-2xl font-semibold leading-tight md:text-5xl"><T>Pick a few districts. We&apos;ll shape the days.</T></h2>
              <p className="mt-3 max-w-lg text-white/85"><T>Choose your style and your dates and get a day-by-day plan you can edit, save and share.</T></p>
            </div>
            <LinkButton href="/trips" variant="amber" size="lg" className="w-full md:w-auto"><T>Create Trip</T> <ArrowRight className="size-4" /></LinkButton>
          </div>
        </section>
      </div>
    </>
  );
}
