'use strict';
/* ============================================================
   GlobalReach Exports — script.js
   Modules:
     1. SPA Page Navigation
     2. Navbar Scroll Effect
     3. Mobile Burger Menu
     4. Scroll Reveal
     5. Animated Counters
     6. Testimonial Slider
     7. Product Filter
     8. Contact Form Validation
   ============================================================ */

/* ─────────────────────────────────────────
   1. SPA PAGE NAVIGATION
   Switches between Home / Products / Contact
   without reloading the page.
───────────────────────────────────────── */
const pages = document.querySelectorAll('.page');
const navLnks = document.querySelectorAll('.nav-lnk');

function goTo(pg) {
  if (!pg) return;

  // Hide all pages, show target
  pages.forEach((p) => p.classList.remove('active'));
  const target = document.getElementById(pg);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Sync active state on nav links
  navLnks.forEach((l) => l.classList.toggle('active', l.dataset.pg === pg));

  // Keep navbar dark on inner pages
  const nav = document.getElementById('nav');
  if (pg !== 'home') {
    nav.classList.add('scrolled');
  } else {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  // Re-run reveal for any new elements in the page
  setTimeout(revealAll, 80);

  // Trigger counters when navigating back to Home
  if (pg === 'home') setTimeout(animateCounters, 300);

  // Close mobile menu
  document.getElementById('mobMenu').classList.remove('open');
  resetBurger();
}

// Handle clicks on any element with [data-pg]
document.addEventListener('click', (e) => {
  // 🚫 Ignore clicks inside form
  if (e.target.closest('form')) return;

  const el = e.target.closest('[data-pg]');
  if (!el) return;

  e.preventDefault();
  goTo(el.dataset.pg);
});

/* ─────────────────────────────────────────
   2. NAVBAR SCROLL EFFECT
   Adds dark background after scrolling 40px.
───────────────────────────────────────── */
const nav = document.getElementById('nav');

window.addEventListener(
  'scroll',
  () => {
    const homeActive = document
      .getElementById('home')
      .classList.contains('active');
    if (homeActive) {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    } else {
      nav.classList.add('scrolled'); // always dark on inner pages
    }
  },
  { passive: true },
);

// Set correct initial state on page load
nav.classList.toggle('scrolled', window.scrollY > 40);

/* ─────────────────────────────────────────
   3. MOBILE BURGER MENU
   Toggles the mobile dropdown and animates
   the hamburger icon into an × and back.
───────────────────────────────────────── */
const burger = document.getElementById('burger');
const mobMenu = document.getElementById('mobMenu');

function resetBurger() {
  mobMenu.classList.remove('open');
  burger.querySelectorAll('span').forEach((s) => {
    s.style.transform = '';
    s.style.opacity = '';
  });
}

burger.addEventListener('click', () => {
  const isOpen = mobMenu.classList.toggle('open');
  const spans = burger.querySelectorAll('span');

  if (isOpen) {
    // Animate to × shape
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    resetBurger();
  }
});

/* ─────────────────────────────────────────
   4. SCROLL REVEAL
   Uses IntersectionObserver to fade-in
   elements with class .reveal as they
   enter the viewport.
───────────────────────────────────────── */
function revealAll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vis');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );

  document
    .querySelectorAll('.reveal:not(.vis)')
    .forEach((el) => observer.observe(el));
}

// Run once on initial load
revealAll();

/* ─────────────────────────────────────────
   5. ANIMATED COUNTERS
   Counts up the stat numbers in the hero
   section when they scroll into view.
───────────────────────────────────────── */
let counted = false;

function animateCounters() {
  if (counted) return;
  counted = true;

  document.querySelectorAll('.stat-n').forEach((el) => {
    const target = parseInt(el.dataset.t, 10);
    const duration = 1800; // ms
    const step = 16; // ~60fps
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString();
    }, step);
  });
}

// Trigger via IntersectionObserver when stats section is visible
const statsEl = document.querySelector('.hero-stats');
if (statsEl) {
  new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) animateCounters();
    },
    { threshold: 0.3 },
  ).observe(statsEl);
}

// Also trigger if home is already visible on load
if (document.getElementById('home').classList.contains('active')) {
  setTimeout(animateCounters, 600);
}

/* ─────────────────────────────────────────
   6. TESTIMONIAL SLIDER
   Auto-advances every 5s with dot navigation
   and touch swipe support.
───────────────────────────────────────── */
const tCards = document.querySelectorAll('.testi-card');
const tDots = document.querySelectorAll('.tdot');
let curT = 0;
let tTimer;

