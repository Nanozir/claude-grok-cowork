// Simulation: the time tick, player actions and war resolution. No DOM access here.
var GTM = globalThis.GTM = globalThis.GTM || {};

const T = () => GTM.TICKS_PER_DAY;

// ---------- Modifiers ----------
GTM.moraleFactor = s => 0.6 + s.morale * 0.006; // 0.6 at 0, 1.0 at ~67, 1.2 at 100

GTM.positionHolder = function (s, pos) {
  const id = s.positions[pos];
  const g = id && s.goblins.find(x => x.id === id);
  return g && g.injured <= 0 ? g : null;
};
GTM.positionBonus = function (s, pos, base) {
  const g = GTM.positionHolder(s, pos);
  if (!g) return 0;
  return g.named.trait === GTM.POSITIONS[pos].trait ? base * 2 : base;
};

GTM.gatherMult = function (s) {
  let m = 1;
  if (s.researched.gathering1) m += 0.2;
  if (s.researched.gathering2) m += 0.2;
  m += GTM.positionBonus(s, 'foreman', 0.15);
  return m;
};
GTM.researchMult = s => 1 + GTM.positionBonus(s, 'leadResearcher', 0.25);
GTM.overtimeOn = (s, role) => !!(s.overtime[role] && s.overtime[role].active);
GTM.workerFactor = function (s, g) {
  let f = GTM.statFactor(g) * GTM.moraleFactor(s);
  if (GTM.overtimeOn(s, g.role)) f *= GTM.OVERTIME.output;
  return f;
};
GTM.offroad = function (s, zoneId) {
  const z = s.zones[zoneId];
  if (z.road || GTM.ZONES[zoneId].home) return 1;
  return s.researched.trails ? 0.85 : GTM.OFFROAD_PENALTY;
};
GTM.zoneDanger = function (s, zoneId) {
  let d = GTM.ZONES[zoneId].danger;
  if (GTM.zoneBuildings(s, zoneId, 'watchtower') > 0) d *= 0.5;
  const guards = s.goblins.filter(g => GTM.ROLES[g.role].military && g.zone === zoneId && g.injured <= 0).length;
  if (guards > 0) d *= 0.7;
  return d;
};
GTM.hasResearchLead = function (s) {
  if (GTM.positionHolder(s, 'leadResearcher')) return true;
  return s.goblins.some(g => g.role === 'researcher' && g.injured <= 0 && g.rank >= 2);
};

// ---------- Production preview (used by tick and UI) ----------
// Returns { [zoneId]: { workers, perDay: {res: amount}, crowding } }
GTM.zoneOutput = function (s) {
  const out = {};
  const gm = GTM.gatherMult(s);
  for (const zid of s.zoneOrder) {
    const z = s.zones[zid];
    const workers = s.goblins.filter(g => g.role === 'laborer' && g.zone === zid && g.injured <= 0);
    const cap = GTM.ZONES[zid].capacity;
    const crowding = workers.length > cap ? cap / workers.length : 1;
    const perDay = {};
    const yields = GTM.ZONES[zid].nodes[z.focus].yields;
    for (const g of workers) {
      const f = GTM.workerFactor(s, g) * gm * crowding * GTM.offroad(s, zid);
      for (const r in yields) perDay[r] = (perDay[r] || 0) + yields[r] * f;
    }
    out[zid] = { workers, perDay, crowding };
  }
  return out;
};

