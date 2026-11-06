// Headless simulation tests. Run: node tests/sim.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

for (const f of ['data.js', 'state.js', 'sim.js', 'onboarding.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), { filename: f });
}
const GTM = globalThis.GTM;
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : ''));
  if (!cond) failures++;
}
const run = (s, ticks, hook) => { for (let i = 0; i < ticks && !s.gameOver; i++) { GTM.tick(s); if (hook) hook(s); } };

// 1. Passive play: everyone gathers fruit, nobody defends, so war #1 is lost.
{
  const s = GTM.newGame(1);
  for (const g of s.goblins) GTM.assign(s, g, 'laborer', 'valley');
  run(s, (GTM.WAR.firstAtDay - 1) * 24 + 1);
  check('passive player loses war #1', !!s.gameOver, s.gameOver && s.gameOver.reason);
  check('passive economy does not starve before the war', !s.log.some(l => l.msg.startsWith('FOOD SHORTAGE')));
}

// 2. Prepared play: split roles, scout, build traps/palisade where the enemy will strike.
function preparedGame(seed) {
  const s = GTM.newGame(seed);
  const gs = s.goblins;
  // 4 fruit, 2 timber (forest), 2 builders, 3 warriors, 1 scout.
  for (const g of gs.slice(0, 4)) GTM.assign(s, g, 'laborer', 'valley');
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

// 2b. War #2 (GROK-REVIEW cliff): a prepared player who drafts half the captives and keeps
// trapping the scouted target should usually survive the second war too.
function playToWar2(s) {
  const target = s.war.atTick;
  run(s, target - s.tick + 2, st => {
    st.goblins.filter(g => g.role === 'idle').forEach((g, i) =>
      i % 2 === 0 ? GTM.assign(st, g, 'warrior', 'reserve') : GTM.assign(st, g, 'laborer', 'valley'));
    const est = GTM.enemyEstimate(st);
    if (est.zoneKnown) for (const g of st.goblins.filter(g => g.role === 'warrior')) g.zone = est.zone;
    if (st.buildQueue.length === 0) {
      const z = est.zoneKnown ? est.zone : 'valley';
      if (GTM.queueBuilding(st, 'pit_traps', z)) GTM.queueBuilding(st, 'palisade', 'valley');
    }
  });
  return s;
}
{
  let war1 = 0, war2 = 0, grows = true;
  for (let seed = 1; seed <= 10; seed++) {
    const s = preparedGame(seed);
    run(s, 2);
    if (s.gameOver || s.warsWon !== 1) continue;
    war1++;
    if (!(s.war.power > 36 * 0.9 * GTM.WAR.growth * 0.95)) grows = false;
    playToWar2(s);
    if (!s.gameOver && s.warsWon === 2) war2++;
  }
  check('war #2 enemy is stronger than war #1', grows && GTM.WAR.growth > 1);
  check('prepared player usually wins war #2', war2 >= Math.ceil(war1 * 0.75), war2 + '/' + war1 + ' war #1 survivors');
}

// 2c. War Room readiness checklist.
{
  const s = GTM.newGame(9);
  let r = GTM.warReadiness(s);
  check('readiness lists walls/warriors/scouted/food', ['scouted', 'walls', 'warriors', 'food'].every(id => r.items.some(i => i.id === id)));
  check('fresh territory is not war-ready', !r.ready && !r.items.find(i => i.id === 'scouted').ok);
  s.intel = GTM.WAR.intelPower;
  const z = s.war.zone;
  s.zones[z].buildings.push('palisade', 'pit_traps');
  GTM.assign(s, s.goblins[0], 'warrior', z); GTM.assign(s, s.goblins[1], 'warrior', z);
  s.resources.fruit += GTM.dailyFoodNeed(s) * 4;
  r = GTM.warReadiness(s);
  check('scouted, walled, posted and fed territory is ready', r.ready && r.target === z && r.known, r.items.filter(i => !i.ok).map(i => i.id).join());
  GTM.assign(s, s.goblins[2], 'warrior', 'reserve');
  check('a warrior left in reserve unticks "warriors on target"', !GTM.warReadiness(s).items.find(i => i.id === 'warriors').ok);
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

// 5. Onboarding: start state, objective chain, progressive reveal, migration.
{
  const s = GTM.newGame(5);
  check('goblins start idle', s.goblins.every(g => g.role === 'idle'));
  check('food starts short (2-3 days)', (() => { const d = GTM.foodTotal(s) / GTM.dailyFoodNeed(s); return d >= 2 && d < 3; })());
  check('day 1 shows only the Zones tab', s.revealed.tabs.join() === 'zones');
  check('first objective is fruit', GTM.currentObjective(s).id === 'fruit');
  for (let i = 0; i < 4; i++) GTM.autoAssign(s, 'laborer', 'valley');
  GTM.tick(s);
  check('fruit objective completes and reveals Forest + Wood', GTM.currentObjective(s).id === 'timber' && GTM.isRevealed(s, 'zones', 'forest') && GTM.isRevealed(s, 'res', 'wood'));
  // Doing two steps at once completes both.
  GTM.autoAssign(s, 'laborer', 'forest'); GTM.autoAssign(s, 'laborer', 'forest');
  GTM.autoAssign(s, 'builder'); GTM.autoAssign(s, 'builder');
  GTM.tick(s);
  check('several finished steps complete together', GTM.currentObjective(s).id === 'palisade' && GTM.isRevealed(s, 'tabs', 'build'));
  check('new tab produces a pausing notice', s.notices.some(n => n.pause && n.msg.includes('Construction')));
  check('only basic buildings revealed early', GTM.isRevealed(s, 'buildings', 'palisade') && !GTM.isRevealed(s, 'buildings', 'workshop'));
  s.resources.wood = 50;
  GTM.queueBuilding(s, 'palisade', 'valley');
  run(s, 26);
  check('watch-a-day step completes and reveals War Room', GTM.isRevealed(s, 'tabs', 'war') && GTM.currentObjective(s).id === 'scout');
  GTM.autoAssign(s, 'scout', 'enemy');
  for (let i = 0; i < 3; i++) GTM.autoAssign(s, 'warrior', 'reserve');
  GTM.tick(s);
  GTM.startOvertime(s, 'builder');
  GTM.tick(s);
  check('tutorial finishes after overtime', !s.tutorial.guided && GTM.currentObjective(s) === null);

  const t = GTM.newGame(6);
  GTM.skipTutorial(t);
  check('skip reveals every tab', GTM.ALL_TABS.every(x => GTM.isRevealed(t, 'tabs', x)));
  const v1 = JSON.parse(JSON.stringify(GTM.newGame(7)));
  v1.version = 1; delete v1.tutorial; delete v1.revealed; delete v1.notices;
  GTM.migrate(v1);
  check('v1 saves migrate to full UI', v1.version === 2 && GTM.isRevealed(v1, 'tabs', 'hierarchy') && !v1.tutorial.guided);
  const w = GTM.newGame(8);
  for (const g of w.goblins) GTM.assign(w, g, 'laborer', 'valley');
  run(w, (GTM.WAR.firstAtDay - 4) * 24);
  check('3-day war warning pauses', w.notices.some(n => n.pause && n.msg.startsWith('War in 3 days')));
  check('first war is on day ' + GTM.WAR.firstAtDay, w.war.atTick === (GTM.WAR.firstAtDay - 1) * 24);
}

console.log(failures ? failures + ' test(s) failed' : 'All tests passed');
process.exit(failures ? 1 : 0);

