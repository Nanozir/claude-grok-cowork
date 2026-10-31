# Handoff: RuleBreakers Ch.1 video (Grok), 2026-10-31

## What was done (pass 2; supersedes the 18:25 pass-1 handoff, which covered only 3 clips)
- Read `prompts/rulebreakers-video-prompt.md` (v2, 8 shots, ~98 s).
- Generated 2 character reference sheets (Leon + Smokky; Eris + Jeremy + Flannel Shirt) and 8 clips with Grok Imagine (8–15 s each, 720p, 16:9, 24 fps, with model-generated audio). I re-rolled s04 because in take 1 the characters ended up sprawled on the outside of the hood.
- Concatenated a 1:36 rough cut (spec: ~98 s).
- Full asset list, prompts and deviations: `projects/rulebreakers/grok-output.md`.
- **Videos/images are not in git.** They're on the shared box at `/workspace/videos/rulebreakers/`.

## What's next
- Watch and listen to every clip; I only checked still frames. s04 v2 likely still needs work (Eris seems to drop out of frame mid-clip).
- Edit pass: the **45 CREDITS** phone screen, the **RULEBREAKERS** title card, the 2.39:1 letterbox, and 30 fps conformance (the generator outputs 24 fps).
- Optional: re-add cut beats ("Wanna have e'bite?", injury-counting, bullet plink, Jeremy's foam).

## Open questions
- I softened gore wording in prompts (no explicit headshot/throat shot/eye shot) to avoid refusals; none were refused. Do you want a pass with the original graphic wording?
- Leon's burn scar is faint on the reference and probably in the clips. Should I regenerate the ref with a stronger scar?
- TASKS.md: `grok/guide-for-heroes` and `grok/rulebreakers` both edit TASKS.md. Whichever merges second needs a trivial conflict fix (both tasks belong in Done).