function showT(i) {
  tCards.forEach((c) => c.classList.remove('active'));
  tDots.forEach((d) => d.classList.remove('active'));
  tCards[i].classList.add('active');
  tDots[i].classList.add('active');
  curT = i;
}

function nextT() {
  showT((curT + 1) % tCards.length);
}

function startTimer() {
  tTimer = setInterval(nextT, 5000);
}

function resetTimer() {
  clearInterval(tTimer);
  startTimer();
}

// Dot navigation
tDots.forEach((d) => {
  d.addEventListener('click', () => {
    showT(parseInt(d.dataset.i, 10));
    resetTimer();
  });
});

startTimer();

// Touch swipe support
const slider = document.getElementById('testiSlider');
let touchStartX = 0;

if (slider) {
  slider.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? nextT() : showT((curT - 1 + tCards.length) % tCards.length);
      resetTimer();
    }
  });
}

/* ─────────────────────────────────────────
   7. PRODUCT FILTER
   Filters the product grid by category with
   a smooth fade + scale animation.
───────────────────────────────────────── */
const fBtns = document.querySelectorAll('.fbtn');
const pCards = document.querySelectorAll('.pc');

fBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;

    // Update active button state
    fBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    pCards.forEach((card) => {
      const match = cat === 'all' || card.dataset.cat === cat;

      if (match) {
        // Fade in
        card.classList.remove('hidden');
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        requestAnimationFrame(() => {
          setTimeout(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 20);
        });
      } else {
        // Fade out then hide
        card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.classList.add('hidden'), 260);
      }
    });
  });
});

/* ─────────────────────────────────────────
   8. CONTACT FORM VALIDATION
   Validates fields on blur / submit and
   shows inline error messages.
───────────────────────────────────────── */

(function () {
  emailjs.init('dteHKDjZx40dg811m');
})();

const cForm = document.getElementById('cForm');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFieldError(fieldId, errId, hasError) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (!field || !err) return;
  field.classList.toggle('err', hasError);
  err.classList.toggle('show', hasError);
}

function validateForm() {
  let valid = true;

  const fn = document.getElementById('fn');
  const ln = document.getElementById('ln');
  const em = document.getElementById('em');
  const cy = document.getElementById('cy');
  const int = document.getElementById('int');
  const msg = document.getElementById('msg');

  if (!fn.value.trim()) {
    setFieldError('fn', 'fnE', true);
    valid = false;
  } else setFieldError('fn', 'fnE', false);
  if (!ln.value.trim()) {
    setFieldError('ln', 'lnE', true);
    valid = false;
  } else setFieldError('ln', 'lnE', false);
  if (!isValidEmail(em.value.trim())) {
    setFieldError('em', 'emE', true);
    valid = false;
  } else setFieldError('em', 'emE', false);
  if (!cy.value.trim()) {
    setFieldError('cy', 'cyE', true);
    valid = false;
  } else setFieldError('cy', 'cyE', false);
  if (!int.value) {
    setFieldError('int', 'intE', true);
    valid = false;
  } else setFieldError('int', 'intE', false);
  if (msg.value.trim().length < 10) {
    setFieldError('msg', 'msgE', true);
    valid = false;
  } else setFieldError('msg', 'msgE', false);

  return valid;
}

// Live re-validation on blur and on correcting an error
['fn', 'ln', 'em', 'cy', 'int', 'msg'].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', validateForm);
  el.addEventListener('input', () => {
    if (el.classList.contains('err')) validateForm();
  });
});

// Form submit
if (cForm) {
  cForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate sending (replace with real fetch/AJAX in production)
    const btn = document.getElementById('subBtn');
    if (btn.disabled) return;

    const txtEl = document.getElementById('subTxt');
    const loader = document.getElementById('subLd');
    const ok = document.getElementById('fOk');

    btn.disabled = true;
    txtEl.style.display = 'none';
    loader.style.display = '';
    btn.style.opacity = '0.7';

    emailjs
      .send('service_je0u1n9', 'template_6rke3v9', {
        fn: document.getElementById('fn').value,
        ln: document.getElementById('ln').value,
        em: document.getElementById('em').value,
        ph: document.getElementById('ph').value,
        cy: document.getElementById('cy').value,
        int: document.getElementById('int').value,
        msg: document.getElementById('msg').value,
      })
      .then(() => {
        btn.style.display = 'none';
        ok.style.display = 'block';
        cForm.reset();
      })
      .catch(() => {
        alert('❌ Failed to send message');
        btn.disabled = false;
        txtEl.style.display = '';
        loader.style.display = 'none';
      });
  });
}
