/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — SECTIONS
   Category browser + search on pre-rendered article cards.
   No fetch, no render — cards are already in the HTML.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'section') return;

  const { $, $$, debounce } = window.Bandwar;

  const SEARCH = $('#section-search');
  const GRID = $('#section-grid');
  const COUNT = $('#section-count');

  if (!GRID) return;

  const cards = $$('.section-card', GRID);
  const totalCount = cards.length;

  /* ─── SEARCH ─── */
  if (SEARCH) {
    const filter = debounce((query) => {
      const q = query.toLowerCase().trim();
      let visible = 0;

      cards.forEach(card => {
        const haystack = card.textContent.toLowerCase();
        const matches = !q || haystack.includes(q);
        card.style.display = matches ? '' : 'none';
        if (matches) visible++;
      });

      // Update count
      if (COUNT) {
        if (q) {
          COUNT.textContent = `${visible} of ${totalCount} article${totalCount === 1 ? '' : 's'} match "${query}"`;
        } else {
          COUNT.textContent = `${totalCount} article${totalCount === 1 ? '' : 's'}`;
        }
      }

      // Empty state
      let empty = GRID.querySelector('.section-empty');
      if (visible === 0 && !empty) {
        empty = document.createElement('div');
        empty.className = 'section-empty';
        empty.innerHTML = `<p>No articles match "<strong>${escapeHtml(query)}</strong>".</p>`;
        GRID.appendChild(empty);
      } else if (visible > 0 && empty) {
        empty.remove();
      }
    }, 200);

    SEARCH.addEventListener('input', (e) => filter(e.target.value));

    // Focus search on `/` key
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== SEARCH) {
        e.preventDefault();
        SEARCH.focus();
      }
      if (e.key === 'Escape' && document.activeElement === SEARCH) {
        SEARCH.value = '';
        filter('');
        SEARCH.blur();
      }
    });
  }

  /* ─── HELPER ─── */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();