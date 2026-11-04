// Static game definitions. Everything tunable lives here.
// Loaded as a plain script (no modules) so index.html works from file://.
var GTM = globalThis.GTM = globalThis.GTM || {};

GTM.TICKS_PER_DAY = 24; // 1 tick = 1 in-game hour

GTM.RESOURCES = {
  meat:       { label: 'Meat',         cat: 'food' },
  fruit:      { label: 'Fruit',        cat: 'food' },
  dried:      { label: 'Dried goods',  cat: 'food' },
  wood:       { label: 'Wood',         cat: 'material' },
  leather:    { label: 'Leather',      cat: 'material' },
  stone:      { label: 'Stone',        cat: 'material' },
  silk:       { label: 'Spider silk',  cat: 'special' },
  scrap:      { label: 'Metal scraps', cat: 'material' },
  ammo:       { label: 'Ammo',         cat: 'supply' },
  repairKits: { label: 'Repair kits',  cat: 'supply' },
  crossbows:  { label: 'Crossbows',    cat: 'supply' },
};
// Food shares one storage pool; every other resource has its own cap.
GTM.BASE_STORAGE = { food: 150, material: 100, special: 60, supply: 200 };
GTM.STORAGE_PER_WAREHOUSE = { food: 100, material: 80, special: 40, supply: 100 };
GTM.SPOILAGE_PER_DAY = { meat: 0.03, fruit: 0.02, dried: 0 };

// Zone templates. yields are units per laborer per day at average stats.
// danger = chance per worker per day of an incident (injury, sometimes death).
GTM.ZONES = {
  valley: { name: 'Valley', capacity: 8, danger: 0.01, slots: 5, home: true,
    nodes: { fruit: { label: 'Fruit trees', yields: { fruit: 3 } },
             timber: { label: 'Scrub wood', yields: { wood: 1.5 } } } },
  forest: { name: 'Forest Edge', capacity: 6, danger: 0.04, slots: 3,
    nodes: { timber: { label: 'Timber', yields: { wood: 3 } },
             hunting: { label: 'Hunting grounds', yields: { meat: 2.4, leather: 0.5 } } } },
  river: { name: 'Riverbank', capacity: 5, danger: 0.03, slots: 3,
    nodes: { quarry: { label: 'River stones', yields: { stone: 2 } },
             fishing: { label: 'Fishing spot', yields: { meat: 2.6 } } } },
  spider: { name: 'Spider Forest', capacity: 4, danger: 0.12, slots: 2, exploreCost: 30,
    nodes: { silk: { label: 'Silk deposits', yields: { silk: 1.2 } },
             hunting: { label: 'Giant beetles', yields: { meat: 2, leather: 0.8 } } } },
  // Conquest pool: absorbed in this order after winning wars.
  desert: { name: 'Desert Approach', capacity: 5, danger: 0.05, slots: 3, conquest: true,
    nodes: { quarry: { label: 'Sandstone', yields: { stone: 2.5 } },
             salvage: { label: 'Caravan wrecks', yields: { scrap: 1 } } } },
  battlefield: { name: 'Old Battlefield', capacity: 6, danger: 0.06, slots: 3, conquest: true,
    nodes: { salvage: { label: 'Rusted arms', yields: { scrap: 2 } },
             scavenge: { label: 'Scavenging', yields: { leather: 1, wood: 1 } } } },
  caves: { name: 'Mushroom Caves', capacity: 7, danger: 0.04, slots: 3, conquest: true,
    nodes: { fungus: { label: 'Fungus beds', yields: { fruit: 3.5 } },
             ore: { label: 'Ore seams', yields: { scrap: 0.8, stone: 1 } } } },
};
GTM.CONQUEST_ORDER = ['desert', 'battlefield', 'caves'];
GTM.OFFROAD_PENALTY = 0.75; // output multiplier for non-home zones with no road

GTM.STATS = ['str', 'agi', 'int', 'end', 'loy'];
GTM.STAT_LABELS = { str: 'STR', agi: 'AGI', int: 'INT', end: 'END', loy: 'LOY' };

