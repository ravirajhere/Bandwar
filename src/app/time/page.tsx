import fs from 'fs';
import path from 'path';
import master from '../../../data/master.json';

export const metadata = {
  title: `Timeline | ${master.site.name}`,
  description: '2,600 years of Bandwar history — from the Anga Mahajanapada to the present day.',
};

export default function TimePage() {
  const mediaPath = path.join(process.cwd(), 'data/media.json');
  const mediaData = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
  const timeline = mediaData.timeline || [];

  // Eras ke hisaab se group karna
  const eras = timeline.reduce((acc: any, event: any) => {
    if (!acc[event.era]) acc[event.era] = [];
    acc[event.era].push(event);
    return acc;
  }, {});

  const eraMeta: any = {
    ancient:  { title: 'Ancient Period',   span: '600 BCE – 1200 CE' },
    medieval: { title: 'Medieval Period',  span: '1200 – 1750 CE' },
    colonial: { title: 'Colonial Period',  span: '1750 – 1947' },
    modern:   { title: 'Modern Period',    span: '1947 – Present' },
  };

  return (
    <div className="container-wide" style={{ paddingBottom: '4rem' }}>
      <header className="section-head-page">
        <span className="eyebrow">History</span>
        <h1 className="section-title-main">Timeline</h1>
        <p className="section-intro">Bandwar across 2,600 years — from the Anga Mahajanapada to the present day.</p>
      </header>

      <div className="time-timeline">
        {Object.keys(eras).map((eraKey, i) => {
          const meta = eraMeta[eraKey] || { title: eraKey, span: '' };
          const eraNum = String(i + 1).padStart(2, '0');
          const eraTotal = String(Object.keys(eras).length).padStart(2, '0');

          return (
            <section className="era" key={eraKey}>
              <header className="era-header">
                <span className="era-num">{eraNum} / {eraTotal}</span>
                <h2 className="era-title">{meta.title}</h2>
                {meta.span && <span className="era-span">{meta.span}</span>}
              </header>
              <ol className="era-events">
                {eras[eraKey].sort((a: any, b: any) => (a.sortKey || 0) - (b.sortKey || 0)).map((event: any, j: number) => (
                  <li className="era-event" key={j}>
                    <div className="era-event-year">{event.year}</div>
                    <div className="era-event-body">
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>
                      {event.article && (
                        <a href={`/article/${event.article}`} className="era-event-link">Read full story →</a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}