/* ════════════════════════════════════
   Mohammad Reyaz · Portfolio · script.js
════════════════════════════════════ */

/* ── Year ── */
document.getElementById('yr').textContent = new Date().getFullYear();

/* ── Nav sticky ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', window.scrollY > 20);
}, { passive: true });

/* ── Burger ── */
const burger    = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileNav.classList.remove('open'));
});

/* ── Scroll reveal ── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  // stagger siblings in same parent
  const siblings = el.parentElement.querySelectorAll('.reveal');
  let idx = Array.from(siblings).indexOf(el);
  el.style.transitionDelay = (idx * 0.08) + 's';
  io.observe(el);
});

/* ── Detection canvas background ── */
(function initCanvas() {
  const canvas = document.getElementById('detCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes, boxes;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initScene();
  }

  const GREEN = 'rgba(10,255,138,';

  /* floating nodes = "keypoints" */
  function initScene() {
    nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      r: Math.random() * 1.5 + .5,
    }));
    /* static detection boxes */
    boxes = [
      { x: W*.10, y: H*.18, w: W*.18, h: H*.55, label: 'player',   conf: 0.97, col: GREEN },
      { x: W*.55, y: H*.12, w: W*.16, h: H*.48, label: 'referee',  conf: 0.91, col: 'rgba(93,164,255,' },
      { x: W*.74, y: H*.40, w: W*.10, h: H*.18, label: 'ball',     conf: 0.93, col: GREEN },
      { x: W*.32, y: H*.20, w: W*.19, h: H*.52, label: 'player',   conf: 0.95, col: GREEN },
    ];
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    /* grid lines */
    ctx.strokeStyle = 'rgba(255,255,255,.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* connection lines between close nodes */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(10,255,138,${.06 * (1 - dist/130)})`;
          ctx.lineWidth = .6;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }

    /* nodes */
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      ctx.fillStyle = GREEN + '.55)';
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    });

    /* detection boxes */
    boxes.forEach((b, idx) => {
      const pulse = .35 + .15 * Math.sin(t * .02 + idx);
      ctx.strokeStyle = b.col + pulse + ')';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.setLineDash([]);

      /* label chip */
      ctx.fillStyle = b.col + '.85)';
      ctx.fillRect(b.x, b.y - 16, 90, 16);
      ctx.fillStyle = '#04060c';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`${b.label} ${b.conf}`, b.x + 4, b.y - 4);

      /* corner ticks */
      const tl = 12;
      ctx.strokeStyle = b.col + '.9)';
      ctx.lineWidth = 1.5;
      [[b.x, b.y, 1, 1], [b.x+b.w, b.y, -1, 1], [b.x, b.y+b.h, 1, -1], [b.x+b.w, b.y+b.h, -1, -1]].forEach(([cx, cy, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(cx + sx*tl, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy*tl);
        ctx.stroke();
      });
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ── FPS counter (fake but fun) ── */
(function fpsAnim() {
  const el = document.getElementById('fpsCounter');
  if (!el) return;
  setInterval(() => {
    el.textContent = 58 + Math.floor(Math.random() * 4);
  }, 800);
})();

/* ── Progress bar animate on scroll ── */
(function animateBars() {
  const bars = document.querySelectorAll('.pb-fill');
  const barIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.style.getPropertyValue('--w') || e.target.style.cssText.match(/--w:\s*([^;]+)/)?.[1] || '0%';
        barIO.unobserve(e.target);
      }
    });
  }, { threshold: .5 });
  bars.forEach(b => { b.style.width = '0%'; barIO.observe(b); });
})();

/* ── Skill pill random accent on hover ── */
(function pillColors() {
  const accents = ['var(--green)', 'var(--blue)', '#c87eff'];
  document.querySelectorAll('.sg-pills span:not(.accent-group span)').forEach(p => {
    const c = accents[Math.floor(Math.random() * accents.length)];
    p.addEventListener('mouseenter', () => { p.style.color = c; p.style.borderColor = c; p.style.background = c.replace(')', ',.08)').replace('var(--green)', 'rgba(10,255,138,.08)').replace('var(--blue)', 'rgba(93,164,255,.08)').replace('#c87eff', 'rgba(200,126,255,.08)'); });
    p.addEventListener('mouseleave', () => { p.style.color = ''; p.style.borderColor = ''; p.style.background = ''; });
  });
})();

/* ── Active nav link ── */
(function navHighlight() {
  const secs = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 80;
    secs.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        links.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + s.id ? 'var(--green)' : '';
        });
      }
    });
  }, { passive: true });
})();
