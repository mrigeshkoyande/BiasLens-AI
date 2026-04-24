'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bell,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Fairness overview' },
  { href: '/upload', label: 'Upload', icon: Upload, description: 'Add dataset' },
  { href: '/reports', label: 'Reports', icon: FileText, description: 'Audit reports' },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Configuration' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync sidebar width with CSS variable (replaces styled-jsx which Turbopack doesn't support)
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '72px' : '260px'
    );
  }, [collapsed]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg glass border border-white/10 text-white"
        aria-label="Toggle sidebar"
      >
        <LayoutDashboard size={18} />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full z-50
          flex flex-col
          bg-[#0f0f1a] border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            <Shield size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="gradient-text font-bold text-[15px] leading-none">BiasLens AI</div>
              <div className="text-[10px] text-[#475569] font-medium mt-0.5">Fairness Platform</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-[rgba(0,212,255,0.12)] to-[rgba(124,58,237,0.08)] text-[#00d4ff] border border-[rgba(0,212,255,0.2)]'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/[0.04]'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : ''}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-[#00d4ff] to-[#7c3aed] rounded-r-full" />
                )}

                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#00d4ff]' : ''}`}
                />
                {!collapsed && (
                  <div>
                    <div className="text-[13px] font-medium leading-none">{item.label}</div>
                    <div className="text-[10px] text-[#475569] mt-0.5">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          {!collapsed && (
            <div className="px-3 py-3 rounded-xl bg-gradient-to-r from-[rgba(0,212,255,0.06)] to-[rgba(124,58,237,0.06)] border border-white/[0.06] mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-[#00d4ff]" />
                <span className="text-[11px] font-semibold text-[#00d4ff]">Pro Plan</span>
              </div>
              <div className="text-[10px] text-[#475569] leading-relaxed">
                Unlimited audits & API access
              </div>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] rounded-full" />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-[#475569]">13 / 20 audits</span>
                <span className="text-[9px] text-[#475569]">65%</span>
              </div>
            </div>
          )}

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#475569] hover:text-[#94a3b8] hover:bg-white/[0.03] transition-all ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Notifications' : ''}
          >
            <Bell size={16} />
            {!collapsed && <span className="text-[13px]">Notifications</span>}
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#475569] hover:text-[#94a3b8] hover:bg-white/[0.03] transition-all ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Help' : ''}
          >
            <HelpCircle size={16} />
            {!collapsed && <span className="text-[13px]">Help & Docs</span>}
          </button>

          {/* User avatar */}
          <div className={`flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-all ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">MK</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-[#f1f5f9] truncate">Mrigesh K.</div>
                <div className="text-[10px] text-[#475569] truncate">Pro Account</div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-[#475569] hover:text-[#00d4ff] hover:border-[#00d4ff]/30 transition-all hidden lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

    </>
  );
}