// ---------- Tick ----------
GTM.tick = function (s) {
  if (s.gameOver) return;
  s.tick++;
  const before = Object.assign({}, s.resources);
  const day = T();

  for (const g of s.goblins) if (g.injured > 0) g.injured--;

  // 1. Work.
  const out = GTM.zoneOutput(s);
  for (const zid in out) {
    const { workers, perDay, crowding } = out[zid];
    for (const r in perDay) {
      const amt = perDay[r] / day;
      s.resources[r] += amt;
      if (s.quota && s.quota.resource === r) {
        s.quota.progress += amt;
        for (const g of workers) s.quota.contributors[g.id] = true;
      }
    }
    for (const g of workers) GTM.addContribution(s, g, 0.1 * GTM.workerFactor(s, g) * crowding);
  }

  let buildWork = 0, researchWork = 0, craftWork = 0;
  const hasTraining = GTM.hasBuilding(s, 'training_grounds');
  for (const g of s.goblins) {
    if (g.injured > 0) continue;
    const f = GTM.workerFactor(s, g);
    switch (g.role) {
      case 'builder':
        buildWork += GTM.WORK_PER_DAY.builder * f / day;
        GTM.addContribution(s, g, 0.1 * f); break;
      case 'researcher': {
        let w = GTM.WORK_PER_DAY.researcher * f / day;
        if (g.named && g.named.trait === 'crafting') w *= 2;
        researchWork += w;
        GTM.addContribution(s, g, 0.1 * f); break;
      }
      case 'craftsman': {
        let w = GTM.WORK_PER_DAY.craftsman * f / day;
        if (g.named && g.named.trait === 'crafting') w *= 2;
        craftWork += w;
        GTM.addContribution(s, g, 0.1 * f); break;
      }
      case 'scout': {
        let w = GTM.WORK_PER_DAY.scout * f / day;
        if (g.named && g.named.trait === 'pathfinder') w *= 2;
        GTM.scoutWork(s, g, w);
        GTM.addContribution(s, g, 0.1 * f); break;
      }
      case 'warrior': case 'ranged':
        GTM.addContribution(s, g, 0.05);
        if (hasTraining && s.tick % day === 0) {
          const st = g.role === 'warrior' ? 'str' : 'agi';
          if (g.stats[st] < 12) g.stats[st] = Math.round((g.stats[st] + 0.2) * 10) / 10;
        }
        break;
      case 'specialist':
        GTM.addContribution(s, g, 0.08); break;
    }
  }
  GTM.applyBuildWork(s, buildWork);
  GTM.applyResearchWork(s, researchWork * GTM.researchMult(s));
  GTM.applyCraftWork(s, craftWork);

  // 2. Food.
  GTM.consumeFood(s);

  // 3. Storage caps.
  let foodCap = GTM.storageCap(s, 'meat');
  let food = GTM.foodTotal(s);
  if (food > foodCap) {
    const k = foodCap / food;
    for (const r of ['meat', 'fruit', 'dried']) s.resources[r] *= k;
  }
  for (const r in s.resources) {
    if (GTM.RESOURCES[r].cat === 'food') continue;
    s.resources[r] = Math.min(s.resources[r], GTM.storageCap(s, r));
  }

  // 4. Zone danger.
  for (const zid in out) {
    const { workers, crowding } = out[zid];
    const danger = GTM.zoneDanger(s, zid) / crowding; // over capacity => riskier
    for (const g of workers) if (GTM.rand(s) < danger / day) GTM.incident(s, g, zid);
  }

  // 5. Timers.
  for (const role in s.overtime) {
    const o = s.overtime[role];
    if (o.active && --o.ticksLeft <= 0) {
      o.active = false; o.cooldown = GTM.OVERTIME.cooldownTicks;
      GTM.log(s, 'info', 'Overtime campaign for ' + GTM.ROLES[role].label + 's ended. Cooldown ' + o.cooldown / day + ' days.');
    } else if (!o.active && o.cooldown > 0) o.cooldown--;
  }
  for (const m of s.moraleMods) m.ticksLeft--;
  s.moraleMods = s.moraleMods.filter(m => m.ticksLeft > 0);
  if (s.quota) GTM.tickQuota(s);
  if (s.autoPromote) GTM.autoPromote(s);

  // 6. Daily.
  if (s.tick % day === 0) GTM.daily(s);

  // 7. Morale.
  s.moraleTarget = GTM.computeMoraleTarget(s).total;
  const diff = s.moraleTarget - s.morale;
  s.morale = Math.max(0, Math.min(100, s.morale + Math.sign(diff) * Math.min(Math.abs(diff), 0.5)));

  // 8. War.
  GTM.warTick(s);

  // Ledger: net change this tick, for per-day rate display.
  for (const r in s.resources) s.ledger[r] = s.resources[r] - before[r];

  // Food alarm: pause once when stocks drop under a day; re-arm once back above two days.
  const foodDays = GTM.foodTotal(s) / Math.max(1, GTM.dailyFoodNeed(s));
  if (foodDays < 1 && !s.flags.foodAlarm) { s.flags.foodAlarm = true; GTM.notify(s, 'Food under 1 day! Put more goblins on Fruit or Hunting.', true); }
  else if (foodDays > 2) s.flags.foodAlarm = false;

  if (GTM.onboardingTick) GTM.onboardingTick(s);
};

GTM.addContribution = function (s, g, amt) {
  g.contribution.lifetime += amt;
  g.contribution.recent += amt;
  s.cp += amt * 0.5;
};

GTM.scoutWork = function (s, g, w) {
  if (g.zone === 'enemy') { s.intel += w; return; }
  const z = s.zones[g.zone];
  if (!z || z.explored) { s.intel += w; return; } // nothing to explore: fall back to intel
  z.exploreProgress += w;
  if (z.exploreProgress >= GTM.ZONES[z.id].exploreCost) {
    z.explored = true;
    GTM.log(s, 'good', 'Scouts mapped ' + z.name + '. It can now be worked and built on.');
    for (const sc of s.goblins) if (sc.role === 'scout' && sc.zone === z.id) sc.zone = 'enemy';
  }
};

GTM.incident = function (s, g, zid) {
  const zname = s.zones[zid].name;
  if (!s.flags.firstIncident) {
    s.flags.firstIncident = true;
    GTM.notify(s, 'First workplace accident at ' + zname + '. Crowded or dangerous zones hurt goblins. Guards and watchtowers help.', true);
  }
  const deadly = GTM.rand(s) < 0.25 && !(g.named && g.named.trait === 'ironhide');
  if (deadly) {
    GTM.log(s, 'bad', GTM.goblinName(g) + ' was killed in an accident at ' + zname + '.');
    GTM.removeGoblin(s, g);
    s.griefMorale = Math.min(20, s.griefMorale + 4);
  } else {
    g.injured = 2 * T();
    GTM.log(s, 'warn', GTM.goblinName(g) + ' was injured at ' + zname + ' (out for 2 days).');
  }
};

GTM.removeGoblin = function (s, g) {
  s.goblins = s.goblins.filter(x => x !== g);
  for (const p in s.positions) if (s.positions[p] === g.id) s.positions[p] = null;
};

GTM.applyBuildWork = function (s, work) {
  while (work > 0 && s.buildQueue.length) {
    const item = s.buildQueue[0];
    const need = item.work - item.progress;
    const used = Math.min(need, work);
    item.progress += used; work -= used;
    if (item.progress >= item.work - 1e-9) {
      s.buildQueue.shift();
      const z = s.zones[item.zone];
      if (item.kind === 'road') { z.road = true; GTM.log(s, 'good', 'Road to ' + z.name + ' completed.'); }
      else { z.buildings.push(item.id); GTM.log(s, 'good', GTM.BUILDINGS[item.id].name + ' completed in ' + z.name + '.'); }
    }
  }
};

