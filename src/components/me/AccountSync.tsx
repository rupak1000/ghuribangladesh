"use client";

import { useEffect } from "react";
import { startAccountSync } from "@/lib/accountClient";

/** Mounts the background sync between this device and the signed-in online account. */
export function AccountSync() {
  useEffect(() => {
    startAccountSync();
  }, []);
  return null;
}
