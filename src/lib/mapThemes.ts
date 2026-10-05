export interface MapTheme {
  key: string;
  label: string;
  visited: string;
  want: string;
  favorite: string;
  base: string;
  cardFrom: string;
  cardTo: string;
  cardBase: string;
  cardVisited: string;
  light?: boolean;
  ink: string;
  sub: string;
  accent: string;
  track: string;
}

export const mapThemes: MapTheme[] = [
  { key: "natural", label: "Natural", visited: "#3f8f5a", want: "#5aa6cf", favorite: "#e0932f", base: "#dfe8cc", cardFrom: "#f8f4e8", cardTo: "#e6edd6", cardBase: "#cddab4", cardVisited: "#3f8f5a", light: true, ink: "#1d2b22", sub: "#5b6b60", accent: "#b8741a", track: "rgba(29,43,34,0.12)" },
  { key: "emerald", label: "Emerald", visited: "#12805c", want: "#5da4c9", favorite: "#e9a23b", base: "#cfe4d5", cardFrom: "#0f4d3a", cardTo: "#082b20", cardBase: "#1b5a47", cardVisited: "#2fc08a", ink: "#ffffff", sub: "#a9cdbd", accent: "#e9a23b", track: "rgba(255,255,255,0.15)" },
  { key: "ocean", label: "Ocean", visited: "#1f6fb2", want: "#7cc4d9", favorite: "#f2a33a", base: "#d3e4ee", cardFrom: "#123a63", cardTo: "#081f38", cardBase: "#1d4f7a", cardVisited: "#4aa3e8", ink: "#ffffff", sub: "#a9cdbd", accent: "#e9a23b", track: "rgba(255,255,255,0.15)" },
  { key: "sunset", label: "Sunset", visited: "#d9622b", want: "#e9a23b", favorite: "#b5276a", base: "#f1dfcf", cardFrom: "#6b2a14", cardTo: "#3a1409", cardBase: "#7c3a22", cardVisited: "#f2894a", ink: "#ffffff", sub: "#a9cdbd", accent: "#e9a23b", track: "rgba(255,255,255,0.15)" },
  { key: "violet", label: "Violet", visited: "#6a4fc4", want: "#a28be0", favorite: "#e9a23b", base: "#e1daf2", cardFrom: "#3a2a78", cardTo: "#1c1340", cardBase: "#4a3b90", cardVisited: "#9a82f0", ink: "#ffffff", sub: "#a9cdbd", accent: "#e9a23b", track: "rgba(255,255,255,0.15)" },
  { key: "rose", label: "Rose", visited: "#c2406a", want: "#e79ab3", favorite: "#e9a23b", base: "#f3dde4", cardFrom: "#6e1f3b", cardTo: "#3a0f20", cardBase: "#822f4d", cardVisited: "#ee6b92", ink: "#ffffff", sub: "#a9cdbd", accent: "#e9a23b", track: "rgba(255,255,255,0.15)" },
  { key: "slate", label: "Slate", visited: "#2f3b4a", want: "#8a98a8", favorite: "#e9a23b", base: "#dfe3e6", cardFrom: "#2a323c", cardTo: "#14181d", cardBase: "#3a4450", cardVisited: "#8fa3b8", ink: "#ffffff", sub: "#a9cdbd", accent: "#e9a23b", track: "rgba(255,255,255,0.15)" },
];

export const getMapTheme = (key?: string): MapTheme => mapThemes.find((t) => t.key === key) ?? mapThemes[0];
