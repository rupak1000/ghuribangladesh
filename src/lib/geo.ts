import mapData from "@/data/map-paths.json";

export const MAP_W: number = mapData.width;
export const MAP_H: number = mapData.height;
export const districtShapes = mapData.districts as Record<string, { d: string; cx: number; cy: number }>;

const { scale, translate } = mapData.projection;

export function project(lat: number, lng: number): [number, number] {
  const lam = (lng * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  return [translate[0] + scale * lam, translate[1] - scale * Math.log(Math.tan(Math.PI / 4 + phi / 2))];
}
