import images from "@/data/images.json";
import mine from "@/data/my-images.json";

export interface ImageInfo {
  url: string;
  author: string;
  license: string;
  page: string;
}

const table = images as Record<string, ImageInfo>;
/** Photos you add by hand in src/data/my-images.json win over the downloaded ones. */
const overrides = mine as Record<string, Partial<ImageInfo> & { url: string }>;

export const imageFor = (id: string): ImageInfo | undefined => {
  const own = overrides[id];
  if (own?.url) return { author: "Ghuri Bangladesh", license: "Own photo", page: "", ...own };
  return table[id];
};
export const allImages = () => Object.entries({ ...table, ...Object.fromEntries(Object.keys(overrides).map((k) => [k, imageFor(k)!])) });
