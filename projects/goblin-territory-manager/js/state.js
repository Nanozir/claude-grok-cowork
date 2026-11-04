// Game state: creation, RNG, small query helpers. No DOM access here.
var GTM = globalThis.GTM = globalThis.GTM || {};

// Seeded RNG (mulberry32) so runs are reproducible and saves stay consistent.
GTM.rand = function (state) {
  let t = (state.rng = (state.rng + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
GTM.randInt = (s, lo, hi) => lo + Math.floor(GTM.rand(s) * (hi - lo + 1));
GTM.pick = (s, arr) => arr[Math.floor(GTM.rand(s) * arr.length)];

GTM.makeZone = function (id) {
  const t = GTM.ZONES[id];
  return {
    id, name: t.name,
    explored: !t.exploreCost,
    exploreProgress: 0,
    road: !!t.home,
    focus: Object.keys(t.nodes)[0], // which resource node laborers work
    buildings: [],                  // building ids placed here
  };
};

GTM.makeGoblin = function (state, opts = {}) {
  const lo = opts.statLo || 2, hi = opts.statHi || 7;
  const g = {
    id: state.nextGoblinId++,
    stats: {},
    role: opts.role || 'idle',
    zone: opts.zone || 'valley',   // laborer: work zone. military: post zone or 'reserve'. scout: target.
    rank: 0,
    contribution: { lifetime: 0, recent: 0 },
    named: null,                   // { name, trait }
    position: null,                // position id when role = specialist
    injured: 0,                    // ticks until recovered
  };
  for (const st of GTM.STATS) g.stats[st] = GTM.randInt(state, lo, hi);
  if (opts.loy) g.stats.loy = opts.loy;
  return g;
};

GTM.newGame = function (seed, opts = {}) {
  const s = {
    version: 2,
    seed: seed >>> 0,
    rng: seed >>> 0,
    tick: 0,
    speed: 1,
    paused: true,
    level: 1,
    prestige: 0,
    cp: 15,
    morale: 55,
    moraleTarget: 55,
    moraleMods: [],          // { label, amount, ticksLeft }
    victoryMorale: 0,
    griefMorale: 0,
    resources: { meat: 6, fruit: 18, dried: 0, wood: 15, leather: 2, stone: 5, silk: 0, scrap: 0, ammo: 0, repairKits: 0, crossbows: 0 },
    ledger: {},              // last tick's net change per resource (for rate display)
    zones: {},
    zoneOrder: [],
    goblins: [],
    nextGoblinId: 1,
    buildQueue: [],          // { kind: 'building'|'road', id, zone, progress, work }
    researchQueue: [],       // { id, progress }
    researched: {},
    craftRecipe: 'ammo',
    craftProgress: 0,
    overtime: {},            // role -> { active, ticksLeft, cooldown }
    autoPromote: true,
    thresholds: GTM.RANKS.map(r => r.threshold),
    positions: { guardCaptain: null, leadResearcher: null, foreman: null },
    quota: null,
    intel: 0,
    war: null,
    warsWon: 0,
    starvingTicks: 0,
    gameOver: null,
    log: [],
    flags: {},
    tutorial: { guided: false, step: 0, stepStart: 0 },
    revealed: GTM.makeRevealed(),
    notices: [],             // { msg, pause } toasts for the UI; drained by main.js
    autoPause: true,
  };
  for (const id of ['valley', 'forest', 'river', 'spider']) {
    s.zones[id] = GTM.makeZone(id);
    s.zoneOrder.push(id);
  }
  for (const r of GTM.OVERTIME_ROLES) s.overtime[r] = { active: false, ticksLeft: 0, cooldown: 0 };
  // Starting population: 12 idle goblins and about 2.5 days of food. The first job is to fix that.
  for (let i = 0; i < 12; i++) s.goblins.push(GTM.makeGoblin(s));
  GTM.scheduleWar(s, (GTM.WAR.firstAtDay - 1) * GTM.TICKS_PER_DAY); // war starts at 00:00 on that day
  GTM.log(s, 'system', 'SYSTEM: You are now Lord. Territory War on Day ' + GTM.WAR.firstAtDay + '. Lose, and everyone dies.');
  if (opts.guided === false) GTM.revealAll(s);
  else GTM.startTutorial(s);
  return s;
};

GTM.scheduleWar = function (s, atTick) {
  const n = s.warsWon;
  const base = GTM.WAR.basePower * Math.pow(GTM.WAR.growth, n);
  const power = Math.round(base * (0.9 + GTM.rand(s) * 0.2));
  const targets = s.zoneOrder.filter(z => s.zones[z].explored);
  s.war = { number: n + 1, atTick, power, zone: GTM.pick(s, targets), warned: false };
  s.intel = 0;
};

GTM.log = function (s, type, msg) {
  s.log.push({ tick: s.tick, type, msg });
  if (s.log.length > 300) s.log.shift();
};

// ---- Query helpers ----
GTM.day = s => Math.floor(s.tick / GTM.TICKS_PER_DAY) + 1;
GTM.hour = s => s.tick % GTM.TICKS_PER_DAY;
GTM.fmtTime = t => 'D' + (Math.floor(t / GTM.TICKS_PER_DAY) + 1) + ' ' + String(t % GTM.TICKS_PER_DAY).padStart(2, '0') + ':00';
GTM.goblinName = g => g.named ? g.named.name : 'Goblin #' + g.id;
GTM.healthy = s => s.goblins.filter(g => g.injured <= 0);
GTM.countBuilding = (s, b) => s.zoneOrder.reduce((n, z) => n + s.zones[z].buildings.filter(x => x === b).length, 0);
GTM.hasBuilding = (s, b) => GTM.countBuilding(s, b) > 0;
GTM.zoneBuildings = (s, z, b) => s.zones[z].buildings.filter(x => x === b).length;
GTM.rankOf = g => GTM.RANKS[g.rank];
GTM.namedCount = s => s.goblins.filter(g => g.named).length;
GTM.namingSlots = s => s.level;
GTM.housingCap = s => GTM.HOUSING_BASE + GTM.HOUSING_PER * GTM.countBuilding(s, 'housing');
GTM.foodTotal = s => s.resources.meat + s.resources.fruit + s.resources.dried;

GTM.storageCap = function (s, res) {
  const cat = GTM.RESOURCES[res].cat;
  let cap = GTM.BASE_STORAGE[cat] + GTM.STORAGE_PER_WAREHOUSE[cat] * GTM.countBuilding(s, 'storage');
  if (s.researched.stacking) cap *= 1.5;
  return Math.round(cap);
};

// Average of the stats a role uses, divided by 5 (an average goblin = 1.0).
GTM.statFactor = function (g, role) {
  const fit = GTM.ROLES[role || g.role].fit;
  return fit.reduce((a, st) => a + g.stats[st], 0) / fit.length / 5;
};

GTM.roleSlots = function (s, role) {
  const def = GTM.ROLES[role];
  if (!def.requires) return Infinity;
  return GTM.countBuilding(s, def.requires) * def.perBuilding;
};

GTM.requirementsMet = function (s, req) {
  if (!req) return true;
  if (req.research && !s.researched[req.research]) return false;
  if (req.building && !GTM.hasBuilding(s, req.building)) return false;
  if (req.zone && !(s.zones[req.zone] && s.zones[req.zone].explored)) return false;
  return true;
};
GTM.describeReq = function (req) {
  if (!req) return '';
  const parts = [];
  if (req.research) parts.push('research ' + GTM.RESEARCH[req.research].name);
  if (req.building) parts.push(GTM.BUILDINGS[req.building].name);
  if (req.zone) parts.push('explore ' + GTM.ZONES[req.zone].name);
  return parts.join(', ');
};

GTM.canAfford = function (s, cost) {
  for (const k in cost) {
    const have = k === 'cp' ? s.cp : s.resources[k];
    if (have < cost[k]) return false;
  }
  return true;
};
GTM.pay = function (s, cost, sign = 1) {
  for (const k in cost) {
    if (k === 'cp') s.cp -= sign * cost[k];
    else s.resources[k] -= sign * cost[k];
  }
};
GTM.fmtCost = cost => Object.keys(cost).map(k => cost[k] + ' ' + (k === 'cp' ? 'CP' : GTM.RESOURCES[k].label)).join(', ');

GTM.dailyFoodNeed = function (s) {
  let need = 0;
  for (const g of s.goblins) {
    let f = GTM.rankOf(g).food;
    if (s.overtime[g.role] && s.overtime[g.role].active) f *= GTM.OVERTIME.food;
    need += f;
  }
  return need;
};

// Goblins whose lifetime contribution meets the next threshold but who are still unpromoted.
GTM.isEligible = function (s, g) {
  const next = g.rank + 1;
  if (next >= GTM.RANKS.length) return false;
  if (GTM.RANKS[next].minLevel > s.level) return false;
  return g.contribution.lifetime >= s.thresholds[next];
};
