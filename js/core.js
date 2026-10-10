/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — CORE
   Navbar · Footer · Theme · PWA · Scroll behaviours · Utilities
   Load on every page · Loaded before page-specific scripts
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════ 1. UTILITIES ═══════ */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const esc = (s) => s == null ? '' : String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const debounce = (fn, wait = 100) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
  };

  const Store = {
    get(k, fallback = null) {
      try {
        const v = localStorage.getItem(k);
        return v === null ? fallback : JSON.parse(v);
      } catch { return fallback; }
    },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    remove(k) { try { localStorage.removeItem(k); } catch {} }
  };

  /* ═══════ 2. THEME ═══════ */
  const Theme = {
    init() {
      const saved = Store.get('bandwar-theme');
      if (saved !== null && saved !== undefined) {
        document.documentElement.dataset.theme = saved || '';
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.dataset.theme = 'dark';
      }
    },
    toggle() {
      const cur = document.documentElement.dataset.theme;
      const next = cur === 'dark' ? '' : 'dark';
      document.documentElement.dataset.theme = next;
      Store.set('bandwar-theme', next);
      Toast.show(next ? '🌙 Dark mode' : '☀️ Light mode');
    }
  };

  /* ═══════ 3. MOBILE MENU ═══════ */
  const MobileMenu = {
    init() {
      this.toggle = $('#navToggle');
      this.menu = $('#navMenu');
      if (!this.toggle || !this.menu) return;

      this.toggle.addEventListener('click', () => this.toggleMenu());

      $$('a', this.menu).forEach(l =>
        l.addEventListener('click', () => this.close())
      );

      document.addEventListener('click', (e) => {
        if (!this.menu.classList.contains('active')) return;
        if (this.menu.contains(e.target) || this.toggle.contains(e.target)) return;
        this.close();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });

      window.addEventListener('resize', debounce(() => {
        if (window.innerWidth >= 900) this.close();
      }, 150));
    },
    toggleMenu() {
      const open = this.menu.classList.toggle('active');
      this.toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    },
    close() {
      if (!this.menu) return;
      this.menu.classList.remove('active');
      this.toggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  /* ═══════ 4. THEME TOGGLE BUTTON ═══════ */
  const ThemeButton = {
    init() {
      const btn = $('#themeToggle');
      if (!btn) return;
      btn.addEventListener('click', () => Theme.toggle());
    }
  };

  /* ═══════ 5. STICKY NAV ═══════ */
  const StickyNav = {
    init() {
      this.nav = $('.navbar');
      if (!this.nav) return;
      const onScroll = () => this.nav.classList.toggle('scrolled', window.scrollY > 20);
      window.addEventListener('scroll', debounce(onScroll, 10), { passive: true });
      onScroll();
    }
  };

  /* ═══════ 6. SMOOTH SCROLL ═══════ */
  const SmoothScroll = {
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    }
  };

  /* ═══════ 7. SCROLL REVEAL ═══════ */
  const Reveal = {
    init() {
      const els = $$('.reveal:not(.visible)');
      if (!els.length) return;

      if (!('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('visible'));
        return;
      }

      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('visible');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      els.forEach(el => io.observe(el));
    }
  };

  /* ═══════ 8. READING PROGRESS ═══════ */
  const ReadingProgress = {
    init() {
      if (!document.body.hasAttribute('data-page')) return;
      const page = document.body.getAttribute('data-page');
      if (page !== 'article' && !$('[data-reading-progress]')) return;

      const bar = document.createElement('div');
      bar.className = 'reading-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);

      const update = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      };
      window.addEventListener('scroll', update, { passive: true });
      update();
    }
  };

  /* ═══════ 9. SCROLL TOP ═══════ */
  const ScrollTop = {
    init() {
      const btn = $('#scrollTop');
      if (!btn) return;
      btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      const toggle = () => btn.classList.toggle('visible', window.scrollY > 500);
      window.addEventListener('scroll', debounce(toggle, 100), { passive: true });
      toggle();
    }
  };

  /* ═══════ 10. LIGHTBOX ═══════ */
  const Lightbox = {
    init() {
      document.addEventListener('click', (e) => {
        const img = e.target.closest('[data-lightbox]');
        if (!img) return;
        const src = img.dataset.lightbox || img.src;
        const alt = img.alt || '';
        if (!src) return;
        e.preventDefault();
        this.open(src, alt);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });
    },
    open(src, alt = '') {
      this.close();
      const box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Image viewer');
      box.innerHTML = `
        <button class="lightbox-close" aria-label="Close viewer" type="button">✕</button>
        <img src="${esc(src)}" alt="${esc(alt)}">
      `;
      box.addEventListener('click', (e) => {
        if (e.target === box || e.target.classList.contains('lightbox-close')) {
          this.close();
        }
      });
      document.body.appendChild(box);
      this.current = box;
    },
    close() {
      if (this.current) {
        this.current.remove();
        this.current = null;
      }
    }
  };

  /* ═══════ 11. TOAST ═══════ */
  const Toast = {
    show(message, duration = 2200) {
      document.querySelectorAll('.toast').forEach(el => el.remove());
      const el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.textContent = message;
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('visible'));
      setTimeout(() => {
        el.classList.remove('visible');
        setTimeout(() => el.remove(), 400);
      }, duration);
    }
  };

  /* ═══════ 12. PWA ═══════ */
  const PWA = {
    init() {
      if (!('serviceWorker' in navigator)) return;
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .catch(err => console.warn('SW registration failed:', err));
      });
    }
  };

  /* ═══════ 13. INIT ═══════ */
  function boot() {
    Theme.init();
    ThemeButton.init();
    MobileMenu.init();
    StickyNav.init();
    SmoothScroll.init();
    ReadingProgress.init();
    ScrollTop.init();
    Lightbox.init();
    Reveal.init();
    PWA.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose for other scripts
  window.Bandwar = { $, $$, esc, debounce, Store, Toast, Theme };

})();