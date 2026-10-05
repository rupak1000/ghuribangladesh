"use client";

import { useStore } from "./store";
import { uiActions } from "./ui";

/** Wraps an action so guests are prompted to sign in first. */
export function useGate() {
  const { user } = useStore();
  return (fn: () => void) => () => {
    if (!user) {
      uiActions.openAuth();
      return;
    }
    fn();
  };
}
