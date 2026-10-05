import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold tabular-nums", className)} title="Editor's rating">
      <Star className="size-3.5 fill-amber text-amber" aria-hidden />
      <span>{value.toFixed(1)}</span>
    </span>
  );
}
