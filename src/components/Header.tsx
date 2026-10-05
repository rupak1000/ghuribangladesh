"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Frame, Globe, HelpCircle, Home, Languages, LogOut, Map as MapIcon, Route, Search, User, Utensils } from "lucide-react";
import { useState } from "react";
import { actions, useStore } from "@/lib/store";
import { uiActions } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { T } from "@/components/T";

const nav = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/food", label: "Food" },
  { href: "/my-map", label: "My Map" },
  { href: "/trips", label: "Trip Planner" },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

function LangToggle() {
  const { lang } = useStore();
  return (
    <button
      onClick={() => actions.setLang(lang === "en" ? "bn" : "en")}
      className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 text-sm font-semibold text-ink transition hover:bg-ink/5 sm:px-3 md:h-10"
      aria-label={lang === "en" ? "Switch to Bengali" : "Switch to English"}
    >
      <Languages className="size-4" aria-hidden /> <span>{lang === "en" ? "বাংলা" : "EN"}</span>
    </button>
  );
}

function AccountLinks({ onNavigate }: { onNavigate: () => void }) {
  const { user, profileLink } = useStore();
  const { t } = useT();
  const row = "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-moss";
  return (
    <>
      <p className="truncate px-3 py-2 text-sm font-semibold">{user?.name}</p>
      <Link href="/profile" onClick={onNavigate} className={row}><User className="size-4" /> {t("Profile")}</Link>
      <a href={profileLink ? `/u/${profileLink.id}` : "/profile#public-profile"} onClick={onNavigate} className={row}><Globe className="size-4" /> <T>My public profile</T></a>
      <Link href="/trips" onClick={onNavigate} className={row}><Route className="size-4" /> <T>Trip Planner</T></Link>
      <Link href="/wall-map" onClick={onNavigate} className={row}><Frame className="size-4" /> <T>Wall map</T></Link>
      <Link href="/help" onClick={onNavigate} className={row}><HelpCircle className="size-4" /> <T>Help &amp; guide</T></Link>
      <Link href="/saved" onClick={onNavigate} className={row}><Bookmark className="size-4" /> {t("Saved")}</Link>
      <button onClick={() => { actions.signOut(); onNavigate(); }} className={`${row} w-full`}><LogOut className="size-4" /> {t("Sign out")}</button>
    </>
  );
}

