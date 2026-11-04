// Onboarding: guided objectives, progressive reveal of UI surfaces, notices and auto-pause.
// No DOM access here, so the Node tests can drive it.
var GTM = globalThis.GTM = globalThis.GTM || {};

GTM.ADVISOR = 'Gruk from HR';

// What the UI can reveal. Ids must match ui.js.
GTM.ALL_TABS = ['zones', 'build', 'population', 'war', 'hierarchy', 'research', 'debug'];
GTM.ALL_RES = ['food', 'wood', 'pop', 'stone', 'leather', 'silk', 'scrap', 'ammo', 'repairKits', 'crossbows', 'morale', 'cp', 'prestige', 'foodTypes'];
GTM.TAB_NAMES = { zones: 'Zones', build: 'Construction', population: 'Population', war: 'War Room', hierarchy: 'Hierarchy', research: 'R&D', debug: 'Debug' };

const count = (s, fn) => s.goblins.filter(fn).length;

// The guided first session. One goal at a time.
// start: what to reveal when the step becomes current. done(s): completion test. tab: where "Show me" goes.
GTM.OBJECTIVES = [
  { id: 'fruit', text: 'Put 4 goblins on Fruit in the Valley', why: 'Goblins that don\'t eat don\'t work.', tab: 'zones',
    start: { zones: ['valley'] },
    done: s => s.zones.valley.focus === 'fruit' && count(s, g => g.role === 'laborer' && g.zone === 'valley') >= 4 },
  { id: 'timber', text: 'Send 2 goblins to the Forest Edge for Timber', why: 'Walls are made of wood.', tab: 'zones',
    start: { zones: ['forest'], res: ['wood'] },
    done: s => s.zones.forest.focus === 'timber' && count(s, g => g.role === 'laborer' && g.zone === 'forest') >= 2 },
  { id: 'builders', text: 'Make 2 Builders', why: 'Someone has to hold the hammer.', tab: 'build',
    start: { tabs: ['build'], buildings: ['palisade', 'pit_traps'] },
    done: s => count(s, g => g.role === 'builder') >= 2 },
  { id: 'palisade', text: 'Queue a Wooden palisade in the Valley', why: 'War on Day 8. Start the paperwork.', tab: 'build',
    done: s => s.zones.valley.buildings.includes('palisade') || s.buildQueue.some(q => q.id === 'palisade' && q.zone === 'valley') },
  { id: 'day', text: 'Press 1x and let a day pass', why: 'Watch the numbers move. Breathe.', tab: 'zones',
    done: s => s.tick >= s.tutorial.stepStart + GTM.TICKS_PER_DAY },
  { id: 'scout', text: 'Make 1 Scout and send them at the enemy', why: 'Know where they\'ll hit before they do.', tab: 'war',
    start: { tabs: ['population', 'war'], zones: ['river', 'spider'], res: ['stone', 'morale'], buildings: ['watchtower', 'storage', 'housing'] },
    done: s => count(s, g => g.role === 'scout' && g.zone === 'enemy') >= 1 },
  { id: 'warriors', text: 'Make 3 Warriors', why: 'A goblin in line is a goblin alive. Post them where the scout says.', tab: 'war',
    done: s => count(s, g => g.role === 'warrior') >= 3 },
  { id: 'overtime', text: 'Behind schedule? Start Overtime for Builders', why: 'It\'s a growth opportunity. (Morale goes down.)', tab: 'build',
    start: { flags: ['overtime'] },
    done: s => !!s.flags.usedOvertime },
];

GTM.makeRevealed = () => ({ tabs: ['zones'], res: ['food', 'pop'], zones: ['valley'], buildings: [], flags: [], newTabs: [] });

GTM.revealAll = function (s) {
  const r = s.revealed;
  r.tabs = GTM.ALL_TABS.slice();
  r.res = GTM.ALL_RES.slice();
  r.zones = s.zoneOrder.slice();
  r.buildings = Object.keys(GTM.BUILDINGS);
  r.flags = ['overtime', 'speed10', 'details'];
  r.newTabs = [];
};

GTM.isRevealed = (s, kind, id) => s.revealed[kind].includes(id);

// Reveal ids of one kind. Returns true if anything was new. New tabs trigger a pausing notice.
GTM.reveal = function (s, kind, ids) {
  let any = false;
  for (const id of ids) {
    if (s.revealed[kind].includes(id)) continue;
    s.revealed[kind].push(id);
    any = true;
    if (kind === 'tabs' && id !== 'debug') {
      s.revealed.newTabs.push(id);
      GTM.notify(s, 'New tab unlocked: ' + GTM.TAB_NAMES[id], true);
    }
  }
  return any;
};

