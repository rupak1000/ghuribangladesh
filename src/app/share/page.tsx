import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { buildShareSvg, decodeShare } from "@/lib/share";
import { T } from "@/components/T";

export const metadata: Metadata = { title: "My Bangladesh" };

export default async function SharePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = decodeShare(await searchParams);
  const svg = buildShareSvg(data);
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald"><T>Shared with you</T></p>
      <h1 className="mt-1 font-display text-3xl font-semibold">{data.name}&apos;s Bangladesh</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={`${data.name} has explored ${data.visited.length} of 64 districts`} className="mx-auto mt-6 w-full max-w-md rounded-3xl shadow-lift" />
      <div className="mt-8 flex justify-center gap-3">
        <LinkButton href="/my-map" size="lg"><T>Start your own map</T></LinkButton>
        <LinkButton href="/explore" variant="secondary" size="lg">Explore</LinkButton>
      </div>
    </div>
  );
}
