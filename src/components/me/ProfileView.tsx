"use client";

import { useState } from "react";
import { Copy, ExternalLink, Globe, Pencil, Share2 } from "lucide-react";
import { actions, useProgress, useStore } from "@/lib/store";
import { getDistrict } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { MapPanel } from "../map/MapPanel";
import { FoodCard } from "../Cards";
import { Button, LinkButton } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Sheet } from "../ui/Sheet";
import { Skeleton } from "../ui/Skeleton";
import { Tabs } from "../ui/Tabs";
import { ShareDialog } from "../ShareDialog";
import { Achievements, PlaceGroup, useShareData } from "./parts";
import { copyText } from "@/lib/clipboard";
import { uiActions } from "@/lib/ui";
import { encodeShare } from "@/lib/share";
import { mapThemes } from "@/lib/mapThemes";
import { publishProfile, unpublishProfile } from "@/lib/publish";
import { slugify } from "@/lib/utils";
import { StaticMap } from "../StaticMap";
import { cn } from "@/lib/utils";
import { T, DS } from "@/components/T";
import { AccountSection } from "./AccountSection";
import { siteOrigin } from "@/lib/site";

type Tab = "map" | "places" | "food" | "trips" | "favorites";

export function ProfileView() {
  const { t } = useT();
  const s = useStore();
  const p = useProgress();
  const data = useShareData();
  const [tab, setTab] = useState<Tab>("map");
  const [share, setShare] = useState(false);
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const origin = siteOrigin();
  const longHref = `${origin}/u?${encodeShare(data)}`;
  const shortHref = s.profileLink ? `${origin}/u/${s.profileLink.id}` : "";
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  if (!s.hydrated) return <div className="mx-auto max-w-5xl space-y-4 px-4 py-10"><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" /></div>;

  if (!s.user) {
    const example = `/u?${encodeShare({
      name: "Sample Traveler", bio: "Explorer · Foodie",
      visited: ["dhaka", "coxs-bazar", "sylhet", "chattogram", "moulvibazar", "bogura", "cumilla", "rajshahi"],
      want: ["bandarban", "rangamati", "sunamganj"], fav: ["coxs-bazar"],
      places: 3, foods: 2, favorites: 1,
      visitedPlaces: ["coxs-bazar--coxs-bazar-beach", "sylhet--ratargul-swamp-forest", "dhaka--lalbagh-fort"],
      favPlaces: ["coxs-bazar--coxs-bazar-beach"], triedFoods: ["bogura--bogura-doi", "moulvibazar--seven-layer-tea"],
    })}`;
    return (
      <div className="mx-auto max-w-xl px-4 py-10 md:py-16">
        <EmptyState
          emoji="👤"
          title={t("Your travel profile lives here")}
          text={t("Sign in to track your districts, save places and plan trips. Once you're signed in, you get a public profile link to share. Anyone can open it without an account.")}
          action={
            <>
              <Button onClick={uiActions.openAuth}>{t("Sign in")}</Button>
              <a href={example} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold transition hover:bg-moss"><Globe className="size-4" /> <T>See an example public profile</T></a>
            </>
          }
        />
      </div>
    );
  }

  const stats = [
    [p.visitedDistricts.length, "Districts"],
    [p.visitedPlaces.length, "Places"],
    [p.triedFoods.length, "Foods"],
    [p.favorites, "Favorites"],
  ] as const;

  const tabs: { key: Tab; label: string }[] = [
    { key: "map", label: t("My Map") },
    { key: "places", label: t("Places") },
    { key: "food", label: t("Food") },
    { key: "trips", label: t("Trips") },
    { key: "favorites", label: t("Favorites") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <header className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
        <div className="grid size-24 shrink-0 place-items-center rounded-full bg-emerald font-display text-4xl font-semibold text-white shadow-lift">{s.user.name.slice(0, 1).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{s.user.name}</h1>
          <p className="text-muted">{s.user.bio}</p>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <Button variant="secondary" className="flex-1 md:flex-none" onClick={() => { setName(s.user!.name); setBio(s.user!.bio); setEdit(true); }}><Pencil className="size-4" /> <T>Edit</T></Button>
          <Button className="flex-1 md:flex-none" onClick={() => setShare(true)}><Share2 className="size-4" /> {t("Share")}</Button>
        </div>
      </header>

      <AccountSection />

      <section id="public-profile" className="mt-6 scroll-mt-20 rounded-2xl border border-emerald/15 bg-moss p-4 text-sm md:p-5" aria-labelledby="public-profile-title">
        <h2 id="public-profile-title" className="flex items-center gap-2 font-semibold"><Globe className="size-4" /> <T>Your public profile</T></h2>
        {s.profileLink ? (
          <>
            <p className="mt-1 text-muted"><T>Anyone with this link sees your name, bio, map, visited places and foods. No email, no account needed. It updates automatically as you add places.</T></p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input readOnly value={shortHref} onFocus={(e) => e.currentTarget.select()} aria-label={t("Public profile link")} className="h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm font-medium" />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={async () => { uiActions.toast((await copyText(shortHref)) ? "Profile link copied" : "Select the link and copy it"); }}><Copy className="size-4" /> Copy link</Button>
                <a href={shortHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-2"><ExternalLink className="size-4" /> <T>Open</T></a>
              </div>
            </div>
            <button
              className="mt-3 min-h-11 text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink"
              onClick={async () => { uiActions.toast((await unpublishProfile()) ? "Public profile removed" : "Could not remove it. Try again."); }}
            >
              <T>Stop sharing and delete the public page</T>
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 text-muted"><T>Create a short link such as</T> <span className="font-semibold text-ink">/u/{slugify(s.user.name) || "your-name"}-a1b2</span>. Anyone with it can see your name, bio, map, visited places and foods. Your email is never shared, and you can delete the page any time.</p>
            <Button className="mt-3" disabled={busy} onClick={async () => { setBusy(true); const r = await publishProfile(data); setBusy(false); uiActions.toast(r.ok ? "Public link created" : `${r.error}. You can still share the long link below.`); }}>
              <Globe className="size-4" /> {busy ? "Creating…" : "Create my public link"}
            </Button>
            <details className="mt-3 text-xs text-muted">
              <summary className="min-h-8 cursor-pointer font-semibold"><T>Or use a long link that needs no server</T></summary>
              <input readOnly value={longHref} onFocus={(e) => e.currentTarget.select()} aria-label={t("Long profile link")} className="mt-2 h-10 w-full rounded-full border border-line bg-white px-4 text-xs" />
            </details>
          </>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-4 shadow-soft md:p-5" aria-labelledby="map-colors">
        <h2 id="map-colors" className="font-semibold"><T>Map colors</T></h2>
        <p className="mt-1 text-sm text-muted"><T>Pick the colors for your districts. It applies to your map, your share card and your public profile.</T></p>
        <div className="mt-4 grid items-center gap-5 md:grid-cols-[1fr_150px]">
          <div role="radiogroup" aria-label={t("Map color theme")} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {mapThemes.map((th) => (
              <button
                key={th.key}
                role="radio"
                aria-checked={s.mapTheme === th.key}
                onClick={() => { actions.setMapTheme(th.key); uiActions.toast(`${th.label} map colors applied`); }}
                className={cn("flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-sm font-semibold transition active:scale-[0.98]", s.mapTheme === th.key ? "border-forest bg-moss ring-2 ring-forest" : "border-line hover:border-forest/40")}
              >
                <span className="flex shrink-0 -space-x-1.5">
                  {[th.visited, th.want, th.favorite].map((c) => <span key={c} className="size-5 rounded-full border-2 border-white" style={{ background: c }} />)}
                </span>
                {th.label}
              </button>
            ))}
          </div>
          <StaticMap visited={data.visited} want={data.want} fav={data.fav} theme={s.mapTheme} home={data.home} className="mx-auto h-36 w-auto md:h-44" />
        </div>
      </section>

      <dl className="mt-8 grid grid-cols-4 divide-x divide-line rounded-3xl border border-line bg-card py-5 text-center shadow-soft">
        {stats.map(([n, l]) => (
          <div key={l}><dt className="sr-only">{l}</dt><dd className="font-display text-2xl font-semibold md:text-3xl">{n}</dd><p className="text-xs font-medium text-muted">{t(l)}</p></div>
        ))}
      </dl>

      <section className="mt-10"><Achievements p={p} /></section>

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mt-10" />
      <div className="py-8 pb-nav md:pb-8">
        {tab === "map" && (
          <div className="overflow-hidden rounded-3xl border border-line">
            <MapPanel markers={[]} className="h-[480px]" />
          </div>
        )}
        {tab === "places" && <PlaceGroup title={t("Visited places")} places={p.visitedPlaces} empty={{ title: "No visited places yet", text: "Mark places as visited to build your travel log." }} />}
        {tab === "food" &&
          (p.triedFoods.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{p.triedFoods.map((f) => <FoodCard key={f.id} food={f} />)}</div>
          ) : (
            <EmptyState emoji="🍛" title={t("No dishes tried yet")} text={t("Visit the food map and tap “I've Tried This” on the dishes you've tasted.")} href="/food" cta="Taste Bangladesh" />
          ))}
        {tab === "trips" &&
          (s.trips.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {s.trips.map((tr) => (
                <li key={tr.id} className="rounded-2xl border border-line bg-card p-4 shadow-soft">
                  <p className="font-semibold">{tr.name}</p>
                  <p className="text-xs text-muted">{[...new Set(tr.days.map((d) => d.districtSlug))].map((sl, i) => <span key={sl}>{i ? " · " : ""}<DS slug={sl} /></span>)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState emoji="🧳" title={t("No trips yet")} text={t("Turn your saved places into a day-by-day plan.")} href="/trips" cta="Create Trip" />
          ))}
        {tab === "favorites" && <PlaceGroup title="Favorite places" places={p.favPlaces} empty={{ title: "No favorites yet", text: "Tap the heart on places you love most." }} />}
      </div>

      <LinkButton href="/my-map" variant="secondary"><T>Open full map</T></LinkButton>

      <Sheet open={edit} onClose={() => setEdit(false)} title={t("Edit profile")}>
        <h2 className="mb-4 font-display text-2xl font-semibold"><T>Edit profile</T></h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) return;
            actions.signIn({ ...s.user!, name: name.trim(), bio: bio.trim() });
            setEdit(false);
          }}
        >
          <label className="block text-sm font-medium">{t("Name")}<input maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-emerald" /></label>
          <label className="block text-sm font-medium"><T>Bio</T><input maxLength={120} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("Explorer · Foodie · Traveler")} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-emerald" /></label>
          <Button className="w-full" type="submit">Save</Button>
        </form>
      </Sheet>
      <ShareDialog open={share} onClose={() => setShare(false)} data={data} />
    </div>
  );
}
