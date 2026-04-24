'use client';
import { HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: 'blue' | 'purple' | 'green' | 'red' | 'amber' | 'none';
  interactive?: boolean;
  gradient?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const glowMap = {
  blue: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.12)] hover:border-[rgba(0,212,255,0.2)]',
  purple: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.12)] hover:border-[rgba(124,58,237,0.2)]',
  green: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] hover:border-[rgba(16,185,129,0.2)]',
  red: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.12)] hover:border-[rgba(239,68,68,0.2)]',
  amber: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.12)] hover:border-[rgba(245,158,11,0.2)]',
  none: '',
};

const paddingMap = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  none: '',
};

export default function GlassCard({
  children,
  glow = 'blue',
  interactive = false,
  gradient = false,
  padding = 'md',
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-white/[0.07]
        ${gradient
          ? 'bg-gradient-to-br from-[rgba(0,212,255,0.04)] to-[rgba(124,58,237,0.04)]'
          : 'bg-[#0f0f1a]'}
        ${interactive ? `cursor-pointer transition-all duration-300 hover:-translate-y-1 ${glowMap[glow]}` : ''}
        ${paddingMap[padding]}
        ${className}
      `}
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
      {...props}
    >
      {children}
    </div>
  );
}
