import { useId } from "react";
import type { Category } from "@/lib/types";
import { hash } from "@/lib/utils";

interface Palette {
  sky: [string, string];
  sun: string;
  far: string;
  mid: string;
  near: string;
  accent: string;
}

const palettes: Record<Category, Palette[]> = {
  nature: [
    { sky: ["#fdf3d6", "#cfe8d4"], sun: "#f6c453", far: "#9cc9a5", mid: "#4f9d6c", near: "#1f6b49", accent: "#0f3d2c" },
    { sky: ["#e9f5ee", "#bfe0cc"], sun: "#f9dd8a", far: "#8dbf9b", mid: "#3f8a5e", near: "#175a3c", accent: "#0b3326" },
    { sky: ["#fde6c8", "#c8e3d0"], sun: "#f0a04b", far: "#a7cfa8", mid: "#58a06a", near: "#25704c", accent: "#103f2d" },
  ],
  adventure: [
    { sky: ["#dfe8f5", "#f7ead6"], sun: "#f6d28a", far: "#a9b9d6", mid: "#6e82ad", near: "#3a4a78", accent: "#232e55" },
    { sky: ["#f9e1cf", "#d6def0"], sun: "#f2a65a", far: "#b7b2d6", mid: "#7a74b5", near: "#443f85", accent: "#272454" },
  ],
  beach: [
    { sky: ["#fde7c3", "#cfe7f2"], sun: "#f59b3d", far: "#7fc1d9", mid: "#3d97bf", near: "#e9d3a0", accent: "#1c6a8f" },
    { sky: ["#fbd7c0", "#bfe1ee"], sun: "#f6746b", far: "#78bcd6", mid: "#3589b3", near: "#efdcae", accent: "#1a5f86" },
    { sky: ["#e3f3f8", "#c9e8f1"], sun: "#fbe08a", far: "#8fd0df", mid: "#44a5c4", near: "#f2e3b9", accent: "#1f7a9b" },
  ],
  history: [
    { sky: ["#f9e6c8", "#efd0a8"], sun: "#e9a23b", far: "#d9b88c", mid: "#b98355", near: "#7e4f2c", accent: "#4a2c16" },
    { sky: ["#f4e7d3", "#dcc6a6"], sun: "#e8b45a", far: "#cfae83", mid: "#a8734a", near: "#6d4326", accent: "#3f2412" },
  ],
  culture: [
    { sky: ["#fbe0d8", "#f3c9c7"], sun: "#f5a35d", far: "#d99aa4", mid: "#b5546f", near: "#6e2e49", accent: "#3f1a2b" },
    { sky: ["#fde8d0", "#f0c7a5"], sun: "#f08a4b", far: "#e0a083", mid: "#c26a51", near: "#7a3a2f", accent: "#44201a" },
  ],
  wildlife: [
    { sky: ["#eaf3d9", "#c6dca4"], sun: "#f4de86", far: "#93b774", mid: "#5f8f43", near: "#2f5f2a", accent: "#193a1b" },
    { sky: ["#f3efce", "#cde0a8"], sun: "#f5c85c", far: "#9dbd77", mid: "#65964a", near: "#33652d", accent: "#1c3d1d" },
  ],
  food: [
    { sky: ["#fde7c8", "#f8cf9d"], sun: "#f2a03e", far: "#f0b673", mid: "#d9822b", near: "#a8571a", accent: "#6b3410" },
    { sky: ["#fdeccc", "#f6d6a8"], sun: "#e98b2f", far: "#f2c283", mid: "#d98a32", near: "#a85d1b", accent: "#6d3911" },
  ],
};

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

function ridge(r: () => number, base: number, amp: number, steps = 7, w = 400, h = 300) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) pts.push([(w / steps) * i, base - r() * amp]);
  let d = `M0 ${h} L0 ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const cx = (px + x) / 2;
    d += ` C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + ` L${w} ${h} Z`;
}

