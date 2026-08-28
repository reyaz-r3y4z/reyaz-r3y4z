/* ═══════════════════════════════════════════
   Mohammad Reyaz — Portfolio · script.js
═══════════════════════════════════════════ */

/* year */
document.getElementById('yr').textContent = new Date().getFullYear();

/* ── NAV active tab ── */
const navTabs = document.querySelectorAll('.tb-tabs .tab');
const allSections = document.querySelectorAll('section[id]');
function updateActiveTab() {
  const y = window.scrollY + 80;
  let current = 'hero';
  allSections.forEach(s => {
    if (y >= s.offsetTop) current = s.id;
  });
  navTabs.forEach(t => t.classList.toggle('active', t.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', updateActiveTab, { passive: true });
updateActiveTab(); // set correct tab on page load

/* ── Burger ── */
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

/* ── Scroll reveal ── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach((el, _, arr) => {
  const siblings = Array.from(el.parentElement.querySelectorAll('.reveal'));
  el.style.transitionDelay = (siblings.indexOf(el) * 0.1) + 's';
  io.observe(el);
});

/* ── Flip cards ── */
document.querySelectorAll('.flip-card').forEach(card => {
  let flipped = false;
  const toggle = () => { flipped = !flipped; card.classList.toggle('flipped', flipped); };
  card.addEventListener('click', toggle);
  card.querySelectorAll('.fc-hint').forEach(h => h.addEventListener('click', e => { e.stopPropagation(); toggle(); }));
  card.addEventListener('touchstart', () => {}, { passive: true });
});

/* ── Line numbers ── */
(function() {
  const code = document.getElementById('codeEditor');
  const nums = document.getElementById('lineNums');
  if (!code || !nums) return;
  const lines = code.textContent.split('\n').length;
  nums.innerHTML = Array.from({ length: lines }, (_, i) => '<div>' + (i + 1) + '</div>').join('');
})();

/* ── Particle background ── */
(function() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;
  const COLS = ['rgba(0,255,148,', 'rgba(14,165,233,', 'rgba(124,58,237,'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.5 + .5,
      col: COLS[Math.floor(Math.random() * COLS.length)]
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) {
          ctx.strokeStyle = pts[i].col + (.05 * (1 - d / 140)) + ')';
          ctx.lineWidth = .6;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
    }
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = p.col + '.6)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize(); draw();
})();

/* ── Terminal boot animation: reveal every line in sequence, like a real boot log ── */
(function() {
  const lines = document.querySelectorAll('.term-body > .tl');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transition = 'opacity .25s ease';
    setTimeout(() => { line.style.opacity = '1'; }, 200 + i * 220);
  });
})();

