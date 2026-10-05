"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAP_H, MAP_W, districtShapes, project } from "@/lib/geo";
import { districts, districtStats, getDistrict } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { roadKm } from "@/lib/travel";
import { cn } from "@/lib/utils";
import { T } from "@/components/T";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  emoji: string;
  color: string;
  label: string;
  state?: "visited" | "saved" | "favorite";
}

export interface DistrictStyle {
  fill?: string;
  star?: boolean;
}

interface Props {
  selected?: string | null;
  onSelect?: (slug: string | null) => void;
  markers?: MapMarker[];
  onMarkerClick?: (id: string) => void;
  districtStyle?: (slug: string) => DistrictStyle;
  dimmed?: (slug: string) => boolean;
  fullBleed?: boolean;
  className?: string;
  labelAll?: boolean;
  baseFill?: string;
  route?: string[];
}

interface View { k: number; x: number; y: number }

const HQ = ["dhaka", "chattogram", "sylhet", "rajshahi", "khulna", "barishal", "rangpur", "mymensingh"];
const MAX_K = 9;

function clampView(v: View): View {
  const k = Math.min(MAX_K, Math.max(1, v.k));
  return {
    k,
    x: Math.min(0, Math.max(MAP_W * (1 - k), v.x)),
    y: Math.min(0, Math.max(MAP_H * (1 - k) - (k > 1 ? MAP_H * 0.5 : 0), v.y)),
  };
}

