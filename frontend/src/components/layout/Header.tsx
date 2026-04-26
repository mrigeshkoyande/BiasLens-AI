'use client';
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, breadcrumbs, actions }: HeaderProps) {
  return (
    <div className="px-8 pt-7 pb-5 border-b border-[#c3caad]/30 flex items-center justify-between gap-4"
      style={{ background: '#FFFADE' }}>
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-[#c3caad] text-[12px]">›</span>
                )}
                {crumb.href ? (
                  <Link href={crumb.href}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#737a61] hover:text-[#4b6700] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    i === breadcrumbs.length - 1 ? 'text-[#4b6700]' : 'text-[#737a61]'
                  }`}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-[26px] font-black tracking-tight text-[#1d1c0a] leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-[12px] text-[#737a61] mt-1">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
