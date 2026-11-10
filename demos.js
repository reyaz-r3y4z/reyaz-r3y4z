/* ═══════════════════════════════════════════════════════
   Demo viewer: screenshots of each product in its working state.
   A button with data-demo="<id>" opens the viewer; so does a link to #demo-<id>.
   Add a project by adding an entry to DEMOS (images live in assets/demos/<id>/).
═══════════════════════════════════════════════════════ */
(function () {
  const DEMOS = {
    vmath: {
      title: 'V_Math_AI · TEAiCH',
      tag: 'Multi-agent AI maths tutor',
      links: [{ label: 'TEAiCH product page', href: 'https://reyaz-r3y4z.github.io/teaich/' }],
      slides: [
        { src: 'assets/demos/vmath/whiteboard.png', title: 'Pen whiteboard',
          text: 'The student writes on the right with a pen; the reader turns handwriting, figures and maths into clean digital text on the left, live.' },
        { src: 'assets/demos/vmath/lesson-step.png', title: 'Lesson mode, one step at a time',
          text: 'The teaching agent asks for one value per step and checks it instantly: confirms a right answer, gives a hint, or explains a typical mistake without giving the answer away.' },
        { src: 'assets/demos/vmath/graph-vs-hybrid.png', title: 'Graph retrieval vs hybrid RAG',
          text: 'Same model, same prompt, only the sources differ. Hybrid RAG gives up; graph retrieval brings in Exercise 4.2 Q6 and solves the problem with the quadratic formula.' },
        { src: 'assets/demos/vmath/graph-answer.png', title: 'A cited, worked answer',
          text: 'The graph-backed answer reaches the result (6 articles at ₹15 each) and cites the textbook unit it used.' },
        { src: 'assets/demos/vmath/graph-explorer.png', title: 'Knowledge graph explorer',
          text: 'Every one of the 3,151 knowledge items has an id, class, chapter, pages and typed links: 3,179 nodes and 6,124 relationships in Neo4j.' },
        { src: 'assets/demos/vmath/chapter-graph.png', title: 'A chapter as a graph',
          text: 'Figures, theorems, remarks and exercises connected by the links the book states and the 2,405 evidence-quoted links the linking agent added.' },
        { src: 'assets/demos/vmath/evaluate.png', title: 'Human evaluation built in',
          text: 'A person judges each classified item sentence by sentence. This page measured the classifier at 94.7%, with a second judge agreeing at kappa 0.92.' },
      ],
    },
    graphrag: {
      title: 'GraphRAG over Math Textbooks',
      tag: 'Predecessor of V_Math_AI',
      links: [{ label: 'Architecture page', href: 'projects/graphrag-architecture.html' }],
      slides: [
        { src: 'assets/demos/graphrag/refusal.png', title: 'Grounded, with honest refusals',
          text: 'Asked about three coins, it says the book only covers one and two, and lists the five passages it checked with their pages.' },
        { src: 'assets/demos/graphrag/doc3.png', title: 'Why a graph',
          text: 'The answer was in a document top-k search never reached. Following stored links found it: full retrieval 28% (top-5) and 44% (top-8) against 84% with the graph.' },
      ],
    },
    finsight: {
      title: 'FinSight 10-K',
      tag: 'RAG on Microsoft Fabric with LLM-judge evaluation',
      links: [],
      slides: [
        { src: 'assets/demos/finsight/answer.png', title: 'Cited answers with exact figures',
          text: 'Compares Apple and Microsoft net sales for fiscal 2025 from 369 audited-statement facts, each number linked to its source.' },
        { src: 'assets/demos/finsight/home.png', title: 'Running inside Microsoft Fabric',
          text: 'Ask, Ingestion, Evaluation and Architecture views, behind Entra ID sign-in, with retrieval settings per question.' },
        { src: 'assets/demos/finsight/history.png', title: 'Every question logged',
          text: 'Questions and latencies are stored in Fabric SQL; evaluation runs are stored too, so a drop of 5 points or more is flagged as a regression.' },
      ],
    },
    trainstop: {
      title: 'Basketball Player & Ball Tracking',
      tag: 'Trainstop / Superstat · 95% mAP@50',
      links: [],
      slides: [
        { video: 'assets/Basketball-demo.mp4', title: 'Detection and identity tracking on match footage',
          text: 'Players, referees, ball and hoop detected with YOLOv8 and RF-DETR, then tracked with ByteTrack and BoT-SORT through occlusion and fast motion.' },
      ],
    },
    healthcare: {
      title: 'PT Zero · Care Navigation',
      tag: 'Seven agents behind a deterministic safety gate',
      live: 'https://pt-zero-care-navigation.onrender.com',
      links: [{ label: 'Code on GitHub', href: 'https://github.com/reyaz-r3y4z/pt-zero-care-navigation' }],
      slides: [],
    },
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const box = document.createElement('div');
  box.id = 'demoViewer';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Project demo');
  box.innerHTML = `
    <div class="dv-panel">
      <div class="dv-hd">
        <span class="pd r"></span><span class="pd y"></span><span class="pd g"></span>
        <div class="dv-titles"><strong class="dv-title"></strong><span class="dv-tag"></span></div>
        <span class="dv-count"></span>
        <button class="dv-close" type="button" aria-label="Close demo">✕</button>
      </div>
      <div class="dv-stage">
        <button class="dv-nav prev" type="button" aria-label="Previous">‹</button>
        <div class="dv-media"></div>
        <button class="dv-nav next" type="button" aria-label="Next">›</button>
      </div>
      <div class="dv-caption"><strong class="dv-stitle"></strong><p class="dv-text"></p></div>
      <div class="dv-thumbs"></div>
      <div class="dv-links"></div>
    </div>`;
  document.body.appendChild(box);

  const $ = sel => box.querySelector(sel);
  let current = null, index = 0;

  function render() {
    const d = DEMOS[current], s = d.slides[index];
    $('.dv-count').textContent = d.slides.length ? `${index + 1} / ${d.slides.length}` : '';
    if (!s) {
      $('.dv-media').innerHTML = `<div class="dv-live"><span class="dv-live-dot"></span><p>This one is deployed. Open the live app with a fictional demo account; the free host may take about 30 seconds to wake up.</p><a class="btn-g" href="${esc(d.live)}" target="_blank" rel="noopener">Open live demo ↗</a></div>`;
      $('.dv-stitle').textContent = 'Live deployment';
      $('.dv-text').textContent = 'Synthetic data only. A 250-case benchmark showed 100% routing accuracy and 100% emergency-stop recall.';
    } else {
      $('.dv-media').innerHTML = s.video
        ? `<video controls playsinline autoplay muted src="${esc(s.video)}"></video>`
        : `<img src="${esc(s.src)}" alt="${esc(s.title)}">`;
      $('.dv-stitle').textContent = s.title;
      $('.dv-text').textContent = s.text;
    }
    box.querySelectorAll('.dv-thumb').forEach((t, i) => t.classList.toggle('on', i === index));
    const many = d.slides.length > 1;
    box.querySelectorAll('.dv-nav').forEach(b => { b.hidden = !many; });
  }

  function open(id, at) {
    const d = DEMOS[id];
    if (!d) return;
    current = id; index = at || 0;
    $('.dv-title').textContent = d.title;
    $('.dv-tag').textContent = d.tag;
    $('.dv-thumbs').innerHTML = d.slides.length > 1 ? d.slides.map((s, i) =>
      `<button class="dv-thumb" type="button" data-i="${i}" aria-label="${esc(s.title)}"><img src="${esc(s.src)}" alt="" loading="lazy"></button>`).join('') : '';
    const links = [...(d.live && d.slides.length ? [{ label: 'Live app', href: d.live }] : []), ...d.links];
    $('.dv-links').innerHTML = links.map(l => `<a class="btn-ghost" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('');
    render();
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (location.hash !== '#demo-' + id) history.replaceState(null, '', '#demo-' + id);
    $('.dv-close').focus();
  }

  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    const v = box.querySelector('video'); if (v) v.pause();
    $('.dv-media').innerHTML = '';
    if (location.hash.startsWith('#demo-')) history.replaceState(null, '', '#projects');
    current = null;
  }

  function step(n) {
    const len = DEMOS[current].slides.length;
    if (len < 2) return;
    index = (index + n + len) % len;
    render();
  }

  $('.dv-close').addEventListener('click', close);
  $('.prev').addEventListener('click', () => step(-1));
  $('.next').addEventListener('click', () => step(1));
  $('.dv-thumbs').addEventListener('click', e => {
    const t = e.target.closest('.dv-thumb'); if (!t) return;
    index = +t.dataset.i; render();
  });
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => {
    if (!current) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
  let x0 = null;
  $('.dv-stage').addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  $('.dv-stage').addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  });

  // Buttons and thumbnails on the page: data-demo="<id>" [data-slide="<n>"].
  document.querySelectorAll('[data-demo]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      open(el.dataset.demo, +(el.dataset.slide || 0));
    });
  });

  // Shareable links: #demo-vmath opens that demo (and selects its project tab).
  function fromHash() {
    const m = location.hash.match(/^#demo-([\w-]+)$/);
    if (!m || !DEMOS[m[1]]) return;
    const tab = document.querySelector(`.proj-tab[data-proj="${m[1]}"]`);
    if (tab) tab.click();
    open(m[1]);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
  window.openDemo = open;
})();
