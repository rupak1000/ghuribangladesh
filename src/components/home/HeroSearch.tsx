"use client";

import { Search } from "lucide-react";
import { uiActions } from "@/lib/ui";
import { useT } from "@/lib/i18n";

export function HeroSearch() {
  const { t } = useT();
  return (
    <button
      onClick={uiActions.openSearch}
      className="group mx-auto flex h-14 w-full max-w-2xl items-center gap-3 rounded-full bg-white px-5 text-left text-base text-muted shadow-float transition duration-200 hover:shadow-[0_24px_48px_-14px_rgb(0_0_0/0.5)] active:scale-[0.99] md:h-16 md:text-lg"
      aria-label={t("Search")}
    >
      <Search className="size-5 shrink-0 text-emerald" aria-hidden />
      <span className="flex-1 truncate">{t("Search districts, places, food...")}</span>
      <kbd className="hidden rounded-lg bg-moss px-2 py-1 text-xs font-semibold text-forest md:block">⌘K</kbd>
    </button>
  );
}
