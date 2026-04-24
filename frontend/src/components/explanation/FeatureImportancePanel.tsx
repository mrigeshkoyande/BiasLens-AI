'use client';
import type { FeatureImportance } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FeatureImportancePanelProps {
  features: FeatureImportance[];
}

const directionConfig = {
  increases_bias: { icon: TrendingUp, color: '#ef4444', label: '↑ Bias', bg: 'rgba(239,68,68,0.12)' },
  decreases_bias: { icon: TrendingDown, color: '#10b981', label: '↓ Bias', bg: 'rgba(16,185,129,0.12)' },
  neutral: { icon: Minus, color: '#94a3b8', label: 'Neutral', bg: 'rgba(148,163,184,0.12)' },
};

export default function FeatureImportancePanel({ features }: FeatureImportancePanelProps) {
  const sorted = [...features].sort((a, b) => b.importance - a.importance);
  const max = sorted[0]?.importance ?? 1;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#f1f5f9]">Feature Importance</h3>
          <p className="text-[11px] text-[#475569] mt-0.5">SHAP-based bias attribution</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#475569]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />Increases</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" />Decreases</span>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((feature, i) => {
          const config = directionConfig[feature.direction];
          const Icon = config.icon;
          const barWidth = (feature.importance / max) * 100;

          return (
            <div key={feature.feature} className="group" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#e2e8f0]">{feature.feature}</span>
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold"
                    style={{ color: config.color, background: config.bg }}
                  >
                    <Icon size={9} />
                    {config.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#94a3b8]">
                  {(feature.importance * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${barWidth}%`,
                    background: feature.direction === 'increases_bias'
                      ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                      : feature.direction === 'decreases_bias'
                      ? 'linear-gradient(90deg, #10b981, #00d4ff)'
                      : 'rgba(148,163,184,0.4)',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
