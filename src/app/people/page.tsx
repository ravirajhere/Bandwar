import fs from 'fs';
import path from 'path';
import master from '../../../data/master.json';

export const metadata = {
  title: `People of Bandwar | ${master.site.name}`,
  description: 'Meet the residents, leaders, and notable figures of Bandwar village.',
};

export default function PeoplePage() {
  // Data read karna
  const dataPath = path.join(process.cwd(), 'data/people.json');
  const peopleData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const people = peopleData.people || [];

  return (
    <div className="container-wide" style={{ paddingBottom: '4rem' }}>
      <header className="section-head-page">
        <span className="eyebrow">Directory</span>
        <h1 className="section-title-main">People of Bandwar</h1>
        <p className="section-intro">
          A directory of notable individuals from our village — politicians, teachers, authors, and community leaders.
        </p>
        <span className="section-count">{people.length} individuals listed</span>
      </header>

      <div className="section-grid" style={{ marginTop: '2rem' }}>
        {people.map((person: any, i: number) => (
          <div className="section-card" key={i} style={{ cursor: 'default' }}>
            {person.photo && (
              <div className="section-card-img" style={{ aspectRatio: '1/1' }}>
                <img src={person.photo.startsWith('/') ? person.photo : `/${person.photo}`} alt={person.name} loading="lazy" />
              </div>
            )}
            <div className="section-card-body">
              <h3 className="section-card-title">{person.name}</h3>
              <div className="section-card-cat" style={{ marginBottom: '1rem' }}>{person.role}</div>
              <p className="section-card-summary">{person.bio}</p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--c-border-soft)', fontSize: 'var(--fs-xs)', color: 'var(--c-text-faint)' }}>
                📍 {person.locality}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}