function ProfileMenu() {
  const { user } = useStore();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const { profileLink } = useStore();
  if (!user) {
    return (
      <button onClick={uiActions.openAuth} className="h-11 whitespace-nowrap rounded-full bg-forest px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-forest-2 active:scale-[0.97] md:h-10">
        {t("Sign in")}
      </button>
    );
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label={t("Account menu")} aria-expanded={open} className="grid size-10 place-items-center rounded-full bg-emerald text-sm font-bold text-white ring-2 ring-transparent transition hover:ring-emerald-soft aria-expanded:ring-emerald-soft">
        {user.name.slice(0, 1).toUpperCase()}
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-30 cursor-default" aria-label={t("Close menu")} onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-lift animate-pop">
            <AccountLinks onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}

export function Header() {
  const path = usePathname();
  const { user } = useStore();
  const { t } = useT();
  return (
    <header className="sticky top-0 z-40 print:hidden border-b border-line/70 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-2 px-4 md:gap-3 md:px-5 lg:h-[4.5rem] lg:gap-6 lg:px-6">
        <Logo />
        <nav className="hidden h-full items-stretch gap-0.5 md:flex lg:ml-2 lg:gap-1" aria-label="Main">
          {nav.map((n) => {
            const active = isActive(path, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center whitespace-nowrap px-2.5 text-sm font-semibold transition lg:px-3.5",
                  active ? "text-forest" : "text-ink/70 hover:text-ink",
                )}
              >
                {t(n.label)}
                <span className={cn("absolute inset-x-2.5 bottom-0 h-[3px] rounded-full bg-emerald transition-opacity lg:inset-x-3.5", active ? "opacity-100" : "opacity-0")} />
              </Link>
            );
          })}
        </nav>
        <button
          onClick={uiActions.openSearch}
          aria-label={t("Search")}
          className="mx-auto hidden h-11 w-full max-w-md items-center justify-between rounded-full border border-line bg-card px-5 text-sm text-muted transition hover:border-emerald/40 lg:flex"
        >
          <span className="truncate">{t("Search districts, places, food...")}</span>
          <Search className="size-[18px] shrink-0 text-ink/70" />
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
          <button onClick={uiActions.openSearch} aria-label={t("Search")} className="flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-ink/75 transition hover:bg-ink/5 lg:hidden">
            <Search className="size-[18px]" />
          </button>
          <Link href="/help" aria-label={t("Help and guide")} className="hidden h-11 min-w-11 items-center justify-center rounded-full text-ink/75 transition hover:bg-ink/5 lg:flex"><HelpCircle className="size-[18px]" /></Link>
          <LangToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/food", label: "Food", icon: Utensils },
  { href: "/my-map", label: "My Map", icon: MapIcon },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const path = usePathname();
  const { t } = useT();
  const { user } = useStore();
  const [menu, setMenu] = useState(false);
  const tabCls = (active: boolean) => cn("flex h-[4.25rem] w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition active:scale-95", active ? "text-forest" : "text-muted hover:text-ink");
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 print:hidden border-t border-line bg-card/95 shadow-[0_-8px_24px_-16px_rgb(10_51_38/0.3)] backdrop-blur md:hidden" aria-label="Bottom">
      {menu && user && (
        <>
          <button className="fixed inset-0 -z-10 cursor-default bg-forest/20" aria-label={t("Close menu")} onClick={() => setMenu(false)} />
          <div className="absolute bottom-full right-2 mb-2 w-60 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-lift animate-pop">
            <AccountLinks onNavigate={() => setMenu(false)} />
          </div>
        </>
      )}
      <ul className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(path, href);
          const inner = (
            <>
              <span className={cn("grid h-8 w-14 place-items-center rounded-full transition", (active || (menu && href === "/profile")) && "bg-emerald-soft")}><Icon className="size-[22px]" /></span>
              {t(label)}
            </>
          );
          return (
            <li key={href}>
              {href === "/profile" && user ? (
                <button type="button" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)} className={tabCls(active || menu)}>{inner}</button>
              ) : (
                <Link href={href} aria-current={active ? "page" : undefined} onClick={() => setMenu(false)} className={tabCls(active)}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Footer() {
  const [showCredits, setShowCredits] = useState(false);
  return (
    <footer className="mt-20 print:hidden border-t border-line bg-card pb-nav pt-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-sm text-muted md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm space-y-2">
          <Logo />
          <p className="text-base">Discover Bangladesh. Your way.</p>
          <p><T>Developed by</T> <span className="font-semibold text-ink">Rupak Hasan</span></p>
        </div>
        <div className="space-y-1.5 md:text-right">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 md:justify-end">
            <Link className="font-semibold text-emerald hover:underline" href="/help"><T>Help &amp; guide</T></Link>
            <Link className="font-semibold text-emerald hover:underline" href="/wall-map"><T>Wall map</T></Link>
            <Link className="font-semibold text-emerald hover:underline" href="/trips"><T>Trip planner</T></Link>
            <button type="button" aria-expanded={showCredits} aria-controls="footer-credits" onClick={() => setShowCredits((v) => !v)} className="font-semibold text-emerald hover:underline">
              {showCredits ? "Hide credits" : "Credits"}
            </button>
          </p>
          {showCredits && (
            <div id="footer-credits" className="space-y-1.5 text-xs">
              <p><T>District boundaries: BBS / OCHA via geoBoundaries (CC BY 3.0 IGO).</T></p>
              <p><T>Photos from Wikimedia Commons, credited to their authors.</T> <Link className="font-semibold text-emerald hover:underline" href="/credits"><T>Photo credits</T></Link></p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
