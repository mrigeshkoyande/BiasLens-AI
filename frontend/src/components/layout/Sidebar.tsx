'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/upload', label: 'Upload', icon: 'upload_file' },
  { href: '/analysis', label: 'Analysis', icon: 'analytics' },
  { href: '/explainability', label: 'Explainability', icon: 'visibility' },
  { href: '/mitigation', label: 'Mitigation', icon: 'auto_fix_high' },
  { href: '/reports', label: 'Reports', icon: 'description' },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="sidebar-toggle"
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          {mobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">BiasLens</div>
          <div className="sidebar-brand-subtitle">AI Scrutiny Engine</div>
        </div>

        <nav className="sidebar-nav" aria-label="Section navigation" style={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                <span className="material-symbols-outlined sidebar-link-icon">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 18px 8px' }}>
          {bottomItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                <span className="material-symbols-outlined sidebar-link-icon">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-health">
          <div className="sidebar-health-label">System Health</div>
          <div className="sidebar-health-row">
            <span className="sidebar-health-dot" />
            <span>Engine v4.2 Running</span>
          </div>
        </div>
      </aside>
    </>
  );
}
