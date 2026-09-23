# Demo video — voiceover cue sheet

Matched to `docs/video/alexa-demo.mp4` — **1:31.28**, 1920×1080, 25 fps, H.264 (Premiere-ready).
The picture already carries English captions, so **narration is optional**: the rules ask only for
a video under 3 minutes, in English, no third-party music. Voice is an upgrade, not a requirement.

Read at a normal pace (~150 wpm). Every line is written **short on purpose** — each window has
1–3 seconds of slack so you never have to rush or clip the next beat. If you fall behind, drop a
sentence rather than speed up.

Total speech ≈ 173 words ≈ 70 s inside a 91 s picture.

---

| # | In | Out | On screen | Say |
|---|----|-----|-----------|-----|
| — | 0:00 | 0:03 | page loading | *(silence — let it settle)* |
| 1 | 0:03 | 0:11 | idle Echo Show, Lakeview Cabin | "A short-term rental. An Echo on the counter — and a guest who has never been in this house before." |
| 2 | 0:11 | 0:21 | hot-tub question and answer card | "This house is an MCP server. Ask it anything, and the answer is the host's own instructions — not a model's guess." |
| 3 | 0:22 | 0:31 | coffee pods reorder | "Say the coffee's out, and it checks the cupboard, orders a refill from the host's supplier, and tells the host." |
| 4 | 0:32 | 0:47 | shower ticket → "yes" → booked card | "Report a leak, and it opens a ticket, picks the host's plumber, and proposes a time. Say yes, and it's booked. Tomorrow the house will remember who's coming, and why." |
| 5 | 0:48 | 0:56 | MCP drawer open, tool calls listed | "Every one of those answers was a real MCP tool call. This drawer shows them. Nothing here is mocked." |
| — | 0:56 | 1:00 | switching to the Harbor Loft | *(silence)* |
| 6 | 1:00 | 1:04 | Harbor Loft idle screen | "One server, three houses — each with its own calendar." |
| 7 | 1:04 | 1:18 | radiator reported → "yes" | "In this one, the guest leaves tomorrow, and the next arrives the day after. So a repair reported today can't land tomorrow." |
| 8 | 1:18 | 1:24 | booked card, Saturday slot | "It lands three days out, on the first day nobody is checking in or out." |
| 9 | 1:25 | 1:31 | closing link card | "Live, open source, and honest about its limits. The house explains itself." |

---

## Recording notes

- **Line 4 is the one to land.** It is the continuity claim — the thing a smart speaker demo
  usually cannot show. Give it the full 15 seconds.
- **Line 7 into 8 is the differentiator.** The calendar-aware repair is the only beat no other
  entry will have. Do not hurry the pause between them; the picture is doing work there.
- Line 5 is the proof beat. Say "real" plainly — the drawer on screen is the evidence.
- No music. The rules forbid third-party music, and the demo needs none.

## If you re-record the picture

`scratchpad/browser/video/record.mjs` drives the live site and prints each beat's timestamp.
Timings shift with how fast the model answers (an earlier take ran 2:07 against this one's 1:31),
so re-derive the table from that log rather than reusing these numbers.