export function BangladeshMap({
  selected, onSelect, markers = [], onMarkerClick, districtStyle, dimmed, fullBleed, className, labelAll, baseFill, route,
}: Props) {
  const { t, dn } = useT();
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);
  const [hover, setHover] = useState<{ slug: string; x: number; y: number; w: number } | null>(null);
  const [hint, setHint] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: boolean; slug: string | null; pinch: number; start: { x: number; y: number } } | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geometry = useCallback(() => {
    const rect = svgRef.current!.getBoundingClientRect();
    const s = Math.min(rect.width / MAP_W, rect.height / MAP_H);
    return { rect, s, ox: (rect.width - MAP_W * s) / 2, oy: (rect.height - MAP_H * s) / 2 };
  }, []);

  const zoomAt = useCallback((factor: number, px: number, py: number, anim = false) => {
    setAnimate(anim);
    setView((v) => {
      const k = Math.min(MAX_K, Math.max(1, v.k * factor));
      const f = k / v.k;
      return clampView({ k, x: px - (px - v.x) * f, y: py - (py - v.y) * f });
    });
  }, []);

  const focusOn = useCallback((cx: number, cy: number, k: number) => {
    setAnimate(true);
    setView(clampView({ k, x: MAP_W / 2 - cx * k, y: MAP_H / 2 - cy * k }));
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) {
        setHint(true);
        if (hintTimer.current) clearTimeout(hintTimer.current);
        hintTimer.current = setTimeout(() => setHint(false), 1400);
        return;
      }
      e.preventDefault();
      const { rect, s, ox, oy } = geometry();
      zoomAt(Math.exp(-e.deltaY * 0.01), (e.clientX - rect.left - ox) / s, (e.clientY - rect.top - oy) / s);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [geometry, zoomAt]);

  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    const shape = selected ? districtShapes[selected] : undefined;
    if (shape) {
      setAnimate(true);
      setView(clampView({ k: 2.4, x: MAP_W / 2 - shape.cx * 2.4, y: MAP_H * 0.3 - shape.cy * 2.4 }));
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const slug = (e.target as Element).closest("[data-slug]")?.getAttribute("data-slug") ?? null;
    if (pointers.current.size === 1) {
      gesture.current = { moved: false, slug, pinch: 0, start: { x: e.clientX, y: e.clientY } };
    } else if (gesture.current) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { ...gesture.current, moved: true, pinch: Math.hypot(a.x - b.x, a.y - b.y) };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    const g = gesture.current;
    if (prev && g) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const { rect, s, ox, oy } = geometry();
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (g.pinch) zoomAt(d / g.pinch, ((a.x + b.x) / 2 - rect.left - ox) / s, ((a.y + b.y) / 2 - rect.top - oy) / s);
        g.pinch = d;
        return;
      }
      if (!g.moved && Math.hypot(e.clientX - g.start.x, e.clientY - g.start.y) > 5) {
        g.moved = true;
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      }
      if (g.moved) {
        setAnimate(false);
        const dx = (e.clientX - prev.x) / s;
        const dy = (e.clientY - prev.y) / s;
        setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
        setHover(null);
        return;
      }
    }
    if (e.pointerType === "mouse") {
      const slug = (e.target as Element).closest("[data-slug]")?.getAttribute("data-slug");
      if (slug) {
        const rect = svgRef.current!.getBoundingClientRect();
        setHover({ slug, x: e.clientX - rect.left, y: e.clientY - rect.top, w: rect.width });
      } else setHover(null);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (g && !g.moved && pointers.current.size === 0) {
      const markerId = (e.target as Element).closest("[data-marker]")?.getAttribute("data-marker");
      const cluster = (e.target as Element).closest("[data-cluster]")?.getAttribute("data-cluster");
      if (cluster) {
        const [cx, cy] = cluster.split(",").map(Number);
        focusOn(cx, cy, Math.min(MAX_K, view.k * 2.4));
      } else if (markerId) onMarkerClick?.(markerId);
      else onSelect?.(g.slug);
    }
    if (pointers.current.size === 0) gesture.current = null;
  };

  const reset = () => {
    setAnimate(true);
    setView({ k: 1, x: 0, y: 0 });
    onSelect?.(null);
  };

  const projected = useMemo(() => markers.map((m) => ({ ...m, pt: project(m.lat, m.lng) })), [markers]);

  const items = useMemo(() => {
    const cell = 34 / Math.max(1, Math.round(view.k * 4) / 4);
    const buckets = new Map<string, typeof projected>();
    for (const m of projected) {
      const key = `${Math.floor(m.pt[0] / cell)}:${Math.floor(m.pt[1] / cell)}`;
      buckets.set(key, [...(buckets.get(key) ?? []), m]);
    }
    return [...buckets.values()].map((g) => {
      const x = Math.round((g.reduce((a, m) => a + m.pt[0], 0) / g.length) * 100) / 100;
      const y = Math.round((g.reduce((a, m) => a + m.pt[1], 0) / g.length) * 100) / 100;
      return { x, y, group: g };
    });
  }, [projected, view.k]);

  const hovered = hover ? getDistrict(hover.slug) : null;
  const hovStats = hover ? districtStats(hover.slug) : null;
  const ordered = useMemo(() => {
    const slugs = districts.map((d) => d.slug);
    return selected ? [...slugs.filter((s) => s !== selected), selected] : slugs;
  }, [selected]);
  const showNames = labelAll || view.k >= 2.2;

  return (
    <div className={cn("relative select-none overflow-hidden bg-[#dce9ee]", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="block h-full w-full"
        overflow="hidden"
        style={{ touchAction: fullBleed || view.k > 1 ? "none" : "pan-y" }}
        role="group"
        aria-label={t("Interactive map of Bangladesh's 64 districts")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="bay" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={MAP_H}>
            <stop offset="0.55" stopColor="#e6eff0" />
            <stop offset="1" stopColor="#c9dfea" />
          </linearGradient>
        </defs>
        <rect x="-3000" y="-3000" width={MAP_W + 6000} height={MAP_H + 6000} fill="url(#bay)" />
        <g
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
            transformOrigin: "0 0",
            transition: animate ? "transform 0.6s cubic-bezier(0.2,0.8,0.2,1)" : "none",
          }}
        >
          <text x="440" y="790" fontSize="12" fill="#2f7fa8" opacity="0.55" fontStyle="italic" letterSpacing="3">BAY OF BENGAL</text>
          <text x="14" y="300" fontSize="10" fill="#6f8a80" opacity="0.7" letterSpacing="3">INDIA</text>
          <text x="565" y="560" fontSize="10" fill="#6f8a80" opacity="0.7" letterSpacing="3" transform="rotate(90 575 560)">MYANMAR</text>

          {ordered.map((slug) => {
            const sh = districtShapes[slug];
            const st = districtStyle?.(slug) ?? {};
            const isSel = slug === selected;
            const dim = dimmed?.(slug);
            return (
              <path
                key={slug}
                d={sh.d}
                data-slug={slug}
                className="map-district"
                tabIndex={0}
                role="button"
                aria-label={dn(getDistrict(slug) ?? { name: slug, bn: slug })}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect?.(slug))}
                fill={isSel ? "#0b3d2e" : (st.fill ?? (dim ? "#e6ece6" : (baseFill ?? "#cfe4d5")))}
                fillOpacity={dim && !isSel ? 0.75 : 1}
                stroke={isSel ? "#e9a23b" : "#ffffff"}
                strokeWidth={isSel ? 2.4 : 1}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                onMouseEnter={(e) => !isSel && ((e.currentTarget.style.filter = "brightness(0.93)"))}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "")}
              />
            );
          })}

          {districts.map((d) => {
            const sh = districtShapes[d.slug];
            const isHQ = HQ.includes(d.slug);
            const star = districtStyle?.(d.slug).star;
            const label = showNames || d.slug === selected || (hover?.slug === d.slug);
            return (
              <g key={d.slug} transform={`translate(${sh.cx} ${sh.cy}) scale(${1 / view.k})`} pointerEvents="none">
                {star && <text textAnchor="middle" y="5" fontSize="15">⭐</text>}
                {isHQ && !star && (
                  <>
                    <circle r="3" fill="#0b3d2e" stroke="#fff" strokeWidth="1.2" />
                    <text y="-8" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0b3d2e" stroke="#fff" strokeWidth="3" paintOrder="stroke">{dn(d)}</text>
                  </>
                )}
                {label && !isHQ && (
                  <text y="3" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#14221b" stroke="#fff" strokeWidth="3" paintOrder="stroke">{dn(d)}</text>
                )}
              </g>
            );
          })}

          {route && route.length > 1 && <RouteOverlay route={route} k={view.k} />}

          {items.map(({ x, y, group }) => {
            const key = `${x.toFixed(1)},${y.toFixed(1)}`;
            if (group.length > 1) {
              return (
                <g key={`c-${key}`} transform={`translate(${x} ${y}) scale(${1 / view.k})`} data-cluster={key} className="cursor-pointer">
                  <circle r="15" fill="#0b3d2e" stroke="#fff" strokeWidth="2.5" />
                  <text textAnchor="middle" y="4.5" fontSize="12" fontWeight="700" fill="#fff">{group.length}</text>
                </g>
              );
            }
            const m = group[0];
            return (
              <g key={m.id} transform={`translate(${x} ${y}) scale(${1 / view.k})`} data-marker={m.id} className="group/m cursor-pointer">
                <title>{m.label}</title>
                <g className="origin-center transition-transform duration-150 group-hover/m:scale-125" style={{ transformBox: "fill-box" }}>
                  <circle r="12.5" fill="#fff" stroke={m.state === "visited" ? "#12805c" : m.color} strokeWidth={m.state ? 3 : 2} />
                  <text textAnchor="middle" y="4.5" fontSize="13">{m.emoji}</text>
                  {m.state && (
                    <g transform="translate(9 -9)">
                      <circle r="6" fill={m.state === "visited" ? "#12805c" : m.state === "saved" ? "#2f7fa8" : "#e9a23b"} stroke="#fff" strokeWidth="1.5" />
                      <text textAnchor="middle" y="3" fontSize="8" fill="#fff" fontWeight="700">{m.state === "visited" ? "✓" : m.state === "saved" ? "•" : "★"}</text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && hover && hovStats && (
        <div
          className="pointer-events-none absolute z-10 hidden rounded-xl bg-forest px-3 py-2 text-xs text-white shadow-lift md:block"
          style={{ left: Math.min(hover.x + 14, hover.w - 160), top: Math.max(8, hover.y - 52) }}
        >
          <p className="font-semibold">{dn(hovered)}</p>
          <p className="text-white/75">{hovStats.places} places · {hovStats.foods} foods</p>
        </div>
      )}

      <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-xl border border-line/80 bg-white/95 shadow-lift backdrop-blur">
        <button aria-label={t("Zoom in")} className="grid size-11 place-items-center md:size-10 hover:bg-moss active:bg-emerald-soft" onClick={() => zoomAt(1.6, MAP_W / 2, MAP_H / 2, true)}><Plus className="size-4" /></button>
        <button aria-label={t("Zoom out")} className="grid size-11 place-items-center md:size-10 border-t border-line hover:bg-moss active:bg-emerald-soft" onClick={() => zoomAt(1 / 1.6, MAP_W / 2, MAP_H / 2, true)}><Minus className="size-4" /></button>
        <button aria-label={t("Reset view")} className="grid size-11 place-items-center md:size-10 border-t border-line hover:bg-moss active:bg-emerald-soft" onClick={reset}><RotateCcw className="size-4" /></button>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-forest/90 px-3 py-1.5 text-xs font-medium text-white transition-opacity",
          hint ? "opacity-100" : "opacity-0",
        )}
      >
        <T>Hold Ctrl / ⌘ and scroll to zoom</T>
      </div>
    </div>
  );
}

interface Pt { x: number; y: number }

function legPath(a: Pt, b: Pt) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * len * 0.18;
  const cy = my + (dx / len) * len * 0.18;
  const midX = 0.25 * a.x + 0.5 * cx + 0.25 * b.x;
  const midY = 0.25 * a.y + 0.5 * cy + 0.25 * b.y;
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return { d: `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`, midX, midY, angle };
}

