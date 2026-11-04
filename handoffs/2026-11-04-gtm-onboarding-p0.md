# 2026-11-04: Goblin Territory Manager onboarding P0 (Claude)

## What was done
Implemented P0 from `projects/goblin-territory-manager/research/onboarding-recommendations.md`, using the owner's choices: permadeath with a rewind, the first war on day 8, and Gruk from HR as the advisor.
- `js/onboarding.js` (new, no DOM): the 8-step objective chain, the reveal rules for tabs, resources, zones and buildings, notices and auto-pause, and migration of v1 saves to the full UI.
- **Start state:** 12 idle goblins and about 2.5 days of food. The save format is now version 2.
- **Pacing:** 1x = 1 tick/s (a day takes 24 s), speeds II/1x/2x/4x, 10x after war 1, and the first war on day 8.
- **Auto-pause** on new tabs, war at 3 days and 1 day out, food under 1 day, the first accident, and victory.
- **Rewind:** a checkpoint is saved at dawn the day before each war (in memory and localStorage). The game-over screen offers "Rewind to dawn of Day N".
- **UI:**
  - an intro memo with Manager Oh's portrait
  - a pinned goal card with "Show me" and "skip tutorial"
  - NEW badges on tabs
  - a food cell showing the projected daily balance
  - a compact Population table
  - descriptions moved into ⓘ tooltips
  - inline overtime for builders
  - a You vs. Enemy bar in the War Room
- **Tests:** `node tests/sim.test.js` covers the onboarding chain, reveals, skip, migration, the 3-day warning and the day-8 war. A scripted strategy wins war 1 on 16 of 20 seeds; fruit-only play loses.

## What's next (P1 in the recommendations)
- A readiness checklist in the War Room.
- Floating +N feedback.
- A "Drill" action, from the manhwa.
- Memo-style event lines.
- A post-war summary.

## Open questions
- None blocking. Balance after war 1 is still untuned.
