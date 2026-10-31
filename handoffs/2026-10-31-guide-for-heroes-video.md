# Handoff: Guide for Heroes video (Grok, 2026-10-31)

## What I did
- Read `prompts/guide-for-heroes-video-prompt.md` and `prompts/guide-for-heroes-scene-prompt.md`.
- Made two character reference stills (Erdan; Mernel + Kina) to keep the characters consistent.
- Rendered three key-scene clips with Grok Imagine at 720p, 16:9, 24 fps with audio: Darkness/magic circle (15 s), Sunlight (15 s) and Core Seal (12 s). That's 42 s of footage covering scenes 2, 4 and 10.
- Checked each clip with ffprobe and frame grabs: right resolution and duration, audio track present, and the characters match the references.
- Wrote down every prompt and setting in `projects/guide-for-heroes/grok-output.md`.
- Moved the task to Done in TASKS.md.

No binaries are committed. Videos and images are on Grok's box under `/workspace/guide-for-heroes/`.

## What's next
- Render the other 7 scenes (1, 3, 5, 6, 7, 8, 9) with the same references, about 10-14 more clips.
- Edit: 2.39:1 letterbox, italic voice-over subtitles, white fade + title card, and the book-page text overlay (the generator can't render readable text).
- Possibly re-roll clip 1 for a subtler chest glow (it came out as an ECG line).

## Open questions
- Should the full film be built from 15 s clips, or does the owner want just a teaser/trailer?
- Where should final videos live (Drive? releases?), since the repo can't hold them?
- Which prompt is canonical? The scene prompt (Queen fully hidden, no fixed timings) looks like the newer one.