GTM.researchBlocked = function (s, id) {
  const r = GTM.RESEARCH[id];
  return r.lead && !GTM.hasResearchLead(s);
};
GTM.applyResearchWork = function (s, work) {
  while (work > 0) {
    const item = s.researchQueue.find(q => !GTM.researchBlocked(s, q.id));
    if (!item) return;
    const def = GTM.RESEARCH[item.id];
    const used = Math.min(def.work - item.progress, work);
    item.progress += used; work -= used;
    if (item.progress >= def.work - 1e-9) {
      s.researchQueue = s.researchQueue.filter(q => q !== item);
      s.researched[item.id] = true;
      GTM.log(s, 'good', 'Research complete: ' + def.name + '. ' + def.desc);
    }
  }
};

GTM.applyCraftWork = function (s, work) {
  if (work <= 0) return;
  const rec = GTM.RECIPES[s.craftRecipe];
  if (!rec || !GTM.requirementsMet(s, rec.requires)) return;
  s.craftProgress += work;
  while (s.craftProgress >= rec.work) {
    if (!GTM.canAfford(s, rec.in)) { s.craftProgress = rec.work; return; } // stalled on inputs
    GTM.pay(s, rec.in);
    for (const r in rec.out) s.resources[r] += rec.out[r];
    s.craftProgress -= rec.work;
  }
};

GTM.consumeFood = function (s) {
  const pres = s.researched.preservation ? 0.5 : 1;
  for (const r in GTM.SPOILAGE_PER_DAY) s.resources[r] -= s.resources[r] * GTM.SPOILAGE_PER_DAY[r] * pres / T();
  let need = GTM.dailyFoodNeed(s) / T();
  // Eat perishables first, dried goods last.
  for (const r of ['fruit', 'meat', 'dried']) {
    const eat = Math.min(need, s.resources[r]);
    s.resources[r] -= eat; need -= eat;
  }
  if (need > 1e-6) {
    if (s.starvingTicks === 0) GTM.log(s, 'bad', 'FOOD SHORTAGE: the territory has run out of food. Morale is collapsing.');
    s.starvingTicks++;
  } else s.starvingTicks = 0;
};

GTM.daily = function (s) {
  for (const g of s.goblins) g.contribution.recent *= 0.7; // "recent" decays
  s.victoryMorale = Math.max(0, s.victoryMorale - 1);
  s.griefMorale = Math.max(0, s.griefMorale - 2);

  // Starvation deaths after 2 days without food.
  if (s.starvingTicks >= 2 * T()) {
    const victims = s.goblins.filter(() => GTM.rand(s) < 0.1);
    for (const g of victims) { GTM.log(s, 'bad', GTM.goblinName(g) + ' starved to death.'); GTM.removeGoblin(s, g); }
    s.griefMorale = Math.min(20, s.griefMorale + victims.length * 2);
  }
  // Desertion when morale is low.
  if (s.morale < 25) {
    for (const g of s.goblins.slice()) {
      if (g.named || g.stats.loy >= 6) continue;
      if (GTM.rand(s) < (25 - s.morale) / 100 * 0.5) { GTM.log(s, 'bad', GTM.goblinName(g) + ' deserted the territory.'); GTM.removeGoblin(s, g); }
    }
  }
  // Growth: well-fed, content territories grow.
  const daysOfFood = GTM.foodTotal(s) / Math.max(1, GTM.dailyFoodNeed(s));
  if (s.goblins.length < GTM.housingCap(s) && daysOfFood >= 2 && s.morale >= 50 && GTM.rand(s) < 0.6) {
    const g = GTM.makeGoblin(s);
    s.goblins.push(g);
    GTM.log(s, 'good', 'A new goblin joined the territory (' + GTM.goblinName(g) + ', idle).');
  }
  if (GTM.rand(s) < 0.3) GTM.randomEvent(s);
  if (s.goblins.length === 0) s.gameOver = { reason: 'Every goblin is gone. The territory is abandoned.' };
};

GTM.randomEvent = function (s) {
  const roll = GTM.rand(s);
  if (roll < 0.3) {
    if (s.goblins.length >= GTM.housingCap(s)) return;
    const g = GTM.makeGoblin(s, { loy: GTM.randInt(s, 2, 5) });
    s.goblins.push(g);
    GTM.log(s, 'event', 'EVENT: A stray goblin wandered in and asked for meat (' + GTM.goblinName(g) + ', idle).');
  } else if (roll < 0.6) {
    const zones = s.zoneOrder.filter(z => s.zones[z].explored && !GTM.ZONES[z].home);
    const zid = GTM.pick(s, zones);
    const guards = s.goblins.filter(g => g.role === 'warrior' && g.zone === zid && g.injured <= 0);
    if (guards.length >= 2) {
      s.resources.meat += 15; s.resources.leather += 5;
      for (const g of guards) GTM.addContribution(s, g, 3);
      GTM.log(s, 'event', 'EVENT: A rare beast attacked ' + s.zones[zid].name + '. Your warriors slew it: +15 meat, +5 leather.');
    } else {
      const victim = s.goblins.find(g => g.role === 'laborer' && g.zone === zid && g.injured <= 0);
      if (victim) { victim.injured = 3 * T(); GTM.log(s, 'event', 'EVENT: A rare beast mauled ' + GTM.goblinName(victim) + ' at ' + s.zones[zid].name + '. Post 2+ warriors there to hunt it next time.'); }
      else GTM.log(s, 'event', 'EVENT: A rare beast prowls ' + s.zones[zid].name + '. Nobody was there.');
    }
  } else if (roll < 0.8) {
    const lost = Math.round(s.resources.wood * 0.1);
    s.resources.wood -= lost;
    s.moraleMods.push({ label: 'Storm', amount: -4, ticksLeft: T() });
    GTM.log(s, 'event', 'EVENT: A storm soaked the stockpiles (-' + lost + ' wood, -4 morale for a day).');
  } else if (!s.flags.rescuedResearcher && s.researchQueue.length) {
    s.flags.rescuedResearcher = true;
    const item = s.researchQueue[0];
    item.progress = Math.min(GTM.RESEARCH[item.id].work - 1, item.progress + 25);
    GTM.log(s, 'event', 'EVENT: Your scouts rescued a lost human scholar. They help with ' + GTM.RESEARCH[item.id].name + ' (+25 progress) before leaving.');
  }
};

