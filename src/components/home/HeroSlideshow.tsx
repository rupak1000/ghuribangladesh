/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Slide {
  id: string;
  name: string;
  district: string;
  src: string;
  author: string;
  license: string;
  page: string;
}

const INTERVAL = 6500;
const FADE = 1800;
const DRIFT = [
  ["-2.5%", "-1.5%"],
  ["2.5%", "-1%"],
  ["-1.5%", "2%"],
  ["2%", "1.5%"],
];

/** Popular place photos that crossfade slowly behind the hero text, like a quiet video. */
export function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [seen, setSeen] = useState(0);
  const idxRef = useRef(0);
  const n = slides.length;

  const goTo = useCallback((i: number) => {
    if (i === idxRef.current) return;
    setPrev(idxRef.current);
    idxRef.current = i;
    setIdx(i);
    setSeen((s) => Math.max(s, i));
  }, []);

  useEffect(() => {
    if (n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = setInterval(() => {
      if (!document.hidden) goTo((idxRef.current + 1) % n);
    }, INTERVAL);
    return () => clearInterval(tick);
  }, [n, goTo]);

  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), FADE + 200);
    return () => clearTimeout(t);
  }, [prev, idx]);

  const cur = slides[idx];

  return (
    <>
      <div className="absolute inset-0 -z-20 overflow-hidden bg-forest" aria-hidden>
        {slides.map((s, i) => {
          if (i > seen + 1) return null;
          const active = i === idx;
          const running = active || i === prev;
          const [kx, ky] = DRIFT[i % DRIFT.length];
          return (
            <img
              key={s.id}
              src={s.src}
              alt=""
              decoding="async"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              style={{ "--kx": kx, "--ky": ky, transitionDuration: `${FADE}ms` } as React.CSSProperties}
              className={cn("absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity ease-in-out", active && "opacity-80", running && "hero-kb")}
            />
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-20 z-0 mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 md:bottom-28 md:px-6">
        <p className="pointer-events-auto min-w-0 text-left text-xs text-white/90" aria-live="off">
          <span className="flex items-center gap-1.5 font-semibold">
            <MapPin className="size-3.5 shrink-0" aria-hidden /> <span className="truncate">{cur.name}, {cur.district}</span>
          </span>
          <a href={cur.page} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-[11px] text-white/70 underline-offset-2 hover:underline">
            Photo: {cur.author} · {cur.license} · Wikimedia Commons
          </a>
        </p>
        {n > 1 && (
          <div className="pointer-events-auto flex shrink-0 items-center" role="group" aria-label="Choose hero photo">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)} aria-label={`Show photo of ${s.name}`} aria-current={i === idx} className="grid size-6 place-items-center">
                <span className={cn("block h-1.5 rounded-full bg-white transition-all", i === idx ? "w-6 opacity-100" : "w-1.5 opacity-50")} />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
