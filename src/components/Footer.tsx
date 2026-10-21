import Link from 'next/link';
import master from '../../data/master.json';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const copyright = master.footer?.copyright?.replace('{year}', currentYear.toString()) || `© ${currentYear} Bandwar Community`;

  return (
    <footer className="footer">
      <div className="container-wide">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">{master.site.shortName}</div>
            <p className="footer-desc">{master.site.description}</p>
          </div>
          <div className="footer-col">
            <h4>Sections</h4>
            <ul>
              {master.footer?.sections?.map((item: any) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              {master.footer?.explore?.map((item: any) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{copyright}</p>
          <p>{master.footer?.credit}</p>
        </div>
      </div>
    </footer>
  );
}