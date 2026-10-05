"use client";

import { Copy, Download, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildShareSvg, downloadBlob, encodeShare, svgToPngBlob, type ShareData } from "@/lib/share";
import { copyText } from "@/lib/clipboard";
import { uiActions } from "@/lib/ui";
import { publishProfile } from "@/lib/publish";
import { getLink } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "./ui/Button";
import { Sheet } from "./ui/Sheet";
import { T } from "@/components/T";

interface Props {
  open: boolean;
  onClose: () => void;
  data: ShareData;
}

export function ShareDialog({ open, onClose, data }: Props) {
  if (!open) return null;
  return <ShareBody onClose={onClose} data={data} />;
}

function ShareBody({ onClose, data }: Omit<Props, "open">) {
  const { t, lang } = useT();
  const svg = useMemo(() => buildShareSvg(data, lang === "bn"), [data, lang]);
  const src = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);
  const [id, setId] = useState<string | null | undefined>(() => getLink()?.id);

  // The link is made as soon as the dialog opens, so the share button can fire straight from the tap.
  // Phones (especially Safari) refuse to open their share sheet if the app waits on the network first.
  useEffect(() => {
    if (id !== undefined) return;
    let live = true;
    publishProfile(data).then((r) => live && setId(r.ok ? r.id : null));
    return () => {
      live = false;
    };
  }, [id, data]);

  const url = id ? `${window.location.origin}/u/${id}` : id === null ? `${window.location.origin}/u?${encodeShare(data)}` : "";
  const text = `${data.name} has explored ${data.visited.length} of 64 districts of Bangladesh on Ghuri Bangladesh. #GhuriBangladesh`;

  const copy = async () => {
    uiActions.toast((await copyText(url)) ? "Link copied" : "Couldn't copy. Select the link and copy it.");
  };

  const share = () => {
    if (!url) return;
    if (!navigator.share) {
      void copy();
      return;
    }
    navigator.share({ title: "My Bangladesh", text, url }).catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "AbortError") return;
      void copy();
    });
  };

  const download = async () => {
    try {
      downloadBlob(await svgToPngBlob(svg), "my-bangladesh.png");
    } catch {
      uiActions.toast("Couldn't create the image. Try again.");
    }
  };

  const loading = !url;

  return (
    <Sheet open onClose={onClose} title={t("Share My Bangladesh")} className="md:max-w-lg">
      <h2 className="mb-4 pr-8 font-display text-2xl font-semibold">{t("Share My Bangladesh")}</h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${data.name}'s My Bangladesh card`} className="mx-auto max-h-[44dvh] w-auto rounded-2xl shadow-soft" />

      <input
        readOnly
        value={loading ? "Creating your link…" : url}
        onFocus={(e) => e.currentTarget.select()}
        aria-label={t("Profile link")}
        className="mt-4 h-12 w-full rounded-full border border-line bg-white px-4 text-sm font-medium"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button disabled={loading} onClick={share}><Share2 className="size-4" aria-hidden /> {t("Share")}</Button>
        <Button variant="secondary" disabled={loading} onClick={copy}><Copy className="size-4" aria-hidden /> Copy link</Button>
        <Button variant="secondary" onClick={download}><Download className="size-4" aria-hidden /> {t("Download")} card</Button>
      </div>
      <p className="mt-4 text-xs text-muted"><T>Sharing creates a short public link to a read-only copy of your profile: name, bio, map, home district (only if you set one), visited places and tried foods. It stays up to date, and you can delete it from Profile. Your email is never included.</T></p>
    </Sheet>
  );
}
