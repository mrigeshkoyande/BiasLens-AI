'use client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  icon?: React.ReactNode;
  threshold?: { good: number; warning: number }; // lower is worse for bias metrics
  invert?: boolean; // if higher = worse (bias metrics like disparity)
}

const colorMap = {
  blue: {
    icon: 'bg-[rgba(0,212,255,0.1)] text-[#00d4ff]',
    value: '#00d4ff',
    glow: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]',
    bar: 'from-[#00d4ff]',
  },
  green: {
    icon: 'bg-[rgba(16,185,129,0.1)] text-[#10b981]',
    value: '#10b981',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]',
    bar: 'from-[#10b981]',
  },
  amber: {
    icon: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]',
    value: '#f59e0b',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]',
    bar: 'from-[#f59e0b]',
  },
  red: {
    icon: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]',
    value: '#ef4444',
    glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.08)]',
    bar: 'from-[#ef4444]',
  },
  purple: {
    icon: 'bg-[rgba(124,58,237,0.1)] text-[#7c3aed]',
    value: '#7c3aed',
    glow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.08)]',
    bar: 'from-[#7c3aed]',
  },
};

export default function MetricCard({
  title,
  value,
  suffix = '',
  prefix = '',
  decimals = 2,
  description,
  trend,
  trendValue,
  color = 'blue',
  icon,
  invert = false,
}: MetricCardProps) {
  const colors = colorMap[color];

  // Determine severity color for the value display
  const displayValue = Math.abs(value);

  return (
    <div
      className={`
        rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-5
        transition-all duration-300 hover:-translate-y-1 cursor-default
        ${colors.glow}
        group
      `}
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider">{title}</p>
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-[11px] text-[#94a3b8]">{prefix}</span>
          <AnimatedCounter
            value={displayValue}
            decimals={decimals}
            className="text-3xl font-bold font-mono leading-none"
            style={{ color: colors.value } as React.CSSProperties}
          />
          <span className="text-[13px] text-[#94a3b8]">{suffix}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.bar} to-transparent rounded-full transition-all duration-1000`}
            style={{ width: `${Math.min(displayValue * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Description & trend */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#475569] leading-relaxed flex-1">{description}</p>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 ml-3 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0
            ${trend === 'up'
              ? (invert ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]' : 'bg-[rgba(16,185,129,0.1)] text-[#10b981]')
              : trend === 'down'
              ? (invert ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]')
              : 'bg-white/[0.06] text-[#94a3b8]'
            }`}>
            {trend === 'up' ? <TrendingUp size={10} /> : trend === 'down' ? <TrendingDown size={10} /> : <Minus size={10} />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}