// Roles. fit = stats used for work output and for auto-picking the best goblin.
GTM.ROLES = {
  idle:       { label: 'Idle',       fit: ['end'] },
  laborer:    { label: 'Laborer',    fit: ['str', 'end'] },
  builder:    { label: 'Builder',    fit: ['str', 'end'] },
  warrior:    { label: 'Warrior',    fit: ['str', 'end'], military: true },
  ranged:     { label: 'Ranged',     fit: ['agi'], military: true },
  scout:      { label: 'Scout',      fit: ['agi', 'int'] },
  researcher: { label: 'Researcher', fit: ['int'], requires: 'research_hut', perBuilding: 3 },
  craftsman:  { label: 'Craftsman',  fit: ['int', 'agi'], requires: 'workshop', perBuilding: 2 },
  specialist: { label: 'Specialist', fit: ['int'], namedOnly: true },
};
GTM.OVERTIME_ROLES = ['laborer', 'builder', 'researcher', 'craftsman'];
GTM.OVERTIME = { output: 1.4, food: 1.3, maxTicks: 48, cooldownTicks: 72, moralePenalty: 20 };

// Daily work units at average stats (stat factor 1.0).
GTM.WORK_PER_DAY = { builder: 12, researcher: 10, craftsman: 10, scout: 10 };

GTM.RANKS = [
  { id: 'intern',   label: 'Intern',   threshold: 0,   cost: 0,  food: 0.8, lead: false, minLevel: 1 },
  { id: 'regular',  label: 'Regular',  threshold: 10,  cost: 5,  food: 1.0, lead: false, minLevel: 1 },
  { id: 'senior',   label: 'Senior',   threshold: 30,  cost: 15, food: 1.2, lead: false, minLevel: 1 },
  { id: 'captain',  label: 'Captain / Lead', threshold: 70, cost: 30, food: 1.4, lead: true, minLevel: 1 },
  { id: 'director', label: 'Director', threshold: 150, cost: 60, food: 1.7, lead: true, minLevel: 2 },
];

GTM.BUILDINGS = {
  pit_traps:    { name: 'Pit traps', tier: 'Basic', cost: { wood: 5 }, work: 10,
                  desc: 'Trap power 6 if the enemy attacks this zone. Spent when triggered.' },
  palisade:     { name: 'Wooden palisade', tier: 'Basic', cost: { wood: 15 }, work: 25,
                  desc: 'Fortification 10 in this zone (Valley forts also count 50% everywhere).' },
  watchtower:   { name: 'Watchtower', tier: 'Basic', cost: { wood: 10, stone: 4 }, work: 20,
                  desc: 'Halves zone danger. Reveals an attack on this zone 1 day early; reserves arrive at full strength.' },
  storage:      { name: 'Storage shed', tier: 'Basic', cost: { wood: 12 }, work: 15,
                  desc: 'Raises storage caps.' },
  housing:      { name: 'Basic housing', tier: 'Basic', cost: { wood: 10 }, work: 15,
                  desc: '+6 population cap.' },
  training_grounds: { name: 'Training grounds', tier: 'Mid', cost: { wood: 20, stone: 10 }, work: 40,
                  desc: 'Military goblins slowly gain STR/AGI. Unlocks formation research.' },
  workshop:     { name: 'Workshop', tier: 'Mid', cost: { wood: 20, stone: 8 }, work: 35,
                  desc: 'Unlocks Craftsman role (2 per workshop): ammo, repair kits.' },
  research_hut: { name: 'Research hut', tier: 'Mid', cost: { wood: 15, stone: 5 }, work: 30,
                  desc: 'Unlocks Researcher role (3 per hut).' },
  crossbow_workshop: { name: 'Crossbow workshop', tier: 'Advanced', cost: { wood: 25, stone: 10, leather: 5 }, work: 50,
                  requires: { research: 'crossbows' }, desc: 'Craftsmen can build crossbows.' },
  reinforced_wall: { name: 'Reinforced wall', tier: 'Advanced', cost: { stone: 30, wood: 10 }, work: 60,
                  requires: { research: 'masonry' }, desc: 'Fortification 25 in this zone.' },
};
GTM.ROAD = { cost: { wood: 10 }, work: 20 };
GTM.HOUSING_BASE = 16;
GTM.HOUSING_PER = 6;

