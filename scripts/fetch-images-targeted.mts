import { writeFileSync, readFileSync } from "node:fs";

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


const targets: [string, string, string[]][] = [
  ["coxs-bazar--inani-beach", "Inani Beach sunset", ["inani"]],
  ["bogura--mahasthangarh", "Mahasthangarh ruins Bogra", ["mahasthan"]],
  ["cumilla--kotila-mura", "Kotila Mura Mainamati stupa", ["kotila"]],
  ["cumilla--dharmasagar-dighi", "Dharmasagar pond Comilla", ["dharma"]],
  ["khulna--sundarbans-boat-tours", "Sundarbans mangrove Bangladesh boat", ["sundarban"]],
  ["bagerhat--karamjal-wildlife-centre", "Karamjal Sundarbans", ["karamjal"]],
  ["satkhira--sundarbans-kaikhali", "Kaikhali Sundarbans Shyamnagar", ["kaikhali", "sundarban"]],
  ["narail--s-m-sultan-museum", "SM Sultan Narail painting", ["sultan"]],
  ["narail--narail-zamindar-bari", "Narail Zamindar house Lohagara", ["zamindar", "narail"]],
  ["madaripur--shakuni-lake", "Shakuni Lake Madaripur", ["shakuni"]],
  ["khagrachhari--richhang-waterfall", "Richhang waterfall Khagrachari", ["richhang", "waterfall"]],
  ["khagrachhari--nunchari-hills", "Khagrachari hills view", ["khagrachari", "khagrachhari"]],
  ["dhaka--old-dhaka-food-walk", "Chawkbazar Old Dhaka street food", ["chawk", "old dhaka", "puran"]],
  ["patuakhali--fatrar-char", "Fatrar Char Kuakata mangrove", ["fatra", "kuakata"]],
  ["jashore--date-palm-sap-farms", "Date palm sap collection Jessore", ["date", "sap", "khejur"]],
  ["jhenaidah--date-palm-jaggery-villages", "Khejur gur making Bangladesh", ["jaggery", "khejur", "date"]],
  ["munshiganj--munshiganj-potatoes", "Potato Munshiganj Bangladesh", ["potato"]],
  ["sylhet--shatkora-beef", "Shatkora Sylhet", ["shatkora", "satkora", "hatkora"]],
  ["sylhet--akhni-pulao", "Akhni Bangladesh", ["akhni"]],
  ["coxs-bazar--grilled-seafood-platter", "Grilled fish Cox's Bazar seafood", ["seafood", "grill"]],
  ["dinajpur--katarivog-rice-beef", "Katarivog rice Dinajpur", ["katari"]],
  ["sunamganj--haor-fish", "Haor fish Sunamganj", ["haor", "fish"]],
  ["rangamati--kaptai-lake-fish", "Kaptai Lake fishermen fish", ["fish"]],
  ["lakshmipur--meghna-hilsa", "Hilsa Meghna fisherman", ["hilsa", "ilish"]],
  ["sirajganj--jamuna-river-fish", "Jamuna river fishermen catch", ["fish"]],
  ["bandarban--hill-pajon", "Bandarban tribal food", ["tribal", "bandarban"]],
  ["netrakona--dhanu-river-haors", "Netrakona haor", ["haor", "netrokona", "netrakona"]],
  ["jamalpur--jamuna-riverfront", "Jamalpur Jamuna river char", ["jamalpur", "jamuna"]],
  ["nilphamari--teesta-river-banks", "Teesta river Nilphamari Dimla", ["teesta", "nilphamari", "dimla"]],
  ["lalmonirhat--teesta-chars", "Lalmonirhat Teesta river", ["lalmonirhat", "teesta"]],
  ["joypurhat--joypurhat-farmland-villages", "Joypurhat Bangladesh village", ["joypurhat", "jaipurhat"]],
];
const out2 = out;
for (const [id, q, tokens] of targets) {
  const hit = await find(q, tokens);
  console.log(hit ? "OK  " : "--  ", id, hit?.page.split("File:").pop().slice(0, 60) ?? "");
  if (hit) out2[id] = hit;
  await new Promise((r) => setTimeout(r, 400));
}
writeFileSync(OUT, JSON.stringify(out2));
