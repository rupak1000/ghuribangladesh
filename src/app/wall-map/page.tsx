import type { Metadata } from "next";
import { WallMapStudio } from "@/components/wall/WallMapStudio";

export const metadata: Metadata = { title: "Wall map", description: "Create a print-ready poster map of Bangladesh's 64 districts for your wall." };

export default function WallMapPage() {
  return <WallMapStudio />;
}
