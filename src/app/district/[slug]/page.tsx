import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DistrictView } from "@/components/district/DistrictView";
import { districts, getDistrict } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => districts.map((d) => ({ slug: d.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = getDistrict((await params).slug);
  return d ? { title: d.name, description: d.tagline } : {};
}

export default async function DistrictPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { slug } = await params;
  if (!getDistrict(slug)) notFound();
  const { tab } = await searchParams;
  return <DistrictView slug={slug} initialTab={tab} />;
}
