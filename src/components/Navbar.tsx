'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import master from '../../data/master.json';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          {master.site.shortName}
        </Link>

        <nav className={`nav-menu ${isOpen ? 'active' : ''}`}>
          {master.nav?.map((item: any) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={isActive ? 'active' : ''}>
                {item.icon && <span aria-hidden="true">{item.icon}</span>} {item.label}
              </Link>
            );
          })}
        </nav>

        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
          </svg>
        </button>
      </div>
    </header>
  );
}