GTM.computeMoraleTarget = function (s) {
  const parts = [['Base', 50]];
  const need = Math.max(1, GTM.dailyFoodNeed(s));
  const days = GTM.foodTotal(s) / need;
  if (s.starvingTicks > 0) parts.push(['Starving', -35]);
  else if (days < 1) parts.push(['Food < 1 day', -10]);
  else if (days >= 3) parts.push(['Food secure (3+ days)', 10]);
  if (s.victoryMorale > 0) parts.push(['Recent victory', Math.round(s.victoryMorale)]);
  if (s.griefMorale > 0) parts.push(['Recent deaths', -Math.round(s.griefMorale)]);
  const named = s.goblins.filter(g => g.named);
  if (named.length) {
    let n = Math.min(9, named.length * 3);
    n += named.filter(g => g.named.trait === 'leadership').length * 3;
    parts.push(['Named leaders', n]);
  }
  const eligible = s.goblins.filter(g => GTM.isEligible(s, g)).length;
  if (eligible) parts.push(['Overlooked for promotion (' + eligible + ')', -Math.round(25 * eligible / s.goblins.length)]);
  const onOT = s.goblins.filter(g => GTM.overtimeOn(s, g.role)).length;
  if (onOT) parts.push(['Overtime', -Math.round(GTM.OVERTIME.moralePenalty * onOT / s.goblins.length)]);
  const over = s.goblins.length - GTM.housingCap(s);
  if (over > 0) parts.push(['Overcrowded', -Math.min(20, over * 3)]);
  for (const m of s.moraleMods) parts.push([m.label, m.amount]);
  const total = Math.max(0, Math.min(100, parts.reduce((a, p) => a + p[1], 0)));
  return { parts, total };
};

// ---------- Player actions (all return a string error or null) ----------
GTM.assign = function (s, g, role, zone) {
  const def = GTM.ROLES[role];
  if (def.namedOnly && !g.named) return 'Only Named goblins can be Specialists.';
  if (role === 'specialist') return 'Specialists are assigned through positions in the Hierarchy panel.';
  if (def.requires && g.role !== role) {
    const used = s.goblins.filter(x => x.role === role).length;
    if (used >= GTM.roleSlots(s, role)) return 'No free ' + def.label + ' slots (build more ' + GTM.BUILDINGS[def.requires].name + ').';
  }
  if (g.role === 'specialist') { for (const p in s.positions) if (s.positions[p] === g.id) s.positions[p] = null; g.position = null; }
  g.role = role;
  if (zone) g.zone = zone;
  if (role === 'laborer' && !(s.zones[g.zone] && s.zones[g.zone].explored)) g.zone = 'valley';
  if (def.military && g.zone !== 'reserve' && !(s.zones[g.zone] && s.zones[g.zone].explored)) g.zone = 'reserve';
  if (role === 'scout' && !(g.zone === 'enemy' || (s.zones[g.zone] && !s.zones[g.zone].explored))) g.zone = 'enemy';
  return null;
};

// Pick the best-fitting goblin from Idle (then from Laborers) for a role.
GTM.autoAssign = function (s, role, zone) {
  const fitScore = g => GTM.statFactor(g, role);
  let pool = s.goblins.filter(g => g.role === 'idle');
  if (!pool.length) pool = s.goblins.filter(g => g.role === 'laborer' && role !== 'laborer');
  if (!pool.length) return 'Nobody available (no idle goblins or laborers).';
  pool.sort((a, b) => fitScore(b) - fitScore(a));
  return GTM.assign(s, pool[0], role, zone);
};
GTM.autoUnassign = function (s, role, zone) {
  const pool = s.goblins.filter(g => g.role === role && (!zone || g.zone === zone));
  if (!pool.length) return 'Nobody in that role.';
  pool.sort((a, b) => GTM.statFactor(a, role) - GTM.statFactor(b, role));
  return GTM.assign(s, pool[0], 'idle');
};

