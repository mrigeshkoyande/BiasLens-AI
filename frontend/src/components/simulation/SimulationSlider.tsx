'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { SimulationResult } from '@/lib/types';

interface SimulationSliderProps {
  baseResult: SimulationResult;
}

type AspectRatio = '1:1' | '4:3' | '16:9' | '9:16';
type ViewMode = 'web' | 'mobile';

function computeSimulation(n: number, base: SimulationResult): SimulationResult {
  const ratio = n / base.totalApplicants;
  const unfairRejections = Math.round(base.unfairRejections * ratio);
  const costOfBias = Math.round(base.costOfBias * ratio);
  const affectedGroups = base.affectedGroups.map((g) => ({
    ...g,
    affected: Math.round(g.affected * ratio),
  }));
  const disadvantagedGroup = affectedGroups[0]?.group || 'protected groups';
  const affectedCount = affectedGroups[0]?.affected || unfairRejections;
  const plainLanguageImpact = `At a scale of ${n.toLocaleString()} applicants, approximately ${affectedCount.toLocaleString()} individuals from "${disadvantagedGroup}" would be unfairly disadvantaged — costing an estimated $${(costOfBias / 1000).toFixed(0)}K in litigation risk.`;
  return { totalApplicants: n, unfairRejections, costOfBias, affectedGroups, plainLanguageImpact };
}

const MARKS = [1_000, 5_000, 10_000, 25_000, 50_000, 100_000];
const RATIO_DIMS: Record<AspectRatio, { w: number; h: number; label: string }> = {
  '1:1':  { w: 540, h: 540, label: '1:1 — Square' },
  '4:3':  { w: 640, h: 480, label: '4:3 — Classic' },
  '16:9': { w: 720, h: 405, label: '16:9 — Widescreen' },
  '9:16': { w: 360, h: 640, label: '9:16 — Portrait' },
};

