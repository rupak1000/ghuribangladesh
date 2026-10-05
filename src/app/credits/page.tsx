import type { Metadata } from "next";
import { allImages } from "@/lib/images";
import { districts, foods, places } from "@/lib/data";
import { T } from "@/components/T";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  const names = new Map<string, string>([
    ...places.map((p) => [p.id, p.name] as [string, string]),
    ...districts.map((d) => [`district:${d.slug}`, d.name] as [string, string]),
    ...foods.map((f) => [f.id, f.name] as [string, string]),
  ]);
  const rows = allImages().map(([id, img]) => ({ name: names.get(id) ?? id, ...img })).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <h1 className="font-display text-4xl font-semibold"><T>Photo credits</T></h1>
      <p className="mt-3 text-muted">
        Photographs are from Wikimedia Commons and used under their free licences. Thank you to the photographers. Places without a photo show an illustration instead.
        District boundaries come from the Bangladesh Bureau of Statistics via OCHA and geoBoundaries (CC BY 3.0 IGO).
      </p>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card">
        {rows.map((r) => (
          <li key={r.page} className="flex flex-col gap-0.5 px-4 py-3 text-sm sm:flex-row sm:items-baseline sm:justify-between">
            <span className="font-semibold">{r.name}</span>
            <span className="text-muted">{r.author} · {r.license} · <a className="text-emerald underline" href={r.page} target="_blank" rel="noopener noreferrer">source</a></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
