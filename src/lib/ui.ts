"use client";

import { useSyncExternalStore } from "react";

export interface Toast {
  id: number;
  message: string;
}

interface UIState {
  authOpen: boolean;
  searchOpen: boolean;
  toasts: Toast[];
}

let ui: UIState = { authOpen: false, searchOpen: false, toasts: [] };
const listeners = new Set<() => void>();
let toastId = 0;

function set(patch: Partial<UIState>) {
  ui = { ...ui, ...patch };
  listeners.forEach((l) => l());
}

export function useUI() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => ui,
    () => ui,
  );
}

export const uiActions = {
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  toast(message: string) {
    const id = ++toastId;
    set({ toasts: [...ui.toasts, { id, message }] });
    setTimeout(() => set({ toasts: ui.toasts.filter((t) => t.id !== id) }), 2600);
  },
};
