import { writeFileSync, readFileSync } from "node:fs";
import { foods } from "../src/lib/data.ts";

const OUT = new URL("../src/data/images.json", import.meta.url);
const UA = "GhuriBangladesh/0.1 (travel prototype; contact: rupakhasanbd@gmail.com)";
const strip = (h: string) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
interface Img { url: string; author: string; license: string; page: string }
interface Cand extends Img { title: string; px: number }

const types: Record<string, { queries: string[]; tokens: string[] }> = {
  biryani: { queries: ["Kacchi Biryani", "Biryani Bangladesh", "Tehari Bangladesh", "Bangladeshi biryani"], tokens: ["biryani", "tehari", "polao", "pulao"] },
  hilsa: { queries: ["Hilsa fish", "Ilish fish curry", "Ilish bhapa", "Hilsa Bangladesh cooked", "Hilsa fry"], tokens: ["hilsa", "ilish", "hilsha"] },
  prawn: { queries: ["Prawn curry Bangladesh", "Chingri malai curry", "Golda chingri", "Bangladesh shrimp dish"], tokens: ["prawn", "chingri", "shrimp", "golda"] },
  seafood: { queries: ["Seafood Cox's Bazar", "Crab curry Bangladesh", "Lobster Bangladesh", "Fried fish Cox's Bazar", "Pomfret fry"], tokens: ["seafood", "crab", "lobster", "fish", "pomfret", "prawn"] },
  shutki: { queries: ["Shutki dried fish", "Dried fish Bangladesh", "Shutki bhuna"], tokens: ["shutki", "dried fish", "dry fish", "shutkir"] },
  beef: { queries: ["Beef bhuna", "Beef curry Bangladesh", "Beef rezala", "Kala bhuna", "Mezbani beef", "Mutton curry Bangladesh"], tokens: ["beef", "bhuna", "rezala", "mezbani", "mutton", "curry"] },
  khichuri: { queries: ["Khichuri Bangladesh", "Khichuri beef", "Bhuna khichuri", "Khichdi Bengali"], tokens: ["khichuri", "khichdi", "khichri"] },
  pitha: { queries: ["Pitha Bangladesh", "Bhapa pitha", "Chitoi pitha", "Patishapta", "Nakshi pitha", "Puli pitha", "Bengali pitha winter"], tokens: ["pitha", "pithe", "patishapta", "pati shapta"] },
  doi: { queries: ["Mishti doi", "Doi Bangladesh", "Bogra doi", "Sweet yoghurt Bangladesh"], tokens: ["doi", "yogurt", "yoghurt", "curd"] },
  sweets: { queries: ["Rasmalai Bangladesh", "Roshogolla", "Chomchom", "Sandesh Bangladesh", "Bangladeshi sweets", "Jilapi", "Kalojam", "Bengali sweets shop"], tokens: ["rasmalai", "roshogolla", "rosogolla", "chomchom", "chamcham", "sandesh", "sweet", "jilapi", "jalebi", "mishti", "kalojam", "monda"] },
  kheer: { queries: ["Payesh", "Kheer Bangladesh", "Rice pudding Bengali"], tokens: ["payesh", "kheer", "pudding"] },
  mango: { queries: ["Mango Bangladesh", "Himsagar mango", "Langra mango", "Fazli mango", "Mango Rajshahi"], tokens: ["mango", "himsagar", "langra", "fazli", "aam"] },
  lychee: { queries: ["Lychee Bangladesh", "Litchi Dinajpur"], tokens: ["lychee", "litchi"] },
  pineapple: { queries: ["Pineapple Bangladesh", "Pineapple Srimangal"], tokens: ["pineapple"] },
  jackfruit: { queries: ["Jackfruit Bangladesh", "Kathal"], tokens: ["jackfruit", "kathal"] },
  guava: { queries: ["Guava floating market Bangladesh", "Guava Bangladesh", "Hog plum Bangladesh"], tokens: ["guava", "amra", "plum"] },
  tea: { queries: ["Seven layer tea", "Tea Srimangal", "Tea cup Bangladesh", "Tea garden Sylhet tea"], tokens: ["tea", "chai"] },
  jaggery: { queries: ["Date palm jaggery", "Khejur gur", "Date palm sap Bangladesh", "Patali gur"], tokens: ["jaggery", "khejur", "date palm", "gur", "sap"] },
  bamboo: { queries: ["Bamboo chicken", "Bamboo shoot Bangladesh", "Tribal food Bangladesh", "Chittagong Hill Tracts food"], tokens: ["bamboo", "tribal", "hill"] },
  snack: { queries: ["Fuchka Bangladesh", "Chotpoti", "Jhalmuri", "Samosa Bangladesh", "Singara", "Street food Dhaka"], tokens: ["fuchka", "chotpoti", "jhalmuri", "muri", "samosa", "singara", "street food", "chop"] },
  bread: { queries: ["Paratha Bangladesh", "Bakarkhani", "Luchi", "Dal puri", "Mughlai paratha"], tokens: ["paratha", "bakarkhani", "luchi", "puri", "roti", "naan"] },
  haleem: { queries: ["Haleem Bangladesh", "Borhani", "Shahi tukra"], tokens: ["haleem", "borhani", "tukra"] },
  poultry: { queries: ["Chicken roast Bangladesh", "Duck curry Bangladesh", "Chicken curry Bangladesh"], tokens: ["chicken", "duck", "roast", "curry"] },
  bhorta: { queries: ["Bhorta", "Aloo bhorta", "Begun bhorta", "Bengali mashed vegetables"], tokens: ["bhorta", "bharta", "vorta"] },
  fish: { queries: ["Bangladeshi fish curry", "Fish curry rice Bangladesh", "Rui fish", "Koi fish curry", "Pabda fish", "Fish fry Bangladesh", "Bengali fish thali"], tokens: ["fish", "curry", "maach", "machh", "rui", "koi", "pabda"] },
  ghee: { queries: ["Ghee Bangladesh", "Clarified butter ghee"], tokens: ["ghee"] },
  general: { queries: ["Bengali food", "Bangladeshi cuisine", "Bangladeshi food plate", "Bangladeshi rice and curry"], tokens: ["food", "cuisine", "rice", "curry", "bengali", "bangladeshi"] },
};

