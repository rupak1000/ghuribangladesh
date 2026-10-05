"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Progress({ value, max, className, tone = "emerald" }: { value: number; max: number; className?: string; tone?: "emerald" | "amber" }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW((value / max) * 100));
    return () => cancelAnimationFrame(id);
  }, [value, max]);
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-forest/10", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", tone === "emerald" ? "bg-emerald" : "bg-amber")}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}