GTM.queueBuilding = function (s, id, zone) {
  const def = GTM.BUILDINGS[id];
  const z = s.zones[zone];
  if (!z || !z.explored) return 'Zone not explored.';
  if (!GTM.requirementsMet(s, def.requires)) return 'Requires ' + GTM.describeReq(def.requires) + '.';
  const queued = s.buildQueue.filter(q => q.zone === zone && q.kind === 'building').length;
  if (z.buildings.length + queued >= GTM.ZONES[zone].slots) return z.name + ' has no free building slots.';
  if (!GTM.canAfford(s, def.cost)) return 'Not enough materials (' + GTM.fmtCost(def.cost) + ').';
  GTM.pay(s, def.cost);
  s.buildQueue.push({ kind: 'building', id, zone, progress: 0, work: def.work, cost: def.cost });
  return null;
};
GTM.roadCost = s => s.researched.trails ? { wood: GTM.ROAD.cost.wood / 2 } : GTM.ROAD.cost;
GTM.queueRoad = function (s, zone) {
  const z = s.zones[zone];
  if (!z.explored) return 'Zone not explored.';
  if (z.road || s.buildQueue.some(q => q.kind === 'road' && q.zone === zone)) return 'Road already built or queued.';
  const cost = GTM.roadCost(s);
  if (!GTM.canAfford(s, cost)) return 'Not enough wood.';
  GTM.pay(s, cost);
  s.buildQueue.push({ kind: 'road', id: 'road', zone, progress: 0, work: GTM.ROAD.work, cost });
  return null;
};
GTM.cancelBuild = function (s, idx) {
  const item = s.buildQueue[idx];
  if (!item) return 'No such item.';
  GTM.pay(s, item.cost, -1); // refund
  s.buildQueue.splice(idx, 1);
  return null;
};
GTM.moveBuild = function (s, idx, dir) {
  const j = idx + dir;
  if (j < 0 || j >= s.buildQueue.length) return null;
  [s.buildQueue[idx], s.buildQueue[j]] = [s.buildQueue[j], s.buildQueue[idx]];
  return null;
};

GTM.researchAvailable = function (s, id) {
  return !s.researched[id] && !s.researchQueue.some(q => q.id === id) && GTM.requirementsMet(s, GTM.RESEARCH[id].requires);
};
GTM.queueResearch = function (s, id) {
  const def = GTM.RESEARCH[id];
  if (!GTM.researchAvailable(s, id)) return 'Not available.';
  if (!GTM.canAfford(s, def.cost)) return 'Cannot afford ' + GTM.fmtCost(def.cost) + '.';
  GTM.pay(s, def.cost);
  s.researchQueue.push({ id, progress: 0 });
  return null;
};
GTM.cancelResearch = function (s, idx) {
  const item = s.researchQueue[idx];
  if (!item) return 'No such item.';
  GTM.pay(s, GTM.RESEARCH[item.id].cost, -1);
  s.researchQueue.splice(idx, 1);
  return null;
};

GTM.promote = function (s, g) {
  if (!GTM.isEligible(s, g)) return 'Not eligible.';
  const next = GTM.RANKS[g.rank + 1];
  if (s.cp < next.cost) return 'Need ' + next.cost + ' CP.';
  s.cp -= next.cost;
  g.rank++;
  GTM.log(s, 'info', GTM.goblinName(g) + ' promoted to ' + next.label + '.');
  return null;
};
GTM.autoPromote = function (s) {
  const elig = s.goblins.filter(g => GTM.isEligible(s, g)).sort((a, b) => b.contribution.lifetime - a.contribution.lifetime);
  for (const g of elig) if (s.cp >= GTM.RANKS[g.rank + 1].cost) GTM.promote(s, g);
};

GTM.startOvertime = function (s, role) {
  const o = s.overtime[role];
  if (o.active) return 'Already running.';
  if (o.cooldown > 0) return 'Workers are still recovering.';
  o.active = true; o.ticksLeft = GTM.OVERTIME.maxTicks;
  s.flags.usedOvertime = true;
  GTM.log(s, 'info', 'Overtime campaign started for ' + GTM.ROLES[role].label + 's (2 days, +40% output, +30% food, morale hit).');
  return null;
};
GTM.stopOvertime = function (s, role) {
  const o = s.overtime[role];
  if (!o.active) return null;
  const used = GTM.OVERTIME.maxTicks - o.ticksLeft;
  o.active = false; o.cooldown = Math.round(GTM.OVERTIME.cooldownTicks * used / GTM.OVERTIME.maxTicks);
  return null;
};

GTM.BONUSES = {
  feast: { name: 'Meat Feast', desc: '2 meat per goblin. +12 morale for 2 days.' },
  merit: { name: 'Merit Bonus', desc: '20 CP. Top 25% recent contributors get +5 contribution. +6 morale for 3 days.' },
};
GTM.issueBonus = function (s, kind) {
  if (kind === 'feast') {
    const cost = 2 * s.goblins.length;
    if (s.resources.meat < cost) return 'Need ' + cost + ' meat.';
    s.resources.meat -= cost;
    s.moraleMods.push({ label: 'Meat Feast', amount: 12, ticksLeft: 2 * T() });
    GTM.log(s, 'good', 'You threw a meat feast. The goblins cheer your name.');
  } else {
    if (s.cp < 20) return 'Need 20 CP.';
    s.cp -= 20;
    const top = s.goblins.slice().sort((a, b) => b.contribution.recent - a.contribution.recent).slice(0, Math.max(1, Math.ceil(s.goblins.length / 4)));
    for (const g of top) { g.contribution.lifetime += 5; g.contribution.recent += 5; }
    s.moraleMods.push({ label: 'Merit Bonus', amount: 6, ticksLeft: 3 * T() });
    GTM.log(s, 'good', 'Merit bonus paid to ' + top.length + ' top performers.');
  }
  return null;
};

