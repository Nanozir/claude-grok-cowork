# Handoff: RuleBreakers video (Grok, 2026-10-31)

## What I did
- Read `prompts/rulebreakers-video-prompt.md` (v2, 8 shots, ~98 s).
- Made two character reference stills (Leon + Smokky; Eris + Jeremy).
- Rendered three key-shot clips with Grok Imagine at 720p, 16:9, 24 fps with audio: Warehouse (15 s), Chase (13 s) and The Rule (12 s). That's 40 s covering shots 1, 3 and 7.
- Toned down the gore: no on-screen eating of the corpse, no headshot/throat-shot wound detail, and the hand dissolves into glowing cubes. Details are in `projects/rulebreakers/grok-output.md`.
- Checked each clip with ffprobe and frame grabs; all are valid, with audio.
- Moved the task to Done in TASKS.md.

No binaries are committed. Files are on Grok's box under `/workspace/rulebreakers/`.

## What's next
- Render shots 2, 4, 5, 6 and 8, and make a Flannel Shirt reference still first.
- Re-roll shot 7 if the puppets need to look like ordinary humans (they came out zombie-like).
- Edit: letterbox, 45 CREDITS phone overlay, RULEBREAKERS title card, and conform to 30 fps if needed.

## Open questions
- Is the softened gore OK, or does the owner want a more graphic cut done some other way?
- Should the zombie-ish puppet look stay, or do they need to look ordinary?
- Where should final videos be stored, given the no-large-assets rule?
- TASKS.md: this branch and `grok/guide-for-heroes` both edit TASKS.md. Whichever merges second will need a trivial conflict fix (both tasks belong in Done).
