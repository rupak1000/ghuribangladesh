import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/PublicProfile";
import { getProfile } from "@/lib/profileStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = await getProfile((await params).handle);
  return p ? { title: `${p.data.name}'s Bangladesh`, description: `${p.data.name} has explored ${p.data.visited.length} of 64 districts.` } : {};
}

export default async function ProfileByHandle({ params }: { params: Promise<{ handle: string }> }) {
  const p = await getProfile((await params).handle);
  if (!p) notFound();
  return <PublicProfile d={p.data} updatedAt={p.updatedAt} />;
}
