import type { Category, Division, Style } from "./types";

export interface CategoryMeta {
  key: Category;
  label: string;
  bn: string;
  emoji: string;
  color: string;
}

export const categories: CategoryMeta[] = [
  { key: "nature", label: "Nature", bn: "প্রকৃতি", emoji: "🌿", color: "#2f8f5b" },
  { key: "history", label: "History", bn: "ইতিহাস", emoji: "🏛️", color: "#b0733a" },
  { key: "food", label: "Food", bn: "খাবার", emoji: "🍛", color: "#d9822b" },
  { key: "adventure", label: "Adventure", bn: "অ্যাডভেঞ্চার", emoji: "🏔️", color: "#6a5fb8" },
  { key: "beach", label: "Beach", bn: "সৈকত", emoji: "🌊", color: "#2f7fa8" },
  { key: "culture", label: "Culture", bn: "সংস্কৃতি", emoji: "🎭", color: "#b5476a" },
  { key: "wildlife", label: "Wildlife", bn: "বন্যপ্রাণী", emoji: "🦌", color: "#7a8a2f" },
];

export const categoryMeta = Object.fromEntries(categories.map((c) => [c.key, c])) as Record<Category, CategoryMeta>;

export const styles: { key: Style; label: string; bn: string }[] = [
  { key: "family", label: "Family", bn: "পরিবার" },
  { key: "couple", label: "Couple", bn: "দম্পতি" },
  { key: "solo", label: "Solo", bn: "একা" },
  { key: "photography", label: "Photography", bn: "ফটোগ্রাফি" },
  { key: "budget", label: "Budget", bn: "সাশ্রয়ী" },
  { key: "luxury", label: "Luxury", bn: "বিলাসবহুল" },
];

export const divisionBn: Record<Division, string> = {
  Dhaka: "ঢাকা", Chattogram: "চট্টগ্রাম", Sylhet: "সিলেট", Rajshahi: "রাজশাহী",
  Khulna: "খুলনা", Barishal: "বরিশাল", Rangpur: "রংপুর", Mymensingh: "ময়মনসিংহ",
};
