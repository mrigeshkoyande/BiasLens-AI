'use client';
import { useState, useMemo } from 'react';
import { Users, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import type { SimulationResult } from '@/lib/types';

interface SimulationSliderProps {
  baseResult: SimulationResult;
}

function computeSimulation(n: number, base: SimulationResult): SimulationResult {
  const ratio = n / base.totalApplicants;
  return {
    totalApplicants: n,
    unfairRejections: Math.round(base.unfairRejections * ratio),
    costOfBias: Math.round(base.costOfBias * ratio),
    affectedGroups: base.affectedGroups.map((g) => ({
      ...g,
      affected: Math.round(g.affected * ratio),
    })),
  };
}

const marks = [100, 1000, 5000, 10000, 25000, 50000, 100000];

export default function SimulationSlider({ baseResult }: SimulationSliderProps) {
  const [applicants, setApplicants] = useState(10000);

  const result = useMemo(() => computeSimulation(applicants, baseResult), [applicants, baseResult]);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
      <div className="mb-5">
        <h3 className="text-[14px] font-semibold text-[#f1f5f9]">Real-World Impact Simulation</h3>
        <p className="text-[11px] text-[#475569] mt-0.5">Simulate the effect of this bias at scale</p>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">
            Applicant Pool Size
          </label>
          <span className="text-[15px] font-bold font-mono gradient-text">
            {applicants.toLocaleString()}
          </span>
        </div>
        <div className="relative">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${((applicants - 100) / (100000 - 100)) * 100}%`,
              background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
              height: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          <input
            type="range"
            min={100}
            max={100000}
            step={100}
            value={applicants}
            onChange={(e) => setApplicants(Number(e.target.value))}
            className="relative z-10"
          />
        </div>
        <div className="flex justify-between mt-1">
          {marks.map((m) => (
            <button
              key={m}
              onClick={() => setApplicants(m)}
              className={`text-[9px] font-mono transition-colors ${applicants === m ? 'text-[#00d4ff]' : 'text-[#475569] hover:text-[#94a3b8]'}`}
            >
              {m >= 1000 ? `${m / 1000}K` : m}
            </button>
          ))}
        </div>
      </div>

      {/* Impact metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-4 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)]">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-[#ef4444]" />
            <span className="text-[10px] font-semibold text-[#ef4444] uppercase tracking-wider">Unfair Rejections</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#ef4444]">
            {result.unfairRejections.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#475569] mt-1">people unfairly rejected</div>
        </div>

        <div className="rounded-xl p-4 bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-[#f59e0b]" />
            <span className="text-[10px] font-semibold text-[#f59e0b] uppercase tracking-wider">Cost of Bias</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#f59e0b]">
            ${(result.costOfBias / 1000).toFixed(0)}K
          </div>
          <div className="text-[10px] text-[#475569] mt-1">estimated litigation risk</div>
        </div>
      </div>

      {/* Affected groups breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={13} className="text-[#475569]" />
          <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">Affected Groups</span>
        </div>
        <div className="space-y-2.5">
          {result.affectedGroups.map((g, i) => (
            <div key={g.group}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingDown size={11} className="text-[#ef4444]" />
                  <span className="text-[12px] text-[#e2e8f0]">{g.group}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-[#94a3b8]">{g.affected.toLocaleString()} people</span>
                  <span className="text-[10px] font-semibold text-[#ef4444]">{g.percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${g.percentage}%`,
                    background: i === 0 ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                      : i === 1 ? 'linear-gradient(90deg, #f59e0b, #7c3aed)'
                      : 'linear-gradient(90deg, #7c3aed, #00d4ff)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
