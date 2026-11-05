# Grok second opinion: Goblin Territory Manager (balance + UX)

Date: 2026-11-05. Against `main` at merge of PR #6 (onboarding P0). Headless: `node tests/sim.test.js` all pass. Extra probe script below (not committed as a test).

## Verdict

War #1 and the guided first session are in good shape. Post-war #1 is the real problem: a player who only repeats the tutorial strategy almost always dies on war #2. Fix that cliff before adding more systems. UX P0 landed; ship the War Room readiness checklist next, not more tabs.

## Balance

### War #1 (good)
- Passive fruit-only: loses (test). Prepared split (4 fruit / 2 timber / 2 builders / 3 warriors / 1 scout + traps/palisade): **8/10** wins in the suite.
- `basePower` 36, `firstAtDay` 8, ±10% rolls: fights sit near 1.0 ratio, so preparation and posting matter. Keep that.
- Starting idle + ~2.5 days of food forces the first choices. Do not go back to "already gathering".

### War #2 cliff (bad)
Same prepared script, then assign captives to fruit and keep queueing traps/palisade for 7 more days (no R&D, no housing push, no extra warriors beyond 2 captives):

| Result | Rate (n=10) |
|---|---|
| Survive war #1 | 8/10 |
| Survive war #2 | **2/10** |

Typical losses: defense mid-40s vs rolled enemy ~50–63 (`growth` 1.55 → ~56 base). Close fights flip on the roll; weak seeds never catch up.

**Why it cliffs**
1. `WAR.growth` 1.55 every 7 days outpaces +4-ish captives and one free palisade on the new zone.
2. Pit traps are consumed every war; wood rebuild tax hits every cycle while builders also need roads/housing/storage.
3. No automated test past war #1, so the suite still "passes" while mid-game is broken for a tutorial graduate.

**Suggested knobs (pick one primary, measure again)**
- Soften growth: **1.35–1.40**, or first two wars at 1.35 then 1.55.
- Or stretch interval after war #1 to **9–10** days once.
- Or give one free rebuild: traps in the attacked zone restore at half cost after a win.
- Add a headless check: prepared play wins war #2 on ≥6/10 seeds (or document Challenge vs Standard presets from the research P2).

### Wood and food (mild)
- Forest timber 3/day vs palisade 15 + traps 5 + housing/road competition: wood is the right bottleneck for war #1. Keep it.
- Spoilage (meat 3%, fruit 2%) is background noise before war #1; only bites if the player stockpiles without storage/preservation. Fine for now.
- Naming at 40 CP vs +20 CP per win: one Named by war #2 is optimistic. Either lower cost to ~25 or bump win CP slightly once growth is fixed.

### What not to touch yet
Militia factor, formation/crossbow multipliers, and Director gating. They matter after the war #2 curve is sane.

## UX

### What already works
- Idle start, Gruk one-line goals, progressive tabs, day-8 fuse, auto-pause, rewind: matches the research P0 intent and the tests.
- Compact Population + ⓘ tooltips cut the day-1 wall of text.
- Skip / v1 migration to full UI is correct for return players.

### Highest-value next UX (ordered)
1. **War Room readiness checklist** (research P1 #1): walls / warriors on target / scouted / 3 days food, plus the You vs Enemy bar. Claude's handoff still lists this; do it before flavour juice.
2. **Post-war summary** (P1 #6): what contributed to the ratio, what was missing, next war ETA and enemy estimate band. Today the log dump does not teach the cliff.
3. **Floating +N / food-days colour** (P1 #2): cheap clarity; secondary to the checklist.
4. **Drill action** (P1 #4): manhwa fantasy, but it is content. Balance the curve first so Drill is not a band-aid for war #2.

### Friction notes
- Auto-pause is good; if notices stack, players may mash through. Cap or coalesce pauses when several unlocks fire on one tick.
- Battle log lines from `computeDefense` are useful for debug, dense for a first win. Summary screen should lead; keep the log under a "Details" fold.
- Open design leftover from the prototype handoff: retreat-and-lose-a-zone vs permadeath. Owner already chose rewind; no need to reopen unless playtests hate it.

## For Claude (concrete)
1. Re-tune `WAR.growth` / interval (or free trap rebuild) until a documented prepared script clears war #2 most of the time; add a suite assertion.
2. Implement War Room readiness checklist + post-war summary.
3. Leave map/water/multi-territory stubs alone until those two land.

## Owner (only if you care)
- Prefer softer growth, longer gap after war #1, or free trap rebuild after a win?
- Keep Challenge (steep 1.55) as an explicit preset once Standard is fair?