// Research projects. lead: needs a Senior+ researcher or a Lead Researcher assigned.
GTM.RESEARCH = {
  gathering1: { name: 'Gathering Rotas', cat: 'Process', cost: { cp: 10 }, work: 30,
                desc: '+20% gathering output.' },
  gathering2: { name: 'Lean Foraging', cat: 'Process', cost: { cp: 25 }, work: 60, lead: true,
                requires: { research: 'gathering1' }, desc: '+20% more gathering output.' },
  slingshot2: { name: 'Improved Slingshots', cat: 'Weapons', cost: { cp: 10, wood: 10, leather: 5 }, work: 30,
                desc: 'Ranged power x1.3.' },
  crossbows:  { name: 'Crossbows', cat: 'Weapons', cost: { cp: 25, wood: 20, stone: 10 }, work: 70, lead: true,
                requires: { research: 'slingshot2', building: 'workshop' }, desc: 'Unlocks Crossbow workshop. Each crossbow makes one ranged goblin x1.8.' },
  formation:  { name: 'Close Infantry Formation', cat: 'Tactics', cost: { cp: 15 }, work: 40,
                requires: { building: 'training_grounds' }, desc: 'Warrior groups of 3+ at one post fight x1.25.' },
  ambush:     { name: 'Ambush Tactics', cat: 'Tactics', cost: { cp: 20 }, work: 50, lead: true,
                requires: { research: 'formation' }, desc: 'Traps x1.5; ranged in the attacked zone x1.1.' },
  trails:     { name: 'Marked Trails', cat: 'Logistics', cost: { cp: 10, wood: 5 }, work: 25,
                desc: 'Roads cost half. Off-road penalty reduced.' },
  stacking:   { name: 'Stacked Storage', cat: 'Logistics', cost: { cp: 10 }, work: 25,
                desc: 'All storage caps x1.5.' },
  preservation: { name: 'Food Preservation', cat: 'Logistics', cost: { cp: 10, wood: 5 }, work: 30,
                desc: 'Halves food spoilage. Craftsmen can dry meat.' },
  fire:       { name: 'Fire-starting Methods', cat: 'Invention', cost: { cp: 15, wood: 10 }, work: 35,
                desc: 'Each trap +3 power.' },
  silk:       { name: 'Silk Processing', cat: 'Invention', cost: { cp: 20, silk: 10 }, work: 45,
                requires: { zone: 'spider' }, desc: 'Silk wraps: warriors x1.15.' },
  masonry:    { name: 'Masonry', cat: 'Invention', cost: { cp: 15, stone: 15 }, work: 40,
                desc: 'Unlocks Reinforced walls.' },
};

// Craftsman recipes. work = work units per batch.
GTM.RECIPES = {
  ammo:     { name: 'Sling ammo (1 stone -> 6 ammo)', in: { stone: 1 }, out: { ammo: 6 }, work: 2 },
  repair:   { name: 'Repair kit (2 wood + 1 leather)', in: { wood: 2, leather: 1 }, out: { repairKits: 1 }, work: 4 },
  dried:    { name: 'Dried meat (2 meat -> 2 dried)', in: { meat: 2 }, out: { dried: 2 }, work: 2,
              requires: { research: 'preservation' } },
  crossbow: { name: 'Crossbow (3 wood, 1 scrap, 1 leather)', in: { wood: 3, scrap: 1, leather: 1 }, out: { crossbows: 1 }, work: 8,
              requires: { building: 'crossbow_workshop' } },
};

GTM.TRAITS = {
  fire:       { name: 'Fire Magic',  desc: '+8 personal war power; traps in a zone they defend +2 each.' },
  leadership: { name: 'Leadership',  desc: 'Buffs their squad like a Captain; doubles the Guard Captain bonus; +3 morale.' },
  crafting:   { name: 'Exceptional Crafting', desc: 'x2 personal craft/research work; doubles the Lead Researcher bonus.' },
  pathfinder: { name: 'Pathfinder',  desc: 'x2 scouting; doubles the Foreman bonus.' },
  ironhide:   { name: 'Ironhide',    desc: 'x1.5 personal war power; never dies to zone incidents.' },
};
GTM.POSITIONS = {
  guardCaptain:   { name: 'Guard Captain',   trait: 'leadership', desc: 'All military power +15% (+30% with Leadership).' },
  leadResearcher: { name: 'Lead Researcher', trait: 'crafting',   desc: 'Research +25% (+50% with Crafting). Counts as research lead.' },
  foreman:        { name: 'Foreman',         trait: 'pathfinder', desc: 'Gathering +15% (+30% with Pathfinder).' },
};
GTM.NAMING_COST = 40;
GTM.NAME_SUGGESTIONS = ['Grik', 'Snag', 'Mozzle', 'Rutka', 'Bograt', 'Tinksy', 'Varg', 'Nubbin', 'Skrell', 'Oglet', 'Fizzrot', 'Grubba'];

// War tuning.
GTM.WAR = {
  firstAtDay: 8,          // first war starts at the beginning of this day
  interval: 7,            // days between wars
  basePower: 36,
  growth: 1.55,           // enemy power multiplier per war
  intelZone: 15,          // intel points to learn the attack zone
  intelPower: 30,         // intel points to learn enemy power within +-10%
  reserveFactor: 0.8,
  otherZoneFactor: 0.5,
  militiaFactor: 0.25,    // non-military goblins still fight, badly
  ammoPerRanged: 10,
};
