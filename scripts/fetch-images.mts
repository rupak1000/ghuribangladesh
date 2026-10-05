import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { places, districts, foods } from "../src/lib/data.ts";

const OUT = new URL("../src/data/images.json", import.meta.url);
const UA = "GhuriBangladesh/0.1 (travel prototype; contact: rupakhasanbd@gmail.com)";
const strip = (h: string) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

interface Img { url: string; author: string; license: string; page: string }
const rejected = new Set<string>(JSON.parse(readFileSync(new URL("./rejected-images.json", import.meta.url), "utf8")));
const out: Record<string, Img> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

async function find(query: string, name: string, minW = 1200): Promise<Img | null> {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({
    action: "query", format: "json", generator: "search", gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6", gsrlimit: "6", prop: "imageinfo", iiprop: "url|extmetadata|mime|size", iiurlwidth: "960",
  }).forEach(([k, v]) => u.searchParams.set(k, v));
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(u, { headers: { "User-Agent": UA } });
    if (r.status === 429) { await new Promise((s) => setTimeout(s, 4000 * (attempt + 1))); continue; }
    if (!r.ok) return null;
    const j = await r.json();
    const pages = Object.values(j.query?.pages ?? {}) as any[];
    pages.sort((a, b) => a.index - b.index);
    for (const p of pages) {
      const ii = p.imageinfo?.[0];
      if (!ii || ii.mime !== "image/jpeg" || ii.width < ii.height * 1.1 || ii.width < minW) continue;
      const title = String(p.title ?? "").toLowerCase().replace(/[_-]/g, " ");
      const tokens = name.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length >= 4 && !["beach", "fort", "park", "river", "national"].includes(w));
      if (!tokens.some((w) => title.includes(w))) continue;
      const md = ii.extmetadata ?? {};
      const lic = md.LicenseShortName?.value ?? "";
      if (!/CC|Public domain|PD/i.test(lic)) continue;
      return {
        url: ii.thumburl, author: strip(md.Artist?.value ?? "Unknown").slice(0, 80),
        license: lic, page: ii.descriptionurl,
      };
    }
    return null;
  }
  return null;
}

const jobs = [
  ...places.map((p) => ({ id: p.id, q: `${p.name} ${districts.find((d) => d.slug === p.districtSlug)!.name} Bangladesh`, name: p.name })),
  ...districts.map((d) => ({ id: `district:${d.slug}`, q: `${d.name} Bangladesh`, name: d.name })),
  ...foods.map((f) => ({ id: f.id, q: `${f.name} Bangladesh food`, name: f.name, minW: 800 })),
];
for (const [i, job] of jobs.entries()) {
  if (out[job.id] || rejected.has(job.id) || job.id.startsWith("district:")) continue;
  const img = await find(job.q, job.name, (job as { minW?: number }).minW);
  if (img) out[job.id] = img;
  if (i % 10 === 0) { writeFileSync(OUT, JSON.stringify(out)); console.log(i, jobs.length, Object.keys(out).length); }
  await new Promise((s) => setTimeout(s, 350));
}
writeFileSync(OUT, JSON.stringify(out));
console.log("done", Object.keys(out).length, "of", jobs.length);
