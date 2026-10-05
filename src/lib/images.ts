import images from "@/data/images.json";

export interface ImageInfo {
  url: string;
  author: string;
  license: string;
  page: string;
}

const table = images as Record<string, ImageInfo>;

export const imageFor = (id: string): ImageInfo | undefined => table[id];
export const allImages = () => Object.entries(table);
