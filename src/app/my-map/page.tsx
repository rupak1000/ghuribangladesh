import type { Metadata } from "next";
import { MyMapView } from "@/components/me/MyMapView";

export const metadata: Metadata = { title: "My Bangladesh" };

export default function MyMapPage() {
  return <MyMapView />;
}
