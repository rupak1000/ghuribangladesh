"use client";

import { useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { publishProfile } from "@/lib/publish";
import { useShareData } from "./parts";

/** Keeps a published public profile in step with the owner's latest map. */
export function ProfileSync() {
  const s = useStore();
  const data = useShareData();
  const key = useMemo(() => JSON.stringify(data), [data]);
  const active = !!s.user && !!s.profileLink && s.hydrated;
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => void publishProfile(JSON.parse(key)), 1500);
    return () => clearTimeout(t);
  }, [active, key]);
  return null;
}
