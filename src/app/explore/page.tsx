import type { Metadata } from "next";
import { ExploreView } from "@/components/explore/ExploreView";
import { categories } from "@/lib/categories";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const initial = categories.find((c) => c.key === category)?.key as Category | undefined;
  return <ExploreView initialCategory={initial} />;
}