const rules: [RegExp, string][] = [
  [/hilsa|ilish/i, "hilsa"], [/biryani|tehari|pulao|polao/i, "biryani"], [/prawn|chingri|golda/i, "prawn"],
  [/crab|lobster|seafood|rupchanda|loitta|pomfret/i, "seafood"], [/shutki|dried fish/i, "shutki"],
  [/kala bhuna|beef|bhuna|mezbani|rezala|mutton/i, "beef"], [/khichuri/i, "khichuri"], [/haleem|borhani|shahi tukra/i, "haleem"],
  [/pitha|patishapta|bhapa|chitoi/i, "pitha"], [/\bdoi\b|yogh?urt|lassi/i, "doi"], [/payesh|kheer/i, "kheer"],
  [/mishti|roshogolla|rasmalai|roshomalai|chomchom|sandesh|jilapi|kalo jam|monda|golla|chhana|sweet|naru|tilkuta|mango pulp|aam shotto/i, "sweets"],
  [/mango/i, "mango"], [/lychee/i, "lychee"], [/pineapple/i, "pineapple"], [/jackfruit|kathal/i, "jackfruit"], [/guava|amra|hog plum/i, "guava"],
  [/tea/i, "tea"], [/jaggery|khejur|sap|gur\b/i, "jaggery"], [/bamboo|hill|pajon/i, "bamboo"],
  [/fuchka|chotpoti|jhalmuri|muri|chop\b/i, "snack"], [/paratha|bakarkhani|dal puri|luchi/i, "bread"], [/chicken|duck/i, "poultry"],
  [/bhorta/i, "bhorta"], [/ghee/i, "ghee"], [/fish|maach|boal|koi|pabda|tengra|rui|kalia|haor|jhol|curry/i, "fish"],
];
const typeOf = (name: string) => rules.find(([re]) => re.test(name))?.[1] ?? "general";
const NOISE = /kolkata|calcutta|mohali|howrah|kerala|midnapore|digha|west bengal|nepal|hyderabad|berhampore|india|delhi|mumbai|chennai|bhubaneswar|odisha|assam|tripura|sticker|wikimania|delegation|peddler|borgata|programme|advisor|lovebirds|cages|restaurant in st|map|logo|flag|stamp|poster|diagram|chart|banner|portrait|minister|meeting|speech|inaugur|ceremony|workshop|signboard|building|office|station|stadium|hospital/i;

