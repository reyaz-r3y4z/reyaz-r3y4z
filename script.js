/* ═══════════════════════════════════════════════
   Mohammad Reyaz — Portfolio  •  script.js
═══════════════════════════════════════════════ */

/* ── Year ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── Custom cursor ── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.classList.add('visible');
    cursorDot.classList.add('visible');
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });
  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
  (function animateCursor() {
    curX += (mouseX - curX) * .12;
    curY += (mouseY - curY) * .12;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(animateCursor);
  })();
}

/* ── Nav scroll ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ── Mobile menu ── */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('.mm-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Typing animation ── */
const phrases = [
  'Computer Vision',
  'Deep Learning',
  'Object Detection & Tracking',
  'Time-Series Forecasting',
  'Multimodal AI',
  'Big Data Pipelines',
];
const typedEl = document.getElementById('typed');
let phraseIdx = 0, charIdx = 0, deleting = false;

function typeStep() {
  const phrase = phrases[phraseIdx];
  if (!deleting) {
    typedEl.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) {
      deleting = true;
      setTimeout(typeStep, 1800);
      return;
    }
    setTimeout(typeStep, 68);
  } else {
    typedEl.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(typeStep, 380);
      return;
    }
    setTimeout(typeStep, 36);
  }
}
typeStep();

/* ── Stagger mini cards & skill pills on reveal ── */
document.querySelectorAll('.mini-grid').forEach(grid => {
  grid.querySelectorAll('.mini-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.1) + 's';
  });
});
document.querySelectorAll('.skills-grid').forEach(grid => {
  grid.querySelectorAll('.skill-group').forEach((g, i) => {
    g.style.transitionDelay = (i * 0.07) + 's';
  });
});

/* ── Skill pill hover tint ── */
document.querySelectorAll('.skill-pills span').forEach(pill => {
  const colors = ['var(--accent)', 'var(--accent2)', 'var(--accent3)'];
  const c = colors[Math.floor(Math.random() * colors.length)];
  pill.addEventListener('mouseenter', () => {
    pill.style.setProperty('color', c);
    pill.style.setProperty('border-color', c);
  });
  pill.addEventListener('mouseleave', () => {
    pill.style.removeProperty('color');
    pill.style.removeProperty('border-color');
  });
});

/* ── Active nav link highlight on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.links a, .mm-link');
const navH      = 70;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + navH + 40;
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + sec.id
          ? 'var(--text)' : '';
      });
    }
  });
}, { passive: true });
