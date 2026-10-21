import fs from 'fs';
import path from 'path';
import dynamic from 'next/dynamic';
import master from '../../../data/master.json';

// Map ko dynamically import karna (SSR disable karke)
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '600px', background: 'var(--c-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

export const metadata = {
  title: `Places & Map | ${master.site.name}`,
  description: 'Explore Bandwar village through its landmarks and photographs.',
};

export default function PlacePage() {
  const mediaPath = path.join(process.cwd(), 'data/media.json');
  const mediaData = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
  
  const landmarks = mediaData.landmarks || [];
  const gallery = mediaData.gallery?.photos || [];

  return (
    <div className="container-wide" style={{ paddingBottom: '4rem' }}>
      <header className="section-head-page">
        <span className="eyebrow">Explore</span>
        <h1 className="section-title-main">Places & Map</h1>
        <p className="section-intro">
          Bandwar through its landmarks and photographs — an interactive map of the village and a curated gallery.
        </p>
      </header>

      {/* Map Stats */}
      <div className="map-stats-row" style={{ marginTop: '2rem' }}>
        <div className="map-stat">
          <span className="map-stat-value">{landmarks.length}</span>
          <span className="map-stat-label">Landmarks</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-value">{gallery.length}</span>
          <span className="map-stat-label">Photographs</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="place-map-wrap">
        <LeafletMap landmarks={landmarks} />
      </div>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Photo Gallery</h2>
          </div>
          <div className="place-gallery">
            {gallery.map((photo: any, i: number) => (
              <figure className="photo-item" key={i}>
                <img src={photo.src.startsWith('/') ? photo.src : `/${photo.src}`} alt={photo.caption || 'Bandwar'} loading="lazy" />
                {photo.caption && (
                  <figcaption className="photo-caption">
                    {photo.caption}
                    {photo.year && <span className="photo-year">{photo.year}</span>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}