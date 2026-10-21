import fs from 'fs';
import path from 'path';
import master from '../../../data/master.json';

export const metadata = {
  title: `How to Reach | ${master.site.name}`,
  description: 'Travel guide on how to reach Bandwar village in Begusarai, Bihar by air, train, and road.',
};

export default function ReachPage() {
  const reachPath = path.join(process.cwd(), 'data/reach.json');
  const reachData = JSON.parse(fs.readFileSync(reachPath, 'utf-8'));
  const options = reachData.options || [];

  return (
    <div className="container-wide" style={{ paddingBottom: '4rem' }}>
      <header className="section-head-page">
        <span className="eyebrow">Travel</span>
        <h1 className="section-title-main">How to Reach Bandwar</h1>
        <p className="section-intro">{reachData.intro || 'Detailed directions for visitors via Air, Train, and Road.'}</p>
      </header>

      <div style={{ marginTop: '3rem', maxWidth: '800px' }}>
        {options.map((opt: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--c-border-soft)' }}>
            <div style={{ fontSize: '2rem' }}>{opt.icon}</div>
            <div>
              <h3 className="section-title" style={{ fontSize: 'var(--fs-lg)', marginBottom: '0.5rem' }}>{opt.mode}</h3>
              <p style={{ color: 'var(--c-text-muted)', lineHeight: '1.7', margin: 0 }}>{opt.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}