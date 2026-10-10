/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — TIME
   Timeline era filtering only.
   All events are pre-rendered in HTML.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'time') return;

  const { $$ } = window.Bandwar;

  const filters = $$('.time-filter');
  const eras = $$('.era');

  if (!filters.length || !eras.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedEra = btn.dataset.era;

      // Update active chip
      filters.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      // Filter eras
      let visibleEvents = 0;
      eras.forEach(section => {
        const show = !selectedEra || section.dataset.era === selectedEra;
        section.hidden = !show;
        if (show) {
          visibleEvents += section.querySelectorAll('.era-event').length;
        }
      });

      // Smooth scroll to first visible era
      if (selectedEra) {
        const first = document.querySelector('.era:not([hidden])');
        if (first) {
          setTimeout(() => {
            first.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }
      }
    });
  });

})();