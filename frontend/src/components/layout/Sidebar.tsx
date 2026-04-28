'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/upload', label: 'Upload', icon: 'upload_file' },
  { href: '/analysis', label: 'Analysis', icon: 'analytics' },
  { href: '/explainability', label: 'Explainability', icon: 'visibility' },
  { href: '/mitigation', label: 'Mitigation', icon: 'auto_fix_high' },
  { href: '/simulation', label: 'Simulation', icon: 'model_training' },
  { href: '/reports', label: 'Reports', icon: 'description' },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar() {
  const auth = useAuth();
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
          
          <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            {auth.user ? (
              <div style={{ padding: '4px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>
                    {auth.user.displayName?.[0] || auth.user.email?.[0] || 'U'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {auth.user.displayName || 'User'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {auth.user.email}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={auth.logout}
                  className="sidebar-link" 
                  style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--danger)', opacity: 0.8 }}
                >
                  <span className="material-symbols-outlined sidebar-link-icon" style={{ color: 'var(--danger)' }}>logout</span>
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="sidebar-link" style={{ color: 'var(--olive)', fontWeight: 800 }}>
                <span className="material-symbols-outlined sidebar-link-icon">login</span>
                Sign In
              </Link>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}
