import type { Metadata } from "next";
import { PublicProfile } from "@/components/PublicProfile";
import { decodeShare } from "@/lib/share";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const d = decodeShare(await searchParams);
  return { title: `${d.name}'s Bangladesh`, description: `${d.name} has explored ${d.visited.length} of 64 districts.` };
}

export default async function LegacyProfile({ searchParams }: { searchParams: SP }) {
  return <PublicProfile d={decodeShare(await searchParams)} />;
}
