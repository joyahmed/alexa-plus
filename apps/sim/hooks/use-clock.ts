"use client";

import { useSyncExternalStore } from "react";

// The ambient screen's clock. External store so the server renders a blank and the client ticks.
const subscribe = (cb: () => void) => { const t = setInterval(cb, 1000); return () => clearInterval(t); };
const snapshot = () => Math.floor(Date.now() / 1000);
const serverSnapshot = () => 0;

export const useClock = () => {
  const s = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  if (!s) return { time: "", date: "" };
  const d = new Date(s * 1000);
  return {
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    date: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
  };
};
