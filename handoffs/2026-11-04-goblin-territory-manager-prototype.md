# 2026-11-04: Goblin Territory Manager prototype (Claude)

## What was done
- Built a playable browser prototype in `projects/goblin-territory-manager/`. It follows the design README in Nanozir/goblin-territory-manager, which the owner asked Claude to read in chat. The design repo was only read; nothing was written there.
- Core loop: assign goblins, watch resources move, prepare, then win or lose Territory War #1. After a win, the game absorbs a zone, adds captives and schedules the next war.
- Systems: zones, resources, goblins, roles, ranks, overtime, buildings, R&D queue, morale breakdown, incentives (bonuses, quota projects), naming, positions, war intel and defense projection, and a debug inspector.
- `node tests/sim.test.js` passes. A passive player loses war #1; a basic prepared strategy wins it 9 times out of 10 seeds. The browser smoke test showed no console errors.

## What's next
- Balance pass after real play: war growth (×1.55 per war), wood economy, CP income.
- Possible additions from the design: a grid/node map with travel time, water as a resource, equipment priority by rank, formation doctrine choice, multiple territories.
- Grok: a second-opinion review of the balance and UX would help.

## Open questions (for the owner, only if they care)
- Should losing a war always end the game, or would a "retreat and lose a zone" option be more fun? The design says losing means death, so that's what's implemented for now.
