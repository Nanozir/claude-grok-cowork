// Bootstraps the game: main loop, event delegation, save/load, rewind checkpoint, notices.
(function () {
  const SAVE_KEY = 'gtm-save-v1';
  const REWIND_KEY = 'gtm-rewind-v2';
  const TICKS_PER_SECOND = 1; // at 1x: 1 in-game hour per real second, so a day takes 24 s
  const $ = id => document.getElementById(id);
  const debugParam = /[?&]debug\b/.test(location.search);

  let state = freshGame();
  let overlayHidden = false;
  let checkpoint = readStore(REWIND_KEY); // { json, day, war } saved at dawn the day before each war
  window.GTM_STATE = () => state; // handy in the browser console

  const overlay = document.createElement('div');
  document.body.appendChild(overlay);

  function freshGame() {
    const s = GTM.newGame(Date.now() % 1e9);
    if (debugParam) GTM.reveal(s, 'tabs', ['debug']);
    return s;
  }
  function readStore(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  // ---- Toasts: a small queue so notices don't overwrite each other ----
  const toastQueue = [];
  function toast(msg, kind = 'bad') {
    if (!msg) return;
    // Important notices jump the queue: drop pending (not yet shown) success toasts.
    if (kind !== 'good') for (let i = toastQueue.length - 1; i >= 1; i--) if (toastQueue[i].kind === 'good') toastQueue.splice(i, 1);
    toastQueue.push({ msg, kind });
    if (toastQueue.length === 1) showNextToast();
  }
  function showNextToast() {
    const t = $('toast'), item = toastQueue[0];
    if (!item) return;
    t.textContent = item.msg;
    t.className = 'show ' + item.kind;
    setTimeout(() => {
      t.className = '';
      toastQueue.shift();
      setTimeout(showNextToast, 200);
    }, item.kind === 'pause' ? 4500 : toastQueue.length > 1 ? 900 : 1800);
  }
  // Drain sim notices. Returns true if one of them asked to pause.
  function drainNotices() {
    let pause = false;
    for (const n of state.notices.splice(0)) {
      toast(n.msg, n.pause ? 'pause' : 'good');
      if (n.pause && state.autoPause) pause = true;
    }
    if (pause) state.paused = true;
    return pause;
  }

  // Re-rendering a panel while the player has a dropdown open would close it,
  // so skip the panel (not the top bars) while a form control inside it has focus.
  function render(force) {
    $('topbar').innerHTML = GTM.renderTop(state);
    $('resbar').innerHTML = GTM.renderRes(state);
    $('tabs').innerHTML = GTM.renderTabs(state);
    $('objective').innerHTML = GTM.renderObjective(state);
    const a = document.activeElement;
    const busy = a && $('panel').contains(a) && (a.tagName === 'SELECT' || a.tagName === 'INPUT');
    if (force || !busy) {
      const scroll = document.querySelector('main').scrollTop;
      $('panel').innerHTML = GTM.renderPanel(state);
      document.querySelector('main').scrollTop = scroll;
    }
    $('log').innerHTML = GTM.renderLog(state);
    overlay.innerHTML = !state.flags.introDone ? GTM.renderIntro(state)
      : overlayHidden ? '' : GTM.renderGameOver(state, checkpoint);
  }

  // Save a rewind point at dawn of the day before each war.
  function maybeCheckpoint() {
    const w = state.war;
    if (!w || w.atTick - state.tick !== GTM.TICKS_PER_DAY) return;
    if (checkpoint && checkpoint.war === w.number && checkpoint.seed === state.seed) return;
    checkpoint = { json: JSON.stringify(state), day: GTM.day(state), war: w.number, seed: state.seed };
    writeStore(REWIND_KEY, checkpoint);
  }

  // ---- Main loop ----
  let acc = 0, last = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = (now - last) / 1000; last = now;
    if (state.paused || state.gameOver || !state.flags.introDone) { acc = 0; return; }
    acc += dt * state.speed * TICKS_PER_SECOND;
    let n = 0;
    while (acc >= 1 && n < 50) {
      GTM.tick(state); acc--; n++;
      maybeCheckpoint();
      if (drainNotices() || state.gameOver) { acc = 0; break; }
    }
    if (n) render();
  }, 100);

  const goblin = id => state.goblins.find(g => g.id === Number(id));

  const actions = {
    tab: d => {
      GTM.ui.tab = d.v;
      state.revealed.newTabs = state.revealed.newTabs.filter(t => t !== d.v);
    },
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
    toggleDetails: () => { GTM.ui.details = !GTM.ui.details; },
    // Onboarding
    clockIn: () => { state.flags.introDone = true; state.paused = false; state.speed = 1; },
    skipTutorialIntro: () => { state.flags.introDone = true; GTM.skipTutorial(state); state.paused = true; },
    skipTutorial: () => { if (confirm('Skip the guided start and show the full dashboard?')) GTM.skipTutorial(state); },
    showMe: () => { const o = GTM.currentObjective(state); if (o) actions.tab({ v: o.tab }); },
    rewind: () => {
      if (!checkpoint) return 'No rewind point.';
      const r = loadJSON(checkpoint.json);
      GTM.log(state, 'system', 'SYSTEM: Rewound to dawn of Day ' + checkpoint.day + '. The enemy has not arrived yet.');
      return r === 'ok:Loaded (paused).' ? 'ok:Rewound to Day ' + checkpoint.day + '. Paused.' : r;
    },
    save: () => writeStore(SAVE_KEY, state) ? 'ok:Saved.' : 'Save failed (browser storage unavailable). Use Debug > Export instead.',
    load: () => {
      let raw = null;
      try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* storage blocked */ }
      if (!raw) return 'No save found.';
      return loadJSON(raw);
    },
    newGame: () => {
      if (!state.gameOver && !confirm('Abandon this territory and start over?')) return null;
      state = freshGame(); overlayHidden = false; GTM.ui.selected.clear(); GTM.ui.tab = 'zones';
      checkpoint = null;
      try { localStorage.removeItem(REWIND_KEY); } catch (e) { /* ignore */ }
    },
    closeOverlay: () => { overlayHidden = true; },
    export: () => {
      const txt = JSON.stringify(state);
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('Save copied to clipboard.', 'good'), () => prompt('Copy your save:', txt));
      else prompt('Copy your save:', txt);
    },
    import: () => { const raw = prompt('Paste a save:'); return raw ? loadJSON(raw) : null; },
    dbg: d => {
      const r = state.resources;
      if (d.k === 'food') { r.fruit += 50; r.meat += 50; }
      if (d.k === 'mats') { r.wood += 100; r.stone += 100; }
      if (d.k === 'cp') state.cp += 100;
      if (d.k === 'day') for (let i = 0; i < 24; i++) { GTM.tick(state); maybeCheckpoint(); }
      if (d.k === 'war' && state.war) state.war.atTick = state.tick + 1;
      if (d.k === 'intel') state.intel = GTM.WAR.intelPower;
      if (d.k === 'morale') state.morale = 100;
    },
  };

  function loadJSON(raw) {
    try {
      const s = JSON.parse(raw);
      if (!s || (s.version !== 1 && s.version !== 2) || !Array.isArray(s.goblins)) return 'Not a valid save.';
      state = GTM.migrate(s);
      state.paused = true; state.flags.introDone = true; overlayHidden = false;
      if (debugParam) GTM.reveal(state, 'tabs', ['debug']);
      if (!GTM.isRevealed(state, 'tabs', GTM.ui.tab)) GTM.ui.tab = 'zones';
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
    autoPause: el => { state.autoPause = el.checked; },
    position: el => GTM.setPosition(state, el.dataset.pos, el.value ? Number(el.value) : null),
    logFilter: el => { GTM.ui.logFilter = el.value; },
  };

  function result(msg) {
    if (typeof msg === 'string') toast(msg.startsWith('ok:') ? msg.slice(3) : msg, msg.startsWith('ok:') ? 'good' : 'bad');
  }
  // After any player action, re-check objectives immediately (they must complete while paused too).
  function afterAction() {
    if (!state.gameOver) GTM.onboardingTick(state);
    drainNotices();
    render(true);
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled || !actions[el.dataset.action]) return;
    result(actions[el.dataset.action](el.dataset));
    afterAction();
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-change]');
    if (!el || !changes[el.dataset.change]) return;
    result(changes[el.dataset.change](el));
    el.blur();
    afterAction();
  });
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || !state.flags.introDone) return;
    if (e.code === 'Space') { e.preventDefault(); state.paused = !state.paused; render(); }
  });

  render(true);
})();
