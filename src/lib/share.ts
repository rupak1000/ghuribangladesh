import { districts, foods, places } from "./data";
import { MAP_H, MAP_W, districtShapes } from "./geo";
import { getMapTheme } from "./mapThemes";

export interface ShareData {
  name: string;
  theme?: string;
  home?: string;
  bio?: string;
  visitedPlaces?: string[];
  favPlaces?: string[];
  triedFoods?: string[];
  visited: string[];
  want: string[];
  fav: string[];
  places: number;
  foods: number;
  favorites: number;
}

const maskOf = (order: string[], ids: string[]) => {
  const set = new Set(ids);
  let n = 0n;
  order.forEach((id, i) => set.has(id) && (n |= 1n << BigInt(i)));
  return n.toString(36);
};
const unmaskOf = (order: string[], s: string | undefined) => {
  if (!s) return [];
  let n = 0n;
  for (const ch of s) {
    const v = parseInt(ch, 36);
    if (Number.isNaN(v)) return [];
    n = n * 36n + BigInt(v);
  }
  return order.filter((_, i) => (n >> BigInt(i)) & 1n);
};
const dOrder = districts.map((d) => d.slug);
const pOrder = places.map((p) => p.id);
const fOrder = foods.map((f) => f.id);

export function encodeShare(d: ShareData): string {
  const q = new URLSearchParams({
    n: d.name, v: maskOf(dOrder, d.visited), w: maskOf(dOrder, d.want), f: maskOf(dOrder, d.fav),
    p: String(d.places), fo: String(d.foods), fv: String(d.favorites),
    vp: maskOf(pOrder, d.visitedPlaces ?? []), fp: maskOf(pOrder, d.favPlaces ?? []), tf: maskOf(fOrder, d.triedFoods ?? []),
  });
  if (d.bio) q.set("b", d.bio.slice(0, 80));
  if (d.theme) q.set("t", d.theme);
  if (d.home) q.set("h", d.home);
  return q.toString();
}

export function decodeShare(q: Record<string, string | string[] | undefined>): ShareData {
  const g = (k: string) => (Array.isArray(q[k]) ? q[k]![0] : (q[k] as string | undefined));
  const num = (k: string) => Math.max(0, Math.min(9999, Number(g(k)) || 0));
  return {
    name: (g("n") ?? "A traveler").slice(0, 40),
    bio: (g("b") ?? "").slice(0, 80),
    theme: getMapTheme(g("t")).key,
    home: dOrder.includes(g("h") ?? "") ? g("h") : undefined,
    visited: unmaskOf(dOrder, g("v")), want: unmaskOf(dOrder, g("w")), fav: unmaskOf(dOrder, g("f")),
    visitedPlaces: unmaskOf(pOrder, g("vp")), favPlaces: unmaskOf(pOrder, g("fp")), triedFoods: unmaskOf(fOrder, g("tf")),
    places: num("p"), foods: num("fo"), favorites: num("fv"),
  };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function homeMarker(x: number, y: number, r: number, color: string): string {
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(r / 10).toFixed(3)})"><circle r="10" fill="#ffffff" stroke="${color}" stroke-width="2"/><path d="M0 -6 L6.5 -0.5 H4.4 V5 H-4.4 V-0.5 H-6.5 Z" fill="${color}"/></g>`;
}

const FONT = "'Noto Sans Bengali','Nirmala UI','Kohinoor Bangla',Helvetica,Arial,sans-serif";
const CARD = { from: "#f8f4e8", to: "#e6edd6", ink: "#1d2b22", sub: "#5b6b60", accent: "#b8741a" };

