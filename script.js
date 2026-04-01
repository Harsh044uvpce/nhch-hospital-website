/**
 * NEW HEALTH CITY HOSPITAL — script.js
 * Production-ready, vanilla JavaScript (ES6+)
 * No external libraries or frameworks.
 * Covers: Sticky Header, Hero Slider, Mobile Nav,
 *          Stats Counter (Intersection Observer), Scroll-To-Top,
 *          Scroll Reveal, Active Nav Link, and Year Injection.
 *
 * Author: Senior Front-End Developer
 */

/* =========================================================
   UTILITY HELPERS
========================================================= */

/**
 * Shorthand querySelector
 * @param {string} selector - CSS selector
 * @param {Element} [scope=document] - Search scope
 * @returns {Element|null}
 */
const $ = (selector, scope = document) => scope.querySelector(selector);

/**
 * Shorthand querySelectorAll
 * @param {string} selector - CSS selector
 * @param {Element} [scope=document] - Search scope
 * @returns {NodeListOf<Element>}
 */
const $$ = (selector, scope = document) => scope.querySelectorAll(selector);

/**
 * Easing function for counter animation (ease-out cubic)
 * @param {number} t - progress 0→1
 * @returns {number}
 */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);


/* =========================================================
   1. CURRENT YEAR — inject into footer copyright
========================================================= */
(function injectYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


/* =========================================================
   2. STICKY HEADER — add class on scroll
========================================================= */
(function stickyHeader() {
  const header = $('#main-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is pre-scrolled
})();


/* =========================================================
   3. MOBILE NAV — hamburger toggle
========================================================= */
(function mobileNav() {
  const btn  = $('#hamburger-btn');
  const nav  = $('#main-nav');
  const body = document.body;

  if (!btn || !nav) return;

  // Toggle open/close
  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    nav.classList.toggle('is-open', isOpen);
    // Prevent body scroll while menu is open
    body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when a nav link is clicked
  $$('.nav__link', nav).forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      body.style.overflow = '';
    });
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      body.style.overflow = '';
      btn.focus();
    }
  });
})();


/* =========================================================
   4. ACTIVE NAV LINK — highlight on scroll using
      IntersectionObserver on each section
========================================================= */
(function activeNavLink() {
  const navLinks = $$('.nav__link');
  const sections = $$('section[id], div[id]');

  if (!navLinks.length || !sections.length) return;

  // Map section IDs to their corresponding nav anchor's href
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === id);
          });
        }
      });
    },
    {
      root: null,
      // Trigger when section is 40% into the viewport
      threshold: 0.40,
    }
  );

  sections.forEach(section => observer.observe(section));
})();


/* =========================================================
   5. HERO IMAGE SLIDER
========================================================= */
(function heroSlider() {
  const slider      = $('#hero-slider');
  const prevBtn     = $('#slider-prev');
  const nextBtn     = $('#slider-next');
  const dotsWrapper = $('#hero-dots');

  if (!slider) return;

  const slides    = $$('.hero__slide',  slider);
  const dots      = $$('.hero__dot',    dotsWrapper);
  const total     = slides.length;
  let   current   = 0;
  let   autoTimer = null;

  /** Show a specific slide by index */
  function goTo(index) {
    // Wrap around
    index = ((index % total) + total) % total;

    // Deactivate current
    slides[current].classList.remove('hero__slide--active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('hero__dot--active');
    dots[current].setAttribute('aria-selected', 'false');

    // Activate new
    current = index;
    slides[current].classList.add('hero__slide--active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('hero__dot--active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  /** Start auto-advance */
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5500);
  }

  /** Stop auto-advance (on user interaction) */
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Previous
  if (prevBtn) {
    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  }

  // Next
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  }

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  // Touch / swipe support
  let touchStartX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 48) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      resetAuto();
    }
  }, { passive: true });

  // Keyboard support on focused slider
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
    if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
  });

  // Pause on hover / focus
  slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
  slider.addEventListener('mouseleave', () => startAuto());
  slider.addEventListener('focusin',    () => clearInterval(autoTimer));
  slider.addEventListener('focusout',   () => startAuto());

  // Pause when tab / page is not visible (performance)
  document.addEventListener('visibilitychange', () => {
    document.hidden ? clearInterval(autoTimer) : startAuto();
  });

  // Start
  startAuto();
})();


/* =========================================================
   6. STATISTICS COUNTER
      Uses IntersectionObserver to trigger only when visible
========================================================= */
(function statsCounter() {
  const statNums   = $$('.stat-item__num[data-target]');
  if (!statNums.length) return;

  /**
   * Animate a single element from 0 to its data-target
   * @param {Element} el - The number element
   */
  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2200; // ms — adjust to taste
    const start    = performance.now();

    // Mark as animated so we don't re-run
    el.dataset.animated = 'true';

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const current  = Math.round(eased * target);

      el.textContent = current.toLocaleString('en-IN'); // Indian comma format

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Ensure final exact value
        el.textContent = target.toLocaleString('en-IN');
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          animateCount(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.50, // start when 50% of element visible
    }
  );

  statNums.forEach(el => observer.observe(el));
})();


