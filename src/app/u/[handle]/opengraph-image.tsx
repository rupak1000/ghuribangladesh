import { ImageResponse } from "next/og";
import { districts } from "@/lib/data";
import { MAP_H, MAP_W, districtShapes } from "@/lib/geo";
import { getMapTheme } from "@/lib/mapThemes";
import { getProfile } from "@/lib/profileStore";

export const alt = "Travel profile on Ghuri Bangladesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const p = await getProfile((await params).handle);
  const d = p?.data;
  const th = getMapTheme(d?.theme);
  const visited = new Set(d?.visited ?? []);
  const want = new Set(d?.want ?? []);
  const fav = new Set(d?.fav ?? []);
  const name = d?.name ?? "A traveler";
  const stat = (value: number | string, label: string) => (
    <div style={{ display: "flex", flexDirection: "column", marginRight: 44 }}>
      <div style={{ fontSize: 54, fontWeight: 700, color: th.ink }}>{String(value)}</div>
      <div style={{ fontSize: 22, color: th.sub, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: `linear-gradient(135deg, ${th.cardFrom}, ${th.cardTo})`, padding: 60 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: th.accent, letterSpacing: 6 }}>MY BANGLADESH</div>
            <div style={{ fontSize: name.length > 16 ? 64 : 82, fontWeight: 700, color: th.ink, marginTop: 18, lineHeight: 1.05 }}>{name}</div>
            {d?.bio ? <div style={{ fontSize: 28, color: th.sub, marginTop: 14 }}>{d.bio}</div> : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", marginBottom: 28 }}>
              {stat(`${d?.visited.length ?? 0}/64`, "Districts")}
              {stat(d?.visitedPlaces?.length ?? 0, "Places")}
              {stat(d?.triedFoods?.length ?? 0, "Foods")}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: th.ink }}>Ghuri Bangladesh · #GhuriBangladesh</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 440 }}>
          <svg width="400" height={Math.round((400 * MAP_H) / MAP_W)} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
            {districts.map((x) => (
              <path
                key={x.slug}
                d={districtShapes[x.slug].d}
                fill={fav.has(x.slug) ? th.favorite : visited.has(x.slug) ? th.cardVisited : want.has(x.slug) ? th.want : th.cardBase}
                stroke={th.cardTo}
                strokeWidth={1.5}
              />
            ))}
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
