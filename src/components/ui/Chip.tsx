import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Chip({ active, className, ...rest }: { active?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition duration-200 active:scale-[0.97] md:h-10",
        active ? "border-forest bg-forest text-white shadow-soft" : "border-line bg-card text-ink hover:border-forest/40 hover:bg-moss",
        className,
      )}
      {...rest}
    />
  );
}
