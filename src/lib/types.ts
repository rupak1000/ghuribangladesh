export type Category = "nature" | "history" | "food" | "adventure" | "beach" | "culture" | "wildlife";
export type Style = "family" | "couple" | "solo" | "photography" | "budget" | "luxury";
export type Division =
  | "Dhaka" | "Chattogram" | "Sylhet" | "Rajshahi" | "Khulna" | "Barishal" | "Rangpur" | "Mymensingh";

export interface District {
  slug: string;
  name: string;
  bn: string;
  division: Division;
  lat: number;
  lng: number;
  tagline: string;
  about: string;
}

export interface Place {
  id: string;
  districtSlug: string;
  name: string;
  categories: Category[];
  styles: Style[];
  rating: number;
  blurb: string;
  bestTime: string;
  budget: string;
  lat: number;
  lng: number;
  hidden: boolean;
  exact: boolean;
  thingsToDo: string[];
}

export interface Food {
  id: string;
  districtSlug: string;
  name: string;
  bn: string;
  blurb: string;
  rating: number;
  price: string;
}

export interface Experience {
  id: string;
  districtSlug: string;
  title: string;
  blurb: string;
  category: Category;
}

export type Mark = "visited" | "want" | "favorite";
export type FoodMark = "tried" | "want" | "favorite";
