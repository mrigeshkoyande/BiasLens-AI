'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'DASHBOARD' },
    { href: '/explainability', label: 'MODELS' },
    { href: '/reports', label: 'AUDITS' },
  ];

  return (
    <header className="topbar">
      <Link href="/" className="topbar-logo">
        <img src="/logo.png" alt="Logo" width={32} height={32} className="logo-img" />
        <span>BiasLens AI</span>
      </Link>

      <nav className="topbar-nav" aria-label="Primary">
        {navItems.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`topbar-link ${active ? 'is-active' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/upload" className="topbar-cta">
        Audit Now
      </Link>
    </header>
  );
}
