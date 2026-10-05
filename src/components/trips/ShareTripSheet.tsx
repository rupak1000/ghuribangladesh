"use client";

import { useEffect, useState } from "react";
import { Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { publishTrip } from "@/lib/publish";
import { tripToText } from "@/lib/planner";
import type { Trip } from "@/lib/store";
import { copyText } from "@/lib/clipboard";
import { uiActions } from "@/lib/ui";
import { Button } from "../ui/Button";
import { Sheet } from "../ui/Sheet";
import { T } from "@/components/T";
import { useT } from "@/lib/i18n";
import { siteOrigin } from "@/lib/site";

type Outcome = { ok: true; id: string } | { ok: false; error: string };

export function ShareTripSheet({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const { t } = useT();
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    let live = true;
    publishTrip(trip).then((r) => live && setOutcome(r));
    return () => {
      live = false;
    };
  }, [trip]);

  const state = !outcome
    ? { status: "loading" as const, url: undefined, error: undefined }
    : outcome.ok
      ? { status: "ready" as const, url: `${siteOrigin()}/trip/${outcome.id}`, error: undefined }
      : { status: "failed" as const, url: undefined, error: outcome.error };

  const message = `${trip.name}: a ${trip.days.length}-day plan on Ghuri Bangladesh.`;
  const full = state.url ? `${message} ${state.url}` : tripToText(trip);

  const copy = async (value: string, done: string) => {
    uiActions.toast((await copyText(value)) ? done : "Couldn't copy. Select the text and copy it.");
  };

  return (
    <Sheet open onClose={onClose} title={t("Share trip with friends")} className="md:max-w-md">
      <h2 className="pr-8 font-display text-2xl font-semibold"><T>Share with friends</T></h2>
      <p className="mt-1 text-sm text-muted"><T>Friends get a read-only page with your route, costs and day-by-day plan. No account needed.</T></p>

      {state.status === "loading" && <p className="mt-5 rounded-2xl bg-moss px-4 py-3 text-sm text-muted" aria-live="polite"><T>Creating your link…</T></p>}

      {state.status === "failed" && (
        <div className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm">
          <p className="font-semibold">Couldn&apos;t make a link ({state.error}).</p>
          <p className="mt-1 text-muted"><T>You can still send the full plan as text.</T></p>
        </div>
      )}

      {state.status === "ready" && state.url && (
        <input readOnly value={state.url} onFocus={(e) => e.currentTarget.select()} aria-label="Trip link" className="mt-5 h-12 w-full rounded-full border border-line bg-white px-4 text-sm font-medium" />
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {state.status === "ready" && state.url ? (
          <Button onClick={() => copy(state.url!, "Link copied")}><Copy className="size-4" aria-hidden /> Copy link</Button>
        ) : (
          <Button disabled={state.status === "loading"} onClick={() => copy(tripToText(trip), "Plan copied as text")}><Copy className="size-4" aria-hidden /> <T>Copy as text</T></Button>
        )}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(full)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={state.status === "loading"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1f9d55] px-5 text-sm font-semibold text-white transition hover:brightness-95 active:scale-[0.97]"
        >
          <MessageCircle className="size-4" aria-hidden /> WhatsApp
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(trip.name)}&body=${encodeURIComponent(full)}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold transition hover:bg-moss active:scale-[0.97]"
        >
          <Mail className="size-4" aria-hidden /> Email
        </a>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <Button
            variant="secondary"
            onClick={() => navigator.share({ title: trip.name, text: message, url: state.url }).catch(() => undefined)}
            disabled={state.status === "loading"}
          >
            <Share2 className="size-4" aria-hidden /> <T>More…</T>
          </Button>
        )}
      </div>
    </Sheet>
  );
}