/* ── PROJECT SIDEBAR + MATRIX RAIN ── */
(function() {
  const tabs    = document.querySelectorAll('.proj-tab');
  const panels  = document.querySelectorAll('.proj-panel');
  const stage   = document.getElementById('matrixStage');
  const canvas  = document.getElementById('matrixCanvas');
  const label   = document.getElementById('matrixLabel');
  const edTabs  = document.getElementById('projEditorTabs');
  if (!tabs.length || !canvas) return;

  const ctx = canvas.getContext('2d');
  let rafId = null, drops = [];

  const cfg = {
    trainstop: {
      label: '> trainstop.py', file: 'trainstop.py',
      chars: 'YOLOv8RF-DETRByteTrackBoT-SORTRTMPoseOpenCVCVATPython0195mAP',
      color: '#00FF94', glow: 'rgba(0,255,148,', icon: '🏀'
    },
    entailment: {
      label: '> visual_entailment.py', file: 'visual_entailment.py',
      chars: 'EfficientNetB4BERTUSETensorFlowKerasSageMakerentailneutral01',
      color: '#A78BFA', glow: 'rgba(167,139,250,', icon: '🧠'
    },
    forecast: {
      label: '> forecasting.py', file: 'forecasting.py',
      chars: 'XGBoostSARIMAADFlag1lag3lag12saleserosion24mopatent01',
      color: '#0EA5E9', glow: 'rgba(14,165,233,', icon: '💊'
    },
    gptscratch: {
      label: '> gpt_from_scratch.py', file: 'gpt_from_scratch.py',
      chars: 'GPT2TransformerAttentionTokenEmbeddingLossAdamWCosineWarmup01',
      color: '#FF6B35', glow: 'rgba(255,107,53,', icon: '🤖'
    },
    mlnotes: {
      label: '> all_about_ml.md', file: 'all_about_ml.md',
      chars: 'BackpropGradientDescentCNNRNNTransformerAdamSGDLossFunction01',
      color: '#FBBF24', glow: 'rgba(251,191,36,', icon: '📚'
    },
    bigquery: {
      label: '> taxi_fare_bqml.sql', file: 'taxi_fare_bqml.sql',
      chars: 'BigQueryMLSQLTaxiFareRMSELinearRegressionFeatureEngineering01',
      color: '#4285F4', glow: 'rgba(66,133,244,', icon: '📊'
    },
    dataflow: {
      label: '> dataflow_lab.py', file: 'dataflow_lab.py',
      chars: 'DataflowApacheBeamPythonPubSubBigQueryWindowWatermark01',
      color: '#57E3D1', glow: 'rgba(87,227,209,', icon: '🌊'
    },
    financial10k: {
      label: '> financial_analyser.py', file: 'financial_analyser.py',
      chars: 'SEC10KAppleMicrosoftTeslaRevenueNetIncomeAssetsCashFlowMiniLM01',
      color: '#F472B6', glow: 'rgba(244,114,182,', icon: '💹'
    }
  };

  function startMatrix(proj) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    const c = cfg[proj]; if (!c) return;
    const W = canvas.width  = stage.offsetWidth  || 800;
    const H = canvas.height = stage.offsetHeight || 180;
    const FS = 13, COLS = Math.floor(W / FS);
    drops = Array.from({ length: COLS }, () => Math.random() * -30);
    const chars = c.chars.split('');

    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = FS + 'px JetBrains Mono, monospace';
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        if (Math.random() > 0.93) { ctx.fillStyle = '#fff'; ctx.shadowColor = c.color; ctx.shadowBlur = 8; }
        else { ctx.fillStyle = c.glow + (.15 + Math.random() * .6) + ')'; ctx.shadowBlur = 0; }
        ctx.fillText(ch, i * FS, y * FS);
        ctx.shadowBlur = 0;
        if (y * FS > H && Math.random() > .975) drops[i] = 0;
        drops[i] += 0.65;
      });
      rafId = requestAnimationFrame(draw);
    }
    draw();
    label.textContent = c.label;
    label.style.color = c.color;
    label.style.textShadow = '0 0 18px ' + c.glow + '.8), 0 0 50px ' + c.glow + '.3)';
    setTimeout(() => label.classList.add('show'), 100);
  }

  function stopMatrix() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    label.classList.remove('show');
  }

  function setEditorTab(proj) {
    if (!edTabs) return;
    const c = cfg[proj];
    edTabs.innerHTML = '<div class="pet active">' + c.icon + ' ' + c.file + ' <span class="pet-x">×</span></div>';
    edTabs.querySelector('.pet-x').addEventListener('click', e => { e.stopPropagation(); activate('trainstop', { scroll: true }); });
  }

  // scroll defaults to false so silent/initial setup calls never move the page —
  // only real user clicks (sidebar tabs, editor tab close) should scroll the projects panel into view
  function activate(proj, opts) {
    const scroll = !!(opts && opts.scroll);
    tabs.forEach(t => t.classList.toggle('active', t.dataset.proj === proj));
    panels.forEach(p => p.classList.toggle('active', p.dataset.proj === proj));
    if (cfg[proj]) { stage.classList.add('visible'); startMatrix(proj); }
    else { stage.classList.remove('visible'); stopMatrix(); }
    setEditorTab(proj);
    if (scroll) {
      const active = document.querySelector('.proj-panel[data-proj="' + proj + '"]');
      if (active) setTimeout(() => active.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.proj, { scroll: true })));
  window.addEventListener('resize', () => {
    if (stage.classList.contains('visible')) {
      const a = document.querySelector('.psb-file.active');
      if (a && cfg[a.dataset.proj]) startMatrix(a.dataset.proj);
    }
  }, { passive: true });

  // silent initial setup only — no scroll, so the page always loads on the hero section
  activate('trainstop');
})();
 
/* ── Badge hover glow ── */
document.querySelectorAll('.bw-b img').forEach(img => {
  img.addEventListener('mouseenter', () => img.style.filter = 'brightness(1.25) drop-shadow(0 0 6px rgba(0,255,148,.3))');
  img.addEventListener('mouseleave', () => img.style.filter = '');
});

console.log('%c MohammadReyaz.portfolio() ✓', 'color:#00FF94;font-family:monospace;font-size:13px');
