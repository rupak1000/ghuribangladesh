import { writeFileSync, readFileSync } from "node:fs";
import { places, districts } from "../src/lib/data.ts";
const FILE = new URL("../src/data/images.json", import.meta.url);
const img: Record<string, unknown> = JSON.parse(readFileSync(FILE, "utf8"));
const reject = ["khulna--sundarbans-boat-tours", "khagrachhari--nunchari-hills", "rangamati--kaptai-lake-fish", "jamalpur--jamuna-riverfront", "bandarban--hill-pajon", "sunamganj--haor-fish", "nilphamari--teesta-river-banks"];
for (const id of reject) delete img[id];
for (const d of districts) {
  delete img[`district:${d.slug}`];
  const best = places.filter((p) => p.districtSlug === d.slug && img[p.id]).sort((a, b) => b.rating - a.rating)[0];
  if (best) img[`district:${d.slug}`] = img[best.id];
}
writeFileSync(FILE, JSON.stringify(img));
console.log("images", Object.keys(img).length, "| districts w/o photo:", districts.filter((d) => !img[`district:${d.slug}`]).map((d) => d.name).join(", "));
