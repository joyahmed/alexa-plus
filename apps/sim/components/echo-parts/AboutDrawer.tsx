import { useState } from "react";

const INTERACTIONS = [
  { say: "How do I turn on the hot tub?", does: "Reads the host's own steps and shows the host's picture. Ask about the wifi and you get a QR card." },
  { say: "The coffee pods are out.", does: "Checks the cupboard, orders a refill to the property from the host's supplier, tells you where the spare box is, posts to the host's feed." },
  { say: "The shower is dripping.", does: "Opens a ticket, picks the host's plumber, offers the first slot that isn't a check-in day, books it on your yes — and tomorrow it remembers." },
];

// For a judge landing cold: what this is, in the time it takes to read a card. Opens on demand;
// its open state is the only reactivity, so it stays local.
const AboutDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen((o) => !o)} className="fixed left-4 top-4 z-20 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-ink shadow-lg backdrop-blur">
        What is this?
      </button>
      <aside className={`fixed inset-y-0 left-0 z-10 w-[min(100%,420px)] overflow-y-auto bg-white/95 p-6 text-sm shadow-2xl backdrop-blur transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <h2 className="mt-10 text-xl font-extrabold leading-tight">The house that explains itself</h2>
        <p className="mt-3 text-ink-2">
          An Echo Show on the kitchen counter of a short-term rental. The guest — a stranger to the house — talks
          to it. Alexa+ answers with the host&apos;s own instructions, restocks what runs out, books repairs around
          the booking calendar, and remembers it all the next morning. The host never has to.
        </p>
        <ol className="mt-5 flex flex-col gap-3">
          {INTERACTIONS.map((i) => (
            <li key={i.say} className="rounded-xl border border-line bg-paper p-3">
              <p className="font-bold">“{i.say}”</p>
              <p className="mt-1 text-ink-2">{i.does}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-ink-2">
          <b>Who it&apos;s for:</b> hosts, who already put an Echo in every unit and answer the same twenty questions
          by text at 11 pm. The guide is written once and reused across every stay.
        </p>
        <p className="mt-3 text-ink-2">
          <b>Under the hood:</b> everything runs through a self-hosted MCP server (spec 2025-11-25, Streamable HTTP)
          at <code>/mcp</code>. Open “MCP calls” on the right to watch. Demo data only — no real store, no card.
        </p>
        <p className="mt-5 flex gap-4 font-semibold">
          <a className="text-alexa-2 underline-offset-2 hover:underline" href="https://github.com/joyahmed/alexa-plus" target="_blank" rel="noreferrer">GitHub</a>
          <a className="text-alexa-2 underline-offset-2 hover:underline" href="https://github.com/joyahmed/alexa-plus/blob/main/docs/friction-log.md" target="_blank" rel="noreferrer">Friction log</a>
        </p>
        <p className="mt-6 text-xs text-ink-2">Entry for Build, Ship, Shape: Amazon Developer Hackathon — Alexa+ track. Simulated experience; the real surface is the MCP server.</p>
      </aside>
    </>
  );
};

export default AboutDrawer;
