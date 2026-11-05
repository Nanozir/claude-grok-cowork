# 2026-11-05: GTM war #2 cliff fix + War Room checklist (Grok)

Branch `grok/gtm-war2-soften`. `node tests/sim.test.js`: all pass.

## What I did
- **Knob: `GTM.WAR.growth` 1.55 -> 1.40** (`js/data.js`). The review lists softer growth first, and the owner hasn't picked another option. I also tried the other two. Numbers are from a 60-seed probe that isn't committed:
  - Tutorial graduate (every captive on fruit, traps on the target, palisade in the Valley): war #2 survived 5/44 at 1.55, 15/44 at 1.40, 19/44 at 1.35. That player still mostly dies. My view is that's fine, because they ignored the war entirely.
  - Same script, but half the captives drafted as warriors: 24/44 at 1.55, **35/44 at 1.40**, 38/44 at 1.35.
  - Interval 9–10 days at 1.55: 9–10/44 (graduate). It barely helps, because the enemy doesn't get weaker, and the player only gets a few more logs.
  - Free or half trap reset on a win: it made things *worse* (3/16). Traps stay in the zone that was just hit, the next target is random, and the restored pits help in about 1 of 4 wars. I reverted it and wouldn't use it unless the target zone becomes sticky.
- **War #2 suite test** (`tests/sim.test.js` §2b): `preparedGame` then `playToWar2` (draft half the captives, follow intel, trap the target). It asserts ≥75% of war #1 survivors also win war #2. Result is 7/8 at 1.40. It **fails at 1.55 (5/8)**, so it actually catches the cliff. The margin is one seed, so if you retune, run the test again.
- **War Room readiness checklist**: `GTM.warReadiness(s)` in `js/sim.js` (no DOM) returns items for scouted / walls-or-traps at target (Valley if target unknown) / all military on target / ≥3 days food, plus `you`, `lo`, `hi`, `ready`. Rendered at the top of `GTM.renderWar` in `js/ui.js` as a ✓/✗ list above the existing You-vs-Enemy bar. Tests are in §2c. I added no CSS, and it uses the existing `good`/`bad`/`muted` classes. **I have not checked it in a browser.** Please open index.html and look at it.

## What's next (Claude)
1. Look at the checklist in a browser. Restyle `.checklist` if it looks naff.
2. Post-war summary screen (review UX #2): what made up the ratio, what was missing, next war ETA and estimate band. `warReadiness` + `computeDefense().lines` give you most of the data.
3. Naming cost 40 vs +20 CP per win is still optimistic (review). I didn't touch it.

## Open questions
- Owner: 1.40 makes war #2 fair only if you **draft captives**. A pure "everyone on fruit" player still loses it most of the time. Is that the lesson we want, or should Gruk add an objective after war #1 like "Draft captives as warriors"? I'd do the objective. It's cheap, and it teaches the lesson without making the game softer.
- Owner: keep 1.55 as a "Challenge" preset? Easy now that it's a single constant.
- Militia does a lot of work (13–17 goblins × 0.25 ≈ 15–20 power in war #2). I left it alone as the review said, but it partly hides how few real warriors people have.
