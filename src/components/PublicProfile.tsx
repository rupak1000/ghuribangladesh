import Link from "next/link";
import { Award, Compass, Heart, Home, MapPin, Utensils } from "lucide-react";
import { AchievementList } from "@/components/me/parts";
import { Media, PhotoCredit } from "@/components/Media";
import { ProfileShareBar } from "@/components/ProfileShareBar";
import { DN, T, DS, FN } from "@/components/T";
import { Rating } from "@/components/ui/Rating";
import { StaticMap } from "@/components/StaticMap";
import { LinkButton } from "@/components/ui/Button";
import { achievements } from "@/lib/achievements";
import { categoryMeta } from "@/lib/categories";
import { getDistrict, getFood, getPlace, placesOf } from "@/lib/data";
import { imageFor } from "@/lib/images";
import { getMapTheme } from "@/lib/mapThemes";
import type { ShareData } from "@/lib/share";
import type { Place } from "@/lib/types";

function PlaceTile({ p }: { p: Place }) {
  return (
    <Link href={`/place/${p.id}`} className="group block overflow-hidden rounded-2xl border border-line bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Media id={p.id} seed={p.name} category={p.categories[0]} alt={p.name} className="transition duration-500 group-hover:scale-[1.04]" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-forest backdrop-blur">{categoryMeta[p.categories[0]].emoji} {categoryMeta[p.categories[0]].label}</span>
      </div>
      <div className="flex items-start justify-between gap-2 p-3.5">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold leading-snug">{p.name}</h3>
          <p className="flex items-center gap-1 text-xs text-muted"><MapPin className="size-3" aria-hidden /> <DS slug={p.districtSlug} /></p>
        </div>
        <Rating value={p.rating} className="shrink-0" />
      </div>
    </Link>
  );
}

function Section({ icon: Icon, title, count, children }: { icon: typeof Heart; title: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 flex items-center gap-2.5 font-display text-2xl font-semibold">
        <span className="grid size-9 place-items-center rounded-full bg-emerald-soft text-forest"><Icon className="size-[18px]" aria-hidden /></span>
        {title}
        {count !== undefined && <span className="text-base font-sans font-medium text-muted">{count}</span>}
      </h2>
      {children}
    </section>
  );
}

