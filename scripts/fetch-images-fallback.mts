import { writeFileSync, readFileSync } from "node:fs";
import { places, districts, foods, getDistrict } from "../src/lib/data.ts";

const OUT = new URL("../src/data/images.json", import.meta.url);
const UA = "GhuriBangladesh/0.1 (travel prototype; contact: rupakhasanbd@gmail.com)";
const strip = (h: string) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
interface Img { url: string; author: string; license: string; page: string }
const out: Record<string, Img> = JSON.parse(readFileSync(OUT, "utf8"));
const STOP = new Set(["side", "villages", "farmland", "shops", "banks", "walk", "tours", "bangladesh", "food", "with", "and"]);

async function find(query: string, tokens: string[], minW = 700): Promise<Img | null> {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", format: "json", generator: "search", gsrsearch: `${query} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "10", prop: "imageinfo", iiprop: "url|extmetadata|mime|size", iiurlwidth: "960" }).forEach(([k, v]) => u.searchParams.set(k, v));
  for (let a = 0; a < 4; a++) {
    const r = await fetch(u, { headers: { "User-Agent": UA } });
    if (r.status === 429) { await new Promise((s) => setTimeout(s, 4000 * (a + 1))); continue; }
    if (!r.ok) return null;
    const pages = Object.values((await r.json()).query?.pages ?? {}) as any[];
    pages.sort((x, y) => x.index - y.index);
    for (const p of pages) {
      const ii = p.imageinfo?.[0];
      if (!ii || ii.mime !== "image/jpeg" || ii.width < minW || ii.width < ii.height * 1.05) continue;
      const title = String(p.title).toLowerCase().replace(/[_-]/g, " ");
      if (!tokens.some((t) => title.includes(t))) continue;
      const md = ii.extmetadata ?? {};
      const lic = md.LicenseShortName?.value ?? "";
      if (!/CC|Public domain|PD/i.test(lic)) continue;
      return { url: ii.thumburl, author: strip(md.Artist?.value ?? "Unknown").slice(0, 80), license: lic, page: ii.descriptionurl };
    }
    return null;
  }
  return null;
}

const tok = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w));

const dishes: [RegExp, string, string[]][] = [
  [/biryani|pulao/i, "Biryani Bangladesh", ["biryani", "pulao", "polao"]],
  [/chotpoti|fuchka/i, "Fuchka Bangladesh street food", ["fuchka", "chotpoti", "phuchka", "puchka"]],
  [/hilsa|ilish/i, "Hilsa fish Bangladesh", ["hilsa", "ilish"]],
  [/mango/i, "Mango Bangladesh", ["mango"]],
  [/pineapple/i, "Pineapple Bangladesh", ["pineapple"]],
  [/lychee/i, "Lychee Bangladesh", ["lychee", "litchi"]],
  [/guava/i, "Guava floating market Bangladesh", ["guava"]],
  [/jaggery|khejur|sap/i, "Date palm jaggery Bangladesh", ["jaggery", "khejur", "date palm", "gur"]],
  [/shutki|dried fish/i, "Dried fish Bangladesh", ["dried fish", "shutki", "dry fish"]],
  [/prawn|chingri/i, "Prawn curry Bangladesh", ["prawn", "shrimp", "chingri"]],
  [/seafood|crab/i, "Seafood Cox's Bazar", ["seafood", "crab", "fish", "lobster"]],
  [/fish|haor/i, "Bangladeshi fish curry", ["fish", "curry", "machh"]],
  [/tea/i, "Tea Bangladesh Sylhet", ["tea"]],
  [/beef|bhuna|shatkora/i, "Beef bhuna Bangladesh", ["beef", "bhuna", "bhuna", "curry"]],
  [/pitha|pitha/i, "Pitha Bangladesh", ["pitha", "pithe"]],
  [/doi|yogurt/i, "Doi yogurt Bangladesh", ["doi", "yogurt", "curd", "yoghurt"]],
  [/chomchom|mishti|sandesh|rasmalai|monda|golla|chhana|sweet/i, "Bangladeshi sweets mishti", ["sweet", "mishti", "chomchom", "rasmalai", "sandesh", "monda", "rosogolla"]],
  [/ghee/i, "Ghee Bangladesh", ["ghee"]],
  [/tilkuta|khaja|sesame/i, "Bangladeshi sweets", ["sweet", "sesame", "mishti"]],
  [/coconut/i, "Coconut sweets Bangladesh", ["coconut"]],
  [/bamboo/i, "Bamboo chicken Bangladesh", ["bamboo"]],
  [/pajon|khichuri|rice|panta|potato|chitoi/i, "Bangladeshi rice dishes traditional food", ["rice", "bhat", "khichuri", "panta", "pitha", "food"]],
  [/kala bhuna/i, "Kala bhuna Chittagong", ["bhuna", "chittagong"]],
];

const jobs: { id: string; queries: [string, string[]][] }[] = [];
for (const d of districts) {
  const id = `district:${d.slug}`;
  if (out[id]) continue;
  const alt: Record<string, string[]> = { khagrachhari: ["Khagrachari"], moulvibazar: ["Srimangal", "Moulvibazar", "Maulvibazar"] };
  jobs.push({ id, queries: [d.name, ...(alt[d.slug] ?? [])].map((q) => [`${q} Bangladesh`, [q.toLowerCase().slice(0, 7), ...(alt[d.slug] ?? []).map((a) => a.toLowerCase().slice(0, 7))]] as [string, string[]]) });
}
for (const p of places) {
  if (out[p.id]) continue;
  const d = getDistrict(p.districtSlug)!;
  const base = p.name.replace(/\(.*?\)/g, "").replace(/&/g, " ").trim();
  const tokens = tok(p.name);
  jobs.push({ id: p.id, queries: [[`${base} Bangladesh`, tokens], [`${base}`, tokens], [`${tokens[0] ?? base} ${d.name} Bangladesh`, tokens.slice(0, 1)]] });
}
for (const f of foods) {
  if (out[f.id]) continue;
  const hit = dishes.find(([re]) => re.test(f.name));
  jobs.push({ id: f.id, queries: [[`${f.name} Bangladesh`, tok(f.name)], ...(hit ? [[hit[1], hit[2]] as [string, string[]]] : [])] });
}

for (const [i, job] of jobs.entries()) {
  for (const [q, tokens] of job.queries) {
    const img = await find(q, tokens);
    await new Promise((s) => setTimeout(s, 300));
    if (img) { out[job.id] = img; break; }
  }
  if (i % 10 === 0) { writeFileSync(OUT, JSON.stringify(out)); console.log(i, jobs.length); }
}

// Last resort for places: a real photo of their own district, then of the same division.
const divImg = new Map<string, Img>();
for (const d of districts) if (out[`district:${d.slug}`] && !divImg.has(d.division)) divImg.set(d.division, out[`district:${d.slug}`]);
for (const d of districts) if (!out[`district:${d.slug}`] && divImg.get(d.division)) out[`district:${d.slug}`] = divImg.get(d.division)!;
for (const p of places) if (!out[p.id]) { const di = out[`district:${p.districtSlug}`]; if (di) out[p.id] = di; }
writeFileSync(OUT, JSON.stringify(out));
console.log("done");
