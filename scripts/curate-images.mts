import { writeFileSync, readFileSync } from "node:fs";
import { places, districts } from "../src/lib/data.ts";

const FILE = new URL("../src/data/images.json", import.meta.url);
const img: Record<string, unknown> = JSON.parse(readFileSync(FILE, "utf8"));

// Matches reviewed by hand against their Commons filenames and found unrelated to the subject.
const bad = `dhaka--old-dhaka-food-walk narsingdi--shibpur-weavers-villages faridpur--padma-riverbank-at-charbhadrasan
madaripur--shakuni-lake coxs-bazar--inani-beach khagrachhari--richhang-waterfall khagrachhari--nunchari-hills
cumilla--kotila-mura cumilla--dharmasagar-dighi bogura--mahasthangarh bogura--bogura-doi-shops joypurhat--joypurhat-farmland-villages
khulna--sundarbans-boat-tours khulna--rupsha-river-banks bagerhat--karamjal-wildlife-centre satkhira--sundarbans-kaikhali
jashore--date-palm-sap-farms jhenaidah--date-palm-jaggery-villages narail--s-m-sultan-museum narail--narail-zamindar-bari
patuakhali--fatrar-char nilphamari--teesta-river-banks lalmonirhat--teesta-chars netrakona--garo-hills-border-villages
netrakona--dhanu-river-haors jamalpur--jamuna-riverfront
munshiganj--munshiganj-potatoes bandarban--hill-pajon rangamati--kaptai-lake-fish khagrachhari--bamboo-shoot-curry
sunamganj--haor-fish lakshmipur--meghna-hilsa chuadanga--chuadanga-rice-snacks thakurgaon--thakurgaon-khichuri
sylhet--shatkora-beef habiganj--habiganj-shatkora-curry rangpur--rangpur-shatkora-beef dinajpur--katarivog-rice-beef
sylhet--akhni-pulao sirajganj--jamuna-river-fish jashore--date-palm-sap-khejur-rosh cumilla--khadi-fabric-sweets
barguna--barguna-coconut-sweets coxs-bazar--grilled-seafood-platter patuakhali--kuakata-seafood`.split(/\s+/);
for (const id of bad) delete img[id];

// District heroes: the best-rated place in the district that still has a vetted photo.
for (const d of districts) {
  delete img[`district:${d.slug}`];
  const best = places.filter((p) => p.districtSlug === d.slug && img[p.id]).sort((a, b) => b.rating - a.rating)[0];
  if (best) img[`district:${d.slug}`] = img[best.id];
}
writeFileSync(FILE, JSON.stringify(img));
const miss = districts.filter((d) => !img[`district:${d.slug}`]).map((d) => d.name);
console.log("images:", Object.keys(img).length, "| districts without photo:", miss.length, miss.join(", "));