// Temporary project: gather X of a resource within N days for a contribution reward.
GTM.startQuota = function (s, resource, target, days, reward) {
  if (s.quota) return 'A quota project is already running.';
  if (!(target > 0) || !(days >= 1) || !(reward >= 0)) return 'Invalid quota.';
  if (s.cp < reward) return 'Need ' + reward + ' CP to fund the reward.';
  s.cp -= reward;
  s.quota = { resource, target, progress: 0, ticksLeft: days * T(), reward, contributors: {} };
  GTM.log(s, 'info', 'Quota project: gather ' + target + ' ' + GTM.RESOURCES[resource].label + ' in ' + days + ' day(s). Reward pool ' + reward + ' contribution.');
  return null;
};
GTM.tickQuota = function (s) {
  const q = s.quota;
  if (q.progress >= q.target) {
    const ids = Object.keys(q.contributors).map(Number);
    const share = ids.length ? q.reward * 2 / ids.length : 0; // CP spent becomes 2x contribution
    for (const g of s.goblins) if (ids.includes(g.id)) { g.contribution.lifetime += share; g.contribution.recent += share; }
    s.moraleMods.push({ label: 'Quota met', amount: 8, ticksLeft: 2 * T() });
    GTM.log(s, 'good', 'Quota met! ' + ids.length + ' goblins share the reward.');
    s.quota = null;
  } else if (--q.ticksLeft <= 0) {
    s.moraleMods.push({ label: 'Quota failed', amount: -5, ticksLeft: T() });
    GTM.log(s, 'warn', 'Quota project failed. The reward pool is lost.');
    s.quota = null;
  }
};

GTM.nameGoblin = function (s, g, name, trait) {
  if (g.named) return 'Already named.';
  if (GTM.namedCount(s) >= GTM.namingSlots(s)) return 'No naming slots (raise Territory Level).';
  if (s.cp < GTM.NAMING_COST) return 'Need ' + GTM.NAMING_COST + ' CP.';
  name = String(name || '').trim().slice(0, 20);
  if (!name) return 'Enter a name.';
  if (!GTM.TRAITS[trait]) return 'Pick a trait.';
  s.cp -= GTM.NAMING_COST;
  g.named = { name, trait };
  for (const st of GTM.STATS) g.stats[st] = Math.min(15, g.stats[st] + 3);
  g.stats.loy = 10;
  GTM.log(s, 'good', 'Goblin #' + g.id + ' has been Named "' + name + '" (' + GTM.TRAITS[trait].name + '). Their body visibly changes.');
  return null;
};
GTM.setPosition = function (s, pos, goblinId) {
  const old = GTM.positionHolder(s, pos) || s.goblins.find(x => x.id === s.positions[pos]);
  if (old) { old.role = 'idle'; old.position = null; }
  s.positions[pos] = null;
  if (!goblinId) return null;
  const g = s.goblins.find(x => x.id === goblinId);
  if (!g || !g.named) return 'Only Named goblins can hold positions.';
  for (const p in s.positions) if (s.positions[p] === g.id) s.positions[p] = null;
  s.positions[pos] = g.id;
  g.role = 'specialist'; g.position = pos; g.zone = 'valley';
  return null;
};

// ---------- Military ----------
GTM.weaponMult = s => s.researched.slingshot2 ? 1.3 : 1;

GTM.goblinPower = function (s, g) {
  const st = g.stats;
  let p;
  if (g.role === 'warrior') p = (st.str * 1.5 + st.end + st.agi * 0.5) / 3;
  else if (g.role === 'ranged') p = (st.agi * 1.5 + st.int * 0.5) / 2 * GTM.weaponMult(s);
  else p = (st.str + st.end) / 2 * GTM.WAR.militiaFactor;
  if (g.rank >= 2) p *= 1.1; // Seniors and above are seasoned
  if (g.named) {
    if (g.named.trait === 'fire') p += 8;
    if (g.named.trait === 'ironhide') p *= 1.5;
  }
  return p;
};

