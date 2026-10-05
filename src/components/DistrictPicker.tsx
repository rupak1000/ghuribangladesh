"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { districts, divisions } from "@/lib/data";
import { divisionBn } from "@/lib/categories";
import { getMapTheme } from "@/lib/mapThemes";
import { actions, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { uiActions } from "@/lib/ui";
import { useGate } from "@/lib/useGate";
import { cn } from "@/lib/utils";
import { T } from "@/components/T";

interface Props {
  mode: "mark" | "browse";
  className?: string;
  /** Whether the whole list starts open. Browsing starts closed so the page stays short. */
  defaultOpen?: boolean;
}

export function DistrictPicker({ mode, className, defaultOpen }: Props) {
  const { lang, dn } = useT();
  const s = useStore();
  const gate = useGate();
  const theme = getMapTheme(s.mapTheme);
  const [expanded, setExpanded] = useState(defaultOpen ?? mode === "mark");
  const [open, setOpen] = useState<Record<string, boolean | undefined>>({});
  const isOpenFor = (div: string) => open[div] ?? true;

  const groups = useMemo(
    () =>
      divisions.map((div) => ({
        div,
        list: districts.filter((d) => d.division === div).sort((a, b) => (lang === "bn" ? a.bn.localeCompare(b.bn, "bn") : a.name.localeCompare(b.name))),
      })),
    [lang],
  );
  const visited = (slug: string) => !!s.districtMarks[slug]?.visited;
  const total = districts.filter((d) => visited(d.slug)).length;
  const allOpen = groups.every((g) => isOpenFor(g.div));

  const setMany = (slugs: string[], on: boolean) =>
    gate(() => {
      actions.setDistrictsVisited(slugs, on);
      uiActions.toast(on ? `${slugs.length} districts marked as visited` : "Cleared");
    })();

  return (
    <section className={cn("py-2", className)} aria-labelledby="district-picker-title">
      <div className={cn("rounded-3xl border border-line bg-card shadow-soft transition", expanded ? "p-4 md:p-5" : "hover:border-emerald/40")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-4 rounded-2xl p-1.5 md:p-2"
            onClick={() => setExpanded((v) => !v)}
          >
            <div className="min-w-0">
              <p className="eyebrow mb-1">All 64 districts</p>
              <h2 id="district-picker-title" className="font-display text-2xl font-semibold leading-tight md:text-3xl">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls="district-picker-list"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((v) => !v);
                  }}
                  className="text-left"
                >
                  {mode === "mark" ? "Mark districts you've visited" : "Browse districts by name"}
                </button>
              </h2>
              <p className="mt-1 text-sm text-muted">
                {mode === "mark" ? `${total} of 64 visited. Tap a name to mark it.` : expanded ? "Find any district, grouped by division." : "Find any district, grouped by division. Tap to open."}
              </p>
            </div>
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-full bg-moss transition-transform", expanded && "rotate-180")} aria-hidden>
              <ChevronDown className="size-5" />
            </span>
          </div>
          {expanded && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOpen(Object.fromEntries(groups.map((g) => [g.div, !allOpen])))}
                className="inline-flex h-11 items-center rounded-full border border-line bg-paper px-4 text-sm font-semibold hover:border-emerald/40"
              >
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
              {mode === "mark" && (
                <>
                  <button onClick={() => setMany(districts.map((d) => d.slug), true)} className="inline-flex h-11 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-2"><T>Select all</T></button>
                  <button onClick={() => setMany(districts.map((d) => d.slug), false)} className="inline-flex h-11 items-center rounded-full border border-line bg-paper px-4 text-sm font-semibold hover:border-emerald/40"><T>Clear all</T></button>
                </>
              )}
            </div>
          )}
        </div>

      {expanded && (
      <div id="district-picker-list" className={cn("mt-4 grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4", mode === "browse" && "max-h-[24rem] content-start overflow-y-auto overscroll-contain pr-1")}>
        {groups.map(({ div, list }) => {
          const count = list.filter((d) => visited(d.slug)).length;
          const isOpen = isOpenFor(div);
          return (
            <div key={div} className="rounded-2xl border border-line bg-paper">
              <div className="flex items-center gap-2 pr-3">
                <button
                  aria-expanded={isOpen}
                  aria-controls={`dp-${div}`}
                  onClick={() => setOpen((o) => ({ ...o, [div]: !isOpen }))}
                  className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl px-4 text-left transition hover:bg-moss/60"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-soft text-sm font-bold text-forest">{list.length}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg font-semibold leading-tight">{lang === "bn" ? `${divisionBn[div]} বিভাগ` : `${div} Division`}</span>
                    <span className="block text-xs text-muted">
                      {mode === "mark" ? `${count} of ${list.length} visited` : `${list.length} districts`}
                    </span>
                  </span>
                  <ChevronDown className={cn("size-5 shrink-0 text-muted transition-transform", isOpen && "rotate-180")} />
                </button>
                {mode === "mark" && (
                  <button
                    onClick={() => setMany(list.map((d) => d.slug), count !== list.length)}
                    className="inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold text-emerald hover:bg-emerald-soft"
                  >
                    {count === list.length ? "Clear" : "Select all"}
                  </button>
                )}
              </div>
              {mode === "mark" && (
                <div className="mx-4 h-1 overflow-hidden rounded-full bg-ink/10" aria-hidden>
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(count / list.length) * 100}%`, background: theme.visited }} />
                </div>
              )}
              <ul id={`dp-${div}`} className={cn("flex-wrap gap-2 p-4", isOpen ? "flex" : "hidden")}>
                {list.map((d) =>
                  mode === "browse" ? (
                    <li key={d.slug}>
                      <Link href={`/district/${d.slug}`} className="inline-flex h-10 items-center rounded-full bg-moss px-3.5 text-sm font-medium transition hover:bg-emerald-soft hover:text-forest active:scale-95">{dn(d)}</Link>
                    </li>
                  ) : (
                    <li key={d.slug}>
                      <button
                        aria-pressed={visited(d.slug)}
                        onClick={gate(() => actions.toggleDistrict(d.slug, "visited"))}
                        className={cn(
                          "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition active:scale-95",
                          visited(d.slug) ? "text-white" : "bg-moss text-ink hover:bg-emerald-soft",
                        )}
                        style={visited(d.slug) ? { background: theme.visited } : undefined}
                      >
                        {visited(d.slug) && <Check className="size-3.5" />}
                        {dn(d)}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>
          );
        })}
      </div>
      )}
      </div>
    </section>
  );
}
