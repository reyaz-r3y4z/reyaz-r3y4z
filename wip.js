/* ═══════════════════════════════════════════════════════
   Work in progress: each card on the build radar opens that build's plan below it.
   For builds tracked from GitHub, each plan step is a repository milestone; its state
   (DONE / IN PROGRESS / PLANNED) comes from assets/project-status.json, which a bot refreshes.
   A link to #wip-<id> opens that build directly.
═══════════════════════════════════════════════════════ */
(function () {
  const cards = document.querySelectorAll('.build-radar-card[data-wip]');
  const panels = document.querySelectorAll('.wip-panel[data-wip-panel]');
  if (!cards.length || !panels.length) return;

  function show(id, scroll) {
    const panel = document.querySelector('.wip-panel[data-wip-panel="' + id + '"]');
    if (!panel) return false;
    panels.forEach(p => { p.hidden = p !== panel; });
    cards.forEach(c => {
      const on = c.dataset.wip === id;
      c.classList.toggle('on', on);
      c.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (scroll) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  cards.forEach(c => {
    c.setAttribute('role', 'tab');
    c.addEventListener('click', e => {
      e.preventDefault();
      show(c.dataset.wip, true);
      try { history.replaceState(null, '', '#wip-' + c.dataset.wip); } catch (err) { /* file:// */ }
    });
  });

  function fromHash() {
    const m = location.hash.match(/^#wip-([\w-]+)$/);
    if (m && show(m[1], false)) {
      const panel = document.getElementById('wip-' + m[1]);
      if (panel) setTimeout(() => panel.scrollIntoView({ block: 'start' }), 50);
    }
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  // Milestone states from the status snapshot.
  fetch('assets/project-status.json', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : null))
    .then(payload => {
      if (!payload || !payload.projects) return;
      panels.forEach(panel => {
        const item = payload.projects[panel.dataset.repo];
        const steps = panel.querySelectorAll('.wip-roadmap li[data-milestone]');
        if (!item || !steps.length) return;
        const done = new Set(item.completedMilestones || []);
        let next = true;
        steps.forEach(li => {
          const state = li.querySelector('.wr-state');
          li.classList.remove('active', 'done');
          if (done.has(li.dataset.milestone)) {
            li.classList.add('done'); state.textContent = 'DONE';
          } else if (next) {
            li.classList.add('active'); state.textContent = 'IN PROGRESS'; next = false;
          } else {
            state.textContent = 'PLANNED';
          }
        });
      });
    })
    .catch(() => { /* the plan still reads without states */ });
})();

/* Graph vs hybrid chart: click (or Enter) on a result opens why it came out that way. */
(function () {
  document.querySelectorAll('.cmp-row[role=button]').forEach(row => {
    const why = row.querySelector('.cmp-why');
    if (!why) return;
    const toggle = () => {
      const open = row.getAttribute('aria-expanded') !== 'true';
      row.setAttribute('aria-expanded', open ? 'true' : 'false');
      why.hidden = !open;
    };
    row.addEventListener('click', e => { if (!e.target.closest('a')) toggle(); });
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
})();
