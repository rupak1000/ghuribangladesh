"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, MapPin, Search, Utensils, Sparkles } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { uiActions, useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { search, type Hit } from "@/lib/search";
import { Sheet } from "./ui/Sheet";
import { Button } from "./ui/Button";
import { T } from "@/components/T";
import { hasLocalData, signInOnline } from "@/lib/accountClient";

const icons = { district: MapPin, place: Compass, food: Utensils, experience: Sparkles };
const kindLabel = { district: "Districts", place: "Places", food: "Foods", experience: "Experiences" } as const;

function SearchPanel() {
  const router = useRouter();
  const { t } = useT();
  const [q, setQ] = useState("");
  const hits = useMemo(() => search(q), [q]);
  const grouped = (["district", "place", "food", "experience"] as const)
    .map((k) => ({ k, items: hits.filter((h) => h.kind === k).slice(0, 6) }))
    .filter((g) => g.items.length);
  const go = (h: Hit) => {
    uiActions.closeSearch();
    router.push(h.href);
  };
  return (
    <>
      <div className="flex items-center gap-3 border-b border-line pb-4 pr-10">
        <Search className="size-5 text-muted" />
        <input maxLength={80}
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && hits[0] && go(hits[0])}
          placeholder={t("Search districts, places, food...")}
          className="w-full bg-transparent text-base outline-none placeholder:text-muted/70"
          aria-label={t("Search")}
        />
      </div>
      <div className="mt-3 max-h-[55dvh] overflow-y-auto">
        {!q && (
          <div className="py-6">
            <p className="mb-3 text-sm text-muted">Try</p>
            <div className="flex flex-wrap gap-2">
              {["beach", "tea", "doi", "hilsa", "waterfall", "Sylhet"].map((s) => (
                <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:bg-moss">{s}</button>
              ))}
            </div>
          </div>
        )}
        {q && !hits.length && <p className="py-10 text-center text-sm text-muted">Nothing found for “{q}”. Try a district, a place or a dish.</p>}
        {grouped.map(({ k, items }) => (
          <div key={k} className="mt-2">
            <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted">{t(kindLabel[k])}</p>
            {items.map((h) => {
              const Icon = icons[h.kind];
              return (
                <Link key={h.kind + h.id} href={h.href} onClick={uiActions.closeSearch} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-moss">
                  <span className="grid size-9 place-items-center rounded-full bg-emerald-soft text-forest"><Icon className="size-4" /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{h.title}</span>
                    <span className="block truncate text-xs text-muted">{h.sub}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

export function SearchOverlay() {
  const { searchOpen } = useUI();
  return (
    <Sheet open={searchOpen} onClose={uiActions.closeSearch} title="Search" className="md:max-w-xl md:self-start md:mt-[12vh]">
      <SearchPanel />
    </Sheet>
  );
}

function OnlineSignIn() {
  const { t } = useT();
  const s = useStore();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const local = hasLocalData(s);
  const go = async (keepLocal: boolean) => {
    setBusy(true);
    setError("");
    const r = await signInOnline(email.trim(), keepLocal);
    setBusy(false);
    if ("error" in r) return setError(r.error);
    setEmail("");
    uiActions.closeAuth();
    uiActions.toast("Signed in. Your online map is loaded.");
  };
  return (
    <details className="mt-5 rounded-2xl border border-line bg-moss/50 p-3">
      <summary className="min-h-9 cursor-pointer text-sm font-semibold"><T>Already saved your map online? Sign in with your email</T></summary>
      <div className="mt-3 space-y-3">
        <label className="block text-sm font-medium">
          {t("Email")}
          <input maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-emerald" />
        </label>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button type="button" disabled={busy || !/.+@.+\..+/.test(email.trim())} onClick={() => go(false)} className="h-11 w-full rounded-full bg-forest text-sm font-semibold text-white transition hover:bg-forest-2 disabled:opacity-40">
          {t("Sign in with email")}
        </button>
        {local && (
          <button type="button" disabled={busy || !/.+@.+\..+/.test(email.trim())} onClick={() => go(true)} className="h-11 w-full rounded-full border border-line bg-white text-sm font-semibold transition hover:border-emerald/40 disabled:opacity-40">
            {t("Sign in and keep this device's map")}
          </button>
        )}
        <p className="text-xs text-muted"><T>Signing in loads your online map and replaces the map on this device, unless you choose to keep this device&apos;s map.</T></p>
      </div>
    </details>
  );
}

export function AuthModal() {
  const { authOpen } = useUI();
  const { user } = useStore();
  const { t } = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const open = authOpen && !user;
  const emailOk = email.trim() === "" || /.+@.+\..+/.test(email.trim());
  const valid = name.trim().length > 1 && emailOk;
  return (
    <Sheet open={open} onClose={uiActions.closeAuth} title={t("Sign in")}>
      <h2 className="font-display text-2xl font-semibold">{t("Sign in")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("Sign in to save places, track visits and plan trips. You can keep exploring as a guest.")}</p>
      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          actions.signIn({ name: name.trim(), email: email.trim(), bio: "Explorer · Traveler" });
          setName("");
          setEmail("");
          uiActions.closeAuth();
          uiActions.toast(`Welcome, ${name.trim().split(" ")[0]}!`);
        }}
      >
        <label className="block text-sm font-medium">
          {t("Name")}
          <input maxLength={40} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-emerald" />
        </label>
        <label className="block text-sm font-medium">
          {t("Email")} <span className="font-normal text-muted">(optional)</span>
          <input maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" aria-invalid={!emailOk} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-emerald aria-[invalid=true]:border-red-500" />
          {!emailOk && <span className="mt-1 block text-xs text-red-600"><T>Enter a valid email or leave it empty.</T></span>}
        </label>
        <button type="submit" disabled={!valid} className="h-12 w-full rounded-full bg-forest font-semibold text-white transition hover:bg-forest-2 disabled:opacity-40">{t("Continue")}</button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            actions.signIn({ name: "Guest Traveler", email: "", bio: "Explorer · Traveler" });
            uiActions.closeAuth();
            uiActions.toast("You're in as a guest. You can rename yourself in Profile.");
          }}
        >
          {t("Continue as guest")}
        </Button>
      </form>
      <OnlineSignIn />
      <p className="mt-4 text-xs text-muted"><T>No password needed. Your profile and map are stored on this device. Cloud sync and sign-in with Google arrive when a backend is connected.</T></p>
    </Sheet>
  );
}

export function Toasts() {
  const { toasts } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 md:bottom-8" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="animate-pop rounded-full bg-forest px-4 py-2.5 text-sm font-medium text-white shadow-lift">{t.message}</div>
      ))}
    </div>
  );
}

export function GlobalEffects() {
  const { lang } = useStore();
  const prev = useRef(lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    prev.current = lang;
  }, [lang]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        uiActions.openSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
