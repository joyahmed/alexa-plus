"use client";

import { useSyncExternalStore } from "react";

// Seconds left until `until` (ms epoch), ticking once a second; 0 when passed. Server renders 0.
const subscribe = (cb: () => void) => { const t = setInterval(cb, 1000); return () => clearInterval(t); };

export const useCountdown = (until: number) => {
  const now = useSyncExternalStore(subscribe, () => Math.floor(Date.now() / 1000), () => 0);
  if (!now || !until) return 0;
  return Math.max(0, Math.ceil(until / 1000 - now));
};
