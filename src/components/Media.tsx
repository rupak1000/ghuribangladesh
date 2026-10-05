/* eslint-disable @next/next/no-img-element */
import type { Category } from "@/lib/types";
import { imageFor } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Cover } from "./Cover";

interface Props {
  id: string;
  seed: string;
  category: Category;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function Media({ id, seed, category, alt, className, priority }: Props) {
  const img = imageFor(id);
  if (!img) return <Cover seed={seed} category={category} className={cn("h-full w-full", className)} />;
  return (
    <img
      src={img.url}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

export function PhotoCredit({ id, className }: { id: string; className?: string }) {
  const img = imageFor(id);
  if (!img) return null;
  return (
    <a
      href={img.page}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-[11px] text-white/85 underline-offset-2 hover:underline", className)}
    >
      Photo: {img.author} · {img.license} · Wikimedia Commons
    </a>
  );
}