GTM.applyStart = function (s, start) {
  if (!start) return;
  for (const kind in start) GTM.reveal(s, kind, start[kind]);
};

// Notices become toasts in the UI. pause: true also pauses the game (if auto-pause is on).
GTM.notify = function (s, msg, pause) {
  s.notices.push({ msg, pause: !!pause });
};

GTM.currentObjective = s => s.tutorial.guided ? GTM.OBJECTIVES[s.tutorial.step] || null : null;

GTM.skipTutorial = function (s) {
  s.tutorial.guided = false;
  GTM.revealAll(s);
  GTM.log(s, 'info', 'Tutorial skipped. Full dashboard enabled.');
};

GTM.startTutorial = function (s) {
  s.tutorial = { guided: true, step: 0, stepStart: s.tick };
  GTM.applyStart(s, GTM.OBJECTIVES[0].start);
};

// Called every tick from GTM.tick (and once after player actions, from the UI).
GTM.onboardingTick = function (s) {
  // Objectives: allow several to complete at once (e.g. the player did step 2 before step 1).
  let obj;
  while ((obj = GTM.currentObjective(s)) && obj.done(s)) {
    s.tutorial.step++;
    s.tutorial.stepStart = s.tick;
    const next = GTM.currentObjective(s);
    GTM.notify(s, '✓ ' + obj.text, false);
    if (next) GTM.applyStart(s, next.start);
    else {
      s.tutorial.guided = false;
      GTM.notify(s, GTM.ADVISOR + ': Onboarding complete. Now survive Day ' + (Math.floor(s.war.atTick / GTM.TICKS_PER_DAY) + 1) + '.', true);
      GTM.log(s, 'good', 'Onboarding complete. The full dashboard unlocks as you need it.');
    }
  }
  GTM.unlockRules(s);
};

// Reveals that happen by need, guided or not.
GTM.unlockRules = function (s) {
  const day = GTM.day(s);
  const res = s.resources;
  if (s.goblins.some(g => GTM.isEligible(s, g)) || day >= 4) { GTM.reveal(s, 'tabs', ['hierarchy']); GTM.reveal(s, 'res', ['cp']); }
  if (Math.abs(s.morale - 55) >= 5 || day >= 2) GTM.reveal(s, 'res', ['morale']);
  if (GTM.hasBuilding(s, 'research_hut')) GTM.reveal(s, 'tabs', ['research']);
  if (day >= 5 || s.warsWon >= 1) GTM.reveal(s, 'buildings', ['training_grounds', 'workshop', 'research_hut']);
  if (s.warsWon >= 1) {
    GTM.reveal(s, 'buildings', Object.keys(GTM.BUILDINGS));
    GTM.reveal(s, 'res', ['prestige']);
    GTM.reveal(s, 'flags', ['speed10', 'details']);
  }
  if (s.goblins.some(g => g.role === 'ranged') || res.ammo > 0) GTM.reveal(s, 'res', ['ammo']);
  if ((s.ledger.stone || 0) > 0) GTM.reveal(s, 'res', ['stone']);
  for (const r of ['leather', 'silk', 'scrap', 'repairKits', 'crossbows']) if ((s.ledger[r] || 0) > 0 || res[r] >= 5) GTM.reveal(s, 'res', [r]);
  if (res.dried > 0 || res.meat >= 10) GTM.reveal(s, 'res', ['foodTypes']);
  // Conquered zones join the map as soon as they exist.
  if (s.revealed.zones.includes('river')) GTM.reveal(s, 'zones', s.zoneOrder.filter(z => GTM.ZONES[z].conquest));
  // Any zone the enemy is known to target must be visible.
  if (s.war) { const est = GTM.enemyEstimate(s); if (est.zoneKnown) GTM.reveal(s, 'zones', [est.zone]); }
};

// Old (v1) saves predate onboarding: show everything.
GTM.migrate = function (s) {
  if (s.version === 1) {
    s.version = 2;
    s.tutorial = { guided: false, step: GTM.OBJECTIVES.length, stepStart: 0 };
    s.revealed = GTM.makeRevealed();
    GTM.revealAll(s);
    s.notices = [];
    s.autoPause = true;
    s.flags = s.flags || {};
    s.flags.introDone = true;
  }
  return s;
};
