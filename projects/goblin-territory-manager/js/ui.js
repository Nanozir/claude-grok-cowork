// UI: renders state into HTML strings. Interaction handlers live in main.js.
var GTM = globalThis.GTM = globalThis.GTM || {};

GTM.ui = {
  tab: 'zones',
  sort: { key: 'id', dir: 1 },
  roleFilter: 'all',
  selected: new Set(),
  logFilter: 'all',
  warView: null,
};
GTM.TABS = [
  ['zones', 'Zones'], ['population', 'Population'], ['build', 'Construction'],
  ['research', 'R&D'], ['hierarchy', 'Hierarchy & Incentives'], ['war', 'War Room'], ['debug', 'Debug'],
];

const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const f0 = n => Math.floor(n + 1e-9).toLocaleString();
const f1 = n => (Math.round(n * 10) / 10).toFixed(1);
const sgn = n => (n >= 0 ? '+' : '') + f1(n);
const bar = (pct, cls = '', mark) => `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i>${mark != null ? `<span class="mark" style="left:${mark}%"></span>` : ''}</div>`;
const btn = (label, action, data = {}, opts = {}) =>
  `<button data-action="${action}" ${Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')} ${opts.disabled ? 'disabled' : ''} class="${opts.cls || ''}" title="${esc(opts.title || '')}">${label}</button>`;
const opt = (value, label, sel) => `<option value="${esc(value)}" ${value === sel ? 'selected' : ''}>${esc(label)}</option>`;
GTM.esc = esc;

// ---------- Top bar & resource strip ----------
const shown = (s, kind, id) => GTM.isRevealed(s, kind, id);

