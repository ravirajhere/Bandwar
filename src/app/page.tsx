import Link from 'next/link';
import master from '../../data/master.json';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>{master.home.hero.title}</h1>
          <p className="hero-tagline">{master.home.hero.tagline}</p>
          <div>
            <Link href="/section" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Explore the Archive
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}