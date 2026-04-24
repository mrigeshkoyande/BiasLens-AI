'use client';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { BiasExplanation } from '@/lib/types';

interface BiasExplanationPanelProps {
  explanations: BiasExplanation[];
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    label: 'Critical',
  },
  warning: {
    icon: AlertCircle,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.08)',
    border: 'rgba(0,212,255,0.2)',
    label: 'Info',
  },
};

function ExplanationItem({ item, index }: { item: BiasExplanation; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[item.severity];
  const Icon = config.icon;

  return (
    <div
      className="rounded-xl p-4 cursor-pointer transition-all duration-200"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        animationDelay: `${index * 100}ms`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={16} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: config.color, background: `${config.color}20` }}
            >
              {config.label}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/[0.06] text-[#94a3b8]">
              {item.feature}
            </span>
          </div>
          <p className="text-[12px] text-[#e2e8f0] leading-relaxed">{item.text}</p>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#475569] uppercase tracking-wider">Bias Magnitude</span>
                <span className="text-[12px] font-mono font-semibold" style={{ color: config.color }}>
                  {(item.magnitude * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.magnitude * 100}%`,
                    background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                  }}
                />
              </div>
              <p className="text-[10px] text-[#475569] mt-2">
                Direction: <span style={{ color: item.direction === 'positive' ? '#10b981' : '#ef4444' }}>
                  {item.direction === 'positive' ? '↑ Positive (reduces bias)' : '↓ Negative (increases bias)'}
                </span>
              </p>
            </div>
          )}
        </div>
        <button className="flex-shrink-0 text-[#475569] mt-0.5">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function BiasExplanationPanel({ explanations }: BiasExplanationPanelProps) {
  const criticalCount = explanations.filter((e) => e.severity === 'critical').length;
  const warningCount = explanations.filter((e) => e.severity === 'warning').length;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#f1f5f9]">Bias Explanations</h3>
          <p className="text-[11px] text-[#475569] mt-0.5">AI-generated fairness insights</p>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]">
            {criticalCount} Critical
          </span>
          <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">
            {warningCount} Warning
          </span>
        </div>
      </div>

      {/* Explanation items */}
      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {explanations.map((item, i) => (
          <ExplanationItem key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
