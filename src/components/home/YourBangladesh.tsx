"use client";

import Link from "next/link";
import { useProgress, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { buttonClass } from "../ui/Button";
import { Progress } from "../ui/Progress";
import { Skeleton } from "../ui/Skeleton";
import { T } from "@/components/T";

export function YourBangladesh() {
  const { t } = useT();
  const s = useStore();
  const p = useProgress();
  if (!s.hydrated) return <Skeleton className="h-48 w-full rounded-3xl" />;
  const n = p.visitedDistricts.length;
  return (
    <div className="grid gap-6 rounded-3xl border border-line bg-card p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center md:p-10">
      <div>
        <p className="eyebrow">{t("Your Bangladesh")}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-4xl">
          {n ? <><T>You&apos;ve explored</T> <span className="text-emerald">{n} / 64</span> districts.</> : <><T>Your map is waiting.</T> <span className="text-emerald">0 / 64</span>.</>}
        </h2>
        <p className="mt-2 max-w-xl leading-relaxed text-muted">
          {n ? "Every district you mark turns green on your personal map." : "Mark the districts you've visited and watch your own Bangladesh fill in, one district at a time."}
        </p>
        <Progress value={n} max={64} className="mt-5 max-w-xl" />
      </div>
      <Link href="/my-map" className={buttonClass("primary", "lg", "w-full md:w-auto")}>{t("View My Map")}</Link>
    </div>
  );
}
