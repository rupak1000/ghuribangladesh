import type { Place } from "./types";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  hint: string;
  progress: number;
  target: number;
}

export function achievements(p: { visitedDistricts: unknown[]; triedFoods: unknown[]; visitedPlaces: Place[] }): Achievement[] {
  const adventure = p.visitedPlaces.filter((x) => x.categories.includes("adventure")).length;
  const photo = p.visitedPlaces.filter((x) => x.styles.includes("photography")).length;
  const rows: Omit<Achievement, "progress">[] = [
    { id: "first", icon: "🏆", title: "First District", hint: "Mark your first district as visited", target: 1 },
    { id: "ten", icon: "🏆", title: "10 Districts", hint: "Visit 10 districts", target: 10 },
    { id: "half", icon: "🏆", title: "Halfway There", hint: "Visit 32 districts", target: 32 },
    { id: "all", icon: "🏆", title: "All 64 Districts", hint: "Visit every district", target: 64 },
    { id: "food", icon: "🍛", title: "Food Explorer", hint: "Try 10 local foods", target: 10 },
    { id: "adv", icon: "🏔️", title: "Adventure Seeker", hint: "Visit 5 adventure places", target: 5 },
    { id: "photo", icon: "📸", title: "Photo Hunter", hint: "Visit 5 photogenic places", target: 5 },
  ];
  const values: Record<string, number> = {
    first: p.visitedDistricts.length, ten: p.visitedDistricts.length, half: p.visitedDistricts.length,
    all: p.visitedDistricts.length, food: p.triedFoods.length, adv: adventure, photo,
  };
  return rows.map((r) => ({ ...r, progress: Math.min(values[r.id], r.target) }));
}