export function buildShareSvg(d: ShareData, bn = false): string {
  const W = 1080;
  const H = 1350;
  const scale = 780 / MAP_H;
  const th = getMapTheme(d.theme);
  const v = new Set(d.visited);
  const w = new Set(d.want);
  const f = new Set(d.fav);
  const paths = districts
    .map((x) => {
      const fill = f.has(x.slug) ? th.favorite : v.has(x.slug) ? th.visited : w.has(x.slug) ? th.want : th.base;
      return `<path d="${districtShapes[x.slug].d}" fill="${fill}" stroke="#ffffff" stroke-width="${(1.2 / scale).toFixed(2)}" stroke-linejoin="round"/>`;
    })
    .join("");

  const fontSize = 12;
  const placed: [number, number, number, number][] = [];
  const home = d.home ? districts.find((x) => x.slug === d.home) : undefined;
  const homePos = home && { x: 60 + districtShapes[home.slug].cx * scale, y: 380 + districtShapes[home.slug].cy * scale - 22 };
  if (homePos) placed.push([homePos.x - 14, homePos.y - 14, homePos.x + 14, homePos.y + 14]);
  const marked = (slug: string) => (f.has(slug) ? 0 : v.has(slug) ? 1 : w.has(slug) ? 2 : 3);
  const labels = [...districts]
    .sort((a, b) => marked(a.slug) - marked(b.slug))
    .flatMap((x) => {
      const { cx, cy } = districtShapes[x.slug];
      const px = 60 + cx * scale;
      const py = 380 + cy * scale;
      const hw = (bn ? x.bn : x.name).length * fontSize * 0.28;
      const box: [number, number, number, number] = [px - hw, py - fontSize * 0.45, px + hw, py + fontSize * 0.45];
      if (placed.some(([a, b, c, e]) => box[0] < c && box[2] > a && box[1] < e && box[3] > b)) return [];
      placed.push(box);
      return [`<text x="${px.toFixed(1)}" y="${py.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="700" fill="${CARD.ink}" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke">${esc(bn ? x.bn : x.name)}</text>`];
    })
    .join("");
  const homeSvg = homePos && home ? `${homeMarker(homePos.x, homePos.y, 14, CARD.ink)}<g>${homeMarker(92, 1160, 14, CARD.ink)}<text x="116" y="1166" font-family="${FONT}" font-size="22" fill="${CARD.sub}">${bn ? "নিজ জেলা" : "Home"} · ${esc(bn ? home.bn : home.name)}</text></g>` : "";
  const pct = Math.round((d.visited.length / 64) * 100);
  const stat = (y: number, big: string, small: string) =>
    `<text x="740" y="${y}" font-family="Georgia, serif" font-size="76" font-weight="700" fill="${CARD.ink}">${big}</text><text x="742" y="${y + 38}" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${CARD.sub}" letter-spacing="2">${small}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${CARD.from}"/><stop offset="1" stop-color="${CARD.to}"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<circle cx="900" cy="150" r="260" fill="${th.visited}" opacity="0.12"/>
<text x="80" y="130" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="${CARD.accent}" letter-spacing="7">MY BANGLADESH</text>
<text x="80" y="235" font-family="Georgia, serif" font-size="${d.name.length > 18 ? 66 : 88}" font-weight="700" fill="${CARD.ink}">${esc(d.name)}</text>
<text x="80" y="290" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${CARD.sub}">Explored Bangladesh</text>
<g transform="translate(60 380) scale(${scale.toFixed(4)})">${paths}</g>
${labels}
${homeSvg}
${stat(470, `${d.visited.length} / 64`, "DISTRICTS")}
${stat(640, String(d.places), "PLACES")}
${stat(810, String(d.foods), "FOODS")}
${stat(980, String(d.favorites), "FAVORITES")}
<rect x="80" y="1210" width="920" height="14" rx="7" fill="${CARD.ink}" opacity="0.12"/>
<rect x="80" y="1210" width="${(920 * pct) / 100}" height="14" rx="7" fill="${th.visited}"/>
<text x="80" y="1290" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="${CARD.ink}">#GhuriBangladesh</text>
<text x="1000" y="1290" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${CARD.sub}">${pct}% explored</text>
</svg>`;
}

export function svgToPngBlob(svg: string, w = 1080, h = 1350): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png");
    };
    img.onerror = () => reject(new Error("Could not render the card"));
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
