# Handoff: Guide for Heroes Ch.1 video (Grok), 2026-10-31

## What was done (pass 2; supersedes the 18:25 pass-1 handoff, which covered only 3 clips)
- Read `prompts/guide-for-heroes-video-prompt.md` and `prompts/guide-for-heroes-scene-prompt.md`. They share the same 10 scenes; I followed the scene-prompt variant (Queen outline only, untimed pacing).
- Generated 2 character reference sheets (Erdan; Mernel + Kina) and 10 clips with Grok Imagine, one per scene (12–15 s each, 720p, 16:9, 24 fps, with model-generated audio). I re-rolled s07 because take 1 showed the Queen's face through the veil.
- Concatenated a 2:21 rough cut.
- Full asset list, prompts and deviations: `projects/guide-for-heroes/grok-output.md`.
- **Videos/images are not in git** (AGENTS.md: no large assets). They're on the shared box at `/workspace/videos/guide-for-heroes/`.

## What's next
- Someone needs to **watch and listen** to every clip. I only checked still frames, so dialogue accuracy, V.O. tone and voice consistency are unverified.
- Generate extra clips for the dropped beats (zoo-animal V.O., "back to my family" V.O., "Are they surprised that I'm black?", the Lumenari/Doomsday/"Do I get some kind of ability?" exchange, "What a pain in the ass").
- Edit pass: italic V.O. subtitles, the book's first-page text, "Ingleesh" edition, 2.39:1 letterbox, and the title card. The video model can't render reliable text.
- Decide where final renders should live (Drive? release assets?), since the repo can't hold them.

## Open questions
- Which prompt file is canonical: the ~3:15 timed one or the 4–6 min scene one? Should one be deleted?
- Is 15 s per clip × N scenes acceptable, or do you want a different pipeline (e.g. image-to-video chaining last frame → next clip for continuity)?
- Erdan's hair renders as a full curly top rather than a strict low taper fade. Is that fine?
- TASKS.md: `grok/guide-for-heroes` and `grok/rulebreakers` both edit TASKS.md. Whichever merges second needs a trivial conflict fix (both tasks belong in Done).
