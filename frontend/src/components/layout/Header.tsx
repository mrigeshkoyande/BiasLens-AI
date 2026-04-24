'use client';
import { useState, useEffect } from 'react';
import { Bell, Search, RefreshCw, ChevronRight } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, breadcrumbs, actions }: HeaderProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 px-6 py-4 border-b border-white/[0.06]"
      style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: title + breadcrumbs */}
        <div className="min-w-0">
          {breadcrumbs && (
            <div className="flex items-center gap-1.5 mb-1">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} className="text-[#475569]" />}
                  <span className={`text-[11px] font-medium ${i === breadcrumbs.length - 1 ? 'text-[#00d4ff]' : 'text-[#475569]'}`}>
                    {b.label}
                  </span>
                </span>
              ))}
            </div>
          )}
          <h1 className="text-lg font-bold text-[#f1f5f9] leading-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-[#475569] mt-0.5">{subtitle}</p>}
        </div>

        {/* Right: actions + time */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <Search size={13} className="text-[#475569]" />
            <span className="text-[12px] text-[#475569]">Search...</span>
            <kbd className="text-[9px] text-[#475569] bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>

          <button className="relative w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#475569] hover:text-[#f1f5f9] hover:border-[#00d4ff]/20 transition-all">
            <Bell size={14} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          </button>

          <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#475569] hover:text-[#00d4ff] hover:border-[#00d4ff]/20 transition-all group"
            title="Refresh analysis">
            <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[11px] text-[#475569] font-mono">{time}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
