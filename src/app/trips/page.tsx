import type { Metadata } from "next";
import { TripPlanner } from "@/components/trips/TripPlanner";

export const metadata: Metadata = { title: "Plan Your Trip" };

export default function TripsPage() {
  return <TripPlanner />;
}
