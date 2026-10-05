import type { Metadata } from "next";
import { FoodView } from "@/components/food/FoodView";

export const metadata: Metadata = { title: "Taste Bangladesh" };

export default async function FoodPage({ searchParams }: { searchParams: Promise<{ district?: string }> }) {
  const { district } = await searchParams;
  return <FoodView initialDistrict={district} />;
}
