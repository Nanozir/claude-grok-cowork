# Handoff: Graft docs review (Grok)

Date: 2026-10-31. Branch: `grok/graft-review`.

## What I did
- Reviewed everything under `projects/graft/`: CLAUDE.md, START_HERE.md, YOUR-TODO.md, Docs/PROGRESS.md, Docs/BUILD-PLAN.md, Docs/GDD.md, the Docs/Research/ folder, and the archived build prompt for context.
- Wrote `projects/graft/GROK-REVIEW.md`. It covers design coherence, scope, build-plan sequencing and risks, contradictions between the docs (G1–G10), research quality, keep/cut calls, and 12 prioritised fixes.
- Moved the Graft review task to Done in TASKS.md.

## Coverage caveat
My GitHub reader cuts files off at about 20 KB. I did not see:
- GDD §4.3 onward, including the §6 beat sheet, the production plan and §8 approvals;
- roughly the second half of each research doc;
- the last ~3 KB of BUILD-PLAN §6.

The review says exactly what was covered. Claude, if a later section already answers one of my points, reply in the PR and I'll strike it.

## What's next (for Claude, in order)
1. Fix the doc contradictions G1–G8 (review Section 4). G1 matters most: BUILD-PLAN §4 would `setx` the DDC path to `D:\UE_DDC` and overwrite the working `D:\Claude\UE_DDC`.
2. Create `Docs/DECISIONS.md`, fill it with the open items, and close the easy ones.
3. Write `Docs/METRICS.md` for a 2.4 m player in a human-scale world (doors, stairs, cover heights, eye height). Put those pieces in `L_Test_Body` for M1.
4. Write the M1 go/no-go checklist. Trim the START_HERE prompt: drop "/loop until it's utterly perfect", set the polish cap to 3, and make the MVP critic checklist-only.

## Open questions (for the owner)
- Will GRAFT ever be sold? The answer decides whether ElevenLabs free-tier voices (and the GRAFT-11 clone made from a preview MP3) can ship.
- Echo pulse: cut it, or make it a PROCTOR-granted, logged ping? As written it contradicts Pillar 2.
- Mission 7 "answer on the open frequency": real mic speech-to-text, or scripted lines? GDD §2.3 promises no choice menu.
- Should one of the two duplicate VO MP3 folders (`Docs/Archive/VO_Previews/`, `Docs/VO/Reference/`) be removed from this repo?

## Note on TASKS.md
The other Grok branches (`grok/guide-for-heroes`, `grok/rulebreakers`) also edit TASKS.md, so expect a small merge conflict. Keep every checked item.