// Full defense breakdown if the enemy attacks attackZone. Used for both preview and resolution.
GTM.computeDefense = function (s, attackZone) {
  const lines = [];
  const z = s.zones[attackZone];
  const hasTower = GTM.zoneBuildings(s, attackZone, 'watchtower') > 0;
  const reserveF = hasTower ? 1 : GTM.WAR.reserveFactor;
  const otherF = z.road ? 0.75 : GTM.WAR.otherZoneFactor;
  const fighters = GTM.healthy(s);

  // Group military goblins by post.
  const groups = {};
  for (const g of fighters) {
    const post = GTM.ROLES[g.role].military ? g.zone : (g.role === 'specialist' && g.position === 'guardCaptain' ? attackZone : 'militia');
    (groups[post] = groups[post] || []).push(g);
  }

  // Ranged need ammo: crossbows go to the best shooters first.
  const ranged = fighters.filter(g => g.role === 'ranged').sort((a, b) => b.stats.agi - a.stats.agi);
  const ammoFrac = ranged.length ? Math.min(1, s.resources.ammo / (ranged.length * GTM.WAR.ammoPerRanged)) : 1;
  const crossbowIds = new Set(ranged.slice(0, Math.floor(s.resources.crossbows)).map(g => g.id));

  let military = 0;
  for (const post in groups) {
    if (post === 'militia') continue;
    const gs = groups[post];
    const factor = post === attackZone ? 1 : post === 'reserve' ? reserveF : otherF;
    const leaders = gs.filter(g => GTM.rankOf(g).lead || (g.named && g.named.trait === 'leadership')).length;
    const warriors = gs.filter(g => g.role === 'warrior').length;
    let sum = 0;
    for (const g of gs) {
      let p = GTM.goblinPower(s, g);
      if (g.role === 'warrior') {
        if (s.researched.formation && warriors >= 3) p *= 1.25;
        if (s.researched.silk) p *= 1.15;
      }
      if (g.role === 'ranged') {
        if (crossbowIds.has(g.id)) p *= 1.8 / GTM.weaponMult(s); // crossbow replaces the slingshot multiplier
        p *= 0.3 + 0.7 * ammoFrac;
        if (s.researched.ambush && post === attackZone) p *= 1.1;
      }
      sum += p;
    }
    sum *= 1 + 0.1 * Math.min(2, leaders);
    const label = post === attackZone ? 'Defenders at ' + z.name : post === 'reserve' ? 'Reserve' : 'Posted at ' + (s.zones[post] ? s.zones[post].name : post);
    lines.push([label + ' (' + gs.length + ', x' + factor + (leaders ? ', ' + Math.min(2, leaders) + ' leader' : '') + ')', sum * factor]);
    military += sum * factor;
  }
  if (ranged.length && ammoFrac < 1) lines.push(['  (ranged ammo ' + Math.round(ammoFrac * 100) + '% stocked)', 0]);
  const militia = (groups.militia || []).reduce((a, g) => a + GTM.goblinPower(s, g), 0);
  if (militia) lines.push(['Militia (' + groups.militia.length + ' non-military goblins)', militia]);

  const gcBonus = GTM.positionBonus(s, 'guardCaptain', 0.15);
  const mf = GTM.moraleFactor(s);
  let troops = (military + militia) * (1 + gcBonus) * mf;
  if (gcBonus) lines.push(['Guard Captain', '+' + Math.round(gcBonus * 100) + '%']);
  lines.push(['Morale x' + mf.toFixed(2), '']);

  // Traps and fortifications in the attacked zone.
  const traps = GTM.zoneBuildings(s, attackZone, 'pit_traps');
  let trapPower = 6 + (s.researched.fire ? 3 : 0);
  const fireDefender = (groups[attackZone] || []).some(g => g.named && g.named.trait === 'fire');
  if (fireDefender) trapPower += 2;
  if (s.researched.ambush) trapPower *= 1.5;
  const trapTotal = traps * trapPower;
  if (traps) lines.push([traps + ' pit trap(s)', trapTotal]);
  const fortOf = zid => GTM.zoneBuildings(s, zid, 'palisade') * 10 + GTM.zoneBuildings(s, zid, 'reinforced_wall') * 25;
  let fort = fortOf(attackZone);
  if (attackZone !== 'valley') fort += fortOf('valley') * 0.5;
  if (fort) lines.push(['Fortifications', fort]);
  if (hasTower) lines.push(['Watchtower: reserve at full strength', '']);

  const total = troops + trapTotal + fort;
  return { total, lines, troops };
};

GTM.enemyEstimate = function (s) {
  const w = s.war;
  const known = s.intel >= GTM.WAR.intelPower;
  const zoneKnown = s.intel >= GTM.WAR.intelZone ||
    (GTM.zoneBuildings(s, w.zone, 'watchtower') > 0 && w.atTick - s.tick <= T());
  return {
    lo: Math.round(w.power * (known ? 0.9 : 0.6)),
    hi: Math.round(w.power * (known ? 1.1 : 1.5)),
    known, zoneKnown,
    zone: zoneKnown ? w.zone : null,
  };
};

// War Room readiness checklist (research P1 #1). Pure data so the UI and tests share it.
GTM.warReadiness = function (s) {
  const w = s.war;
  if (!w) return null;
  const est = GTM.enemyEstimate(s);
  const target = est.zone;
  const mil = GTM.healthy(s).filter(g => GTM.ROLES[g.role].military);
  const posted = target ? mil.filter(g => g.zone === target).length : 0;
  const wallZone = target || 'valley';
  const walls = GTM.zoneBuildings(s, wallZone, 'palisade') + GTM.zoneBuildings(s, wallZone, 'reinforced_wall');
  const traps = GTM.zoneBuildings(s, wallZone, 'pit_traps');
  const foodDays = GTM.foodTotal(s) / Math.max(1, GTM.dailyFoodNeed(s));
  const items = [
    { id: 'scouted', ok: est.zoneKnown, label: 'Scouted the target', detail: target ? s.zones[target].name : 'unknown: put a scout on the enemy' },
    { id: 'walls', ok: walls + traps > 0, label: 'Walls or traps at ' + (target ? 'the target' : 'the Valley'), detail: walls + ' wall(s), ' + traps + ' trap(s) at ' + s.zones[wallZone].name },
    { id: 'warriors', ok: !!target && mil.length > 0 && posted === mil.length, label: 'Warriors on the target', detail: target ? posted + '/' + mil.length + ' military posted' : 'target unknown' },
    { id: 'food', ok: foodDays >= 3, label: '3 days of food', detail: foodDays.toFixed(1) + ' days' },
  ];
  const you = target ? GTM.computeDefense(s, target).total : Math.min(...s.zoneOrder.filter(z => s.zones[z].explored).map(z => GTM.computeDefense(s, z).total));
  return { items, ready: items.every(i => i.ok), you, lo: est.lo, hi: est.hi, known: est.known, target };
};

