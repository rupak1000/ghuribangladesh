import { districts } from "./data";
import { MAP_H, MAP_W, districtShapes } from "./geo";
import { getMapTheme } from "./mapThemes";
import { homeMarker, type ShareData } from "./share";
import type { Division } from "./types";

export type WallStyle = "natural" | "vintage" | "dark" | "line";
export type WallFrame = "none" | "line" | "double" | "mat";
export type WallSizeKey = "a4" | "a3" | "a2" | "a1" | "50x70" | "24x36";

export interface WallSize {
  key: WallSizeKey;
  label: string;
  w: number;
  h: number;
  dpi: number;
}

/** Paper sizes in millimetres, with a sensible PNG resolution that stays within browser canvas limits. */
export const wallSizes: WallSize[] = [
  { key: "a4", label: "A4 · 210 × 297 mm", w: 210, h: 297, dpi: 300 },
  { key: "a3", label: "A3 · 297 × 420 mm", w: 297, h: 420, dpi: 200 },
  { key: "a2", label: "A2 · 420 × 594 mm", w: 420, h: 594, dpi: 150 },
  { key: "a1", label: "A1 · 594 × 841 mm", w: 594, h: 841, dpi: 100 },
  { key: "50x70", label: "50 × 70 cm", w: 500, h: 700, dpi: 110 },
  { key: "24x36", label: "24 × 36 in", w: 610, h: 914, dpi: 90 },
];

export const wallStyles: { key: WallStyle; label: string; blurb: string; swatch: string[] }[] = [
  { key: "natural", label: "Natural", blurb: "Light, like a real atlas map", swatch: ["#dfe8c9", "#c4dcb0", "#bcdcec"] },
  { key: "vintage", label: "Vintage", blurb: "Parchment and sepia ink", swatch: ["#f3e9d2", "#dfcea0", "#8a6d3b"] },
  { key: "dark", label: "Midnight", blurb: "Deep green and glowing districts", swatch: ["#0a2a20", "#1f4d3f", "#2fc08a"] },
  { key: "line", label: "Line art", blurb: "Clean outlines, great for colouring", swatch: ["#ffffff", "#2b3a34", "#e9a23b"] },
];

export const wallFrames: { key: WallFrame; label: string }[] = [
  { key: "none", label: "No border" },
  { key: "line", label: "Thin line" },
  { key: "double", label: "Double line" },
  { key: "mat", label: "Frame mat (wide white border)" },
];

export interface WallOptions {
  style: WallStyle;
  size: WallSizeKey;
  title: string;
  subtitle: string;
  byline: string;
  showByline: boolean;
  labels: boolean;
  bengali: boolean;
  highlight: boolean;
  compass: boolean;
  scaleBar: boolean;
  frame: WallFrame;
  data?: ShareData;
}

interface Palette {
  paper: string;
  ink: string;
  sub: string;
  stroke: string;
  label: string;
  halo: string;
  sea: string;
  seaText: string;
  border: string;
  fill: (division: Division) => string;
  fillNone?: boolean;
}

const natural: { [d in Division]: string } = {
  Dhaka: "#dfe8c9", Chattogram: "#cde0b4", Sylhet: "#c2dbb0", Rajshahi: "#e8e9c8",
  Khulna: "#c9e0c2", Barishal: "#d4e6c8", Rangpur: "#e3e9c9", Mymensingh: "#d8e6bf",
};
const vintage: { [d in Division]: string } = {
  Dhaka: "#e8d9b0", Chattogram: "#dccb9a", Sylhet: "#d6c690", Rajshahi: "#ecdfbd",
  Khulna: "#dfd0a2", Barishal: "#e3d5ac", Rangpur: "#eadcb8", Mymensingh: "#e1d2a8",
};
const dark: { [d in Division]: string } = {
  Dhaka: "#1f4d3f", Chattogram: "#235642", Sylhet: "#1b4a45", Rajshahi: "#26503a",
  Khulna: "#1d5140", Barishal: "#1f4f4a", Rangpur: "#22503a", Mymensingh: "#1e4c43",
};

const palettes: { [s in WallStyle]: Palette } = {
  natural: { paper: "#fbf8ee", ink: "#1d2b22", sub: "#5b6b60", stroke: "#ffffff", label: "#26352c", halo: "#f4f6e6", sea: "#a9d3e8", seaText: "#3d7ea0", border: "#8aa583", fill: (d) => natural[d] },
  vintage: { paper: "#f3e9d2", ink: "#4a3520", sub: "#7a6040", stroke: "#8a6d3b", label: "#4a3520", halo: "#f3e9d2", sea: "#b9c9c4", seaText: "#6b7f7a", border: "#8a6d3b", fill: (d) => vintage[d] },
  dark: { paper: "#08241b", ink: "#eaf6ef", sub: "#9fc4b2", stroke: "#08241b", label: "#d8eee3", halo: "#0b2f23", sea: "#12415a", seaText: "#5f9fbd", border: "#2fc08a", fill: (d) => dark[d] },
  line: { paper: "#ffffff", ink: "#1f2d27", sub: "#5b6b60", stroke: "#2b3a34", label: "#1f2d27", halo: "#ffffff", sea: "#ffffff", seaText: "#9aa8a0", border: "#2b3a34", fill: () => "#ffffff", fillNone: true },
};