/* ── Sandbox simulation display ─────────────────────────────────── */
function SimulationSandbox({ result, viewMode }: { result: SimulationResult; viewMode: ViewMode }) {
  const maxRejections = Math.max(result.unfairRejections, 1);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--surface-2, #f8f8f0)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        padding: viewMode === 'mobile' ? '12px' : '20px',
        gap: 14,
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: viewMode === 'mobile' ? 11 : 13, fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Bias Impact · Sandbox
          </div>
          <div style={{ fontSize: viewMode === 'mobile' ? 10 : 12, color: 'var(--muted)', marginTop: 2 }}>
            {result.totalApplicants.toLocaleString()} applicants simulated
          </div>
        </div>
        <span
          style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 800,
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.25)', letterSpacing: '0.05em',
          }}
        >
          LIVE SANDBOX
        </span>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Unfair Rejections', value: result.unfairRejections.toLocaleString(), color: '#ef4444', icon: '⚠' },
          { label: 'Cost of Bias', value: `$${(result.costOfBias / 1000).toFixed(0)}K`, color: '#f59e0b', icon: '💸' },
        ].map(({ label, value, color, icon }) => (
          <div
            key={label}
            style={{
              padding: viewMode === 'mobile' ? '10px 12px' : '14px 16px',
              borderRadius: 12,
              background: 'var(--surface, #fff)',
              border: '1px solid var(--line)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: viewMode === 'mobile' ? 18 : 22, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Affected groups */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Affected Groups
        </div>
        {result.affectedGroups.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--muted)', fontSize: 13 }}>
            No group disparity detected ✓
          </div>
        ) : (
          result.affectedGroups.map((g, i) => {
            const pct = Math.min((g.affected / maxRejections) * 100, 100);
            const gradients = [
              'linear-gradient(90deg, #ef4444, #f59e0b)',
              'linear-gradient(90deg, #f59e0b, #7c3aed)',
              'linear-gradient(90deg, #7c3aed, #00d4ff)',
            ];
            return (
              <div key={g.group}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{g.group}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {g.affected.toLocaleString()} people
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444' }}>
                      {g.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      background: gradients[i % gradients.length],
                      width: `${pct}%`,
                      transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Impact statement */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(185,245,0,0.08)',
          border: '1px solid rgba(185,245,0,0.2)',
          fontSize: viewMode === 'mobile' ? 11 : 12,
          color: 'var(--ink)',
          lineHeight: 1.6,
          fontStyle: 'italic',
        }}
      >
        "{result.plainLanguageImpact}"
      </div>
    </div>
  );
}

/* ── Pop-out window ─────────────────────────────────────────────── */
function PopOutWindow({
  result,
  onClose,
}: {
  result: SimulationResult;
  onClose: () => void;
}) {
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const dims = RATIO_DIMS[ratio];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'column', gap: 0,
          background: 'var(--bg)', borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          border: '1px solid var(--line)',
          maxHeight: '95vh',
          maxWidth: '95vw',
        }}
      >
        {/* Pop-out toolbar */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'var(--surface-2)',
            borderBottom: '1px solid var(--line)',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
              🧪 Simulation Sandbox
            </span>
            <span
              style={{
                padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 800,
                background: 'var(--lime)', color: 'var(--ink)', letterSpacing: '0.08em',
              }}
            >
              POP-OUT
            </span>
          </div>
          {/* Ratio controls */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {(Object.keys(RATIO_DIMS) as AspectRatio[]).map((r) => (
              <button
                key={r}
                onClick={() => setRatio(r)}
                style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: `1px solid ${ratio === r ? 'var(--olive)' : 'var(--line)'}`,
                  background: ratio === r ? 'var(--lime)' : 'transparent',
                  color: ratio === r ? 'var(--ink)' : 'var(--muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {r}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 4px' }} />
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 8, border: '1px solid var(--line)',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
                fontSize: 16, transition: 'all 0.2s',
              }}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sandbox viewport */}
        <div
          style={{
            width: dims.w,
            height: dims.h,
            maxWidth: '90vw',
            maxHeight: 'calc(95vh - 60px)',
            overflow: 'hidden',
            transition: 'width 0.3s cubic-bezier(.22,1,.36,1), height 0.3s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <SimulationSandbox result={result} viewMode={ratio === '9:16' ? 'mobile' : 'web'} />
        </div>

        <div
          style={{
            padding: '8px 18px',
            fontSize: 10,
            color: 'var(--muted)',
            borderTop: '1px solid var(--line)',
            background: 'var(--surface-2)',
            flexShrink: 0,
          }}
        >
          {RATIO_DIMS[ratio].label} · {dims.w}×{dims.h}px · Isolated Sandbox Environment
        </div>
      </div>
    </div>
  );
}

/* ── Main SlimulationSlider component ───────────────────────────── */
export default function SimulationSlider({ baseResult }: SimulationSliderProps) {
  const [applicants, setApplicants] = useState(10000);
  const [viewMode, setViewMode] = useState<ViewMode>('web');
  const [showPopOut, setShowPopOut] = useState(false);
  const [animating, setAnimating] = useState(false);
  const prevApplicants = useRef(applicants);

  const result = useMemo(() => computeSimulation(applicants, baseResult), [applicants, baseResult]);

  // Trigger animation on change
  useEffect(() => {
    if (prevApplicants.current !== applicants) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 300);
      prevApplicants.current = applicants;
      return () => clearTimeout(t);
    }
  }, [applicants]);

  const sandboxStyle: React.CSSProperties =
    viewMode === 'web'
      ? { width: '100%', aspectRatio: '16/9', minHeight: 240 }
      : { width: '100%', maxWidth: 300, aspectRatio: '9/16', minHeight: 400, margin: '0 auto' };

  return (
    <>
      {showPopOut && <PopOutWindow result={result} onClose={() => setShowPopOut(false)} />}

      <div
        className="editorial-card animate-card-enter"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {/* Card header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid var(--line)',
            gap: 12, flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--olive)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              Monte Carlo · Simulation Engine
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)', margin: 0 }}>
              Real-World Impact Simulator
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* View mode toggle */}
            <div
              style={{
                display: 'flex', borderRadius: 10, border: '1px solid var(--line)',
                overflow: 'hidden', background: 'var(--surface-2)',
              }}
            >
              {(['web', 'mobile'] as ViewMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  style={{
                    padding: '6px 14px', fontSize: 11, fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    background: viewMode === m ? 'var(--lime)' : 'transparent',
                    color: viewMode === m ? 'var(--ink)' : 'var(--muted)',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {m === 'web' ? 'desktop_windows' : 'smartphone'}
                  </span>
                  {m === 'web' ? '16:9' : '9:16'}
                </button>
              ))}
            </div>
            {/* Pop-out button */}
            <button
              onClick={() => setShowPopOut(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                border: '1px solid var(--line)', background: 'transparent',
                color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s',
              }}
              title="Open in pop-out window"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
              Pop Out
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Slider control */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label
                htmlFor="applicant-pool-slider"
                style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                Applicant Pool Size
              </label>
              <span
                style={{
                  fontSize: 18, fontWeight: 900,
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'color 0.3s',
                  color: animating ? 'var(--olive)' : 'var(--ink)',
                }}
              >
                {applicants.toLocaleString()}
              </span>
            </div>
            <div style={{ position: 'relative', paddingBottom: 24 }}>
              <div
                style={{
                  position: 'absolute', top: '50%', left: 0,
                  transform: 'translateY(-50%)',
                  height: 6, borderRadius: 4,
                  background: 'linear-gradient(90deg, var(--olive), var(--lime))',
                  width: `${((applicants - 1000) / (100000 - 1000)) * 100}%`,
                  pointerEvents: 'none', zIndex: 0,
                  transition: 'width 0.15s ease',
                  marginTop: -12, // align with range thumb
                }}
              />
              <input
                id="applicant-pool-slider"
                name="applicant-pool-slider"
                type="range"
                min={1000}
                max={100000}
                step={500}
                value={applicants}
                onChange={(e) => setApplicants(Number(e.target.value))}
                style={{ width: '100%', position: 'relative', zIndex: 1 }}
              />
              <div
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  display: 'flex', justifyContent: 'space-between',
                }}
              >
                {MARKS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setApplicants(m)}
                    style={{
                      fontSize: 9, fontWeight: 700, border: 'none',
                      background: 'transparent', cursor: 'pointer', padding: '0 2px',
                      color: applicants === m ? 'var(--olive)' : 'var(--muted)',
                      transition: 'color 0.2s',
                    }}
                  >
                    {m >= 1000 ? `${m / 1000}K` : m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sandbox viewport */}
          <div
            style={{
              ...sandboxStyle,
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid var(--line)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              transition: 'all 0.4s cubic-bezier(.22,1,.36,1)',
            }}
          >
            <SimulationSandbox result={result} viewMode={viewMode} />
          </div>
        </div>
      </div>
    </>
  );
}
