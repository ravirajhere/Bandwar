/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — VISION
   Before/after slider interactivity.
   All content is pre-rendered in HTML.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'vision') return;

  const { $$ } = window.Bandwar;

  $$('[data-ba-slider]').forEach(slider => {
    const after = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;

    let dragging = false;

    const setPosition = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = `${pct}%`;
    };

    /* ─── POINTER EVENTS ─── */
    slider.addEventListener('pointerdown', (e) => {
      dragging = true;
      slider.setPointerCapture(e.pointerId);
      setPosition(e.clientX);
    });

    slider.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setPosition(e.clientX);
    });

    slider.addEventListener('pointerup', () => { dragging = false; });
    slider.addEventListener('pointercancel', () => { dragging = false; });

    /* ─── KEYBOARD ACCESSIBILITY ─── */
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', '50');

    slider.addEventListener('keydown', (e) => {
      const currentPct = parseFloat(handle.style.left) || 50;
      const step = 5;
      let next = currentPct;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        next = Math.max(0, currentPct - step);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next = Math.min(100, currentPct + step);
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        next = 100;
      } else {
        return;
      }

      after.style.clipPath = `inset(0 0 0 ${next}%)`;
      handle.style.left = `${next}%`;
      slider.setAttribute('aria-valuenow', String(Math.round(next)));
    });

    /* ─── INIT ─── */
    setPosition(slider.getBoundingClientRect().left + slider.getBoundingClientRect().width / 2);
  });

})();