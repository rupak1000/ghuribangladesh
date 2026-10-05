import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

/**
 * Looks in public/foods for photos named <food id>.jpg|jpeg|png|webp and writes them into
 * src/data/my-images.json, so they replace the downloaded photo for that food.
 * Optional credits: public/foods/credits.json, like { "<food id>": { "author": "Name", "license": "Own photo", "page": "" } }
 */
const dir = new URL("../public/foods/", import.meta.url);
const out = new URL("../src/data/my-images.json", import.meta.url);
const credits: Record<string, { author?: string; license?: string; page?: string }> = existsSync(new URL("credits.json", dir))
  ? JSON.parse(readFileSync(new URL("credits.json", dir), "utf8"))
  : {};

const result: Record<string, object> = {};
for (const file of readdirSync(dir)) {
  const m = file.match(/^(.+)\.(jpe?g|png|webp)$/i);
  if (!m) continue;
  result[m[1]] = { url: `/foods/${file}`, ...credits[m[1]] };
}
writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
console.log(`${Object.keys(result).length} own photo(s) linked.`);
