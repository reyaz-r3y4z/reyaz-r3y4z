/* ═══════════════════════════════════════════════════════
   Welcome pop-up: tells a first-time visitor what the page can do
   (watch the TEAiCH video, type a project in the terminal, Research Reyaz,
   browse projects). Each tip has a button that does it for them.
   Shown once, 2.5 s after load; a "tips" button brings it back.
═══════════════════════════════════════════════════════ */
(function () {
  const KEY = 'reyaz-tour-seen';
  const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  const remember = () => { try { localStorage.setItem(KEY, '1'); } catch (e) { /* private window */ } };

  const box = document.createElement('aside');
  box.id = 'tour';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-labelledby', 'tourTitle');
  box.innerHTML = `
    <div class="tour-bar"><span class="tour-dots"><i></i><i></i><i></i></span><span>~ welcome.sh</span>
      <button class="tour-x" type="button" aria-label="Close">×</button></div>
    <div class="tour-body">
      <p class="tour-hi" id="tourTitle"><span class="tour-pr">reyaz@ml:~$</span> ./welcome</p>
      <p class="tour-lead">This page is interactive. Try one:</p>
      <button class="tour-item" type="button" data-act="video">
        <span class="tour-ic">▶</span><span><b>Watch TEAiCH in 3 minutes</b><small>my AI tutor, recorded working</small></span></button>
      <button class="tour-item" type="button" data-act="type" data-cmd="teaich">
        <span class="tour-ic">⌨</span><span><b>Type a project name in the terminal</b><small>e.g. <code>teaich</code>, <code>trainstop</code>, <code>finsight</code></small></span></button>
      <button class="tour-item" type="button" data-act="type" data-cmd="Research Reyaz">
        <span class="tour-ic">⌕</span><span><b>Type <code>Research Reyaz</code></b><small>an interview brief about me</small></span></button>
      <button class="tour-item" type="button" data-act="projects">
        <span class="tour-ic">▦</span><span><b>Browse all projects</b><small>every card has a demo button</small></span></button>
      <div class="tour-foot"><span>Esc goes back · tips stay at the bottom right</span>
        <button class="tour-ok" type="button">Got it</button></div>
    </div>`;
  document.body.appendChild(box);

  const pill = document.createElement('button');
  pill.id = 'tourPill';
  pill.type = 'button';
  pill.innerHTML = '<span>?</span> tips';
  pill.setAttribute('aria-label', 'Show tips for this page');
  document.body.appendChild(pill);

  function open() { box.classList.add('open'); pill.classList.remove('show'); }
  function close() { box.classList.remove('open'); pill.classList.add('show'); remember(); }

  // Type a command into the hero terminal, one key at a time, then Enter.
  function typeCommand(cmd) {
    const hero = document.getElementById('hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const send = key => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    send('Escape');
    let i = 0;
    const t = setInterval(() => {
      if (i < cmd.length) { send(cmd[i++]); return; }
      clearInterval(t);
      setTimeout(() => send('Enter'), 250);
    }, 90);
  }

  box.addEventListener('click', e => {
    if (e.target.closest('.tour-x, .tour-ok')) { close(); return; }
    const item = e.target.closest('.tour-item');
    if (!item) return;
    close();
    const act = item.dataset.act;
    if (act === 'video' && window.openDemo) window.openDemo('vmath', 0);
    else if (act === 'type') setTimeout(() => typeCommand(item.dataset.cmd), 400);
    else if (act === 'projects') document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  });
  pill.addEventListener('click', open);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('open')) close(); });

  // First visit: open after a moment, unless a demo link opened the viewer.
  if (seen()) { pill.classList.add('show'); return; }
  setTimeout(() => {
    const viewer = document.getElementById('demoViewer');
    if (viewer && viewer.classList.contains('open')) { pill.classList.add('show'); return; }
    open();
  }, 2500);
})();
