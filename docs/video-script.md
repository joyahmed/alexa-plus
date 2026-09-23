# Demo video — narration script

Read this straight through in **one take**. Do not watch the video, do not watch a clock.
The lines get cut apart and placed against the picture afterwards.

**The only thing you have to do mechanically:** leave a clear **2-second pause between lines**
— stop, breathe, then start the next one. The pauses are what the splitter cuts on, so make them
noticeably longer than any pause inside a sentence. Nothing else about your timing matters.

Say the lines in order. Say nothing else — no "line four", no restarts mid-line. If you fluff a
line, pause, and say the whole line again from the start; the extra take is easy to drop.

## Tone

One register for the whole thing: **calm, certain, unhurried** — a person explaining something
they built and know works. Not an advert. Judges hear a lot of over-sold demo videos, and
understatement reads as competence. Accent is irrelevant; pace and certainty are not.

Three places to shift, marked below. Everywhere else, stay level.

---

| # | Tone | Say |
|---|------|-----|
| 1 | Matter-of-fact, setting a scene | "A short-term rental, and an Echo on the kitchen counter." |
| 2 | Slightly knowing — this is the problem | "The guest has never been in this house before." |
| 3 | **Confident.** The claim of the whole project. Lean on *"not a model's guess"* | "This house is an MCP server. The answer is the host's own instructions — not a model's guess." |
| 4 | Brisk, practical. A little pleased at how much happens from one sentence | "Say the coffee's out. It checks the cupboard, orders a refill from the host's supplier, and tells the host." |
| 5 | **Build, then slow right down on the last sentence.** This is the best thing in the demo | "Report a leak, and it opens a ticket, picks the host's plumber, and proposes a time. Say yes, and it's booked. Tomorrow, the house still knows who is coming, and why." |
| 6 | **Flat and factual. Do not sell this one** — the flatness is what makes it credible | "Every one of those answers was a real MCP tool call. This drawer shows them. Nothing is mocked." |
| 7 | Light, quick, almost a throwaway | "One server, three houses — each with its own calendar." |
| 8 | Deliberate, explaining. Slow. You are walking someone through a rule | "In this one, the guest leaves tomorrow, and the next arrives the day after. So a repair reported today cannot land tomorrow, and it cannot land the day after either." |
| 9 | The payoff. Land it, then stop | "It lands three days out — the first day nobody is checking in or out." |
| 10 | Warm. The only line that should sound like you are pleased | "Live, open source, and honest about its limits. The house explains itself." |

---

## Recording

Any recorder — phone, Audacity, Premiere. Quiet-ish room; perfection is not needed, the mix
applies a high-pass, gentle denoise and levelling. Hand over the file and it gets cut on the
pauses and placed against the picture automatically.

~170 words against a 1:55 picture, so there is room everywhere. If a line feels rushed, it is.

## One thing to know about the picture

The answers carry the caption *"Answered from the house script · Gemini free tier: 5 requests/min"*.
The demo is public and its free-tier key is shared with whoever else is on the site, so the live
model was in cooldown during recording. This is the honest fallback the submission already
describes — the scripted agent walks the **same MCP tools**, and the drawer still shows every
call. Nothing in the video is misleading.

## If the picture is re-recorded

`record-slow.mjs` prints `CAP <seconds> "<text>"` for every caption change. The cue times live in
`mux-voice.mjs` (`CUES`) and must be rebuilt from that log — timings shift with how fast the model
answers (takes so far: 2:07, 1:31, 1:55, 1:54).
