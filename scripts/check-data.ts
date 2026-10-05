import { districts, places, foods, placesOf, foodsOf } from "../src/lib/data";
const ids = [...places.map((p) => p.id), ...foods.map((f) => f.id)];
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
console.log("places", places.length, "foods", foods.length, "dupes", dup);
console.log("min places/district", Math.min(...districts.map((d) => placesOf(d.slug).length)), districts.filter((d) => placesOf(d.slug).length < 3).map((d) => d.slug + ":" + placesOf(d.slug).length).join(" "));
console.log("min foods/district", Math.min(...districts.map((d) => foodsOf(d.slug).length)), districts.filter((d) => foodsOf(d.slug).length < 3).map((d) => d.slug + ":" + foodsOf(d.slug).length).join(" "));
