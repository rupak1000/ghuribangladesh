import { districts } from "@/data/districts";
import { places } from "@/data/places";
import { foods } from "@/data/foods";
import { experiences } from "@/data/experiences";
import type { Category, District, Division, Experience, Food, Place } from "./types";

export { districts, places, foods, experiences };

export const divisions: Division[] = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"];

const districtBySlug = new Map(districts.map((d) => [d.slug, d]));
const placeById = new Map(places.map((p) => [p.id, p]));
const foodById = new Map(foods.map((f) => [f.id, f]));

export const getDistrict = (slug: string): District | undefined => districtBySlug.get(slug);
export const getPlace = (id: string): Place | undefined => placeById.get(id);
export const getFood = (id: string): Food | undefined => foodById.get(id);

const group = <T extends { districtSlug: string }>(items: T[]) => {
  const m = new Map<string, T[]>();
  for (const i of items) m.set(i.districtSlug, [...(m.get(i.districtSlug) ?? []), i]);
  return m;
};
const placesByDistrict = group(places);
const foodsByDistrict = group(foods);
const expByDistrict = group(experiences);

export const placesOf = (slug: string): Place[] => placesByDistrict.get(slug) ?? [];
export const foodsOf = (slug: string): Food[] => foodsByDistrict.get(slug) ?? [];
export const experiencesOf = (slug: string): Experience[] => expByDistrict.get(slug) ?? [];

export function districtStats(slug: string) {
  const ps = placesOf(slug);
  return {
    places: ps.length,
    foods: foodsOf(slug).length,
    experiences: experiencesOf(slug).length,
    hidden: ps.filter((p) => p.hidden).length,
  };
}

export function districtCategories(slug: string): Category[] {
  const set = new Set<Category>();
  placesOf(slug).forEach((p) => p.categories.forEach((c) => set.add(c)));
  if (foodsOf(slug).length) set.add("food");
  return [...set];
}

export function nearbyPlaces(place: Place, limit = 4): Place[] {
  const rad = (x: number) => (x * Math.PI) / 180;
  const dist = (a: Place) => {
    const dLat = rad(a.lat - place.lat);
    const dLng = rad(a.lng - place.lng) * Math.cos(rad(place.lat));
    return Math.hypot(dLat, dLng);
  };
  return places
    .filter((p) => p.id !== place.id)
    .map((p) => ({ p, d: dist(p) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.p);
}

export function nearbyFoods(place: Place, limit = 3): Food[] {
  const local = foodsOf(place.districtSlug);
  if (local.length >= limit) return local.slice(0, limit);
  const d = getDistrict(place.districtSlug);
  const rest = foods
    .filter((f) => f.districtSlug !== place.districtSlug && getDistrict(f.districtSlug)?.division === d?.division)
    .slice(0, limit - local.length);
  return [...local, ...rest];
}

export function topPlaces(n: number) {
  return [...places].sort((a, b) => b.rating - a.rating).slice(0, n);
}
