/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — PLACES
   Map + Gallery interactivity.
   Content is pre-rendered — this adds:
     - Tab switching (map / gallery)
     - Leaflet map initialization
     - Category filtering
     - Landmark list toggling
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'place') return;

  const { $, $$, esc } = window.Bandwar;

  /* ═══════ 1. TABS ═══════ */
  const tabs = $$('.place-tab');
  const panels = $$('.place-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });

      panels.forEach(p => {
        const active = p.dataset.panel === target;
        p.classList.toggle('active', active);
        p.hidden = !active;
      });
    });
  });

  /* ═══════ 2. LEAFLET MAP ═══════ */
  const mapEl = $('#village-map');
  const dataEl = $('#landmark-data');

  if (mapEl && dataEl && window.L) {
    let data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch (err) {
      console.warn('Invalid landmark data:', err);
      return;
    }

    const map = L.map(mapEl, {
      center: [data.center.lat, data.center.lng],
      zoom: data.zoom || 16,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
      }
    ).addTo(map);

    const markers = {};

    data.landmarks.forEach(l => {
      const icon = L.divIcon({
        className: 'marker-icon',
        html: `<div class="marker-inner">${esc(l.icon)}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([l.lat, l.lng], { icon })
        .addTo(map)
        .bindPopup(renderPopup(l));

      marker._cat = l.cat;
      markers[l.id] = marker;
    });

    /* ─── FILTER MARKERS ─── */
    $$('.place-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;

        $$('.place-filter').forEach(b =>
          b.classList.toggle('active', b === btn)
        );

        Object.values(markers).forEach(m => {
          const show = !cat || m._cat === cat;
          if (show) m.addTo(map);
          else map.removeLayer(m);
        });

        // Filter landmark list too
        $$('.landmark-item').forEach(item => {
          const itemCat = item.getAttribute('data-cat');
          item.hidden = cat && itemCat !== cat;
        });
      });
    });

    /* ─── POPUP RENDERER ─── */
    function renderPopup(l) {
      return `
        <div class="map-popup">
          ${l.photo ? `
            <div class="map-popup-img">
              <img src="${esc(l.photo)}" alt="${esc(l.name)}" loading="lazy">
            </div>
          ` : ''}
          <div class="map-popup-body">
            <div class="map-popup-title">${esc(l.name)}</div>
            <a class="map-popup-link" href="/article/${esc(l.article)}">Read more →</a>
          </div>
        </div>
      `;
    }
  }

  /* ═══════ 3. GALLERY FILTER ═══════ */
  $$('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;

      $$('.gallery-filter').forEach(b =>
        b.classList.toggle('active', b === btn)
      );

      $$('.photo-item').forEach(item => {
        const itemCat = item.getAttribute('data-cat');
        item.hidden = cat && itemCat !== cat;
      });
    });
  });

})();