const KM_PER_UNIT = 0.824;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f1 = (n: number) => Math.round(n * 100) / 100;

export function sizeOf(key: WallSizeKey): WallSize {
  return wallSizes.find((s) => s.key === key) ?? wallSizes[1];
}

export function pixelSize(size: WallSize) {
  return { w: Math.round((size.w / 25.4) * size.dpi), h: Math.round((size.h / 25.4) * size.dpi) };
}

/** A print-ready wall map as an SVG string whose units are millimetres. */
export function buildWallMapSvg(o: WallOptions): string {
  const size = sizeOf(o.size);
  const { w: W, h: H } = size;
  const p = palettes[o.style];
  const hl = o.highlight && o.data;
  const th = getMapTheme(o.data?.theme);
  const visited = new Set(o.data?.visited ?? []);
  const want = new Set(o.data?.want ?? []);
  const fav = new Set(o.data?.fav ?? []);

  const mat = o.frame === "mat" ? W * 0.075 : 0;
  const m = o.frame === "none" ? W * 0.035 : o.frame === "mat" ? mat + W * 0.03 : W * 0.06;
  const innerL = m;
  const innerR = W - m;

  const titleSize = Math.min(W * 0.085, (innerR - innerL) / Math.max(6, o.title.length) * 1.55);
  const titleY = m + titleSize * 0.95;
  const subSize = W * 0.0235;
  const subY = titleY + subSize * 1.7;
  const headerBottom = o.subtitle ? subY + subSize * 0.8 : titleY + titleSize * 0.2;

  const footerH = W * (o.showByline && o.byline ? 0.105 : 0.075);
  const areaTop = headerBottom + W * 0.02;
  const areaBottom = H - m - footerH;
  const areaW = innerR - innerL;
  const areaH = areaBottom - areaTop;
  const s = Math.min(areaW / MAP_W, areaH / MAP_H);
  const mapW = MAP_W * s;
  const mapH = MAP_H * s;
  const mapX = innerL + (areaW - mapW) / 2;
  const mapY = areaTop + (areaH - mapH) / 2;
  const strokeW = f1((W * (o.style === "line" ? 0.0012 : 0.0009)) / s);

  const gradId = "sea";
  const sea =
    o.style === "line"
      ? ""
      : `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sea}" stop-opacity="0"/><stop offset="1" stop-color="${p.sea}" stop-opacity="${o.style === "dark" ? 0.9 : 0.75}"/></linearGradient></defs>
<rect x="${f1(innerL)}" y="${f1(mapY + mapH * 0.5)}" width="${f1(areaW)}" height="${f1(areaBottom - (mapY + mapH * 0.5))}" fill="url(#${gradId})"/>
<text x="${f1(W / 2)}" y="${f1(areaBottom - (hl ? W * 0.07 : W * 0.03))}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="${f1(W * 0.02)}" letter-spacing="${f1(W * 0.004)}" fill="${p.seaText}">BAY OF BENGAL</text>`;

  const shapes = districts
    .map((d) => {
      let fill = p.fillNone ? "none" : p.fill(d.division);
      if (hl) fill = fav.has(d.slug) ? th.favorite : visited.has(d.slug) ? th.visited : want.has(d.slug) ? th.want : fill;
      if (hl && p.fillNone) fill = fav.has(d.slug) ? th.favorite : visited.has(d.slug) ? th.visited : want.has(d.slug) ? th.want : "none";
      return `<path d="${districtShapes[d.slug].d}" fill="${fill}" stroke="${p.stroke}" stroke-width="${strokeW}" stroke-linejoin="round"/>`;
    })
    .join("");

  const starR = f1((W * 0.0105) / s);
  const star = (cx: number, cy: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? starR : starR * 0.42;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      return `${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`;
    });
    return `<polygon points="${pts.join(" ")}" fill="#ffffff" stroke="${th.favorite}" stroke-width="${f1(starR * 0.12)}" stroke-linejoin="round"/>`;
  };
  const stars = hl ? districts.filter((d) => fav.has(d.slug)).map((d) => star(districtShapes[d.slug].cx, districtShapes[d.slug].cy - starR * 1.5)).join("") : "";

  const HQ = new Set(["dhaka", "chattogram", "sylhet", "rajshahi", "khulna", "barishal", "rangpur", "mymensingh"]);
  const labelBase = f1((W * 0.0078) / s);
  const labels = o.labels
    ? districts
        .map((d) => {
          const sh = districtShapes[d.slug];
          const size = HQ.has(d.slug) ? labelBase * 1.25 : labelBase;
          const onFill = hl && (visited.has(d.slug) || fav.has(d.slug)) && o.style !== "line";
          const color = onFill ? "#ffffff" : p.label;
          const halo = onFill ? "rgba(0,0,0,0.35)" : p.halo;
          return `<text x="${sh.cx}" y="${f1(sh.cy + size * 0.35)}" text-anchor="middle" font-family="${o.bengali ? "'Noto Sans Bengali','Nirmala UI','Kohinoor Bangla',Helvetica,Arial,sans-serif" : "Helvetica, Arial, sans-serif"}" font-size="${f1(size)}" font-weight="${HQ.has(d.slug) ? 700 : 500}" fill="${color}" stroke="${halo}" stroke-width="${f1(size * 0.28)}" paint-order="stroke" stroke-linejoin="round">${esc(o.bengali ? d.bn : d.name)}</text>`;
        })
        .join("")
    : "";

  const home = o.data?.home ? districts.find((x) => x.slug === o.data?.home) : undefined;
  const homeR = f1((W * 0.011) / s);
  const homeSvg = home ? homeMarker(districtShapes[home.slug].cx, districtShapes[home.slug].cy - homeR * 1.7, homeR, p.ink === "#eaf6ef" ? "#e9a23b" : p.ink) : "";
  const homeLegend = home
    ? `<g transform="translate(${f1(innerR - W * 0.012)} ${f1(areaBottom - W * 0.03)})"><text text-anchor="end" font-family="${o.bengali ? "'Noto Sans Bengali','Nirmala UI','Kohinoor Bangla',Helvetica,Arial,sans-serif" : "Helvetica, Arial, sans-serif"}" font-size="${f1(W * 0.0145)}" fill="${p.ink}">${o.bengali ? "নিজ জেলা" : "Home"} · ${esc(o.bengali ? home.bn : home.name)}</text><g transform="translate(${f1(-(W * 0.0145 * (esc(o.bengali ? home.bn : home.name).length + 7) * 0.55 + W * 0.014))} ${f1(-W * 0.0045)})">${homeMarker(0, 0, W * 0.0095, p.ink === "#eaf6ef" ? "#e9a23b" : p.ink)}</g></g>`
    : "";

  const compassSize = W * 0.045;
  const cx = innerR - compassSize * 0.9;
  const cy = areaTop + compassSize * 1.1;
  const compass = o.compass
    ? `<g transform="translate(${f1(cx)} ${f1(cy)})"><circle r="${f1(compassSize * 0.62)}" fill="none" stroke="${p.border}" stroke-width="${f1(W * 0.0012)}"/><path d="M0 ${f1(-compassSize * 0.55)} L${f1(compassSize * 0.16)} 0 L0 ${f1(compassSize * 0.12)} L${f1(-compassSize * 0.16)} 0 Z" fill="${p.ink}"/><path d="M0 ${f1(compassSize * 0.55)} L${f1(compassSize * 0.12)} 0 L${f1(-compassSize * 0.12)} 0 Z" fill="${p.border}" opacity="0.55"/><text y="${f1(-compassSize * 0.72)}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="${f1(compassSize * 0.34)}" fill="${p.ink}">N</text></g>`
    : "";

  const barMm = (100 / KM_PER_UNIT) * s;
  const barX = innerL + W * 0.012;
  const barY = areaBottom - W * 0.03;
  const scaleBar = o.scaleBar
    ? `<g transform="translate(${f1(barX)} ${f1(barY)})"><rect width="${f1(barMm / 2)}" height="${f1(W * 0.005)}" fill="${p.ink}"/><rect x="${f1(barMm / 2)}" width="${f1(barMm / 2)}" height="${f1(W * 0.005)}" fill="none" stroke="${p.ink}" stroke-width="${f1(W * 0.0008)}"/><text y="${f1(-W * 0.007)}" font-family="Helvetica, Arial, sans-serif" font-size="${f1(W * 0.0125)}" fill="${p.ink}">0</text><text x="${f1(barMm / 2)}" y="${f1(-W * 0.007)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${f1(W * 0.0125)}" fill="${p.ink}">50</text><text x="${f1(barMm)}" y="${f1(-W * 0.007)}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="${f1(W * 0.0125)}" fill="${p.ink}">100 km</text></g>`
    : "";

  const legendItems: [string, string][] = hl
    ? [
        [th.visited, "Visited"],
        [th.want, "Want to visit"],
        [th.favorite, "Favorite"],
      ]
    : [];
  const itemW = (label: string) => W * 0.03 + label.length * W * 0.0085;
  const gap = W * 0.035;
  const rowW = legendItems.reduce((sum, [, t]) => sum + itemW(t), 0) + gap * Math.max(0, legendItems.length - 1);
  const legendY = areaBottom - W * 0.03;
  const legend = (() => {
    let x = W / 2 - rowW / 2;
    return legendItems
      .map(([c, t]) => {
        const g = `<g transform="translate(${f1(x)} ${f1(legendY)})"><circle r="${f1(W * 0.0085)}" cx="${f1(W * 0.0085)}" cy="${f1(-W * 0.0045)}" fill="${c}" stroke="${p.stroke}" stroke-width="${f1(W * 0.0008)}"/><text x="${f1(W * 0.024)}" font-family="Helvetica, Arial, sans-serif" font-size="${f1(W * 0.0145)}" fill="${p.ink}">${t}</text></g>`;
        x += itemW(t) + gap;
        return g;
      })
      .join("");
  })();

  const footerTop = areaBottom + W * 0.02;
  const byline = o.showByline && o.byline ? esc(o.byline) : "";
  const footer = `
${byline ? `<text x="${f1(innerL)}" y="${f1(footerTop + W * 0.038)}" font-family="Georgia, serif" font-size="${f1(W * 0.034)}" font-weight="700" fill="${p.ink}">${byline}</text>` : ""}
<text x="${f1(innerR)}" y="${f1(footerTop + W * 0.03)}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="${f1(W * 0.0165)}" font-weight="700" letter-spacing="${f1(W * 0.0015)}" fill="${p.sub}">GHURI BANGLADESH</text>
<text x="${f1(innerL)}" y="${f1(H - m - W * 0.006)}" font-family="Helvetica, Arial, sans-serif" font-size="${f1(W * 0.0085)}" fill="${p.sub}" opacity="0.9">District boundaries: Bangladesh Bureau of Statistics / OCHA via geoBoundaries (CC BY 3.0 IGO). Map made with Ghuri Bangladesh.</text>`;

  const frame =
    o.frame === "none"
      ? ""
      : o.frame === "line"
        ? `<rect x="${f1(W * 0.03)}" y="${f1(W * 0.03)}" width="${f1(W - W * 0.06)}" height="${f1(H - W * 0.06)}" fill="none" stroke="${p.border}" stroke-width="${f1(W * 0.0025)}"/>`
        : o.frame === "double"
          ? `<rect x="${f1(W * 0.025)}" y="${f1(W * 0.025)}" width="${f1(W - W * 0.05)}" height="${f1(H - W * 0.05)}" fill="none" stroke="${p.border}" stroke-width="${f1(W * 0.003)}"/><rect x="${f1(W * 0.036)}" y="${f1(W * 0.036)}" width="${f1(W - W * 0.072)}" height="${f1(H - W * 0.072)}" fill="none" stroke="${p.border}" stroke-width="${f1(W * 0.0012)}"/>`
          : `<rect x="${f1(mat)}" y="${f1(mat)}" width="${f1(W - mat * 2)}" height="${f1(H - mat * 2)}" fill="none" stroke="${p.border}" stroke-width="${f1(W * 0.0018)}"/>`;

  const matFill = o.frame === "mat" ? (o.style === "dark" ? "#f3f3ef" : "#ffffff") : null;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
<rect width="${W}" height="${H}" fill="${matFill ?? p.paper}"/>
${matFill ? `<rect x="${f1(mat)}" y="${f1(mat)}" width="${f1(W - mat * 2)}" height="${f1(H - mat * 2)}" fill="${p.paper}"/>` : ""}
${matFill ? "" : ""}
<text x="${f1(W / 2)}" y="${f1(titleY)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${f1(titleSize)}" font-weight="700" letter-spacing="${f1(titleSize * 0.04)}" fill="${p.ink}">${esc(o.title || "Bangladesh")}</text>
${o.subtitle ? `<text x="${f1(W / 2)}" y="${f1(subY)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${f1(subSize)}" letter-spacing="${f1(subSize * 0.22)}" fill="${p.sub}">${esc(o.subtitle.toUpperCase())}</text>` : ""}
${sea}
<g transform="translate(${f1(mapX)} ${f1(mapY)}) scale(${f1(s * 1000) / 1000})">${shapes}${stars}${labels}${homeSvg}</g>
${compass}${scaleBar}${legend}${homeLegend}${footer}
${frame}
</svg>`;
}
