import Link from 'next/link';
import master from '../../data/master.json'; // <--- Path sahi kiya gaya hai

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const copyright = master.footer?.copyright?.replace('{year}', currentYear.toString()) || `© ${currentYear} Bandwar Community`;

  return (
    <footer className="site-footer">
      <div className="container-wide footer-inner">
        <div className="footer-brand">
          <h2>{master.site.shortName}</h2>
          <p>{master.site.description}</p>
        </div>
        <div className="footer-links">
          <div>
            <h3>Sections</h3>
            <ul>
              {master.footer?.sections?.map((item: any) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="container-wide footer-bottom">
        <p>{copyright}</p>
      </div>
    </footer>
  );
}