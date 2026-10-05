"use client";

import { getDistrict } from "@/lib/data";
import { foodBlurbBn } from "@/data/foods-bn";
import { useT } from "@/lib/i18n";

/** Translates a literal English string, for use inside server components. */
export function T({ children }: { children: string }) {
  const { t } = useT();
  return <>{t(children)}</>;
}

/** A district name in the reader's language, for use inside server components. */
export function DN({ d }: { d: { name: string; bn: string } }) {
  const { dn } = useT();
  return <>{dn(d)}</>;
}

/** A district name looked up by slug, in the reader's language. */
export function DS({ slug }: { slug: string }) {
  const { dn } = useT();
  const d = getDistrict(slug);
  return <>{d ? dn(d) : ""}</>;
}

/** A food name in the reader's language. `alt` shows the other language, for a subtitle. */
export function FN({ f, alt }: { f: { name: string; bn: string }; alt?: boolean }) {
  const { lang } = useT();
  return <>{(lang === "bn") !== !!alt ? f.bn : f.name}</>;
}

/** A food description in the reader's language, falling back to English when none is written. */
export function FB({ f }: { f: { id: string; blurb: string } }) {
  const { lang } = useT();
  return <>{lang === "bn" ? (foodBlurbBn[f.id] ?? f.blurb) : f.blurb}</>;
}