GTM.renderTop = function (s) {
  const w = s.war;
  const left = w ? w.atTick - s.tick : 0;
  const days = Math.floor(left / 24), hrs = left % 24;
  const speeds = [[0, 'II'], [1, '1x'], [2, '2x'], [4, '4x']];
  if (shown(s, 'flags', 'speed10')) speeds.push([10, '10x']);
  return `
    <div class="title">Goblin Territory Manager <small>Level ${s.level}</small></div>
    <div>${GTM.fmtTime(s.tick)}</div>
    <div class="speed">${speeds.map(([v, l]) => `<button data-action="speed" data-v="${v}" class="${(v === 0 ? s.paused : !s.paused && s.speed === v) ? 'on' : ''}" title="${v === 0 ? 'Pause (Space)' : v + ' hour(s) per second'}">${l}</button>`).join('')}</div>
    ${w ? `<div class="warclock ${left <= 24 ? 'urgent' : ''}" title="Lose the war and everyone dies. A rewind point is saved 1 day before.">War #${w.number} in ${days}d ${hrs}h</div>` : ''}
    <div class="spacer"></div>
    <label class="muted" title="Pause automatically on warnings, unlocks and emergencies"><input type="checkbox" data-change="autoPause" ${s.autoPause ? 'checked' : ''}> Auto-pause</label>
    ${btn('Save', 'save')} ${btn('Load', 'load')} ${btn('New game', 'newGame')}`;
};

GTM.renderRes = function (s) {
  const need = GTM.dailyFoodNeed(s);
  const food = GTM.foodTotal(s);
  // Projected daily food balance (gathering minus eating), so it reacts instantly, even while paused.
  const outp = GTM.zoneOutput(s);
  const foodRate = Object.values(outp).reduce((a, z) => a + (z.perDay.fruit || 0) + (z.perDay.meat || 0), 0) - need;
  const daysLeft = need > 0 ? food / need : Infinity;
  const cell = (k, v, r, alert, title) => `<div class="res ${alert ? 'alert' : ''}" title="${esc(title || '')}"><div class="k">${k}</div><div class="v">${v}</div>${r != null ? `<div class="r ${String(r).startsWith('-') ? 'bad' : 'good'}">${r}</div>` : ''}</div>`;
  const rate = res => { const d = (s.ledger[res] || 0) * 24; return Math.abs(d) < 0.05 ? null : sgn(d) + '/day'; };
  const out = [];
  out.push(`<div class="res food ${daysLeft < 3 && foodRate < 0 ? 'alert' : ''}" title="Eaten: ${f1(need)}/day. Fruit ${f0(s.resources.fruit)}, meat ${f0(s.resources.meat)}, dried ${f0(s.resources.dried)}. Cap ${GTM.storageCap(s, 'meat')}.">
    <div class="k">Food</div><div class="v"><b class="${daysLeft < 1 ? 'bad' : daysLeft < 3 && foodRate < 0 ? 'warn' : 'good'}">${daysLeft === Infinity ? '∞' : f1(daysLeft)} days</b> <span class="muted">(${f0(food)})</span></div>
    <div class="r ${foodRate < 0 ? 'bad' : 'good'}">${sgn(foodRate)}/day</div></div>`);
  if (shown(s, 'res', 'foodTypes')) out.push(cell('Fruit / Meat / Dried', f0(s.resources.fruit) + ' / ' + f0(s.resources.meat) + ' / ' + f0(s.resources.dried), null));
  for (const r of ['wood', 'stone', 'leather', 'silk', 'scrap', 'ammo', 'repairKits', 'crossbows']) {
    if (!shown(s, 'res', r)) continue;
    out.push(cell(GTM.RESOURCES[r].label, f0(s.resources[r]), rate(r), false, 'Storage cap ' + GTM.storageCap(s, r)));
  }
  if (shown(s, 'res', 'morale')) out.push(`<div class="res" style="min-width:140px" title="Morale scales all work (x${GTM.moraleFactor(s).toFixed(2)} now). Details in Hierarchy."><div class="k">Morale ${f0(s.morale)} → ${f0(s.moraleTarget)}</div>${bar(s.morale, 'morale', s.moraleTarget)}</div>`);
  if (shown(s, 'res', 'cp')) out.push(cell('Points', f0(s.cp), null, false, 'Contribution Points: earned by work, spent on promotions, research and bonuses.'));
  const idle = s.goblins.filter(g => g.role === 'idle').length;
  const inj = s.goblins.filter(g => g.injured > 0).length;
  out.push(cell('Goblins', s.goblins.length + ' / ' + GTM.housingCap(s), idle ? idle + ' idle' : inj ? '-' + inj + ' injured' : null, s.goblins.length > GTM.housingCap(s), 'Population / housing cap'));
  if (shown(s, 'res', 'prestige')) out.push(cell('Prestige', f0(s.prestige), null));
  return out.join('');
};

GTM.renderTabs = s => GTM.TABS.filter(([id]) => shown(s, 'tabs', id)).map(([id, l]) =>
  `<button data-action="tab" data-v="${id}" class="${GTM.ui.tab === id ? 'on' : ''}">${l}${s.revealed.newTabs.includes(id) ? ' <span class="newtag">NEW</span>' : ''}</button>`).join('');

// Pinned "current goal" card (guided mode only).
GTM.renderObjective = function (s) {
  const o = GTM.currentObjective(s);
  if (!o) return '';
  const n = GTM.OBJECTIVES.indexOf(o) + 1;
  return `<div class="objective">
    <img src="research/assets/char-manager-oh.svg" alt="" class="obj-face">
    <div class="obj-body"><div class="obj-k">GOAL ${n}/${GTM.OBJECTIVES.length}</div>
      <div class="obj-text">${esc(o.text)}</div>
      <div class="obj-why">${esc(GTM.ADVISOR)}: “${esc(o.why)}”</div></div>
    <div class="obj-actions">${GTM.ui.tab !== o.tab ? btn('Show me', 'showMe', {}, { cls: 'primary' }) : ''} <button data-action="skipTutorial" class="link">skip tutorial</button></div>
  </div>`;
};

GTM.renderIntro = s => `<div class="overlay"><div class="card memo">
  <img src="research/assets/char-manager-oh.svg" alt="Manager Oh" class="memo-face">
  <div><div class="memo-k">MEMO FROM THE SYSTEM</div>
  <p class="memo-text">You are now Lord of this goblin territory.<br>Territory War on <b>Day ${GTM.WAR.firstAtDay}</b>. Lose, and everyone dies.</p>
  <p>${btn('Clock in', 'clockIn', {}, { cls: 'primary big' })} <button data-action="skipTutorialIntro" class="link">I know the game: skip tutorial</button></p></div>
</div></div>`;

GTM.renderLog = function (s) {
  const f = GTM.ui.logFilter;
  const items = s.log.filter(l => f === 'all' || l.type === f || (f === 'bad' && l.type === 'warn')).slice(-150).reverse();
  return items.map(l => `<div class="${l.type}"><span class="t">${GTM.fmtTime(l.tick)}</span>${esc(l.msg)}</div>`).join('');
};

// ---------- Zones ----------
GTM.renderZones = function (s) {
  const out = GTM.zoneOutput(s);
  const est = s.war ? GTM.enemyEstimate(s) : {};
  const showBuild = shown(s, 'tabs', 'build'), showWar = shown(s, 'tabs', 'war');
  const idle = s.goblins.filter(g => g.role === 'idle').length;
  const cards = s.zoneOrder.filter(zid => shown(s, 'zones', zid)).map(zid => {
    const z = s.zones[zid], t = GTM.ZONES[zid];
    if (!z.explored) {
      const scouts = s.goblins.filter(g => g.role === 'scout' && g.zone === zid).length;
      return `<div class="card locked"><div class="row"><b>${esc(z.name)}</b><span class="tag">Unexplored</span></div>
        <div class="row muted">Mapping ${f0(z.exploreProgress)} / ${t.exploreCost} (${scouts} scout${scouts === 1 ? '' : 's'})</div>
        ${bar(100 * z.exploreProgress / t.exploreCost)}
        <div class="row">${btn('+ Send scout', 'autoAssign', { role: 'scout', zone: zid })} <span class="muted" title="${esc(Object.values(t.nodes).map(n => n.label).join(', '))}">Rumored riches ⓘ</span></div></div>`;
    }
    const o = out[zid];
    const guards = s.goblins.filter(g => GTM.ROLES[g.role].military && g.zone === zid);
    const isTarget = est.zone === zid;
    const prod = Object.entries(o.perDay).map(([r, v]) => `+${f1(v)} ${GTM.RESOURCES[r].label}`).join(', ') || '<span class="muted">nothing yet</span>';
    const queued = s.buildQueue.filter(q => q.zone === zid);
    return `<div class="card ${isTarget ? 'target' : ''}">
      <div class="row"><b>${esc(z.name)}</b>${isTarget ? '<span class="tag" style="border-color:var(--war)">ENEMY TARGET</span>' : ''}
        <span class="muted" title="Chance per worker per day of an accident">danger ${(GTM.zoneDanger(s, zid) * 100).toFixed(1)}% ⓘ</span></div>
      <div class="row"><span>Workers <b class="${o.workers.length > t.capacity ? 'bad' : ''}">${o.workers.length}</b><span class="muted"> / ${t.capacity} safe</span></span>
        <span>${btn('−', 'autoUnassign', { role: 'laborer', zone: zid }, { cls: 'big', disabled: !o.workers.length })} ${btn('+', 'autoAssign', { role: 'laborer', zone: zid }, { cls: 'big primary', disabled: !idle, title: idle ? 'Assign the best-fit idle goblin' : 'No idle goblins' })}</span></div>
      ${o.crowding < 1 ? `<div class="row bad">Over capacity: less output, more accidents.</div>` : ''}
      <div class="row"><span>Working on</span><select data-change="focus" data-zone="${zid}">${Object.entries(t.nodes).map(([k, n]) => opt(k, n.label + ' (' + Object.keys(n.yields).map(r => GTM.RESOURCES[r].label).join(', ') + ')', z.focus)).join('')}</select></div>
      <div class="row"><span>Output</span><span class="good">${prod}${o.workers.length ? '/day' : ''}</span></div>
      ${showBuild && !t.home ? `<div class="row"><span>Road</span><span>${z.road ? 'Built' : `<span class="warn" title="No road: output x${GTM.offroad(s, zid)}">None ⓘ</span> ` + btn('Build road', 'road', { zone: zid }, { disabled: queued.some(q => q.kind === 'road'), title: GTM.fmtCost(GTM.roadCost(s)) })}</span></div>` : ''}
      ${showWar ? `<div class="row"><span>Guards</span><span>${guards.length} (${guards.filter(g => g.role === 'warrior').length}W / ${guards.filter(g => g.role === 'ranged').length}R)</span></div>` : ''}
      ${showBuild ? `<div class="row"><span>Buildings ${z.buildings.length}/${t.slots}</span><span>${z.buildings.map(b => `<span class="tag">${esc(GTM.BUILDINGS[b].name)}</span>`).join('') || '<span class="muted">none</span>'}</span></div>` : ''}
      ${queued.length ? `<div class="row muted"><span>Queued</span><span>${queued.map(q => q.kind === 'road' ? 'Road' : GTM.BUILDINGS[q.id].name).join(', ')}</span></div>` : ''}
    </div>`;
  });
  return `${idle ? `<p class="hint">${idle} idle goblin${idle === 1 ? '' : 's'} waiting for orders. Use <b>+</b> to put them to work.</p>` : ''}<div class="grid">${cards.join('')}</div>`;
};

// ---------- Population ----------
GTM.postOptions = function (s, g) {
  const zones = s.zoneOrder.filter(z => shown(s, 'zones', z)).map(z => s.zones[z]);
  if (g.role === 'laborer') return zones.filter(z => z.explored).map(z => [z.id, z.name]);
  if (GTM.ROLES[g.role].military) return [['reserve', 'Reserve']].concat(zones.filter(z => z.explored).map(z => [z.id, 'Defend ' + z.name]));
  if (g.role === 'scout') return [['enemy', 'Scout enemy']].concat(zones.filter(z => !z.explored).map(z => [z.id, 'Explore ' + z.name]));
  return null;
};
GTM.roleOptions = function (s, g) {
  return Object.entries(GTM.ROLES).filter(([id, r]) => {
    if (id === 'specialist') return g.role === 'specialist';
    if (r.requires && g.role !== id) return GTM.hasBuilding(s, r.requires);
    return true;
  }).map(([id, r]) => [id, r.label]);
};

GTM.renderPopulation = function (s) {
  const ui = GTM.ui;
  const counts = {};
  for (const g of s.goblins) counts[g.role] = (counts[g.role] || 0) + 1;
  const roleVisible = id => {
    const r = GTM.ROLES[id];
    if (r.namedOnly) return s.goblins.some(g => g.named);
    if (r.requires) return GTM.hasBuilding(s, r.requires) || shown(s, 'tabs', 'research');
    if (id === 'builder') return shown(s, 'tabs', 'build');
    if (r.military || id === 'scout') return shown(s, 'tabs', 'war');
    return true;
  };
  const roleCards = Object.entries(GTM.ROLES).filter(([id]) => roleVisible(id)).map(([id, r]) => {
    if (r.namedOnly) return `<div class="card"><div class="muted">${r.label}</div><b>${counts[id] || 0}</b></div>`;
    const slots = GTM.roleSlots(s, id);
    const locked = r.requires && slots === 0;
    const plus = id === 'idle' ? '' : btn('+', 'autoAssign', { role: id }, { disabled: locked, title: locked ? 'Requires ' + GTM.BUILDINGS[r.requires].name : 'Assign best-fit idle goblin' });
    const minus = id === 'idle' ? '' : btn('-', 'autoUnassign', { role: id });
    return `<div class="card ${locked ? 'locked' : ''}"><div class="muted">${r.label}${slots !== Infinity ? ' (' + slots + ' slots)' : ''}</div><b>${counts[id] || 0}</b> ${minus} ${plus}</div>`;
  }).join('');

  let list = s.goblins.slice();
  if (ui.roleFilter !== 'all') list = list.filter(g => g.role === ui.roleFilter);
  const k = ui.sort.key, d = ui.sort.dir;
  const keyFn = {
    id: g => g.id, name: g => GTM.goblinName(g), rank: g => g.rank, role: g => g.role,
    life: g => g.contribution.lifetime, recent: g => g.contribution.recent, fit: g => GTM.statFactor(g),
  }[k] || (g => g.stats[k]);
  list.sort((a, b) => { const x = keyFn(a), y = keyFn(b); return (x > y ? 1 : x < y ? -1 : 0) * d; });

  const th = (key, label) => `<th class="sort" data-action="sort" data-v="${key}">${label}${ui.sort.key === key ? (d > 0 ? ' ▲' : ' ▼') : ''}</th>`;
  const rows = list.map(g => {
    const posts = GTM.postOptions(s, g);
    const statusParts = [];
    if (g.injured > 0) statusParts.push(`<span class="bad">injured ${Math.ceil(g.injured / 24)}d</span>`);
    if (GTM.isEligible(s, g)) statusParts.push('<span class="warn">promotable</span>');
    if (GTM.overtimeOn(s, g.role)) statusParts.push('<span class="warn">overtime</span>');
    return `<tr>
      <td><input type="checkbox" data-change="select" data-id="${g.id}" ${ui.selected.has(g.id) ? 'checked' : ''}></td>
      <td class="num">${g.id}</td>
      <td>${g.named ? `<span class="tag named">${esc(g.named.name)}</span> <span class="muted">${GTM.TRAITS[g.named.trait].name}</span>` : '<span class="muted">unnamed</span>'}</td>
      <td>${GTM.rankOf(g).label}</td>
      <td>${g.role === 'specialist' ? 'Specialist: ' + GTM.POSITIONS[g.position].name : `<select data-change="role" data-id="${g.id}">${GTM.roleOptions(s, g).map(([v, l]) => opt(v, l, g.role)).join('')}</select>`}</td>
      <td>${posts ? `<select data-change="post" data-id="${g.id}">${posts.map(([v, l]) => opt(v, l, g.zone)).join('')}</select>` : ''}</td>
      ${ui.details ? GTM.STATS.map(st => `<td class="num">${f1(g.stats[st]).replace('.0', '')}</td>`).join('') : ''}
      <td class="num" title="How well this goblin's stats suit its role (1.0 = average)">${f1(GTM.statFactor(g))}</td>
      ${ui.details ? `<td class="num">${f1(g.contribution.lifetime)}</td><td class="num">${f1(g.contribution.recent)}</td>` : ''}
      <td>${statusParts.join(' ')}</td></tr>`;
  }).join('');

  const sel = ui.selected.size;
  return `<div class="rolebar">${roleCards}</div>
    <div class="panel-section">
      <div class="row" style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.4rem">
        ${btn(ui.details ? 'Hide stats' : 'Show stats', 'toggleDetails')}
        ${ui.details ? `Filter <select data-change="roleFilter">${opt('all', 'All roles', ui.roleFilter)}${Object.entries(GTM.ROLES).map(([v, r]) => opt(v, r.label, ui.roleFilter)).join('')}</select>
        <span class="muted">|</span> ${sel} selected:
        <select id="bulkRole">${Object.entries(GTM.ROLES).filter(([id]) => id !== 'specialist').map(([v, r]) => opt(v, r.label)).join('')}</select>
        <select id="bulkPost"><option value="">(default post)</option>${opt('reserve', 'Reserve')}${opt('enemy', 'Scout enemy')}${s.zoneOrder.map(z => opt(z, s.zones[z].name)).join('')}</select>
        ${btn('Assign selected', 'bulkAssign', {}, { disabled: !sel })} ${btn('Select shown', 'selectShown')} ${btn('Clear', 'selectNone', {}, { disabled: !sel })}` : ''}
      </div>
      <table class="nowrap"><thead><tr><th></th>${th('id', '#')}${th('name', 'Name')}${th('rank', 'Rank')}${th('role', 'Role')}<th>Post / Zone</th>
        ${ui.details ? GTM.STATS.map(st => th(st, GTM.STAT_LABELS[st])).join('') : ''}${th('fit', 'Fit')}${ui.details ? th('life', 'Contrib') + th('recent', 'Recent') : ''}<th>Status</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>`;
};

// ---------- Construction ----------
GTM.renderBuild = function (s) {
  const builders = s.goblins.filter(g => g.role === 'builder' && g.injured <= 0);
  const perDay = builders.reduce((a, g) => a + GTM.WORK_PER_DAY.builder * GTM.workerFactor(s, g), 0);
  const explored = s.zoneOrder.filter(z => s.zones[z].explored && shown(s, 'zones', z));
  const hiddenCount = Object.keys(GTM.BUILDINGS).filter(id => !shown(s, 'buildings', id)).length;
  const goal = GTM.currentObjective(s);
  const avail = Object.entries(GTM.BUILDINGS).filter(([id]) => shown(s, 'buildings', id)).map(([id, b]) => {
    const ok = GTM.requirementsMet(s, b.requires);
    const afford = GTM.canAfford(s, b.cost);
    const rec = goal && goal.id === 'palisade' && id === 'palisade';
    return `<tr class="${ok ? '' : 'muted'} ${rec ? 'rec' : ''}"><td title="${esc(b.desc)}"><b>${b.name}</b> <span class="muted">ⓘ</span>${rec ? ' <span class="tag good">Recommended</span>' : ''}</td><td>${b.tier}</td>
      <td class="${afford ? '' : 'bad'}">${GTM.fmtCost(b.cost)}</td><td class="num">${b.work}</td>
      <td>${ok ? `<select id="bz_${id}">${explored.map(z => opt(z, s.zones[z].name + ' (' + (GTM.ZONES[z].slots - s.zones[z].buildings.length - s.buildQueue.filter(q => q.zone === z && q.kind === 'building').length) + ' free)')).join('')}</select> ${btn('Queue', 'queueBuild', { id }, { disabled: !afford })}` : 'Needs ' + GTM.describeReq(b.requires)}</td></tr>`;
  }).join('');
  let eta = 0;
  const queue = s.buildQueue.map((q, i) => {
    eta += (q.work - q.progress) / Math.max(0.01, perDay);
    const name = q.kind === 'road' ? 'Road' : GTM.BUILDINGS[q.id].name;
    return `<tr><td>${i + 1}</td><td>${name}</td><td>${esc(s.zones[q.zone].name)}</td><td style="width:30%">${bar(100 * q.progress / q.work)} ${f1(q.progress)}/${q.work}</td>
      <td>${perDay > 0 ? f1(eta) + 'd' : '<span class="bad">no builders</span>'}</td>
      <td>${btn('▲', 'moveBuild', { i, d: -1 })}${btn('▼', 'moveBuild', { i, d: 1 })} ${btn('Cancel', 'cancelBuild', { i })}</td></tr>`;
  }).join('');

  const crafters = s.goblins.filter(g => g.role === 'craftsman' && g.injured <= 0);
  const craftDay = crafters.reduce((a, g) => a + GTM.WORK_PER_DAY.craftsman * GTM.workerFactor(s, g) * (g.named && g.named.trait === 'crafting' ? 2 : 1), 0);
  const rec = GTM.RECIPES[s.craftRecipe];
  return `<div class="panel-section"><h2>Build queue</h2>
      <p>Builders <b>${builders.length}</b> ${btn('−', 'autoUnassign', { role: 'builder' }, { cls: 'big' })} ${btn('+', 'autoAssign', { role: 'builder' }, { cls: 'big primary' })}
      <span class="muted" title="Builders work the top item. Materials are paid when queued and refunded on cancel.">${f1(perDay)} work/day ⓘ</span>
      ${shown(s, 'flags', 'overtime') ? GTM.overtimeButton(s, 'builder') : ''}</p>
      ${queue ? `<table><thead><tr><th>#</th><th>Project</th><th>Zone</th><th>Progress</th><th>ETA</th><th></th></tr></thead><tbody>${queue}</tbody></table>` : '<p class="muted">Queue empty.</p>'}
    </div>
    ${shown(s, 'buildings', 'workshop') ? `<div class="panel-section"><h2>Workshop crafting</h2>
      ${GTM.hasBuilding(s, 'workshop') ? `<p>${crafters.length} craftsman/men: ${f1(craftDay)} work/day. Recipe:
        <select data-change="recipe">${Object.entries(GTM.RECIPES).filter(([, r]) => GTM.requirementsMet(s, r.requires)).map(([id, r]) => opt(id, r.name, s.craftRecipe)).join('')}</select>
        ${bar(100 * Math.min(1, s.craftProgress / rec.work))}
        ${craftDay > 0 ? '~' + f1(craftDay / rec.work) + ' batches/day' : ''} ${!GTM.canAfford(s, rec.in) ? '<span class="bad">missing inputs</span>' : ''}</p>`
        : '<p class="muted">Build a Workshop to unlock Craftsmen (ammo, repair kits, crossbows).</p>'}
    </div>` : ''}
    <div class="panel-section"><h2>Buildings</h2>
      <table><thead><tr><th>Building</th><th>Tier</th><th>Cost</th><th>Work</th><th>Place</th></tr></thead><tbody>${avail}</tbody></table>
      ${hiddenCount ? `<p class="muted">${hiddenCount} more building${hiddenCount === 1 ? '' : 's'} unlock as the territory grows.</p>` : ''}
    </div>`;
};

// Inline overtime toggle for a role (also used by the Hierarchy panel).
GTM.overtimeButton = function (s, role) {
  const o = s.overtime[role];
  if (o.active) return btn('Stop overtime (' + f1(o.ticksLeft / 24) + 'd left)', 'stopOT', { role }, { cls: 'warnbtn' });
  if (o.cooldown > 0) return `<span class="muted">Overtime cooldown ${f1(o.cooldown / 24)}d</span>`;
  return btn('⚡ Overtime', 'startOT', { role }, { title: '+40% output, +30% food, morale down. 2 days max.' });
};

// ---------- Research ----------
GTM.renderResearch = function (s) {
  const res = s.goblins.filter(g => g.role === 'researcher' && g.injured <= 0);
  const perDay = res.reduce((a, g) => a + GTM.WORK_PER_DAY.researcher * GTM.workerFactor(s, g) * (g.named && g.named.trait === 'crafting' ? 2 : 1), 0) * GTM.researchMult(s);
  const lead = GTM.hasResearchLead(s);
  const queue = s.researchQueue.map((q, i) => {
    const d = GTM.RESEARCH[q.id];
    const blocked = GTM.researchBlocked(s, q.id);
    return `<tr><td>${i + 1}</td><td><b>${d.name}</b> <span class="muted">${d.cat}</span></td><td style="width:35%">${bar(100 * q.progress / d.work)} ${f1(q.progress)}/${d.work}</td>
      <td>${blocked ? '<span class="bad">needs lead researcher</span>' : ''}</td><td>${btn('Cancel', 'cancelResearch', { i })}</td></tr>`;
  }).join('');
  const avail = Object.entries(GTM.RESEARCH).filter(([id]) => !s.researched[id] && !s.researchQueue.some(q => q.id === id)).map(([id, d]) => {
    const ok = GTM.requirementsMet(s, d.requires);
    return `<tr class="${ok ? '' : 'muted'}"><td><b>${d.name}</b><br><span class="muted">${d.desc}</span></td><td>${d.cat}</td>
      <td class="${GTM.canAfford(s, d.cost) ? '' : 'bad'}">${GTM.fmtCost(d.cost)}</td><td class="num">${d.work}</td><td>${d.lead ? 'Senior+' : ''}</td>
      <td>${ok ? btn('Queue', 'queueResearch', { id }, { disabled: !GTM.canAfford(s, d.cost) }) : 'Needs ' + GTM.describeReq(d.requires)}</td></tr>`;
  }).join('');
  const done = Object.keys(s.researched).map(id => `<span class="tag">${GTM.RESEARCH[id].name}</span>`).join('') || '<span class="muted">none yet</span>';
  return `<div class="panel-section"><h2>Corporate R&amp;D</h2>
      ${GTM.hasBuilding(s, 'research_hut') ? '' : '<p class="warn">No Research hut yet: build one (Construction tab) to assign Researchers.</p>'}
      <p>${res.length} researcher(s): <b>${f1(perDay)}</b> work/day. Research lead: ${lead ? '<span class="good">yes</span>' : '<span class="warn">no (promote a researcher to Senior or appoint a Lead Researcher)</span>'}
      ${btn('+ researcher', 'autoAssign', { role: 'researcher' }, { disabled: !GTM.hasBuilding(s, 'research_hut') })}</p>
      ${queue ? `<table><tbody>${queue}</tbody></table>` : '<p class="muted">Queue empty. Researchers work the first unblocked project.</p>'}
    </div>
    <div class="panel-section"><h3>Available projects</h3>
      <table><thead><tr><th>Project</th><th>Type</th><th>Cost</th><th>Work</th><th>Lead</th><th></th></tr></thead><tbody>${avail}</tbody></table>
      <h3>Completed</h3>${done}</div>`;
};

// ---------- Hierarchy & incentives ----------
GTM.renderHierarchy = function (s) {
  const ranks = GTM.RANKS.map((r, i) => {
    const n = s.goblins.filter(g => g.rank === i).length;
    return `<tr><td>${r.label}</td><td class="num">${n}</td><td>${i === 0 ? '-' : `<input type="number" min="0" value="${s.thresholds[i]}" data-change="threshold" data-i="${i}">`}</td>
      <td class="num">${r.cost || '-'}</td><td class="num">x${r.food}</td><td>${r.lead ? 'Squad buff +10%, research lead' : i >= 2 ? 'Research lead, +10% war power' : ''}</td>
      <td>${r.minLevel > s.level ? '<span class="warn">Territory Lv ' + r.minLevel + '</span>' : ''}</td></tr>`;
  }).join('');
  const eligible = s.goblins.filter(g => GTM.isEligible(s, g));
  const elig = eligible.slice(0, 12).map(g => `<tr><td>${esc(GTM.goblinName(g))}</td><td>${GTM.rankOf(g).label} → ${GTM.RANKS[g.rank + 1].label}</td><td class="num">${f1(g.contribution.lifetime)}</td><td>${btn('Promote (' + GTM.RANKS[g.rank + 1].cost + ' CP)', 'promote', { id: g.id }, { disabled: s.cp < GTM.RANKS[g.rank + 1].cost })}</td></tr>`).join('');

  const ot = GTM.OVERTIME_ROLES.map(role => {
    const o = s.overtime[role];
    const n = s.goblins.filter(g => g.role === role).length;
    return `<tr><td>${role === 'craftsman' ? 'Craftsmen' : GTM.ROLES[role].label + 's'} (${n})</td><td>${o.active ? `<span class="warn">ACTIVE ${Math.ceil(o.ticksLeft / 24 * 10) / 10}d left</span>` : o.cooldown > 0 ? `<span class="muted">recovering ${f1(o.cooldown / 24)}d</span>` : 'normal hours'}</td>
      <td>${o.active ? btn('Stop', 'stopOT', { role }) : btn('Start overtime', 'startOT', { role }, { disabled: o.cooldown > 0 || n === 0 })}</td></tr>`;
  }).join('');

  const mt = GTM.computeMoraleTarget(s);
  const moraleRows = mt.parts.map(([l, v]) => `<tr><td>${esc(l)}</td><td class="num ${v < 0 ? 'bad' : v > 0 && l !== 'Base' ? 'good' : ''}">${v > 0 && l !== 'Base' ? '+' : ''}${v}</td></tr>`).join('');

  const q = s.quota;
  const quota = q ? `<p>Gather <b>${q.target} ${GTM.RESOURCES[q.resource].label}</b>: ${f1(q.progress)} done, ${f1(q.ticksLeft / 24)} days left, reward ${q.reward * 2} contribution.</p>${bar(100 * q.progress / q.target)}`
    : `<p>Resource <select id="qRes">${['fruit', 'meat', 'wood', 'stone', 'leather', 'silk', 'scrap'].map(r => opt(r, GTM.RESOURCES[r].label)).join('')}</select>
       amount <input id="qAmt" type="number" value="30" min="1"> days <input id="qDays" type="number" value="2" min="1" max="5"> reward CP <input id="qReward" type="number" value="10" min="0">
       ${btn('Launch', 'quota')}</p><p class="muted">CP is spent now; contributors share 2x that as contribution if met in time. Success +8 morale, failure -5.</p>`;

  const slots = GTM.namingSlots(s), used = GTM.namedCount(s);
  const unnamed = s.goblins.filter(g => !g.named).sort((a, b) => GTM.STATS.reduce((x, st) => x + b.stats[st], 0) - GTM.STATS.reduce((x, st) => x + a.stats[st], 0));
  const named = s.goblins.filter(g => g.named);
  const positions = Object.entries(GTM.POSITIONS).map(([pid, p]) => `<tr><td><b>${p.name}</b><br><span class="muted">${p.desc}</span></td>
    <td><select data-change="position" data-pos="${pid}">${opt('', '(vacant)', String(s.positions[pid] || ''))}${named.map(g => opt(String(g.id), g.named.name + ' (' + GTM.TRAITS[g.named.trait].name + ')', String(s.positions[pid] || ''))).join('')}</select></td></tr>`).join('');

  return `<div class="split"><div>
    <div class="panel-section"><h2>Corporate ladder</h2>
      <label><input type="checkbox" data-change="autoPromote" ${s.autoPromote ? 'checked' : ''}> Auto-promote when thresholds are met (pays CP automatically)</label>
      <table><thead><tr><th>Rank</th><th>#</th><th>Threshold</th><th>CP</th><th>Rations</th><th>Perks</th><th></th></tr></thead><tbody>${ranks}</tbody></table>
      <h3>Awaiting promotion (${eligible.length})</h3>
      ${elig ? `<table><tbody>${elig}</tbody></table>` : '<p class="muted">Nobody. Fairness is intact.</p>'}
      <p class="muted">Goblins left waiting for a deserved promotion lower morale. Higher ranks eat more.</p>
    </div>
    <div class="panel-section"><h2>Overtime campaigns</h2>
      <p class="muted">+40% output, +30% food for that role, morale penalty while active. Max 2 days, then 3 days of recovery.</p>
      <table><tbody>${ot}</tbody></table>
    </div>
    <div class="panel-section"><h2>One-time bonuses</h2>
      ${Object.entries(GTM.BONUSES).map(([k, b]) => `<p>${btn(b.name, 'bonus', { k })} <span class="muted">${b.desc}</span></p>`).join('')}
    </div>
    <div class="panel-section"><h2>Quota project</h2>${quota}</div>
  </div><div>
    <div class="panel-section"><h2>Morale ${f0(s.morale)} → ${f0(mt.total)}</h2>${bar(s.morale, 'morale', mt.total)}
      <table><tbody>${moraleRows}</tbody></table></div>
    <div class="panel-section"><h2>Naming (${used}/${slots} slots)</h2>
      <p class="muted">Naming grants +3 to every stat, max loyalty and a trait. Named goblins can become Specialists in leadership positions. Costs ${GTM.NAMING_COST} CP. Slots = Territory Level.</p>
      ${used < slots ? `<p><select id="nameWho">${unnamed.slice(0, 40).map(g => opt(String(g.id), '#' + g.id + ' ' + GTM.STATS.map(st => GTM.STAT_LABELS[st] + Math.round(g.stats[st])).join(' '))).join('')}</select></p>
        <p><input id="nameText" placeholder="Name" value="${esc(GTM.NAME_SUGGESTIONS[(s.tick + used) % GTM.NAME_SUGGESTIONS.length])}" maxlength="20">
        <select id="nameTrait">${Object.entries(GTM.TRAITS).map(([k, t]) => opt(k, t.name)).join('')}</select>
        ${btn('Name goblin', 'name', {}, { disabled: s.cp < GTM.NAMING_COST, cls: 'primary' })}</p>
        <p class="muted">${Object.values(GTM.TRAITS).map(t => '<b>' + t.name + '</b>: ' + t.desc).join('<br>')}</p>` : '<p class="muted">All naming slots used. Win wars to raise Territory Level.</p>'}
      <h3>Positions</h3><table><tbody>${positions}</tbody></table>
    </div>
  </div></div>`;
};

// ---------- War room ----------
GTM.renderWar = function (s) {
  const w = s.war;
  if (!w) return '<p>No war scheduled.</p>';
  const est = GTM.enemyEstimate(s);
  const left = w.atTick - s.tick;
  const scouts = s.goblins.filter(g => g.role === 'scout' && g.zone === 'enemy');
  const explored = s.zoneOrder.filter(z => s.zones[z].explored && shown(s, 'zones', z));
  const rows = explored.map(zid => {
    const d = GTM.computeDefense(s, zid);
    const cls = d.total >= est.hi ? 'good' : d.total >= est.lo ? 'warn' : 'bad';
    return `<tr class="${est.zone === zid ? 'warn' : ''}"><td>${esc(s.zones[zid].name)}${est.zone === zid ? ' <b>(confirmed target)</b>' : ''}</td><td class="num ${cls}">${f1(d.total)}</td>
      <td>${btn('Breakdown', 'warView', { zone: zid })} ${btn('Warriors here', 'postAll', { zone: zid, role: 'warrior' }, { title: 'Post every warrior in this zone' })} ${btn('Ranged here', 'postAll', { zone: zid, role: 'ranged' }, { title: 'Post every ranged goblin in this zone' })}</td></tr>`;
  }).join('');
  const viewZone = GTM.ui.warView && s.zones[GTM.ui.warView] ? GTM.ui.warView : (est.zone || explored[0]);
  const bd = GTM.computeDefense(s, viewZone);
  const ranged = s.goblins.filter(g => g.role === 'ranged').length;
  const counts = r => s.goblins.filter(g => g.role === r).length;
  const target = est.zone || null;
  const you = target ? GTM.computeDefense(s, target).total : Math.min(...explored.map(z => GTM.computeDefense(s, z).total));
  const scale = Math.max(you, est.hi) * 1.1;
  return `<div class="panel-section vs"><div class="row"><b>You ${f1(you)}</b><span class="muted">${target ? 'defending ' + esc(s.zones[target].name) : 'weakest zone (target unknown: scout!)'}</span><b class="bad">Enemy ${est.known ? est.lo + '–' + est.hi : '??'}</b></div>
      <div class="vsbar"><i class="you" style="width:${100 * you / scale}%"></i><i class="enemy" style="left:${100 * est.lo / scale}%;width:${100 * (est.hi - est.lo) / scale}%"></i></div></div>
    ${(() => { const r = GTM.warReadiness(s); return `<div class="panel-section readiness"><h2>Readiness ${r.ready ? '<span class="good">✓ ready</span>' : '<span class="warn">' + r.items.filter(i => !i.ok).length + ' to fix</span>'}</h2>
      <ul class="checklist">${r.items.map(i => `<li class="${i.ok ? 'good' : 'bad'}">${i.ok ? '✓' : '✗'} ${esc(i.label)} <span class="muted">${esc(i.detail)}</span></li>`).join('')}</ul></div>`; })()}
    <div class="split"><div>
    <div class="panel-section"><h2>Territory War #${w.number}</h2>
      <p>Starts ${GTM.fmtTime(w.atTick)} (in ${Math.floor(left / 24)}d ${left % 24}h).</p>
      <p>Enemy strength: <b>${est.lo} - ${est.hi}</b> ${est.known ? '<span class="good">(accurate)</span>' : '<span class="warn">(rough guess)</span>'}</p>
      <p>Attack target: ${est.zone ? '<b class="warn">' + esc(s.zones[est.zone].name) + '</b>' : '<span class="muted">unknown</span>'}</p>
      <p>Intel ${f1(s.intel)}: zone at ${GTM.WAR.intelZone}, strength at ${GTM.WAR.intelPower}. ${scouts.length} scout(s) on the enemy. ${btn('+ scout', 'autoAssign', { role: 'scout', zone: 'enemy' })}</p>
      ${bar(100 * Math.min(1, s.intel / GTM.WAR.intelPower))}
      <p class="muted" title="A watchtower in the targeted zone also reveals the attack 1 day early.">Scouts reveal the target, then its strength ⓘ</p>
    </div>
    <div class="panel-section"><h2>Projected defense by attacked zone</h2>
      <table><thead><tr><th>If enemy attacks</th><th>Defense</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      <p class="muted" title="Green: beats the high estimate. Yellow: inside the range. Red: below it. Each side rolls ±10%.">Colours compare you to the enemy estimate ⓘ</p>
    </div></div><div>
    <div class="panel-section"><h2>Breakdown: ${esc(s.zones[viewZone].name)}</h2>
      <table><tbody>${bd.lines.map(([l, v]) => `<tr><td>${esc(l)}</td><td class="num">${typeof v === 'number' ? f1(v) : esc(v)}</td></tr>`).join('')}
      <tr><td><b>Total</b></td><td class="num"><b>${f1(bd.total)}</b></td></tr></tbody></table>
    </div>
    <div class="panel-section"><h2>Forces &amp; supplies</h2>
      <p>Warriors ${counts('warrior')} ${btn('+', 'autoAssign', { role: 'warrior', zone: 'reserve' })} · Ranged ${counts('ranged')} ${btn('+', 'autoAssign', { role: 'ranged', zone: 'reserve' })}</p>
      <p>Ammo ${f0(s.resources.ammo)} / needed ${ranged * GTM.WAR.ammoPerRanged} ${s.resources.ammo < ranged * GTM.WAR.ammoPerRanged ? '<span class="bad">short: ranged fight at reduced power</span>' : ''}</p>
      <p>Crossbows ${f0(s.resources.crossbows)} · Repair kits ${f0(s.resources.repairKits)} (save a palisade from destruction)</p>
      <p class="muted" title="Defenders in the attacked zone fight at 100%, reserve at 80% (100% with a watchtower there), goblins posted elsewhere at 50% (75% with a road). Everyone else fights as weak militia. Pit traps are spent when triggered.">Post defenders where the enemy will strike ⓘ</p>
    </div></div></div>`;
};

// ---------- Debug ----------
GTM.renderDebug = function (s) {
  const summary = Object.assign({}, s, { goblins: s.goblins.length + ' goblins (see below)', log: s.log.length + ' entries' });
  return `<div class="panel-section"><h2>Debug tools</h2>
    <p>${btn('+100 food', 'dbg', { k: 'food' })} ${btn('+100 wood & stone', 'dbg', { k: 'mats' })} ${btn('+100 CP', 'dbg', { k: 'cp' })}
       ${btn('Skip 1 day', 'dbg', { k: 'day' })} ${btn('War in 1 hour', 'dbg', { k: 'war' })} ${btn('Reveal intel', 'dbg', { k: 'intel' })} ${btn('Morale 100', 'dbg', { k: 'morale' })}</p>
    <p>Seed ${s.seed}. ${btn('Export save to clipboard', 'export')} ${btn('Import save...', 'import')}</p></div>
    <div class="split"><div class="panel-section"><h3>State</h3><pre class="inspect">${esc(JSON.stringify(summary, null, 1))}</pre></div>
    <div class="panel-section"><h3>Goblins</h3><pre class="inspect">${esc(JSON.stringify(s.goblins, null, 1))}</pre></div></div>`;
};

GTM.renderPanel = function (s) {
  return ({ zones: GTM.renderZones, population: GTM.renderPopulation, build: GTM.renderBuild, research: GTM.renderResearch,
    hierarchy: GTM.renderHierarchy, war: GTM.renderWar, debug: GTM.renderDebug })[GTM.ui.tab](s);
};

GTM.renderGameOver = (s, checkpoint) => s.gameOver ? `<div class="overlay"><div class="card"><h2 class="bad">GAME OVER</h2><p>${esc(s.gameOver.reason)}</p>
  <p>You survived ${GTM.day(s)} days and won ${s.warsWon} war(s).</p>
  ${checkpoint && checkpoint.seed === s.seed ? `<p>${btn('⟲ Rewind to dawn of Day ' + checkpoint.day, 'rewind', {}, { cls: 'primary big' })}</p><p class="muted">One day to fix your defenses. Check the War Room.</p>` : ''}
  <p>${btn('Start a new territory', 'newGame')} ${btn('Inspect final state', 'closeOverlay')}</p></div></div>` : '';

