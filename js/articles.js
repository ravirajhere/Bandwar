/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — ARTICLES
   Article page interactivity only.
   Content is pre-rendered in HTML — this adds:
     - Reading progress (handled by core.js)
     - Smooth scroll for section anchors
     - Section navigation tracking
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'article') return;

  const { $, $$ } = window.Bandwar;

  /* ─── HIGHLIGHT CURRENT SECTION IN READING PROGRESS ─── */
  const sections = $$('.article-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));

  /* ─── KEYBOARD NAVIGATION (j/k for next/prev section) ─── */
  let currentIdx = 0;
  document.addEventListener('keydown', (e) => {
    // Only if no input is focused
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.key === 'j' || e.key === 'ArrowDown') {
      if (currentIdx < sections.length - 1) {
        currentIdx++;
        sections[currentIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      if (currentIdx > 0) {
        currentIdx--;
        sections[currentIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

})();