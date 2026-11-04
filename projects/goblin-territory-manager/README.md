# Goblin Territory Manager (browser prototype)

Author: NanPan

A playable prototype of the design in [Nanozir/goblin-territory-manager](https://github.com/Nanozir/goblin-territory-manager) (its README is the source of truth). You're a former corporate manager, now a goblin lord. You assign goblins, keep them fed, run research and survive Territory Wars by preparing for them.

## How to run

Open `index.html` in a browser. It needs no build step, no server and no dependencies, and it works from `file://`.

- The game starts **paused**. Use the speed buttons (`II 1x 2x 5x 10x`) or **Space**. At 1x, 1 in-game hour passes every 0.5 s.
- **Save / Load** use browser storage. Debug > Export/Import moves a save as JSON text.
- Headless tests: `node tests/sim.test.js`

## First-game tips

1. **Population:** take a few laborers off fruit. Make 2 Builders, 3+ Warriors and 1 Scout (on "Scout enemy").
2. **Zones:** send 2 laborers to the Forest Edge on Timber, since wood is the bottleneck.
3. **War Room:** once intel reaches 15, the attack zone shows. Post your warriors there and queue pit traps and a palisade in that zone.
4. Keep at least 3 days of food for the morale bonus. Don't let anyone wait too long for a promotion.

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
| **Debug panel:** state inspector, resource/CP cheats, skip a day, force a war, reveal intel | Done |

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
js/ui.js          renders panels to HTML strings
js/main.js        loop, event delegation, save/load
tests/sim.test.js headless Node tests for the sim
```

All game state is one plain JSON-serialisable object, so saves are just `JSON.stringify(state)`. In the browser console, `GTM_STATE()` returns the live state.
