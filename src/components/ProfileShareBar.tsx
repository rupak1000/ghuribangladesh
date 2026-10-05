"use client";

import { Copy, Share2 } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { useT } from "@/lib/i18n";
import { uiActions } from "@/lib/ui";
import { Button } from "./ui/Button";
import { siteOrigin } from "@/lib/site";

/** Share controls for a public profile page. Everything runs straight from the tap so phones allow it. */
export function ProfileShareBar({ name, districts }: { name: string; districts: number }) {
  const { t } = useT();
  const text = `${name} has explored ${districts} of 64 districts of Bangladesh on Ghuri Bangladesh.`;

  const copy = async () => {
    uiActions.toast((await copyText(`${siteOrigin()}${window.location.pathname}`)) ? "Link copied" : "Couldn't copy. Copy the link from the address bar.");
  };

  const share = () => {
    if (!navigator.share) {
      void copy();
      return;
    }
    navigator.share({ title: `${name}'s Bangladesh`, text, url: `${siteOrigin()}${window.location.pathname}` }).catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "AbortError") return;
      void copy();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={share}><Share2 className="size-4" aria-hidden /> {t("Share")}</Button>
      <Button variant="secondary" onClick={copy}><Copy className="size-4" aria-hidden /> {t("Copy link")}</Button>
    </div>
  );
}
