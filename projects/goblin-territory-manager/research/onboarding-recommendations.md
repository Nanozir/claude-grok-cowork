# Onboarding, information density and pacing: recommendations

This document combines three research outputs and maps each change to the prototype's code:
- [`manhwa-research.md`](manhwa-research.md): *Goblin Corporation*, early chapters.
- [`genre-onboarding-research.md`](genre-onboarding-research.md): how management, idle and colony games run their first 15 minutes.
- [`assets/`](assets/): characters, icons, a territory map, a first-session storyboard and image prompts.

**Goal:** a new player does something meaningful within 30 seconds, without reading a paragraph, and the first war never feels like an ambush.

## What's wrong today (verified in the code)

| Problem | Where | Why it hurts |
|---|---|---|
| The game is already "solved" at start: all 12 goblins are on Fruit | `js/state.js:90` | The first click has no purpose. The player has nothing to fix, so they don't know what to do. |
| All 7 tabs, about 12 resource cells and the full log are visible on second 1 | `js/ui.js` `TABS`, `renderRes` | Too much information is dumped at once, before any context. |
| 1x speed = 2 ticks/s, so 1 day = 12 s and the war arrives after about 60 s of 1x play | `js/main.js:44`, `js/data.js:164` | Time flows too fast. Nothing pauses for warnings. |
| Teaching happens through paragraphs: the War Room notes, building descriptions, naming rules and overtime explanation | `js/ui.js` render functions | Text walls that players say they won't read. |
| The intro is one line in the log | `js/state.js:92` | No preparation, and the stakes are easy to miss. |
| The first loss ends the run with no recovery | `js/sim.js` `resolveWar` | Early time pressure feels punishing instead of teaching. |
| The Population table shows 12 rows × 14 columns | `renderPopulation` | Stats only matter later. On day 1 the player needs "who is idle". |

## Design principles (backed by both reports)

1. **One loop first.** Start with food and goblins. Then add wood and building, then defense and scouting, then the corporate layer (ranks, overtime, naming). The manhwa readers' reports match this order: food crisis, then overtime, then formation drills, then slingshots.
2. **Give a reason, not a paragraph.** Each goal is a single line with a reason in about eight words, shown in one pinned "Next" slot. Rules show up as consequences and one-line tooltips.
3. **Reveal a system when the player needs it.** A tab or resource appears the first time it becomes relevant, with a brief highlight. Hidden is not deleted: an "Expert / Full UI" toggle shows everything.
4. **Calm clock, loud warnings.** Slow default speed, auto-pause on key moments, and the war countdown shown as a readiness checklist.
5. **Make the first failure funny and recoverable.** Keep the design's "lose = die" rule, but offer a rewind.

## P0: do before anyone plays again

| # | Change | Implementation sketch |
|---|---|---|
| 1 | **Start with a problem to fix.** All 12 goblins start Idle, with about 2 days of food. The food card shows red "1.8 days". | `state.js:90`: change `role: 'laborer'` to `'idle'`, and lower the starting fruit and meat. |
| 2 | **One-screen intro memo** instead of the log line. Show Manager Oh's portrait, the line "SYSTEM: You are Lord. War in 8 days. Don't die.", and one **[Clock in]** button. | A new overlay in `ui.js` that uses `assets/char-manager-oh.svg`. Dismissing it unpauses the game at 1x. |
| 3 | **Pinned objective chain** (guided mode on by default), one goal at a time with a ✓ pop and a short auto-pause between goals. See the script below. | Add `GTM.OBJECTIVES` to `data.js` as `{ id, text, why, done: s => bool, reveal: [...] }`. Add `state.tutorial = { step }`, checked every tick in `sim.js` and rendered as a small card above the panel. |
| 4 | **Progressive reveal.** Day 1 shows only the **Zones** tab and **Food (days left), Wood and Population**. Everything else appears from the unlock table below. | Add `state.revealed = { tabs: Set, res: Set }`. `renderTabs` and `renderRes` filter by it. An "Expert UI" checkbox in the Debug tab or settings shows everything. |
| 5 | **Slower time.** Make 1x = 1 tick/s, so a day takes 24 s. Offer only `II 1x 2x 4x`, and add 10x after the first war. | `main.js:44`: change `* 2` to `* 1`. Change the speed list in `renderTop`. |
| 6 | **Longer first fuse.** Move the first war from day 6 to day 8. That's 168 ticks, or 2.8 min of unpaused 1x play. With goal pauses, the real time is about 8–12 min. Rebalance `basePower` and rerun `tests/sim.test.js`. | `data.js:164`. The tests already read `firstAtDay`. |
| 7 | **Auto-pause and one-line toast** on: an objective done, a new unlock, the war 3 days and 1 day out, food under 1 day, the first injury or death, and war start. A setting turns it off. | Have the sim set `s.pauseReason`. `main.js` pauses and shows the toast. |
| 8 | **Rewind on defeat.** Autosave at the dawn of the day before the war. The game-over screen's main button is **[Rewind to Day 7]**. | Use the existing save JSON with a second localStorage key. `resolveWar` is unchanged, so the design rule stands. |
| 9 | **Replace paragraphs with tooltips.** Building, research and trait descriptions move to `title` / ⓘ hovers. Panel footnotes become a single line or disappear. | `ui.js` only. |

