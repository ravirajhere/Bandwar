'use client';

import { useEffect, useRef } from 'react';

export default function LeafletMap({ landmarks }: { landmarks: any[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Leaflet CSS load karna
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Leaflet JS load karna
    const loadLeaflet = async () => {
      if (!(window as any).L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const L = (window as any).L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Map initialize karna
      const map = L.map(mapRef.current).setView([25.5009, 86.1606], 15);
      mapInstanceRef.current = map;

      // Satellite layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      }).addTo(map);

      // Markers lagana
      landmarks.forEach((lm) => {
        const customIcon = L.divIcon({
          className: 'marker-icon',
          html: `<div class="marker-inner">${lm.icon || '📍'}</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        L.marker([lm.lat, lm.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div class="map-popup-body">
              <h3 class="map-popup-title">${lm.name}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${lm.description || ''}</p>
              <a href="/article/${lm.article || lm.id}" class="map-popup-link">Read More →</a>
            </div>
          `);
      });
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [landmarks]);

  return <div ref={mapRef} className="place-map" style={{ width: '100%', height: '600px', zIndex: 1 }} />;
}