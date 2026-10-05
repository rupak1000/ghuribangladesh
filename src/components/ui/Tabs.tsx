"use client";

import { cn } from "@/lib/utils";

export function Tabs<T extends string>({
  tabs, value, onChange, className,
}: { tabs: { key: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn("no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0", className)}>
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={value === t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "relative min-h-11 shrink-0 whitespace-nowrap px-4 py-3 text-sm font-semibold transition",
            value === t.key ? "text-forest" : "text-muted hover:text-ink",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 rounded-full bg-moss px-1.5 py-0.5 text-[11px] font-semibold text-muted">{t.count}</span>}
          {value === t.key && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-forest" />}
        </button>
      ))}
    </div>
  );
}
