// Headless simulation tests. Run: node tests/sim.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

for (const f of ['data.js', 'state.js', 'sim.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), { filename: f });
}
const GTM = globalThis.GTM;
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : ''));
  if (!cond) failures++;
}
const run = (s, ticks, hook) => { for (let i = 0; i < ticks && !s.gameOver; i++) { GTM.tick(s); if (hook) hook(s); } };

// 1. Passive play: nobody defends, so war #1 is lost.
{
  const s = GTM.newGame(1);
  run(s, (GTM.WAR.firstAtDay - 1) * 24 + 1);
  check('passive player loses war #1', !!s.gameOver, s.gameOver && s.gameOver.reason);
  check('passive economy does not starve before the war', !s.log.some(l => l.msg.startsWith('FOOD SHORTAGE')));
}

// 2. Prepared play: split roles, scout, build traps/palisade where the enemy will strike.
function preparedGame(seed) {
  const s = GTM.newGame(seed);
  const gs = s.goblins;
  // 4 fruit, 2 timber (forest), 2 builders, 3 warriors, 1 scout.
  GTM.assign(s, gs[4], 'laborer', 'forest'); GTM.assign(s, gs[5], 'laborer', 'forest');
  s.zones.forest.focus = 'timber';
  GTM.assign(s, gs[6], 'builder'); GTM.assign(s, gs[7], 'builder');
  GTM.assign(s, gs[8], 'warrior', 'reserve'); GTM.assign(s, gs[9], 'warrior', 'reserve'); GTM.assign(s, gs[10], 'warrior', 'reserve');
  GTM.assign(s, gs[11], 'scout', 'enemy');
  let placed = false;
  run(s, (GTM.WAR.firstAtDay - 1) * 24 - 1, st => {
    const est = GTM.enemyEstimate(st);
    if (est.zoneKnown && !placed) {
      placed = true;
      for (const g of st.goblins.filter(g => g.role === 'warrior')) g.zone = est.zone;
    }
    if (st.buildQueue.length === 0) {
      const z = placed ? est.zone : 'valley';
      if (GTM.queueBuilding(st, 'pit_traps', z)) GTM.queueBuilding(st, 'palisade', 'valley');
    }
  });
  return s;
}
{
  let wins = 0;
  const N = 10;
  for (let seed = 1; seed <= N; seed++) {
    const s = preparedGame(seed);
    const est = GTM.enemyEstimate(s);
    const def = GTM.computeDefense(s, s.war.zone).total;
    run(s, 2);
    if (!s.gameOver && s.warsWon === 1) wins++;
    if (seed === 1) console.log('  seed 1: defense', def.toFixed(1), 'enemy', s.war ? '(next war scheduled)' : '', 'est', est.lo + '-' + est.hi);
  }
  check('prepared player usually wins war #1', wins >= 7, wins + '/' + N + ' wins');
}

// 3. Mechanics sanity.
{
  const s = GTM.newGame(3);
  check('cannot assign researcher without a hut', GTM.assign(s, s.goblins[0], 'researcher') !== null);
  s.resources.wood = 100; s.resources.stone = 100;
  check('queue research hut', GTM.queueBuilding(s, 'research_hut', 'valley') === null);
  check('materials paid on queue', s.resources.wood === 85);
  check('cancel refunds', GTM.cancelBuild(s, 0) === null && s.resources.wood === 100);
  s.zones.valley.buildings.push('research_hut');
  check('researcher allowed with a hut', GTM.assign(s, s.goblins[0], 'researcher') === null);
  check('research slots limited to 3 per hut',
    [1, 2, 3].map(i => GTM.assign(s, s.goblins[i], 'researcher')).filter(e => e).length === 1);
  s.cp = 100;
  check('lead-only research blocked without a Senior', (GTM.queueResearch(s, 'gathering1'), s.researched.gathering1 = true, GTM.queueResearch(s, 'gathering2') === null && GTM.researchBlocked(s, 'gathering2')));
  s.cp = 10;
  check('naming costs CP', GTM.nameGoblin(s, s.goblins[5], 'Grik', 'leadership') !== null);
  s.cp = 100;
  check('naming works with CP', GTM.nameGoblin(s, s.goblins[5], 'Grik', 'leadership') === null && s.goblins[5].named.name === 'Grik');
  check('only one naming slot at level 1', GTM.nameGoblin(s, s.goblins[6], 'Snag', 'fire') !== null);
  check('named goblin can hold a position', GTM.setPosition(s, 'guardCaptain', s.goblins[5].id) === null && s.goblins[5].role === 'specialist');
  check('overtime starts', GTM.startOvertime(s, 'laborer') === null);
  run(s, 49);
  check('overtime ends after 2 days and cools down', !s.overtime.laborer.active && s.overtime.laborer.cooldown > 0);
  const t = GTM.computeMoraleTarget(s);
  check('morale target in range', t.total >= 0 && t.total <= 100, 'target ' + t.total);
}

// 4. Starvation hurts.
{
  const s = GTM.newGame(4);
  for (const g of s.goblins) GTM.assign(s, g, 'idle');
  run(s, 5 * 24);
  check('idle territory starves and morale drops', s.starvingTicks > 0 && s.morale < 40, 'morale ' + s.morale.toFixed(1));
}

console.log(failures ? failures + ' test(s) failed' : 'All tests passed');
process.exit(failures ? 1 : 0);
