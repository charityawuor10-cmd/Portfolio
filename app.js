/**
 *CHARITY AWUOR — DEVELOPER PORTFOLIO
 * app.js — All interactive behaviour
 *
 * Sections:
 *  1. Loader
 *  2. Custom cursor
 *  3. Navigation (scroll, active link, burger)
 *  4. Theme toggle (dark / light)
 *  5. Hero terminal typewriter
 *  6. Scroll reveal (IntersectionObserver)
 *  7. Skill bars animation
 *  8. Project filter tabs
 *  9. Contact form (validation + simulated send)
 * 10. Back-to-top button
 * 11. Smooth scroll for all anchor links
 */

'use strict';

/* =============================================
   UTILITY HELPERS
   ============================================= */

/** Select one element */
const qs  = (sel, scope = document) => scope.querySelector(sel);
/** Select many elements */
const qsa = (sel, scope = document) => [...scope.querySelectorAll(sel)];
/** Add event listener with optional cleanup */
const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);


/* =============================================
   1. LOADER
   ============================================= */
(function initLoader() {
  const loader  = qs('#loader');
  const fill    = qs('#loaderFill');
  const pct     = qs('#loaderPct');
  const loaderText = qs('#loaderText');

  if (!loader) return;

  const messages = [
    '> initializing...',
    '> loading assets...',
    '> building UI...',
    '> almost ready...',
  ];

  let progress   = 0;
  let msgIndex   = 0;
  const duration = 1800; // ms
  const interval = 30;   // ms per tick

  const timer = setInterval(() => {
    progress += (100 / (duration / interval)) * (0.8 + Math.random() * 0.5);
    if (progress >= 100) progress = 100;

    fill.style.width   = progress + '%';
    if (pct) pct.textContent = Math.round(progress) + '%';

    // Cycle messages
    const nextMsgAt = (msgIndex + 1) * 25;
    if (progress >= nextMsgAt && msgIndex < messages.length - 1) {
      msgIndex++;
      if (loaderText) loaderText.textContent = messages[msgIndex];
    }

    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        loader.classList.add('hidden');
        // Trigger hero reveal
        document.body.classList.add('loaded');
        triggerHeroReveal();
      }, 300);
    }
  }, interval);
})();

function triggerHeroReveal() {
  qsa('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 100);
  });
}


/* =============================================
   2. CUSTOM CURSOR
   ============================================= */
