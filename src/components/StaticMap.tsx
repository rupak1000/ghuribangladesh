import { MAP_H, MAP_W, districtShapes } from "@/lib/geo";
import { districts } from "@/lib/data";
import { getMapTheme } from "@/lib/mapThemes";

/** Non-interactive map coloured from a snapshot, safe to render on the server. */
export function StaticMap({ visited, want, fav, theme, home, className }: { visited: string[]; want: string[]; fav: string[]; theme?: string; home?: string; className?: string }) {
  const th = getMapTheme(theme);
  const v = new Set(visited);
  const w = new Set(want);
  const f = new Set(fav);
  const h = home ? districtShapes[home] : undefined;
  const r = MAP_W * 0.028;
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className={className} role="img" aria-label={`Map with ${visited.length} of 64 districts visited`}>
      {districts.map((d) => (
        <path
          key={d.slug}
          d={districtShapes[d.slug].d}
          fill={f.has(d.slug) ? th.favorite : v.has(d.slug) ? th.visited : w.has(d.slug) ? th.want : th.base}
          stroke="#fff"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        >
          <title>{d.name}</title>
        </path>
      ))}
      {h && (
        <g transform={`translate(${h.cx} ${h.cy - r * 1.3}) scale(${r / 10})`}>
          <title>Home</title>
          <circle r="10" fill="#fff" stroke="#1d2b22" strokeWidth="2" />
          <path d="M0 -6 L6.5 -0.5 H4.4 V5 H-4.4 V-0.5 H-6.5 Z" fill="#1d2b22" />
        </g>
      )}
    </svg>
  );
}
