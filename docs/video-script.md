# Demo video — voiceover cue sheet

Picture: `docs/video/alexa-demo.mp4` — **1:54.48**, 1920×1080, 25 fps, H.264.
Times below are **measured from the recording**, not estimated: the recorder timestamps every
caption change, so each row's In/Out is exactly when that caption is on screen.

Narration is **optional** — the picture already carries English captions and the rules ask only
for a video under 3 minutes, in English, with no third-party music.

## How to record

1. Open the MP4 and play it once without speaking, just to see the beats.
2. Record one continuous pass reading the **Say** column, starting each line at its **In** time.
3. Any recorder is fine — Premiere, Audacity, even your phone. One mono or stereo WAV/MP3.
4. Hand the audio file over and it gets muxed onto the picture; you do not need to edit video.

**Every line is written well under its window** — roughly 170 words of speech inside 114 seconds
of picture. You are meant to sound unhurried. If you fall behind, drop a sentence; never speed up.
Accent does not matter: the judging criteria are Tech Implementation, Design, Potential Impact and
Quality of Idea. None of them is delivery.

---

| # | In | Out | Room | On screen | Say |
|---|------|------|------|-----------|-----|
| — | 0:00 | 0:03 | — | page loading | *(silence)* |
| 1 | 0:03 | 0:10 | 6.5 s | idle Echo Show, Lakeview Cabin | "A short-term rental, and an Echo on the kitchen counter." |
| 2 | 0:10 | 0:15 | 5.5 s | same, second caption | "The guest has never been in this house before." |
| 3 | 0:15 | 0:26 | 10.5 s | hot-tub question → answer + card | "This house is an MCP server. The answer is the host's own instructions — not a model's guess." |
| 4 | 0:27 | 0:38 | 10.3 s | coffee pods → reorder | "Say the coffee's out. It checks the cupboard, orders a refill from the host's supplier, and tells the host." |
| 5 | 0:39 | 0:59 | 19.4 s | shower → ticket → "yes" → booked | "Report a leak, and it opens a ticket, picks the host's plumber, and proposes a time. Say yes, and it's booked. Tomorrow, the house still knows who is coming, and why." |
| 6 | 1:00 | 1:10 | 9.6 s | MCP drawer open, tool calls | "Every one of those answers was a real MCP tool call. This drawer shows them. Nothing is mocked." |
| — | 1:10 | 1:14 | — | switching to the Harbor Loft | *(silence)* |
| 7 | 1:14 | 1:21 | 6.5 s | Harbor Loft idle screen | "One server, three houses — each with its own calendar." |
| 8 | 1:21 | 1:41 | 20.3 s | radiator reported → "yes" | "In this one, the guest leaves tomorrow, and the next arrives the day after. So a repair reported today cannot land tomorrow, and it cannot land the day after either." |
| 9 | 1:41 | 1:47 | 6.0 s | booked card, Saturday slot | "It lands three days out — the first day nobody is checking in or out." |
| — | 1:47 | 1:48 | — | — | *(silence)* |
| 10 | 1:48 | 1:54 | 6.0 s | closing link card | "Live, open source, and honest about its limits. The house explains itself." |

---

## Which lines carry the entry

- **Line 5** is the continuity claim — report a leak today, and tomorrow the house still knows.
  A smart-speaker demo usually cannot show that. It has the longest window; use it.
- **Lines 8 and 9** are the differentiator. The calendar-aware repair is the one beat no other
  entry will have. The pause between them is deliberate — the picture is doing work there.
- **Line 6** is the proof beat. Say "real" plainly; the drawer on screen is the evidence.
- No music. The rules forbid third-party music and the demo needs none.

## If the picture is re-recorded

`scratchpad/browser/video/record-slow.mjs` drives the live site and prints `CAP <seconds> "<text>"`
for every caption change. Rebuild this table from that log — timings shift with how fast the model
answers (takes so far: 2:07, 1:31, 1:55, 1:54).
