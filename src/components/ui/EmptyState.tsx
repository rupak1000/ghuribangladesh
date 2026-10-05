import type { ReactNode } from "react";
import { LinkButton } from "./Button";

export function EmptyState({
  emoji, title, text, href, cta, action,
}: { emoji: string; title: string; text: string; href?: string; cta?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-emerald/25 bg-moss/50 px-6 py-12 md:py-14 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-card text-3xl shadow-soft" aria-hidden>{emoji}</div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {href && cta && <LinkButton href={href}>{cta}</LinkButton>}
        {action}
      </div>
    </div>
  );
}
