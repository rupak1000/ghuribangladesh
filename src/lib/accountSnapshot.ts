import type { FoodMark, Mark } from "./types";
import type { Trip } from "./store";

export type MarkMap<K extends string> = Record<string, Partial<Record<K, true>>>;

export interface AccountSnapshot {
  v: 1;
  districtMarks: MarkMap<Mark>;
  placeMarks: MarkMap<Mark>;
  foodMarks: MarkMap<FoodMark>;
  trips: Trip[];
  profile: { name: string; bio: string; homeDistrict: string | null; mapTheme: string; lang: "en" | "bn" };
}
