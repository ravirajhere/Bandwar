import fs from 'fs';
import path from 'path';
import master from '../../../data/master.json';

export const metadata = {
  title: `Vision | ${master.site.name}`,
  description: 'A non-political development plan for Bandwar village.',
};

export default function VisionPage() {
  const visionPath = path.join(process.cwd(), 'data/vision.json');
  const visionData = JSON.parse(fs.readFileSync(visionPath, 'utf-8'));
  
  const priorities = visionData.priorities || [];
  const achievements = visionData.achievements || [];
  const roadmap = visionData.roadmap || [];

  return (
    <div className="container-wide" style={{ paddingBottom: '4rem' }}>
      <header className="section-head-page">
        <span className="eyebrow">Bandwar 2036</span>
        <h1 className="section-title-main">A Vision for the Village</h1>
        <p className="section-intro">A non-political development plan — 15 active priorities, acknowledged achievements, and a rolling 10-year roadmap.</p>
      </header>

      {/* Priorities Section */}
      <section style={{ marginTop: '4rem' }}>
        <h2 className="section-title">Active Priorities</h2>
        <div className="needs-container">
          {priorities.map((need: any, i: number) => (
            <article className="need" key={i}>
              <header className="need-header">
                <div className="need-meta">
                  <span className="need-num">{String(i + 1).padStart(2, '0')} / {String(priorities.length).padStart(2, '0')}</span>
                  <span className={`need-badge ${need.status === 'in-progress' ? 'need-badge-progress' : 'need-badge-pending'}`}>
                    {need.status === 'in-progress' ? 'In Progress' : 'Planned'}
                  </span>
                </div>
                <h3 className="need-title">{need.title}</h3>
                {need.summary && <p className="need-summary">{need.summary}</p>}
              </header>
              
              <div className="need-details">
                {need.reality && (
                  <div className="need-detail">
                    <span className="need-detail-label">The Reality</span>
                    <p>{need.reality}</p>
                  </div>
                )}
                {need.vision && (
                  <div className="need-detail">
                    <span className="need-detail-label">What It Should Be</span>
                    <p>{need.vision}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--c-border-soft)' }}>
          <h2 className="section-title">Achievements</h2>
          <div className="thanks-container">
            {achievements.map((ach: any, i: number) => (
              <article className="achievement" key={i}>
                <div className="achievement-body">
                  <span className="achievement-badge">Completed {ach.completed}</span>
                  <h3 className="achievement-title">{ach.title}</h3>
                  <p className="achievement-desc">{ach.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Roadmap Section */}
      {roadmap.length > 0 && (
        <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--c-border-soft)' }}>
          <h2 className="section-title">Roadmap</h2>
          <div className="roadmap-container">
            {roadmap.map((phase: any, i: number) => (
              <article className="roadmap-phase" key={i}>
                <header className="roadmap-header">
                  <span className="roadmap-phase-num">Phase {String(i + 1).padStart(2, '0')}</span>
                  <h3 className="roadmap-phase-title">{phase.title}</h3>
                </header>
                <ul className="roadmap-items">
                  {phase.items?.map((item: any, j: number) => (
                    <li className="roadmap-item" key={j}>
                      <span className="roadmap-icon">{item.icon || '•'}</span>
                      <div>
                        <b>{item.title}</b>
                        <p>{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}