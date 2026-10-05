import type { ReactNode } from "react";
import type { Category } from "@/lib/types";
import { Media, PhotoCredit } from "./Media";

export function PhotoHero({
  imageId, seed, category, alt, children, className = "h-[52dvh] min-h-[360px] md:h-[56dvh]",
}: { imageId: string; seed: string; category: Category; alt: string; children: ReactNode; className?: string }) {
  return (
    <section className={`on-dark relative isolate overflow-hidden bg-forest ${className}`}>
      <Media id={imageId} seed={seed} category={category} alt={alt} priority className="absolute inset-0 -z-10" />
      <div className="scrim-bottom absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-forest/40 to-transparent" />
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-6 text-white md:px-6 md:pb-12">
        {children}
        <PhotoCredit id={imageId} className="mt-4 self-start" />
      </div>
    </section>
  );
}