GTM.warTick = function (s) {
  const w = s.war;
  if (!w || s.gameOver) return;
  const left = w.atTick - s.tick;
  if (left === 3 * T()) {
    GTM.log(s, 'war', 'Territory War #' + w.number + ' in 3 days.');
    GTM.notify(s, 'War in 3 days. Check the War Room.', true);
  }
  if (left === T() && !w.warned) {
    w.warned = true;
    const est = GTM.enemyEstimate(s);
    const msg = 'Territory War #' + w.number + ' begins in 1 day. Enemy strength ' + est.lo + '-' + est.hi + '. Target: ' + (est.zone ? s.zones[est.zone].name : 'unknown');
    GTM.log(s, 'war', 'WARNING: ' + msg);
    GTM.notify(s, msg + '. (Checkpoint saved: you can rewind to now.)', true);
  }
  if (left <= 0) GTM.resolveWar(s);
};

GTM.resolveWar = function (s) {
  const w = s.war;
  const def = GTM.computeDefense(s, w.zone);
  const ourRoll = 0.9 + GTM.rand(s) * 0.2, theirRoll = 0.9 + GTM.rand(s) * 0.2;
  const ours = def.total * ourRoll, theirs = w.power * theirRoll;
  const ratio = ours / Math.max(1, theirs);
  GTM.log(s, 'war', '=== TERRITORY WAR #' + w.number + ' ===');
  GTM.log(s, 'war', 'The enemy lord strikes at ' + s.zones[w.zone].name + ' with strength ' + Math.round(theirs) + '.');
  for (const [label, v] of def.lines) GTM.log(s, 'war', '  ' + label + (typeof v === 'number' ? ': ' + v.toFixed(1) : v ? ': ' + v : ''));
  GTM.log(s, 'war', 'Your total defense: ' + Math.round(ours) + ' (ratio ' + ratio.toFixed(2) + ').');

  // Consumables: ammo used, traps spent, palisade damage (repair kits prevent).
  const ranged = GTM.healthy(s).filter(g => g.role === 'ranged').length;
  s.resources.ammo = Math.max(0, s.resources.ammo - ranged * GTM.WAR.ammoPerRanged);
  const z = s.zones[w.zone];
  const traps = z.buildings.filter(b => b === 'pit_traps').length;
  z.buildings = z.buildings.filter(b => b !== 'pit_traps');
  if (traps) GTM.log(s, 'war', '  ' + traps + ' pit trap(s) were sprung and must be rebuilt.');

  if (ratio < 1) {
    GTM.log(s, 'bad', 'DEFEAT. The enemy overruns your territory. The system notification reads: "Lord eliminated."');
    s.gameOver = { reason: 'Lost Territory War #' + w.number + ' (defense ' + Math.round(ours) + ' vs enemy ' + Math.round(theirs) + ').' };
    return;
  }

  // Casualties: the closer the fight, the more die.
  const deathChance = Math.min(0.5, 0.25 / ratio);
  const fighters = GTM.healthy(s).filter(g => GTM.ROLES[g.role].military && (g.zone === w.zone || g.zone === 'reserve'));
  let dead = 0;
  for (const g of fighters) {
    GTM.addContribution(s, g, 15);
    if (GTM.rand(s) < deathChance * (g.named ? 0.3 : 1)) { GTM.log(s, 'bad', '  ' + GTM.goblinName(g) + ' fell in battle.'); GTM.removeGoblin(s, g); dead++; }
    else if (GTM.rand(s) < 0.3) g.injured = 2 * T();
  }
  const palisades = z.buildings.filter(b => b === 'palisade').length;
  if (palisades) {
    if (s.resources.repairKits >= 1) { s.resources.repairKits--; GTM.log(s, 'war', '  Palisade damage patched with a repair kit.'); }
    else { z.buildings.splice(z.buildings.indexOf('palisade'), 1); GTM.log(s, 'war', '  A palisade was destroyed (no repair kits).'); }
  }

  // Spoils: absorb territory, captives, loot.
  s.warsWon++;
  s.level++;
  s.prestige += 10 * w.number;
  s.victoryMorale = 15;
  s.griefMorale = Math.min(20, s.griefMorale + dead * 2);
  s.cp += 20;
  const loot = Math.round(w.power * 0.4);
  s.resources.meat += loot; s.resources.wood += loot; s.resources.stone += Math.round(loot / 2); s.resources.scrap += Math.round(loot / 4); s.resources.dried += Math.round(loot / 3);
  const captives = 2 + Math.floor(w.power / 15);
  for (let i = 0; i < captives; i++) s.goblins.push(GTM.makeGoblin(s, { loy: GTM.randInt(s, 2, 5) }));
  const newZone = GTM.CONQUEST_ORDER.find(id => !s.zones[id]);
  let zoneMsg = '';
  if (newZone) {
    s.zones[newZone] = GTM.makeZone(newZone);
    s.zones[newZone].buildings.push('palisade'); // existing structures come with it
    s.zoneOrder.push(newZone);
    zoneMsg = ' Absorbed zone: ' + s.zones[newZone].name + ' (with an old palisade).';
  }
  GTM.log(s, 'good', 'VICTORY! ' + dead + ' fallen. ' + captives + ' enemy goblins join as idle Interns (low loyalty). Loot: ~' + loot + ' meat/wood and more. Territory Level ' + s.level + '.' + zoneMsg);
  if (s.level === 2) GTM.log(s, 'info', 'Director rank and a 2nd naming slot unlocked.');
  GTM.notify(s, 'VICTORY! Territory War #' + w.number + ' won. New zone, new goblins, Level ' + s.level + '. See the log for details.', true);
  GTM.scheduleWar(s, s.tick + GTM.WAR.interval * T());
  GTM.log(s, 'system', 'SYSTEM: Territory War #' + s.war.number + ' begins on day ' + (Math.floor(s.war.atTick / T()) + 1) + '.');
};