function peaks(r: () => number, base: number, amp: number, steps = 6, w = 400, h = 300) {
  let d = `M0 ${h} L0 ${base}`;
  for (let i = 0; i < steps; i++) {
    const x = (w / steps) * (i + 0.5 + (r() - 0.5) * 0.5);
    d += ` L${x.toFixed(1)} ${(base - amp * (0.5 + r() * 0.5)).toFixed(1)} L${((w / steps) * (i + 1)).toFixed(1)} ${(base - amp * 0.1 * r()).toFixed(1)}`;
  }
  return d + ` L${w} ${h} Z`;
}

function Tree({ x, y, s, fill, trunk }: { x: number; y: number; s: number; fill: string; trunk: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.5" y="-4" width="3" height="14" fill={trunk} />
      <circle cx="0" cy="-12" r="9" fill={fill} />
      <circle cx="-6" cy="-6" r="6" fill={fill} />
      <circle cx="6" cy="-6" r="6" fill={fill} />
    </g>
  );
}

function Palm({ x, y, s, fill, trunk }: { x: number; y: number; s: number; fill: string; trunk: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 14 C2 0 4 -10 6 -20" stroke={trunk} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {[-60, -25, 15, 50, 80].map((a) => (
        <path key={a} d="M6 -20 C16 -26 24 -22 30 -12" stroke={fill} strokeWidth="2.6" fill="none" strokeLinecap="round" transform={`rotate(${a} 6 -20)`} />
      ))}
    </g>
  );
}

