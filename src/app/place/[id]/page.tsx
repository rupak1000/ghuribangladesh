import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaceView } from "@/components/place/PlaceView";
import { getPlace, places } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => places.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = getPlace((await params).id);
  return p ? { title: p.name, description: p.blurb } : {};
}

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPlace(id)) notFound();
  return <PlaceView id={id} />;
}
