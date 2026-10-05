"use client";

import { useMemo, useState } from "react";
import { Download, FileImage, Frame, Printer } from "lucide-react";
import { useProgress, useStore } from "@/lib/store";
import { uiActions } from "@/lib/ui";
import { downloadBlob, svgToPngBlob } from "@/lib/share";
import { buildWallMapSvg, pixelSize, sizeOf, wallFrames, wallSizes, wallStyles, type WallFrame, type WallSizeKey, type WallStyle } from "@/lib/wallMap";
import { useShareData } from "../me/parts";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import { T } from "@/components/T";

function Toggle({ checked, onChange, children, disabled }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium", disabled && "cursor-not-allowed opacity-50")}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-[#137a58]" />
      {children}
    </label>
  );
}

export function WallMapStudio() {
  const s = useStore();
  const p = useProgress();
  const data = useShareData();
  const [style, setStyle] = useState<WallStyle>("natural");
  const [sizeKey, setSizeKey] = useState<WallSizeKey>("a3");
  const [title, setTitle] = useState("Bangladesh");
  const [subtitleEdit, setSubtitleEdit] = useState<string | null>(null);
  const [byline, setByline] = useState("");
  const [showByline, setShowByline] = useState(true);
  const [labels, setLabels] = useState(true);
  const [bengaliEdit, setBengali] = useState<boolean | null>(null);
  const bengali = bengaliEdit ?? s.lang === "bn";
  const [highlightEdit, setHighlightEdit] = useState<boolean | null>(null);
  const [compass, setCompass] = useState(true);
  const [scaleBar, setScaleBar] = useState(true);
  const [frame, setFrame] = useState<WallFrame>("double");

  const hasVisits = p.visitedDistricts.length + p.wantDistricts.length + p.favDistricts.length > 0;
  const highlight = highlightEdit ?? hasVisits;
  const subtitle = subtitleEdit ?? (highlight && hasVisits ? `${p.visitedDistricts.length} of 64 districts explored` : "64 districts · 8 divisions");
  const name = s.user?.name ?? "";
  const bylineText = byline || name;

  const svg = useMemo(
    () => buildWallMapSvg({ style, size: sizeKey, title, subtitle, byline: bylineText, showByline, labels, bengali, highlight: highlight && hasVisits, compass, scaleBar, frame, data }),
    [style, sizeKey, title, subtitle, bylineText, showByline, labels, bengali, highlight, hasVisits, compass, scaleBar, frame, data],
  );
  const preview = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);
  const size = sizeOf(sizeKey);
  const px = pixelSize(size);
  const fileBase = `${(title || "bangladesh").trim().replace(/\s+/g, "-").toLowerCase()}-wall-map-${size.key}`;

  const downloadSvg = () => downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${fileBase}.svg`);
  const downloadPng = async () => {
    try {
      const sized = svg.replace(/width="[\d.]+mm" height="[\d.]+mm"/, `width="${px.w}" height="${px.h}"`);
      downloadBlob(await svgToPngBlob(sized, px.w, px.h), `${fileBase}.png`);
    } catch {
      uiActions.toast("Couldn't make the PNG on this device. Try the SVG or a smaller size.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 print:m-0 print:max-w-none print:p-0">
      <style>{`@media print { @page { size: ${size.w}mm ${size.h}mm; margin: 0; } }`}</style>

      <div className="print:hidden">
        <p className="eyebrow"><T>Wall map</T></p>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight md:text-5xl"><T>Print Bangladesh for your wall</T></h1>
        <p className="mt-2 max-w-2xl text-base text-muted md:text-lg"><T>Make a poster-quality map of all 64 districts. Choose a style and paper size, add your own title, then download it or print it for framing.</T></p>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] print:mt-0 print:block">
        <div className="rounded-3xl border border-line bg-[#e9e6dc] p-4 shadow-soft md:p-8 print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={`Preview of the ${size.label} wall map`}
            className="mx-auto h-auto max-h-[78dvh] w-auto max-w-full bg-white shadow-lift print:max-h-none print:shadow-none"
            style={{ aspectRatio: `${size.w} / ${size.h}` }}
            id="wall-poster"
          />
          <style>{`@media print { #wall-poster { width: ${size.w}mm !important; height: ${size.h}mm !important; max-width: none !important; } }`}</style>
        </div>

        <aside className="space-y-4 print:hidden lg:sticky lg:top-24">
          <section className="rounded-3xl border border-line bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">1. Style</h2>
            <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Map style">
              {wallStyles.map((x) => (
                <button
                  key={x.key}
                  role="radio"
                  aria-checked={style === x.key}
                  onClick={() => setStyle(x.key)}
                  className={cn("rounded-2xl border p-3 text-left transition active:scale-[0.98]", style === x.key ? "border-forest bg-moss ring-2 ring-forest" : "border-line bg-white hover:border-forest/40")}
                >
                  <span className="flex gap-1">{x.swatch.map((c) => <span key={c} className="size-4 rounded-full border border-black/10" style={{ background: c }} />)}</span>
                  <span className="mt-1.5 block text-sm font-semibold">{x.label}</span>
                  <span className="block text-[11px] leading-tight text-muted">{x.blurb}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">2. Paper & frame</h2>
            <label className="mt-3 block text-sm font-medium">
              <T>Size</T>
              <select value={sizeKey} onChange={(e) => setSizeKey(e.target.value as WallSizeKey)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm">
                {wallSizes.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
              </select>
            </label>
            <label className="mt-3 block text-sm font-medium">
              <T>Border</T>
              <select value={frame} onChange={(e) => setFrame(e.target.value as WallFrame)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm">
                {wallFrames.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
              </select>
            </label>
          </section>

          <section className="rounded-3xl border border-line bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">3. Words & details</h2>
            <label className="mt-3 block text-sm font-medium"><T>Title</T>
              <input value={title} maxLength={32} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-emerald" />
            </label>
            <label className="mt-3 block text-sm font-medium"><T>Subtitle</T>
              <input value={subtitle} maxLength={48} onChange={(e) => setSubtitleEdit(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-emerald" />
            </label>
            <Toggle checked={showByline} onChange={setShowByline}><T>Add a line with my name</T></Toggle>
            {showByline && (
              <input value={byline} placeholder={bylineText || "Your name"} maxLength={60} onChange={(e) => setByline(e.target.value)} aria-label="Name line" className="mb-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-emerald" />
            )}
            <Toggle checked={labels} onChange={setLabels}><T>Show district names</T></Toggle>
            {labels && <Toggle checked={bengali} onChange={setBengali}>Names in বাংলা</Toggle>}
            <Toggle checked={highlight} onChange={setHighlightEdit} disabled={!hasVisits}>Show my map: visited, want to visit and favorite districts{!hasVisits ? " (mark some on My Map first)" : ""}</Toggle>
            <Toggle checked={compass} onChange={setCompass}><T>Compass</T></Toggle>
            <Toggle checked={scaleBar} onChange={setScaleBar}><T>Scale bar (100 km)</T></Toggle>
          </section>

          <section className="rounded-3xl border border-line bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">4. Get your map</h2>
            <div className="mt-3 grid gap-2">
              <Button onClick={downloadPng}><FileImage className="size-4" aria-hidden /> Download PNG ({px.w} × {px.h} px)</Button>
              <Button variant="secondary" onClick={downloadSvg}><Download className="size-4" aria-hidden /> <T>Download SVG (any size)</T></Button>
              <Button variant="secondary" onClick={() => window.print()}><Printer className="size-4" aria-hidden /> <T>Print or save as PDF</T></Button>
            </div>
            <div className="mt-4 rounded-2xl bg-amber-soft p-3.5 text-xs leading-relaxed text-ink/85">
              <p className="flex items-center gap-1.5 font-semibold"><Frame className="size-3.5" aria-hidden /> <T>Framing and printing tips</T></p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4">
                <li><T>Pick the paper size of your frame. A4, A3, A2 and A1 fit standard frames.</T></li>
                <li><T>Choose &ldquo;Frame mat&rdquo; for a wide white border, so a frame never covers the map.</T></li>
                <li>For a print shop, send the PNG ({size.dpi} dpi at this size) or the SVG, which stays sharp at any size.</li>
                <li><T>To print at home, choose &ldquo;Print or save as PDF&rdquo;, set margins to None and scale to 100%.</T></li>
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
