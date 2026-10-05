import { readFileSync, writeFileSync } from "node:fs";
import { geoMercator, geoPath } from "d3-geo";

const W = 640;
const H = 820;
const NAME_TO_SLUG = {
  Bogra: "bogura", Barisal: "barishal", Chittagong: "chattogram", Comilla: "cumilla",
  Jessore: "jashore", Maulvibazar: "moulvibazar", Nawabganj: "chapai-nawabganj",
  Brahamanbaria: "brahmanbaria", Jhalokati: "jhalakathi", "Cox's Bazar": "coxs-bazar",
};

const geo = JSON.parse(readFileSync(new URL("./bgd-districts.geojson", import.meta.url), "utf8"));
for (const f of geo.features) {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) for (const ring of poly) ring.reverse();
}
const projection = geoMercator().fitExtent([[12, 12], [W - 12, H - 12]], geo);
const path = geoPath(projection).digits(1);

const districts = {};
for (const f of geo.features) {
  const name = f.properties.shapeName;
  const slug = NAME_TO_SLUG[name] ?? name.toLowerCase().replace(/[^a-z]+/g, "-");
  const [cx, cy] = path.centroid(f);
  districts[slug] = { d: path(f), cx: +cx.toFixed(1), cy: +cy.toFixed(1) };
}

const out = {
  width: W,
  height: H,
  projection: { scale: projection.scale(), translate: projection.translate() },
  districts,
};
writeFileSync(new URL("../src/data/map-paths.json", import.meta.url), JSON.stringify(out));
console.log(Object.keys(districts).length, "districts;", JSON.stringify(out).length, "bytes");
console.log(Object.keys(districts).sort().join(" "));
