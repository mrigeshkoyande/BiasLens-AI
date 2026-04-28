'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePipeline } from '@/lib/pipeline';
import { simulateImpact, ApiError, ApiSimulationResponse } from '@/lib/api';
import SimulationSlider from '@/components/simulation/SimulationSlider';

function Sk({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ borderRadius: 8, ...style }} />;
}

export default function SimulationPage() {
  const router = useRouter();
  const { analysisId, filename } = usePipeline();
  const [data, setData] = useState<ApiSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId || data || loading) return;
    setLoading(true);
    simulateImpact(analysisId, 10000)
      .then((res) => { setData(res); setLoading(false); })
      .catch((err) => {
        setError(err instanceof ApiError ? err.detail : 'Failed to run simulation.');
        setLoading(false);
      });
  }, [analysisId]);

  if (!analysisId) {
    return (
      <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 30, color: 'var(--ink)', fontVariationSettings: "'FILL' 1" }}>analytics</span>
        </div>
        <div className="section-kicker" style={{ marginBottom: 8 }}>Simulation Locked</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 10 }}>No Analysis Found</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, maxWidth: 380 }}>
          Upload a dataset and run an analysis to unlock the Impact Simulation engine.
        </p>
        <button onClick={() => router.push('/upload')} className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cloud_upload</span>
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
        <div className="section-kicker" style={{ marginBottom: 8 }}>MONTE CARLO PROJECTION · V2.0</div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14 }}>
          Simulating{' '}
          <mark style={{ background: 'var(--lime)', color: 'var(--ink)', padding: '0 6px', borderRadius: 6, fontStyle: 'normal' }}>
            Real-World Damage
          </mark>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 580, lineHeight: 1.7 }}>
          Bias isn't just a number — it's a liability. We've scaled your{' '}
          <strong>{filename ?? 'dataset'}</strong> metrics across a hypothetical population to project
          the cumulative human and financial cost of leaving the model unmitigated.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="responsive-grid">

        {/* LEFT: Simulation Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading ? (
            <div className="editorial-card" style={{ padding: 24 }}>
              <Sk style={{ height: 20, width: 220, marginBottom: 16 }} />
              <Sk style={{ height: 8, width: '100%', marginBottom: 24 }} />
              <Sk style={{ height: 260, width: '100%', borderRadius: 14 }} />
            </div>
          ) : data ? (
            <SimulationSlider
              baseResult={{
                totalApplicants: data.total_applicants,
                unfairRejections: data.unfair_rejections,
                costOfBias: data.cost_of_bias,
                affectedGroups: data.affected_groups.map((g) => ({
                  group: g.group,
                  affected: g.affected,
                  percentage: g.percentage,
                })),
                plainLanguageImpact: data.plain_language_impact,
              }}
            />
          ) : null}

          {/* Regulatory Liability card */}
          <div className="editorial-card animate-card-enter delay-200" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#ef4444', fontVariationSettings: "'FILL' 1" }}>gavel</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Legal Exposure</div>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--ink)', margin: 0 }}>Regulatory Liability</h3>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 16 }}>
              Under EEOC and EU AI Act guidelines, a disparate impact ratio below 0.80
              or a high demographic parity gap may trigger legal scrutiny and significant fines.
            </p>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <span>Estimated Legal Risk</span>
                <span style={{ color: '#ef4444' }}>High Priority</span>
              </div>
              <div style={{ height: 6, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #ef4444, #f59e0b)', width: '85%', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Methodology & CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Simulation Logic */}
          <div className="editorial-card animate-card-enter delay-100" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--olive)' }}>science</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Simulation Logic</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: 'casino', title: 'Monte Carlo Method', desc: 'Stochastic scaling of group-level disparities to larger populations.' },
                { icon: 'attach_money', title: 'Litigation Proxy', desc: 'Costs estimated at $100/unfair rejection based on historical HR settlements.' },
                { icon: 'diversity_3', title: 'Group Weighting', desc: 'Protected group distributions are preserved proportionally to the original dataset.' },
                { icon: 'open_in_new', title: 'Pop-Out Sandbox', desc: 'Launch results in an isolated 1:1, 4:3, 16:9 or 9:16 preview window.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--ink)', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            className="editorial-card animate-card-enter delay-200"
            style={{ padding: 24, background: 'var(--lime)', border: 'none' }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--olive-deep)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Ready to act?
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', marginBottom: 8 }}>
              Reduce this cost now.
            </h3>
            <p style={{ fontSize: 13, color: 'var(--olive-deep)', lineHeight: 1.6, marginBottom: 20 }}>
              Applying our "Reweighting" mitigation strategy can reduce these projected rejections
              by up to <strong>45%</strong> in one step.
            </p>
            <button
              onClick={() => router.push('/mitigation')}
              style={{
                width: '100%', background: 'var(--ink)', color: 'var(--lime)',
                border: 'none', borderRadius: 999, padding: '12px 0',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_fix_high</span>
              Jump to Mitigation
            </button>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'BiasLens AI — Simulation Results', url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }
              }}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>share</span>
              Share
            </button>
            <button
              onClick={() => window.print()}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
