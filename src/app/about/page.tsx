import master from '../../../data/master.json';

export const metadata = {
  title: `About | ${master.site.name}`,
  description: master.about?.intro || 'About the Bandwar Digital Archive.',
};

export default function AboutPage() {
  const about = master.about || {};

  return (
    <div className="container-wide" style={{ paddingBottom: '4rem' }}>
      <header className="section-head-page">
        <span className="eyebrow">Our Story</span>
        <h1 className="section-title-main">About the Archive</h1>
        {about.intro && <p className="section-intro">{about.intro}</p>}
      </header>

      <div className="container-text" style={{ padding: 0, marginTop: '3rem' }}>
        {about.story?.map((para: string, i: number) => (
          <p key={i} style={{ fontSize: 'var(--fs-md)', lineHeight: '1.8', marginBottom: '1.5rem' }}>{para}</p>
        ))}
      </div>

      {about.principles && (
        <div style={{ marginTop: '4rem' }}>
          <h2 className="section-title">Our Principles</h2>
          <div className="principles-list">
            {about.principles.map((p: any, i: number) => (
              <div className="principle-item" key={i}>
                <div className="principle-icon">{p.icon}</div>
                <div>
                  <h3 className="principle-title">{p.title}</h3>
                  <p className="principle-desc">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}