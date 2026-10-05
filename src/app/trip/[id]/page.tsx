import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripShareView } from "@/components/trips/TripShareView";
import { getSharedTrip } from "@/lib/tripStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const t = await getSharedTrip((await params).id);
  return t ? { title: t.name, description: `${t.days.length}-day trip plan on Ghuri Bangladesh.` } : {};
}

export default async function SharedTripPage({ params }: { params: Promise<{ id: string }> }) {
  const trip = await getSharedTrip((await params).id);
  if (!trip) notFound();
  return <TripShareView trip={trip} />;
}
