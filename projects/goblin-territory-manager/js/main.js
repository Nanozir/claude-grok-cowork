// Bootstraps the game: main loop, event delegation, save/load.
(function () {
  const SAVE_KEY = 'gtm-save-v1';
  const $ = id => document.getElementById(id);
  let state = GTM.newGame(Date.now() % 1e9);
  let overlayHidden = false;
  window.GTM_STATE = () => state; // handy in the browser console

  const overlay = document.createElement('div');
  document.body.appendChild(overlay);

  function toast(msg) {
    if (!msg) return;
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // Re-rendering a panel while the player has a dropdown open would close it,
  // so skip the panel (not the top bars) while a form control inside it has focus.
  function render(force) {
    $('topbar').innerHTML = GTM.renderTop(state);
    $('resbar').innerHTML = GTM.renderRes(state);
    $('tabs').innerHTML = GTM.renderTabs(state);
    const a = document.activeElement;
    const busy = a && $('panel').contains(a) && (a.tagName === 'SELECT' || a.tagName === 'INPUT');
    if (force || !busy) {
      const scroll = document.querySelector('main').scrollTop;
      $('panel').innerHTML = GTM.renderPanel(state);
      document.querySelector('main').scrollTop = scroll;
    }
    $('log').innerHTML = GTM.renderLog(state);
    overlay.innerHTML = overlayHidden ? '' : GTM.renderGameOver(state);
  }

  // ---- Main loop: speed 1 = 2 ticks (hours) per real second ----
  let acc = 0, last = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = (now - last) / 1000; last = now;
    if (state.paused || state.gameOver) { acc = 0; return; }
    acc += dt * state.speed * 2;
    let n = 0;
    while (acc >= 1 && n < 50) { GTM.tick(state); acc--; n++; }
    if (n) render();
  }, 100);

  const goblin = id => state.goblins.find(g => g.id === Number(id));

  const actions = {
    tab: d => { GTM.ui.tab = d.v; },
    speed: d => { const v = Number(d.v); if (v === 0) state.paused = true; else { state.paused = false; state.speed = v; } },
    sort: d => { const s = GTM.ui.sort; if (s.key === d.v) s.dir = -s.dir; else { s.key = d.v; s.dir = d.v === 'id' || d.v === 'name' ? 1 : -1; } },
    autoAssign: d => GTM.autoAssign(state, d.role, d.zone),
    autoUnassign: d => GTM.autoUnassign(state, d.role, d.zone),
    road: d => GTM.queueRoad(state, d.zone),
    queueBuild: d => GTM.queueBuilding(state, d.id, $('bz_' + d.id).value),
    cancelBuild: d => GTM.cancelBuild(state, Number(d.i)),
    moveBuild: d => GTM.moveBuild(state, Number(d.i), Number(d.d)),
    queueResearch: d => GTM.queueResearch(state, d.id),
    cancelResearch: d => GTM.cancelResearch(state, Number(d.i)),
    promote: d => GTM.promote(state, goblin(d.id)),
    startOT: d => GTM.startOvertime(state, d.role),
    stopOT: d => GTM.stopOvertime(state, d.role),
    bonus: d => GTM.issueBonus(state, d.k),
    quota: () => GTM.startQuota(state, $('qRes').value, Number($('qAmt').value), Number($('qDays').value), Number($('qReward').value)),
    name: () => GTM.nameGoblin(state, goblin($('nameWho').value), $('nameText').value, $('nameTrait').value),
    warView: d => { GTM.ui.warView = d.zone; },
    postAll: d => { for (const g of state.goblins) if (g.role === d.role) g.zone = d.zone; },
    bulkAssign: () => {
      const role = $('bulkRole').value, post = $('bulkPost').value || undefined;
      const errs = [];
      for (const id of GTM.ui.selected) { const g = goblin(id); if (g) { const e = GTM.assign(state, g, role, post); if (e) errs.push(e); } }
      GTM.ui.selected.clear();
      return errs[0] ? errs.length + ' not assigned: ' + errs[0] : null;
    },
    selectShown: () => { for (const g of state.goblins) if (GTM.ui.roleFilter === 'all' || g.role === GTM.ui.roleFilter) GTM.ui.selected.add(g.id); },
    selectNone: () => GTM.ui.selected.clear(),
    save: () => {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); return 'ok:Saved.'; }
      catch (e) { return 'Save failed (browser storage unavailable). Use Debug > Export instead.'; }
    },
    load: () => {
      let raw = null;
      try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* storage blocked */ }
      if (!raw) return 'No save found.';
      return loadJSON(raw);
    },
    newGame: () => {
      if (!state.gameOver && !confirm('Abandon this territory and start over?')) return null;
      state = GTM.newGame(Date.now() % 1e9); overlayHidden = false; GTM.ui.selected.clear();
    },
    closeOverlay: () => { overlayHidden = true; },
    export: () => {
      const txt = JSON.stringify(state);
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('Save copied to clipboard.'), () => prompt('Copy your save:', txt));
      else prompt('Copy your save:', txt);
    },
    import: () => { const raw = prompt('Paste a save:'); return raw ? loadJSON(raw) : null; },
    dbg: d => {
      const r = state.resources;
      if (d.k === 'food') { r.fruit += 50; r.meat += 50; }
      if (d.k === 'mats') { r.wood += 100; r.stone += 100; }
      if (d.k === 'cp') state.cp += 100;
      if (d.k === 'day') for (let i = 0; i < 24; i++) GTM.tick(state);
      if (d.k === 'war' && state.war) state.war.atTick = state.tick + 1;
      if (d.k === 'intel') state.intel = GTM.WAR.intelPower;
      if (d.k === 'morale') state.morale = 100;
    },
  };

  function loadJSON(raw) {
    try {
      const s = JSON.parse(raw);
      if (!s || s.version !== 1 || !Array.isArray(s.goblins)) return 'Not a valid save.';
      state = s; state.paused = true; overlayHidden = false;
      return 'ok:Loaded (paused).';
    } catch (e) { return 'Could not read save: ' + e.message; }
  }

  const changes = {
    focus: el => { state.zones[el.dataset.zone].focus = el.value; },
    role: el => GTM.assign(state, goblin(el.dataset.id), el.value),
    post: el => { goblin(el.dataset.id).zone = el.value; },
    select: el => { const id = Number(el.dataset.id); if (el.checked) GTM.ui.selected.add(id); else GTM.ui.selected.delete(id); },
    roleFilter: el => { GTM.ui.roleFilter = el.value; },
    recipe: el => { state.craftRecipe = el.value; state.craftProgress = 0; },
    threshold: el => { const v = Math.max(0, Number(el.value) || 0); state.thresholds[Number(el.dataset.i)] = v; },
    autoPromote: el => { state.autoPromote = el.checked; },
    position: el => GTM.setPosition(state, el.dataset.pos, el.value ? Number(el.value) : null),
    logFilter: el => { GTM.ui.logFilter = el.value; },
  };

  function result(msg) {
    if (typeof msg === 'string') toast(msg.startsWith('ok:') ? msg.slice(3) : msg);
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled || !actions[el.dataset.action]) return;
    result(actions[el.dataset.action](el.dataset));
    render(true);
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-change]');
    if (!el || !changes[el.dataset.change]) return;
    result(changes[el.dataset.change](el));
    el.blur();
    render(true);
  });
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') { e.preventDefault(); state.paused = !state.paused; render(); }
  });

  render(true);
})();