/** Numbered travel route drawn through district centres, with the distance on each leg. */
function RouteOverlay({ route, k }: { route: string[]; k: number }) {
  const pts = route.map((slug) => districtShapes[slug]).filter(Boolean).map((s) => ({ x: s.cx, y: s.cy }));
  if (pts.length < 2) return null;
  const legs = pts.slice(1).map((p, i) => ({ ...legPath(pts[i], p), km: roadKm(route[i], route[i + 1]) }));
  const stopOrder = route.filter((slug, i) => i === 0 || slug !== route[0] || i < route.length - 1);
  return (
    <g pointerEvents="none" aria-hidden>
      {legs.map((l, i) => (
        <g key={`p${i}`}>
          <path d={l.d} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.9" />
          <path d={l.d} fill="none" stroke="#d9822b" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 6" vectorEffect="non-scaling-stroke" />
        </g>
      ))}
      {legs.map((l, i) => (
        <g key={`a${i}`} transform={`translate(${l.midX} ${l.midY}) scale(${1 / k})`}>
          <g transform={`rotate(${l.angle})`}>
            <path d="M-5 -5 L5 0 L-5 5 Z" fill="#d9822b" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
          <g transform="translate(0 -14)">
            <rect x="-24" y="-8" width="48" height="16" rx="8" fill="#fff" stroke="#d9822b" strokeWidth="1" />
            <text textAnchor="middle" y="4" fontSize="9.5" fontWeight="700" fill="#14221b">{l.km} km</text>
          </g>
        </g>
      ))}
      {stopOrder.map((slug, i) => {
        const sh = districtShapes[slug];
        if (!sh) return null;
        const start = i === 0;
        return (
          <g key={`s${i}`} transform={`translate(${sh.cx} ${sh.cy}) scale(${1 / k})`}>
            <circle r={start ? 13 : 11} fill={start ? "#e9a23b" : "#0a3326"} stroke="#fff" strokeWidth="2.5" />
            <text textAnchor="middle" y="4" fontSize={start ? 12 : 11} fontWeight="800" fill={start ? "#0a3326" : "#fff"}>{start ? "S" : i}</text>
          </g>
        );
      })}
    </g>
  );
}
