import type { Metadata } from "next";
import { HelpContent } from "@/components/HelpContent";

export const metadata: Metadata = {
  title: "Help & guide",
  description: "How to use Ghuri Bangladesh: exploring the map, saving places, tracking visits, planning trips, sharing your profile and printing a wall map.",
};

export default function HelpPage() {
  return <HelpContent />;
}