### First-session objective script (guided mode)

Each step is one line, with its reason shown greyed under it. The advisor is an original character, *Gruk from HR, the only goblin who can count* (the same name the genre report uses). The reported manhwa sidekick is unconfirmed, so it isn't used.

| Step | Goal (one line) | Reason line | Done when | Reveals |
|---|---|---|---|---|
| 1 | Put 4 goblins on **Fruit** (Valley +) | "Goblins that don't eat don't work." | 4 laborers in the Valley on fruit | the food rate +N/day |
| 2 | Send 2 goblins to **Forest Edge → Timber** | "Walls are made of wood." | 2 laborers on forest timber | Wood, the Forest card |
| 3 | Make 2 **Builders** | "Someone has to hold the hammer." | 2 builders | the **Construction** tab, pit traps and palisade only |
| 4 | Queue a **Palisade** in the Valley | "War on Day 8. Start the paperwork." | a palisade queued | the build queue |
| 5 | Press **1x** and watch a day | (none) | 1 day passes | the morale bar (first change), Population (compact) |
| 6 | Make 1 **Scout** on the enemy | "Know where they'll hit." | a scout assigned | the **War Room** (readiness checklist) |
| 7 | Make 3 **Warriors**, post them in the target zone | "A goblin in line is a goblin alive." | 3 warriors at the revealed zone | the defense vs. enemy bar |
| 8 | Behind schedule? Try **Overtime** on Builders | "Growth opportunity. (Morale −)" | overtime used once | the overtime button inline on the role card |
| then | Free play, with the readiness checklist in the War Room: fortify, man the walls, keep 3 days of food, scout | | | the rest via the unlock table |

### Unlock table (everything else)

| Surface | Unlocks when |
|---|---|
| Stone, Leather | first gathered or first needed by a cost |
| Morale bar | the first time it moves by 5 or more, or day 2 |
| Contribution Points | the first promotion-eligible goblin |
| **Hierarchy** tab (ranks and bonuses only) | the first promotion-eligible goblin, or day 4 |
| Quota projects, naming | after the first war (naming slots already scale with level) |
| **R&D** tab | when a Research hut is built (Research hut is offered after war 1, or from day 5) |
| Workshop, crafting, ammo | when the first Ranged goblin is assigned |
| Population table stat columns | a "Details" toggle, or after war 1 |
| Debug tab | `?debug` in the URL, or the Expert UI toggle |
| Speeds 4x and 10x | 4x after step 5, 10x after war 1 |

## P1: next

1. **Readiness checklist instead of the War Room text.** Show a single *You ▮▮▮▯ vs Enemy ▮▮▮▮▯* bar and 4 checks: walls, warriors at the target, scouted, food for 3 days. (genre: Against the Storm, Frostpunk)
2. **Feedback juice.** Floating `+3 fruit` numbers on zone cards, a ✓ pop on goals, and the food-days number turning red to green. (genre: idle/tycoon)
3. **Compact Population view.** Show #, role, post, fit and status by default. Stats go behind "Details".
4. **A "Drill" action** (from the manhwa: line drills from the bottom up). This is a cheap training order that adds small STR/AGI gains without Training grounds. It's the manhwa's core "make the goblins competent" fantasy, and the prototype lacks it.
5. **Memo-style flavour lines** (12 are ready in `manhwa-research.md` §8) as toasts on events, instead of explanation text.
6. **Post-war summary screen:** what helped, what was missing, and what to do next war.

## P2: later

- Swap the zone cards for the clickable `assets/territory-overview.svg` map, using the icons in `assets/icons.svg`.
- Pace presets: Relaxed (war day 10), Standard, Challenge (war day 6).
- Tip fatigue: once the player dismisses a tip, don't show it again.
- Goblin kids as a visible "the territory is healthy" signal (reported from the manhwa, low confidence).

## Owner decisions needed

1. **Is losing a war still permadeath?** These recommendations keep it, with a rewind (P0 #8). The genre report suggests that losing war #1 should cost resources, not the run.
2. **First war on day 8?** It's the compromise between the premise's urgency (the manhwa's 4-day deadline is unconfirmed) and the genre report's suggestion of day 10.
3. **The advisor character:** an original goblin (recommended), or Manager Oh's inner voice.

## Rough effort

P0 is about a day of focused work, mostly in `ui.js`, `main.js` and a new objectives table in `data.js`, plus a sim test update. P1 is about another day. Nothing needs a new library.
