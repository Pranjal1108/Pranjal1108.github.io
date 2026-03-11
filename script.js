/* ═══════════════════════════════════════════
   CURSOR GLOW
   ═══════════════════════════════════════════ */
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
let mouseX = -500, mouseY = -500;
let glowX = -500, glowY = -500;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Dot tracks instantly
  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  }
});

// Smooth follow with requestAnimationFrame
// Also controls glow visibility — only shows on glass panels
function animateGlow() {
  const ease = 0.15;
  glowX += (mouseX - glowX) * ease;
  glowY += (mouseY - glowY) * ease;
  if (cursorGlow) {
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
  }

  // Check if cursor is inside a glass panel
  const el = document.elementFromPoint(mouseX, mouseY);
  if (el && el.closest('.glass-panel')) {
    document.body.classList.add('cursor-on-glass');
  } else {
    document.body.classList.remove('cursor-on-glass');
  }

  requestAnimationFrame(animateGlow);
}
animateGlow();

/* ═══════════════════════════════════════════
   PARALLAX SCROLLING
   ═══════════════════════════════════════════ */
const parallaxPanels = document.querySelectorAll('[data-speed]');

function updateParallax() {
  const scrollTop = window.scrollY;
  parallaxPanels.forEach((panel) => {
    const speed = parseFloat(panel.dataset.speed);
    const rect = panel.getBoundingClientRect();
    const panelCenter = rect.top + rect.height / 2;
    const windowCenter = window.innerHeight / 2;
    const offset = (panelCenter - windowCenter) * speed * 0.3;
    panel.style.transform = `translateY(${offset}px)`;
  });
}

window.addEventListener('scroll', () => {
  requestAnimationFrame(updateParallax);
});

/* ═══════════════════════════════════════════
   INTERSECTION OBSERVER — FADE-IN
   ═══════════════════════════════════════════ */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.glass-panel').forEach((panel) => {
  observer.observe(panel);
});

/* ═══════════════════════════════════════════
   MOBILE NAV TOGGLE
   ═══════════════════════════════════════════ */
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const icon = navToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-xmark');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    const icon = navToggle.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-xmark');
  });
});

/* ═══════════════════════════════════════════
   BACKGROUND PARTICLES
   ═══════════════════════════════════════════ */
const particlesContainer = document.getElementById('bgParticles');

function createParticle() {
  const p = document.createElement('div');
  p.classList.add('particle');
  const size = Math.random() * 4 + 1;
  p.style.width = size + 'px';
  p.style.height = size + 'px';
  p.style.left = Math.random() * 100 + '%';
  p.style.animationDuration = (Math.random() * 12 + 8) + 's';
  p.style.animationDelay = (Math.random() * 8) + 's';
  particlesContainer.appendChild(p);
}

// Create a batch of particles
for (let i = 0; i < 40; i++) {
  createParticle();
}

/* ═══════════════════════════════════════════
   NAV SCROLL EFFECT
   ═══════════════════════════════════════════ */
const nav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(10, 0, 21, 0.85)';
  } else {
    nav.style.background = 'rgba(10, 0, 21, 0.65)';
  }
});

/* ═══════════════════════════════════════════
   ACTIVE NAV HIGHLIGHT
   ═══════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        link.style.color = '#c084fc';
      } else {
        link.style.color = '';
      }
    }
  });
}

window.addEventListener('scroll', highlightNav);

/* ═══════════════════════════════════════════
   FORCE-HIDE SCROLLBAR (JS failsafe)
   ═══════════════════════════════════════════ */
(function killScrollbar() {
  const s = document.createElement('style');
  s.textContent = `
    html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; overflow: -moz-scrollbars-none !important; }
    html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; background: transparent !important; -webkit-appearance: none !important; }
  `;
  document.head.appendChild(s);
  // Also set inline styles as last resort
  document.documentElement.style.cssText += '; scrollbar-width: none !important; -ms-overflow-style: none !important;';
  document.body.style.cssText += '; scrollbar-width: none !important; -ms-overflow-style: none !important;';
})();