(function initCursor() {
  const dot  = qs('#cursorDot');
  const ring = qs('#cursorRing');
  if (!dot || !ring) return;
  // Only on non-touch devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let raf;

  on(document, 'mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Expand ring on interactive elements
  const interactables = 'a, button, .proj-card, .ftab, .tc, .stag';
  on(document, 'mouseover', (e) => {
    if (e.target.closest(interactables)) {
      document.body.classList.add('cursor-expand');
    }
  });
  on(document, 'mouseout', (e) => {
    if (e.target.closest(interactables)) {
      document.body.classList.remove('cursor-expand');
    }
  });

  // Hide cursor when leaving window
  on(document, 'mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  on(document, 'mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();


/* =============================================
   3. NAVIGATION
   ============================================= */
(function initNav() {
  const header  = qs('#navHeader');
  const burger  = qs('#navBurger');
  const menu    = qs('#mobileMenu');
  const links   = qsa('.nav-link, .mobile-link');
  const sections = qsa('section[id]');

  // ── Scrolled state ──
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
    updateBackToTop();
  };
  on(window, 'scroll', onScroll, { passive: true });
  onScroll();

  // ── Active nav link via IntersectionObserver ──
  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) current = sec.id;
    });
    qsa('.nav-link').forEach(link => {
      const href = link.getAttribute('href')?.slice(1);
      link.classList.toggle('active', href === current);
    });
  }

  // ── Burger / mobile menu ──
  let menuOpen = false;
  function toggleMenu(force) {
    menuOpen = typeof force === 'boolean' ? force : !menuOpen;
    burger?.classList.toggle('open', menuOpen);
    menu?.classList.toggle('open', menuOpen);
    burger?.setAttribute('aria-expanded', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  on(burger, 'click', () => toggleMenu());

  // Close on mobile link click
  qsa('.mobile-link').forEach(link => {
    on(link, 'click', () => toggleMenu(false));
  });

  // Close on outside click
  on(document, 'click', (e) => {
    if (menuOpen && !header?.contains(e.target)) toggleMenu(false);
  });

  // Close on Escape
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) toggleMenu(false);
  });

  // ── Smooth scroll for all hash links ──
  qsa('a[href^="#"]').forEach(link => {
    on(link, 'click', (e) => {
      const target = qs(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = header?.offsetHeight || 64;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* =============================================
   4. THEME TOGGLE
   ============================================= */
(function initTheme() {
  const btn  = qs('#themeToggle');
  const icon = qs('#themeIcon');
  const html = document.documentElement;

  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDark = stored ? stored === 'dark' : prefersDark;

  function applyTheme() {
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (icon) icon.textContent = isDark ? '◐' : '●';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  applyTheme();
  on(btn, 'click', () => { isDark = !isDark; applyTheme(); });
})();


/* =============================================
   5. HERO TERMINAL TYPEWRITER
   ============================================= */
(function initTypewriter() {
  const el = qs('#typingText');
  if (!el) return;

  const commands = [
    'npm run build',
    'git commit -m "ship it 🚀"',
    'docker compose up -d',
    'go test ./...',
    'kubectl apply -f deploy.yaml',
  ];

  let cmdIndex  = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeout;

  function type() {
    const cmd     = commands[cmdIndex];
    const current = isDeleting
      ? cmd.slice(0, charIndex - 1)
      : cmd.slice(0, charIndex + 1);

    el.textContent = current;
    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

    let delay = isDeleting ? 60 : 90;

    if (!isDeleting && current === cmd) {
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && current === '') {
      isDeleting = false;
      cmdIndex = (cmdIndex + 1) % commands.length;
      charIndex = 0;
      delay = 400;
    }

    timeout = setTimeout(type, delay);
  }

  // Start after loader finishes
  const startDelay = document.body.classList.contains('loaded') ? 500 : 2500;
  setTimeout(type, startDelay);
})();


/* =============================================
   6. SCROLL REVEAL
   ============================================= */
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once revealed, stop observing (performance)
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  // Observe all .reveal elements not in hero (hero handled separately)
  qsa('.reveal').forEach(el => {
    if (!el.closest('.hero')) {
      observer.observe(el);
    }
  });
})();


/* =============================================
   7. SKILL BARS
   ============================================= */
(function initSkillBars() {
  const bars = qsa('.sk-fill[data-w]');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const w   = bar.getAttribute('data-w') || 0;
          bar.style.width = w + '%';
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach(bar => observer.observe(bar));
})();


/* =============================================
   8. PROJECT FILTER TABS
   ============================================= */
(function initFilter() {
  const tabs  = qsa('.ftab');
  const cards = qsa('.proj-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    on(tab, 'click', () => {
      // Update active tab
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-cat') || '';
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeIn 0.35s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


/* =============================================
   9. CONTACT FORM
   ============================================= */
(function initContactForm() {
  const form     = qs('#contactForm');
  if (!form) return;

  const submitBtn   = qs('#submitBtn', form);
  const btnLabel    = qs('.btn-label', submitBtn);
  const btnLoading  = qs('.btn-loading', submitBtn);
  const successDiv  = qs('#formSuccess');

  const fields = {
    name:    { el: qs('#name', form),    err: qs('#nameErr', form) },
    email:   { el: qs('#email', form),   err: qs('#emailErr', form) },
    subject: { el: qs('#subject', form), err: qs('#subjectErr', form) },
    message: { el: qs('#message', form), err: qs('#messageErr', form) },
  };

  // ── Validators ──
  const validators = {
    name:    v => v.trim().length < 2  ? 'Please enter your name.' : '',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.',
    subject: v => !v ? 'Please select a topic.' : '',
    message: v => v.trim().length < 10 ? 'Message must be at least 10 characters.' : '',
  };

  function validate(name) {
    const f = fields[name];
    const msg = validators[name](f.el.value);
    f.err.textContent = msg;
    f.el.style.borderColor = msg ? 'rgba(255,95,87,0.6)' : '';
    return !msg;
  }

  // Live validation on blur
  Object.keys(fields).forEach(name => {
    on(fields[name].el, 'blur',  () => validate(name));
    on(fields[name].el, 'input', () => {
      if (fields[name].err.textContent) validate(name);
    });
  });

  // ── Submit ──
  on(form, 'submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const valid = Object.keys(fields).map(validate).every(Boolean);
    if (!valid) return;

    // Loading state
    setLoading(true);

    try {
      /**
       * INTEGRATION POINT — Node.js Backend
       * ─────────────────────────────────────
       * Replace the simulated delay below with a real fetch:
       *
       * const res = await fetch('/api/contact', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify({
       *     name:    fields.name.el.value.trim(),
       *     email:   fields.email.el.value.trim(),
       *     subject: fields.subject.el.value,
       *     message: fields.message.el.value.trim(),
       *   }),
       * });
       * if (!res.ok) throw new Error('Server error');
       */

      // Simulate network request (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      setLoading(false);
      form.reset();
      if (successDiv) successDiv.classList.add('visible');
      setTimeout(() => successDiv?.classList.remove('visible'), 6000);

    } catch (err) {
      setLoading(false);
      // Show generic error
      const errEl = fields.message.err;
      if (errEl) errEl.textContent = 'Something went wrong. Please try again or email directly.';
    }
  });

  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (btnLabel)   btnLabel.style.display   = loading ? 'none'         : '';
    if (btnLoading) btnLoading.style.display  = loading ? 'inline-flex' : 'none';
  }
})();


/* =============================================
   10. BACK TO TOP
   ============================================= */
function updateBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 400);
}

(function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;
  on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* =============================================
   11. MISC: KEYBOARD ACCESSIBILITY
   ============================================= */
(function initA11y() {
  // Allow Enter/Space on project cards (they have tabindex)
  qsa('.proj-card[tabindex]').forEach(card => {
    on(card, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const link = card.querySelector('a');
        link?.click();
      }
    });
  });
})();


/* =============================================
   INITIALISATION LOG
   ============================================= */
console.log('%c[AC] Portfolio loaded ✓', 'color:#00ff9d;font-family:monospace;font-size:14px;');
console.log('%c> Built with HTML · CSS · Vanilla JS', 'color:#888;font-family:monospace;font-size:11px;');
