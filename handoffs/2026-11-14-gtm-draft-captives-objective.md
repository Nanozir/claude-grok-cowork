# 2026-11-14: GTM post-war Gruk objective, draft captives (Grok)

Branch `grok/gtm-draft-captives-objective`. `node tests/sim.test.js`: all pass, including the existing war #2 suite (7/8).

## What I did
- Reused the existing objective machinery in `js/onboarding.js`. `draft_captives` is one more entry in `GTM.OBJECTIVES`, same shape as the first-session goals (`id`, `text`, `why`, `tab`, `done`), plus an `appear(s)` predicate. It is not a second system.
- `appear: s => s.warsWon >= 1`. The goal is absent during the first session, after skip, and after the overtime step. It pins only after war #1 is won. A loss still ends the game, so "won" and "resolved" are the same event.
- Completes when at least **half the surviving war captives** are assigned as Warriors (`Math.ceil(n / 2)`). War #1 always yields 4 captives (`2 + floor(power / 15)` at base 36 ±10%), so the bar is 2. That is the same "draft about half" script from the 2026-11-05 probe that took war #2 from 15/44 to **35/44** at growth 1.40, and the same split the war #2 suite test already uses.
- Captives are tagged at spawn (`makeGoblin(..., { captive: true })` in `resolveWar`). Stray joiners and housing growth are not captives. Drafting extra starters as warriors does not complete the goal.
- Guided GOAL n/m still counts only the original 8 first-session steps. The post-war card is just "GOAL", "Show me" goes to Population, and there is no skip-tutorial link. If a first-session step is still open when war #1 is won, the tutorial chain ends so this goal can pin (leaving "start Overtime" up after a victory would be stupid).
- `skipTutorial` and `migrate` advance `tutorial.step` to the first `appear` goal, so skipped or old v2 saves still get it if they have not fought yet. A loaded save that already won a war and has no tagged captives skips the goal so it cannot stick forever.
- Tests in `tests/sim.test.js` §6: absent before war #1 (guided + skip), appears after a win, stays open after drafting 1 of 4, completes at 2 of 4, does not complete if you only draft non-captives.

## What's next (Claude)
1. Open `index.html` and look at the post-war card. I have not checked it in a browser. Confirm the face, the "GOAL" label (no 9/9), missing skip link, and that "Show me" jumps to Population.
2. Post-war summary screen is still yours (review UX #2). This goal can sit next to it: the summary can say they ignored the captives, the objective tells them what to do about it.
3. Leave the 1.40 growth and the war #2 test alone unless you retune.

## Open questions
- I did not count Ranged toward the bar. The 2026-11-05 finding was specifically warriors. If you want "military" instead, change `draftedCaptives`.
- If some captives desert before you draft, the need is half of whoever is left. If they all vanish, the goal cannot complete (n === 0). Rare, and probably a worse problem than the objective.
- Owner already decided to teach this rather than soften the graduate-who-picks-fruit-only path. That player still loses war #2 most of the time, on purpose.
