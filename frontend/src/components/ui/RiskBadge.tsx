'use client';
import type { RiskLevel } from '@/lib/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const configs = {
  Low: {
    label: 'Low Risk',
    className: 'risk-badge-low',
    dot: 'bg-[#10b981]',
  },
  Medium: {
    label: 'Medium Risk',
    className: 'risk-badge-medium',
    dot: 'bg-[#f59e0b]',
  },
  High: {
    label: 'High Risk',
    className: 'risk-badge-high',
    dot: 'bg-[#ef4444]',
  },
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-[11px]',
  lg: 'px-3 py-1.5 text-[12px]',
};

export default function RiskBadge({ level, size = 'md', showDot = true }: RiskBadgeProps) {
  const config = configs[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.className} ${sizeMap[size]}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />}
      {config.label}
    </span>
  );
}
