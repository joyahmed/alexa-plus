"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { AgentResponse, Turn } from "@/lib/types";

// All the reactivity of the Echo screen: transcript, listening state, speech in, speech out,
// the round trip to /api/agent. The components only render what this returns.

type SpeechRecognitionLike = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
  start: () => void; stop: () => void;
};
type SRWindow = Window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };

const id = () => Math.random().toString(36).slice(2);
const srCtor = () => { const w = window as SRWindow; return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null; };
const noop = () => () => {};

export const useAlexaSession = () => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [draft, setDraft] = useState("");
  const [voiceOut, setVoiceOut] = useState(true);
  // Server renders "no mic"; the browser snapshot says whether Web Speech exists. No effect, no setState.
  const canListen = useSyncExternalStore(noop, () => srCtor() !== null, () => false);
  const [agent, setAgent] = useState<AgentResponse["agent"] | null>(null);
  const recognition = useRef<SpeechRecognitionLike | null>(null);

  const speak = (text: string) =>
    new Promise<void>((resolve) => {
      if (!voiceOut || typeof speechSynthesis === "undefined") return resolve();
      const u = new SpeechSynthesisUtterance(text);
      const voice = speechSynthesis.getVoices().find((v) => /en-US/.test(v.lang) && /female|Samantha|Zira|Aria|Jenny/i.test(v.name)) ?? null;
      if (voice) u.voice = voice;
      u.rate = 1.02; u.onend = () => resolve(); u.onerror = () => resolve();
      setStatus("speaking");
      speechSynthesis.speak(u);
    });

  const ask = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setDraft("");
    const history = turns.map(({ role, text }) => ({ role, text }));
    setTurns((t) => [...t, { id: id(), role: "guest", text: clean, at: Date.now() }]);
    setStatus("thinking");
    try {
      const res = await fetch("/api/agent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: clean, history }) });
      const data = (await res.json()) as AgentResponse | { error: string };
      if ("error" in data) throw new Error(data.error);
      setAgent(data.agent);
      setTurns((t) => [...t, { id: id(), role: "alexa", text: data.text, cards: data.cards, tools: data.tools, at: Date.now() }]);
      await speak(data.text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setTurns((t) => [...t, { id: id(), role: "alexa", text: msg, at: Date.now() }]);
    } finally {
      setStatus("idle");
    }
  };

  // The recogniser is built on first use, after `ask` exists, so the callbacks can reach it.
  const listen = () => {
    if (status !== "idle") return;
    if (!recognition.current) {
      const Ctor = srCtor();
      if (!Ctor) return;
      const r = new Ctor();
      r.lang = "en-US"; r.interimResults = false; r.continuous = false;
      r.onresult = (e) => { const t = e.results[0]?.[0]?.transcript; if (t) void ask(t); };
      r.onend = () => setStatus((s) => (s === "listening" ? "idle" : s));
      r.onerror = () => setStatus("idle");
      recognition.current = r;
    }
    setStatus("listening");
    recognition.current.start();
  };

  const submitDraft = () => void ask(draft);

  return { turns, status, draft, setDraft, submitDraft, listen, canListen, voiceOut, setVoiceOut, agent, ask };
};

export type AlexaSession = ReturnType<typeof useAlexaSession>;
