"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Bottom sheet on mobile, centered dialog on desktop. */
export function Sheet({ open, onClose, title, children, className }: Props) {
  const { t } = useT();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label={t("Close")} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative max-h-[88dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-card p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-float animate-sheet md:max-w-md md:rounded-3xl md:p-6 md:animate-pop",
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line md:hidden" />
        <button onClick={onClose} aria-label={t("Close")} className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-ink/70 hover:bg-ink/5 hover:text-ink md:right-4 md:top-4 md:size-10">
          <X className="size-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