async function search(q: string): Promise<Cand[]> {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", format: "json", generator: "search", gsrsearch: `${q} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "30", prop: "imageinfo", iiprop: "url|extmetadata|mime|size", iiurlwidth: "1100" }).forEach(([k, v]) => u.searchParams.set(k, v));
  for (let a = 0; a < 4; a++) {
    const r = await fetch(u, { headers: { "User-Agent": UA } });
    if (r.status === 429) { await new Promise((s) => setTimeout(s, 4000 * (a + 1))); continue; }
    if (!r.ok) return [];
    const pages = Object.values((await r.json()).query?.pages ?? {}) as any[];
    const out: Cand[] = [];
    for (const p of pages) {
      const ii = p.imageinfo?.[0];
      if (!ii || ii.mime !== "image/jpeg" || ii.width < 800 || ii.width < ii.height * 0.9) continue;
      const lic = ii.extmetadata?.LicenseShortName?.value ?? "";
      if (!/CC|Public domain|PD/i.test(lic)) continue;
      const title = String(p.title).toLowerCase().replace(/^file:/, "").replace(/[_-]/g, " ");
      if (NOISE.test(title)) continue;
      out.push({ url: ii.thumburl, author: strip(ii.extmetadata?.Artist?.value ?? "Unknown").slice(0, 80), license: lic, page: ii.descriptionurl, title, px: ii.width * ii.height });
    }
    return out;
  }
  return [];
}

const pools: Record<string, Cand[]> = {};
for (const [type, def] of Object.entries(types)) {
  const seen = new Map<string, Cand>();
  for (const q of def.queries) {
    for (const c of await search(q)) {
      if (!def.tokens.some((t) => c.title.includes(t))) continue;
      if (type !== "shutki" && /dried|shutki|shutkir/.test(c.title)) continue;
      seen.set(c.url, c);
    }
    await new Promise((s) => setTimeout(s, 350));
  }
  pools[type] = [...seen.values()].sort((a, b) => b.px - a.px).slice(0, 30);
  console.log(type, pools[type].length);
}

const img: Record<string, Img> = JSON.parse(readFileSync(OUT, "utf8"));
for (const f of foods) delete img[f.id];
const used = new Map<string, number>();
const words = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length >= 4 && !["bangladesh", "style", "curry", "fish"].includes(w));
let missing = 0;
for (const f of foods) {
  let t = typeOf(f.name);
  if (!pools[t]?.length) t = pools.fish.length ? "fish" : "general";
  const pool = pools[t].length ? pools[t] : pools.general;
  if (!pool.length) { missing++; continue; }
  const w = words(f.name);
  const pick = [...pool].sort((a, b) => {
    const ma = w.some((x) => a.title.includes(x)) ? 1 : 0;
    const mb = w.some((x) => b.title.includes(x)) ? 1 : 0;
    return mb - ma || (used.get(a.url) ?? 0) - (used.get(b.url) ?? 0) || b.px - a.px;
  })[0];
  used.set(pick.url, (used.get(pick.url) ?? 0) + 1);
  img[f.id] = { url: pick.url, author: pick.author, license: pick.license, page: pick.page };
}
writeFileSync(OUT, JSON.stringify(img));
const distinct = new Set(foods.map((f) => img[f.id]?.url).filter(Boolean)).size;
console.log("foods", foods.length, "missing", missing, "distinct photos", distinct, "max reuse", Math.max(...used.values()));
console.log("done");
