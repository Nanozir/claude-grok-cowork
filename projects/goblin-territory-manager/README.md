# Goblin Territory Manager (browser prototype)

Author: NanPan

A playable prototype of the design in [Nanozir/goblin-territory-manager](https://github.com/Nanozir/goblin-territory-manager) (its README is the source of truth). You're a former corporate manager, now a goblin lord. You assign goblins, keep them fed, run research and survive Territory Wars by preparing for them.

## How to run

Open `index.html` in a browser. It needs no build step, no server and no dependencies, and it works from `file://`.

- A one-line memo opens the game. **Clock in** starts the guided first session, and *skip tutorial* shows the full dashboard straight away.
- Speeds are `II 1x 2x 4x`; 10x unlocks after the first war. **Space** pauses. At 1x, 1 in-game hour passes per second, so a day takes 24 s.
- Auto-pause (top bar) stops the clock for new tabs, war warnings (3 days and 1 day out), low food and the first accident.
- Losing a war still kills you, but a rewind point is saved at dawn the day before each war.
- **Save / Load** use browser storage. Debug > Export/Import moves a save as JSON text.
- Headless tests: `node tests/sim.test.js`

## First session (guided)

Goblins start idle with about 2.5 days of food. One goal at a time is pinned above the panel, each with a one-line reason from *Gruk from HR*:

1. 4 goblins on Fruit.
2. 2 goblins on Timber at the Forest Edge.
3. 2 Builders. This unlocks **Construction**, with only the palisade and pit traps at first.
4. Queue a palisade.
5. Let a day pass. This unlocks **Population**, **War Room**, the other zones and more buildings.
6. 1 Scout on the enemy.
7. 3 Warriors.
8. Try Overtime on Builders.

Other surfaces appear when you need them. **Hierarchy** opens with the first promotion or on Day 4, and **R&D** once a Research hut is built. The first war is on **Day 8**. The design and research behind this are in [`research/`](research/onboarding-recommendations.md).

## What's implemented

| System | Status |
|---|---|
| **Territory & zones:** 4 starting zones (Spider Forest needs scouting) plus 3 conquest zones. Each has resource nodes (choose a work focus), danger, a safe capacity (overcrowding cuts output and raises risk), building slots and roads (without a road, output ×0.75) | Done |
| **Resources:** food (fruit/meat/dried) with spoilage, materials, silk, scrap, ammo, repair kits, crossbows. Storage caps, per-day rates, Contribution Points, Prestige, Territory Level | Done |
| **Goblins:** STR/AGI/INT/END/LOY, role, post, rank, lifetime/recent contribution, injuries, optional Named status | Done |
| **Roles:** Idle, Laborer, Builder, Warrior, Ranged, Scout, Researcher (needs a Research hut, 3 slots each), Craftsman (needs a Workshop, 2 slots each), Specialist (Named only, through positions). Best-fit auto-assign, per-goblin dropdowns, bulk assign, sortable table | Done |
| **Time tick:** work, construction, research, crafting, food use, spoilage, storage caps, zone incidents, morale drift, daily growth/desertion/starvation/random events | Done |
| **Overtime:** per role, +40% output, +30% food, morale penalty, 2-day max then 3-day cooldown | Done |
| **Hierarchy:** Intern → Regular → Senior → Captain/Lead → Director (Director at Territory Level 2). Editable promotion thresholds, auto-promote, manual promotion for CP. Higher ranks eat more. Seniors+ fight better and can lead research. Captains+ buff their squad | Done |
| **Incentives:** Meat Feast, Merit Bonus, and quota projects (gather X in N days for a contribution reward) | Done |
| **Morale:** a visible breakdown covering food security, victories, deaths, Named leaders, fairness (goblins waiting on promotion), overtime, overcrowding and temporary modifiers. It scales all output and drives desertion | Done |
| **Buildings:** pit traps, palisade, watchtower, storage, housing, training grounds, workshop, research hut, crossbow workshop, reinforced wall. Materials, builder work, time | Done |
| **R&D:** 12 queued projects across process, weapons, tactics, logistics and invention. Some have prerequisites (building, research or explored zone), and some need a Senior+ lead | Done |
| **Territory War:** countdown, scouting intel (attack zone, then accurate strength), projected defense for each zone, positioning (posted, reserve or elsewhere), traps, forts, ammo, crossbows, formations, leaders, morale, ±10% rolls on each side, a detailed battle log. A win absorbs a zone, adds captives and loot, and raises your level. A loss ends the game | Done |
| **Naming:** slots = Territory Level, costs 40 CP, +3 all stats, max loyalty, 5 traits. Positions: Guard Captain, Lead Researcher, Foreman | Done (secondary) |
| **Debug panel:** state inspector, resource/CP cheats, skip a day, force a war, reveal intel. Hidden unless the URL has `?debug` or the tutorial is skipped | Done |
| **Onboarding:** intro memo, 8-step objective chain, progressive reveal of tabs, resources, zones and buildings, auto-pause notices, rewind checkpoint, compact Population table ("Show stats" for everything), descriptions moved into ⓘ tooltips | Done (P0 of `research/onboarding-recommendations.md`) |

## Stubbed or simplified (not yet built)

- **Map:** zones are cards, not a grid or node map. Connectivity is just "road or no road" per zone, with no travel-time simulation.
- **Water** is listed in the design as a resource node but isn't modeled yet.
- **Equipment priority by rank** isn't modeled. Crossbows go to the best shooters.
- **Multiple territories / local directors:** not built. Conquered land merges into a single territory.
- **Tactical layer:** wars resolve automatically and the battle log shows how. Formation doctrines are research bonuses, not a setting you choose.
- **Unique units / humans recruited from events:** only one-off events (stray goblins, rare beasts, storms, a rescued scholar).
- **Balance:** first-pass numbers, all tunable in `js/data.js`. The tests check that a passive player loses war #1 and a basic prepared strategy usually wins it.

## Code layout

```
index.html        page shell
css/style.css     dashboard styling
js/data.js        all static definitions and tuning numbers
js/state.js       state shape, new game, seeded RNG, query helpers
js/sim.js         tick, player actions, war resolution (no DOM)
js/onboarding.js  objectives, progressive reveal, notices, save migration (no DOM)
js/ui.js          renders panels to HTML strings
js/main.js        loop, event delegation, save/load
tests/sim.test.js headless Node tests for the sim
```

All game state is one plain JSON-serialisable object, so saves are just `JSON.stringify(state)`. In the browser console, `GTM_STATE()` returns the live state.