export function PublicProfile({ d, updatedAt }: { d: ShareData; updatedAt?: number }) {
  const places = (d.visitedPlaces ?? []).map(getPlace).filter((x): x is Place => !!x);
  const favs = (d.favPlaces ?? []).map(getPlace).filter((x): x is Place => !!x);
  const foods = (d.triedFoods ?? []).map(getFood).filter((x) => !!x);
  const th = getMapTheme(d.theme);
  const ach = achievements({ visitedDistricts: d.visited, triedFoods: foods, visitedPlaces: places });
  const unlocked = ach.filter((a) => a.progress >= a.target).length;
  const pct = Math.round((d.visited.length / 64) * 100);
  const visitedList = d.visited.map(getDistrict).filter((x): x is NonNullable<typeof x> => !!x);
  const wanted = d.want.map(getDistrict).filter((x) => !!x);

  const home = d.home ? getDistrict(d.home) : undefined;
  const bestHomePlace = home ? placesOf(home.slug).filter((x) => imageFor(x.id)).sort((a, b) => b.rating - a.rating)[0] : undefined;
  const cover = bestHomePlace ?? [...favs, ...places].find((x) => imageFor(x.id));
  const stats = [
    { label: "Districts", value: `${d.visited.length}`, sub: "of 64", icon: Compass },
    { label: "Places", value: `${places.length}`, sub: "visited", icon: MapPin },
    { label: "Foods", value: `${foods.length}`, sub: "tasted", icon: Utensils },
    { label: "Favorites", value: `${d.favorites}`, sub: "loved", icon: Heart },
  ];
  const updated = updatedAt ? new Date(updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <div className="pb-16 pt-6 md:pt-10">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <header className="overflow-hidden rounded-3xl border border-line bg-card shadow-soft">
          {cover && (
            <div className="relative h-44 sm:h-56">
              <Media id={cover.id} seed={cover.name} category={cover.categories[0]} alt={cover.name} priority />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-10 md:px-7">
                <p className="on-dark text-sm font-semibold text-white">{cover.name}{home && bestHomePlace ? <> · <DN d={home} /></> : null}</p>
                <PhotoCredit id={cover.id} className="hidden truncate sm:block" />
              </div>
            </div>
          )}
          <div className="p-5 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="grid size-24 shrink-0 place-items-center rounded-full border-4 border-card bg-emerald font-display text-4xl font-semibold text-white shadow-soft sm:size-28 md:-mt-0 md:size-28" aria-hidden>
              {d.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow"><T>Travel profile</T></p>
              <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">{d.name}</h1>
              {d.bio && <p className="mt-0.5 text-muted">{d.bio}</p>}
              {home && <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-forest"><Home className="size-4" aria-hidden /> <T>From</T> <DN d={home} /></p>}
              <p className="mt-1.5 text-xs text-muted">
                {unlocked > 0 ? <>{unlocked} <T>{unlocked === 1 ? "achievement unlocked" : "achievements unlocked"}</T></> : <T>Just getting started</T>}
                {updated ? <> · <T>Updated</T> {updated}</> : null}
              </p>
            </div>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <ProfileShareBar name={d.name} districts={d.visited.length} />
          </div>
        </div>
        </header>

        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-line bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted"><T>{label}</T></dt>
                <Icon className="size-4 text-emerald" aria-hidden />
              </div>
              <dd className="mt-1 font-display text-3xl font-semibold leading-none">{value} <span className="font-sans text-sm font-medium text-muted"><T>{sub}</T></span></dd>
            </div>
          ))}
        </dl>

        <section className="mt-6 grid gap-6 rounded-3xl border border-line bg-card p-5 shadow-soft md:grid-cols-[minmax(0,320px)_1fr] md:items-center md:p-7" aria-label="District map">
          <StaticMap visited={d.visited} want={d.want} fav={d.fav} theme={d.theme} home={d.home} className="mx-auto w-full max-w-[300px]" />
          <div>
            <p className="eyebrow"><T>Exploring Bangladesh</T></p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight">{d.visited.length} <T>of 64 districts</T></h2>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={d.visited.length} aria-valuemin={0} aria-valuemax={64} aria-label="Districts visited">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: th.visited }} />
            </div>
            <p className="mt-1.5 text-sm text-muted">{pct}% <T>of the country explored</T></p>
            {home && <p className="mt-1 text-sm font-medium">🏠 <T>Home district</T>: <DN d={home} /></p>}
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
              <li className="flex items-center gap-2"><span className="size-3.5 rounded-full" style={{ background: th.visited }} /> {d.visited.length} <T>visited</T></li>
              <li className="flex items-center gap-2"><span className="size-3.5 rounded-full" style={{ background: th.want }} /> {d.want.length} <T>on the list</T></li>
              <li className="flex items-center gap-2"><span className="size-3.5 rounded-full" style={{ background: th.favorite }} /> {d.fav.length} <T>{d.fav.length === 1 ? "favorite district" : "favorite districts"}</T></li>
            </ul>
          </div>
        </section>

        {favs.length > 0 && (
          <Section icon={Heart} title={<T>Favorite places</T>} count={favs.length}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{favs.map((p) => <PlaceTile key={p.id} p={p} />)}</div>
          </Section>
        )}

        {places.length > 0 && (
          <Section icon={MapPin} title={<T>Places visited</T>} count={places.length}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{places.map((p) => <PlaceTile key={p.id} p={p} />)}</div>
          </Section>
        )}

        {visitedList.length > 0 && (
          <Section icon={Compass} title={<T>Districts visited</T>} count={visitedList.length}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visitedList.map((x) => (
                <li key={x.slug}>
                  <Link href={`/district/${x.slug}`} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl"><Media id={`district:${x.slug}`} seed={x.name} category="culture" alt={x.name} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold"><DN d={x} /></p>
                      <p className="truncate text-xs text-muted"><T>{x.division}</T> <T>Division</T></p>
                    </div>
                    {d.home === x.slug && <Home className="size-4 shrink-0 text-forest" aria-label="Home district" />}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section icon={Compass} title={<T>Want to visit next</T>} count={wanted.length}>
          {wanted.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {wanted.map((x) => (
                <li key={x!.slug}>
                  <Link href={`/district/${x!.slug}`} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl"><Media id={`district:${x!.slug}`} seed={x!.name} category="culture" alt={x!.name} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold"><DN d={x!} /></p>
                      <p className="truncate text-xs text-muted"><T>{x!.division}</T> <T>Division</T></p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-6 text-center text-sm text-muted"><T>No districts on the list yet.</T></p>
          )}
        </Section>

        {foods.length > 0 && (
          <Section icon={Utensils} title={<T>Foods tried</T>} count={foods.length}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {foods.map((f) => (
                <li key={f!.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 shadow-soft">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl"><Media id={f!.id} seed={f!.name} category="food" alt={f!.name} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold"><FN f={f!} /></p>
                    <p className="truncate text-xs text-muted"><DS slug={f!.districtSlug} /> · {f!.price}</p>
                  </div>
                  <Rating value={f!.rating} className="shrink-0" />
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section icon={Award} title={<T>Achievements</T>} count={unlocked}>
          <AchievementList list={ach} />
        </Section>

        <section className="mt-14 overflow-hidden rounded-3xl bg-forest p-7 text-center text-white md:p-10">
          <h2 className="mx-auto max-w-lg font-display text-2xl font-semibold leading-tight md:text-3xl"><T>Map your own Bangladesh, one district at a time</T></h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/80"><T>Mark the places you have been, track the foods you have tried, and share your journey.</T></p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <LinkButton href="/my-map" variant="amber" size="lg"><T>Start my map</T></LinkButton>
            <LinkButton href="/explore" variant="light" size="lg"><T>Explore Bangladesh</T></LinkButton>
          </div>
        </section>
      </div>
    </div>
  );
}
