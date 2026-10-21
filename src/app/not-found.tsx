import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-wide" style={{ textAlign: 'center', padding: '8rem 1rem' }}>
      <span style={{ display: 'block', fontSize: 'clamp(5rem, 15vw, 10rem)', fontFamily: 'var(--f-display)', color: 'var(--c-accent)', lineHeight: 1 }}>
        404
      </span>
      <h1 style={{ fontSize: 'var(--fs-2xl)', margin: '1rem 0' }}>Page not found</h1>
      <p style={{ color: 'var(--c-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
        The page you're looking for isn't here. It may have been moved, or the link may be incorrect.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">Return to Homepage</Link>
        <Link href="/section" className="btn">Browse the Archive</Link>
      </div>
    </div>
  );
}