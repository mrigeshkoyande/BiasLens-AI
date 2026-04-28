'use client';
import { useState } from 'react';
import { CheckCircle, Zap, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { FixStrategy } from '@/lib/types';
import ProgressRing from '@/components/ui/ProgressRing';

interface FixSuggestionsProps {
  strategies: FixStrategy[];
}

const difficultyConfig = {
  easy: { label: 'Easy', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  hard: { label: 'Hard', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

function StrategyCard({ strategy, index }: { strategy: FixStrategy; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [applied, setApplied] = useState(false);
  const diffConfig = difficultyConfig[strategy.difficulty];
  const improvement = strategy.after_score - strategy.before_score;

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        applied
          ? 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)]'
          : 'border-white/[0.07] bg-[rgba(255,255,255,0.02)] hover:border-white/[0.12]'
      }`}
    >
      <div
        className="p-4 cursor-pointer flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Improvement score */}
        <div className="flex-shrink-0 text-center">
          <div
            className="text-2xl font-bold font-mono"
            style={{ color: '#10b981' }}
          >
            +{improvement}
          </div>
          <div className="text-[9px] text-[#475569]">pts</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[13px] font-semibold text-[#f1f5f9]">{strategy.name}</span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: diffConfig.color, background: diffConfig.bg }}
            >
              {diffConfig.label}
            </span>
            {applied && (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-[#10b981]">
                <CheckCircle size={10} /> Applied
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#475569] leading-relaxed">{strategy.description}</p>
        </div>

        <div className="flex-shrink-0 text-[#475569] mt-1">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-4">
          {/* Before / After comparison */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 text-center">
              <div className="text-[10px] text-[#475569] mb-2 uppercase tracking-wider">Before</div>
              <ProgressRing score={strategy.before_score} size={80} strokeWidth={7} showLabel={false} />
              <div className="text-[13px] font-bold font-mono text-[#ef4444] mt-1">{strategy.before_score}</div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <ArrowRight size={20} className="text-[#475569]" />
              <div className="text-[11px] font-semibold text-[#10b981]">+{improvement} pts</div>
            </div>

            <div className="flex-1 text-center">
              <div className="text-[10px] text-[#475569] mb-2 uppercase tracking-wider">After</div>
              <ProgressRing score={strategy.after_score} size={80} strokeWidth={7} showLabel={false} />
              <div className="text-[13px] font-bold font-mono text-[#10b981] mt-1">{strategy.after_score}</div>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setApplied(!applied); }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${
              applied
                ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border border-[rgba(16,185,129,0.3)]'
                : 'btn-primary'
            }`}
          >
            <Zap size={13} />
            {applied ? 'Undo Fix' : 'Apply This Fix'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function FixSuggestions({ strategies }: FixSuggestionsProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-[#f1f5f9]">Auto-Fix Suggestions</h3>
        <p className="text-[11px] text-[#475569] mt-0.5">AI-recommended mitigation strategies</p>
      </div>
      <div className="space-y-2.5">
        {strategies.map((s, i) => (
          <StrategyCard key={s.id} strategy={s} index={i} />
        ))}
      </div>
    </div>
  );
}