export function Cover({ seed, category, className }: { seed: string; category: Category; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const h = hash(seed + category);
  const r = rng(h);
  const set = palettes[category];
  const p = set[h % set.length];
  const sunX = 70 + r() * 260;
  const sunY = 50 + r() * 50;

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0" stopColor={p.sun} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`shade-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#sky-${uid})`} />
      {category !== "food" && (
        <>
          <circle cx={sunX} cy={sunY} r="70" fill={`url(#glow-${uid})`} />
          <circle cx={sunX} cy={sunY} r="22" fill={p.sun} />
        </>
      )}

      {category === "beach" && (
        <>
          <path d="M0 150 H400 V300 H0Z" fill={p.far} />
          <path d={ridge(r, 175, 10, 10)} fill={p.mid} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M0 ${190 + i * 16} q25 -9 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0`} stroke="#fff" strokeOpacity={0.55 - i * 0.12} strokeWidth="2" fill="none" />
          ))}
          <path d={`M0 250 C100 ${232 + r() * 10} 260 ${240 + r() * 12} 400 ${236}  V300 H0Z`} fill={p.near} />
          <path d="M0 252 C100 238 260 246 400 238" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" fill="none" />
          <Palm x={40 + r() * 40} y={250} s={1.3} fill={p.accent} trunk={p.accent} />
          <Palm x={330 + r() * 40} y={248} s={1} fill={p.accent} trunk={p.accent} />
        </>
      )}

      {category === "nature" && (
        <>
          <path d={ridge(r, 150, 40, 6)} fill={p.far} />
          <path d={ridge(r, 190, 40, 6)} fill={p.mid} />
          {Array.from({ length: 6 }).map((_, i) => (
            <Tree key={i} x={20 + i * 70 + r() * 30} y={198 + r() * 10} s={0.8 + r() * 0.5} fill={p.near} trunk={p.accent} />
          ))}
          <path d={ridge(r, 250, 35, 5)} fill={p.near} />
          <path d="M0 270 C120 255 260 280 400 262 V300 H0Z" fill={p.accent} opacity="0.6" />
        </>
      )}

      {category === "adventure" && (
        <>
          <path d={peaks(r, 190, 120, 5)} fill={p.far} />
          <path d={peaks(r, 220, 110, 4)} fill={p.mid} />
          <ellipse cx={60 + r() * 280} cy={150} rx="55" ry="9" fill="#fff" opacity="0.7" />
          <ellipse cx={80 + r() * 240} cy={185} rx="70" ry="10" fill="#fff" opacity="0.55" />
          <path d={peaks(r, 270, 90, 4)} fill={p.near} />
          <path d="M0 285 H400 V300 H0Z" fill={p.accent} />
        </>
      )}

      {category === "history" && (
        <>
          <path d="M0 220 H400 V300 H0Z" fill={p.mid} opacity="0.5" />
          <g fill={p.near}>
            <rect x="110" y="150" width="180" height="90" />
            <path d="M150 150 a50 50 0 0 1 100 0Z" />
            <rect x="196" y="82" width="8" height="30" />
            <circle cx="200" cy="80" r="5" />
            <rect x="80" y="130" width="22" height="110" />
            <path d="M80 130 l11 -22 l11 22Z" />
            <rect x="298" y="130" width="22" height="110" />
            <path d="M298 130 l11 -22 l11 22Z" />
          </g>
          <g fill={p.sky[1]}>
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M${126 + i * 42} 240 v-34 a12 12 0 0 1 24 0 v34Z`} />
            ))}
          </g>
          <path d="M0 240 H400 V300 H0Z" fill={p.accent} />
          <path d="M0 262 H400" stroke={p.sun} strokeOpacity="0.4" strokeWidth="2" />
        </>
      )}

      {category === "culture" && (
        <>
          <path d="M0 170 H400 V300 H0Z" fill={p.mid} opacity="0.65" />
          <path d={ridge(r, 175, 18, 9)} fill={p.far} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M0 ${200 + i * 20} q25 -7 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0`} stroke={p.sky[0]} strokeOpacity="0.45" strokeWidth="2" fill="none" />
          ))}
          <g transform={`translate(${120 + r() * 120} 215)`}>
            <path d="M-50 0 Q0 22 55 0 L48 -6 Q0 12 -43 -6Z" fill={p.accent} />
            <path d="M-2 -6 V-48" stroke={p.accent} strokeWidth="2.4" />
            <path d="M0 -48 Q28 -34 0 -14Z" fill={p.near} />
            <path d="M0 -50 Q-20 -36 -2 -18Z" fill={p.sun} />
          </g>
          <path d="M0 270 C140 258 280 282 400 266 V300 H0Z" fill={p.accent} />
        </>
      )}

      {category === "wildlife" && (
        <>
          <path d={ridge(r, 160, 30, 7)} fill={p.far} />
          {Array.from({ length: 9 }).map((_, i) => (
            <Tree key={i} x={16 + i * 46 + r() * 20} y={190 + r() * 30} s={0.9 + r() * 0.7} fill={i % 2 ? p.mid : p.near} trunk={p.accent} />
          ))}
          <path d={ridge(r, 260, 28, 6)} fill={p.near} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${60 + r() * 280} ${70 + r() * 40} q6 -6 12 0 q6 -6 12 0`} stroke={p.accent} strokeWidth="1.6" fill="none" />
          ))}
          <path d="M0 280 H400 V300 H0Z" fill={p.accent} />
        </>
      )}

      {category === "food" && (
        <>
          <circle cx="200" cy="140" r="130" fill={p.sun} opacity="0.18" />
          <ellipse cx="200" cy="230" rx="130" ry="22" fill={p.accent} opacity="0.25" />
          <path d="M80 160 H320 C320 220 280 250 200 250 C120 250 80 220 80 160Z" fill={p.near} />
          <ellipse cx="200" cy="160" rx="120" ry="18" fill={p.mid} />
          <path d="M100 160 C120 100 280 100 300 160Z" fill="#fbf4e2" />
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={130 + r() * 140} cy={120 + r() * 38} r={2 + r() * 2.5} fill={i % 3 ? p.sun : p.accent} opacity="0.85" />
          ))}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${160 + i * 40} 96 q-10 -16 0 -30 q10 -14 0 -28`} stroke="#fff" strokeOpacity="0.7" strokeWidth="3" fill="none" strokeLinecap="round" />
          ))}
        </>
      )}
      <rect width="400" height="300" fill={`url(#shade-${uid})`} />
    </svg>
  );
}