/* =========================================================
   7. SCROLL REVEAL — animate elements into view
========================================================= */
(function scrollReveal() {
  // Add .reveal class to elements we want to animate
  const targets = [
    '.doctor-card',
    '.service-card',
    '.testimonial-card',
    '.about-feature',
    '.quick-card',
    '.section-header',
    '.about-banner__visual',
    '.about-banner__content',
    '.contact-banner__item',
    '.stat-item',
  ];

  // Add .reveal class to all matching elements
  targets.forEach(selector => {
    $$(selector).forEach(el => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Stop observing after reveal (one-time animation)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.12,       // trigger when 12% is visible
      rootMargin: '0px 0px -40px 0px', // slight bottom offset
    }
  );

  $$('.reveal').forEach(el => observer.observe(el));
})();


/* =========================================================
   8. SCROLL-TO-TOP BUTTON
========================================================= */
(function scrollToTop() {
  const btn = $('#scroll-top-btn');
  if (!btn) return;

  // Show/hide based on scroll position
  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      btn.removeAttribute('hidden');
    } else {
      btn.setAttribute('hidden', '');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });

  // Smooth scroll back to top
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Return focus to top of page for accessibility
    $('body').setAttribute('tabindex', '-1');
    $('body').focus();
    $('body').removeAttribute('tabindex');
  });

  toggleVisibility(); // run on load
})();


/* =========================================================
   9. SMOOTH SCROLL — for all internal anchor links
========================================================= */
(function smoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      if (href === '#') return; // Skip empty anchors

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      // Account for sticky header height
      const headerH = $('#main-header')?.offsetHeight || 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 10;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Update URL without jumping
      history.pushState(null, '', href);
    });
  });
})();


/* =========================================================
   10. DOCTOR CARD — subtle parallax on mouse move
       (desktop only, uses requestAnimationFrame for perf)
========================================================= */
(function cardTilt() {
  // Only run on pointer devices (not touch)
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = $$('.doctor-card');

  cards.forEach(card => {
    let rafId;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const intensity = 6; // max degrees of rotation

    const onMove = (e) => {
      const rect   = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top  + rect.height / 2;
      // Normalise to -1 → 1
      targetX = -((e.clientY - centerY) / (rect.height / 2)) * intensity;
      targetY =  ((e.clientX - centerX) / (rect.width  / 2)) * intensity;
    };

    const animate = () => {
      // Lerp for smooth feel
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      card.style.transform = `perspective(800px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateY(-6px)`;
      rafId = requestAnimationFrame(animate);
    };

    card.addEventListener('mouseenter', () => {
      rafId = requestAnimationFrame(animate);
    });

    card.addEventListener('mousemove', onMove);

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId);
      targetX = 0; targetY = 0; currentX = 0; currentY = 0;
      card.style.transform = '';
    });
  });
})();


/* =========================================================
   11. SERVICE CARD — ripple click effect
========================================================= */
(function rippleEffect() {
  $$('.service-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Remove any existing ripple
      const old = card.querySelector('.ripple');
      if (old) old.remove();

      const ripple = document.createElement('span');
      const rect   = card.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';

      // Inject minimal inline style (kept out of CSS file intentionally
      // to keep CSS clean — this is purely JS-driven)
      Object.assign(ripple.style, {
        position:       'absolute',
        width:          size + 'px',
        height:         size + 'px',
        left:           (e.clientX - rect.left - size / 2) + 'px',
        top:            (e.clientY - rect.top  - size / 2) + 'px',
        borderRadius:   '50%',
        background:     'rgba(69,179,157,0.18)',
        transform:      'scale(0)',
        pointerEvents:  'none',
        animation:      'rippleAnim 0.55s ease-out forwards',
      });

      // Inject keyframes once
      if (!$('#ripple-keyframes')) {
        const style = document.createElement('style');
        style.id = 'ripple-keyframes';
        style.textContent = `@keyframes rippleAnim { to { transform: scale(2.4); opacity: 0; } }`;
        document.head.appendChild(style);
      }

      // Ensure card has position for ripple to be contained
      card.style.position   = 'relative';
      card.style.overflow   = 'hidden';

      card.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();


/* =========================================================
   12. LAZY LOAD IMAGES — native loading="lazy" fallback
       for older browsers via IntersectionObserver
========================================================= */
(function lazyImages() {
  // Modern browsers support native loading="lazy" — this is a fallback
  if ('loading' in HTMLImageElement.prototype) return;

  const images = $$('img[loading="lazy"]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.removeAttribute('loading');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => observer.observe(img));
})();


/* =========================================================
   13. CONSOLE BRANDING — friendly dev message
========================================================= */
console.log(
  '%c🏥 New Health City Hospital %c| Frontend by Senior Dev ',
  'color:#45b39d;font-weight:bold;font-size:14px;',
  'color:#677a78;font-size:12px;'
);