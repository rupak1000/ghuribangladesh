import { districts, experiences, foods, places, getDistrict } from "./data";
import { categories } from "./categories";

export type Hit =
  | { kind: "district"; id: string; title: string; sub: string; href: string; score: number }
  | { kind: "place"; id: string; title: string; sub: string; href: string; score: number }
  | { kind: "food"; id: string; title: string; sub: string; href: string; score: number }
  | { kind: "experience"; id: string; title: string; sub: string; href: string; score: number };

const catWords = (cats: string[]) =>
  cats.flatMap((c) => {
    const m = categories.find((x) => x.key === c);
    return m ? [m.label.toLowerCase(), m.key] : [c];
  });

function score(q: string, title: string, extra: string[]): number {
  const t = title.toLowerCase();
  if (t === q) return 10;
  if (t.startsWith(q)) return 6;
  if (t.split(/[\s-]+/).some((w) => w.startsWith(q))) return 5;
  if (t.includes(q)) return 4;
  if (extra.some((e) => e.toLowerCase().startsWith(q))) return 3;
  if (extra.some((e) => e.toLowerCase().includes(q))) return 1.5;
  return 0;
}

export function search(raw: string, limit = 24): Hit[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const hits: Hit[] = [];
  for (const d of districts) {
    const cats = catWords(places.filter((p) => p.districtSlug === d.slug).flatMap((p) => p.categories));
    const s = score(q, d.name, [d.bn, d.division, d.tagline, ...cats]);
    if (s) hits.push({ kind: "district", id: d.slug, title: d.name, sub: `${d.division} Division`, href: `/district/${d.slug}`, score: s + 0.5 });
  }
  for (const p of places) {
    const s = score(q, p.name, [...catWords(p.categories), p.blurb, getDistrict(p.districtSlug)?.name ?? ""]);
    if (s) hits.push({ kind: "place", id: p.id, title: p.name, sub: getDistrict(p.districtSlug)?.name ?? "", href: `/place/${p.id}`, score: s + p.rating / 10 });
  }
  for (const f of foods) {
    const s = score(q, f.name, [f.bn, f.blurb, "food", getDistrict(f.districtSlug)?.name ?? ""]);
    if (s) hits.push({ kind: "food", id: f.id, title: f.name, sub: getDistrict(f.districtSlug)?.name ?? "", href: `/food?district=${f.districtSlug}`, score: s });
  }
  for (const e of experiences) {
    const s = score(q, e.title, [e.blurb, ...catWords([e.category])]);
    if (s) hits.push({ kind: "experience", id: e.id, title: e.title, sub: getDistrict(e.districtSlug)?.name ?? "", href: `/district/${e.districtSlug}?tab=experiences`, score: s - 0.2 });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
