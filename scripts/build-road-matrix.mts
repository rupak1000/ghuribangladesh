import { writeFileSync } from "node:fs";
import { districts } from "../src/lib/data.ts";

// District headquarters (town) coordinates, [lat, lng]. Routing snaps each to the nearest road.
const HQ: { [slug: string]: [number, number] } = {
  dhaka: [23.8103, 90.4125], gazipur: [23.9999, 90.4203], narayanganj: [23.6238, 90.5], narsingdi: [23.9193, 90.7176], manikganj: [23.8617, 90.0003],
  munshiganj: [23.5422, 90.5305], tangail: [24.2513, 89.9167], kishoreganj: [24.4449, 90.7766], faridpur: [23.607, 89.8429], gopalganj: [23.005, 89.8266],
  madaripur: [23.1641, 90.1896], rajbari: [23.7574, 89.6446], shariatpur: [23.2423, 90.4348],
  chattogram: [22.3569, 91.7832], "coxs-bazar": [21.4272, 92.0058], bandarban: [22.1953, 92.2184], rangamati: [22.6372, 92.1971], khagrachhari: [23.1193, 91.9847],
  feni: [23.0159, 91.3976], noakhali: [22.8696, 91.0995], lakshmipur: [22.9428, 90.8412], chandpur: [23.2332, 90.6713], cumilla: [23.4607, 91.1809], brahmanbaria: [23.9571, 91.1115],
  sylhet: [24.8949, 91.8687], moulvibazar: [24.4829, 91.7774], habiganj: [24.3745, 91.4156], sunamganj: [25.0658, 91.4073],
  rajshahi: [24.3745, 88.6042], natore: [24.4206, 89.0003], "chapai-nawabganj": [24.5965, 88.2776], naogaon: [24.7936, 88.9318], pabna: [24.0064, 89.2372],
  bogura: [24.8465, 89.377], joypurhat: [25.0968, 89.0227], sirajganj: [24.4534, 89.7007],
  khulna: [22.8456, 89.5403], bagerhat: [22.6516, 89.7859], satkhira: [22.7185, 89.0705], jashore: [23.1665, 89.2081], jhenaidah: [23.5448, 89.1726],
  magura: [23.4873, 89.4199], narail: [23.1725, 89.5126], chuadanga: [23.6402, 88.8518], kushtia: [23.9013, 89.1205], meherpur: [23.7622, 88.6318],
  barishal: [22.701, 90.3535], bhola: [22.6859, 90.6482], barguna: [22.1591, 90.1126], jhalakathi: [22.6406, 90.1987], patuakhali: [22.3596, 90.3299], pirojpur: [22.5841, 89.972],
  rangpur: [25.7439, 89.2752], dinajpur: [25.6217, 88.6354], thakurgaon: [26.0337, 88.4616], panchagarh: [26.3411, 88.5542], nilphamari: [25.9318, 88.856],
  lalmonirhat: [25.9923, 89.2847], kurigram: [25.8054, 89.6361], gaibandha: [25.3297, 89.543],
  mymensingh: [24.7471, 90.4203], jamalpur: [24.9375, 89.9372], netrakona: [24.871, 90.7279], sherpur: [25.0204, 90.0152],
};
const slugs = districts.map((d) => d.slug);
const missing = slugs.filter((s) => !HQ[s]);
if (missing.length) throw new Error("missing HQ: " + missing.join(","));

const coords = slugs.map((s) => `${HQ[s][1]},${HQ[s][0]}`).join(";");
const res = await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?annotations=distance,duration`, { headers: { "User-Agent": "GhuriBangladesh/0.1 (build script)" } });
const j = await res.json();
if (j.code !== "Ok") throw new Error(JSON.stringify(j).slice(0, 300));
let nulls = 0;
const km = j.distances.map((row: (number | null)[]) => row.map((v) => (v == null ? (nulls++, null) : Math.round(v / 100) / 10)));
const min = j.durations.map((row: (number | null)[]) => row.map((v) => (v == null ? null : Math.round(v / 60))));
// How far each HQ point was snapped to a road (metres), to spot bad coordinates.
const snaps = j.sources.map((s: { distance: number }, i: number) => ({ slug: slugs[i], m: Math.round(s.distance) })).filter((x: { m: number }) => x.m > 1500);
writeFileSync(new URL("../src/data/road-matrix.json", import.meta.url), JSON.stringify({ slugs, km, min, hq: HQ }));
console.log("pairs", slugs.length ** 2, "unroutable", nulls, "far-snapped", JSON.stringify(snaps));
