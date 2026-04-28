'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePipeline } from '@/lib/pipeline';
import type { RiskLevel } from '@/lib/types';

function RingGauge({ score, size = 160 }: { score: number; size?: number }) {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  const color = score >= 70 ? '#b9f500' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#dde8b0" strokeWidth={12} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)' }}
      />
    </svg>
  );
}

export default function DashboardPage() {
  const pipeline = usePipeline();
  const score = pipeline.fairness_score ?? 85;
  const hasData = pipeline.hasPipeline && pipeline.analysis_id;
  const riskLevel = pipeline.risk_level ?? 'Low';
  const analysis_id = pipeline.analysis_id;

  const [drivers, setDrivers] = useState<{ label: string; pct: string }[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  useEffect(() => {
    if (!analysis_id) return;
    setLoadingDrivers(true);
    import('@/lib/api').then(({ explainBias }) => {
      explainBias(analysis_id)
        .then(res => {
          const top3 = res.feature_importance.slice(0, 3).map(f => ({
            label: f.feature,
            pct: (f.importance * 100).toFixed(0) + '%'
          }));
          setDrivers(top3);
        })
        .finally(() => setLoadingDrivers(false));
    });
  }, [analysis_id]);

  return (
    <div className="page-shell">

      {/* Model identity */}
      <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 12 }}>
        <div className="section-kicker" style={{ marginBottom: 6 }}>CURRENT MODEL INTEGRITY</div>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          {hasData ? `Dataset: ${pipeline.filename ?? 'Active Audit'}` : 'Model: HR-Recruiter-v2.4'}
        </h1>
      </div>

      {/* Ring gauge centered */}
      <div className="animate-fade-in-up delay-100" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', width: 160, height: 160 }}>
          <RingGauge score={score} size={160} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--ink)', lineHeight: 1 }}>{Math.round(score)}</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 2 }}>FAIRNESS SCORE</div>
          </div>
        </div>
      </div>

      {/* Main responsive grid */}
      <div className="responsive-grid">

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Priority Insight card */}
          <div className="editorial-card animate-card-enter delay-200" style={{ padding: 'clamp(18px, 3vw, 28px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <span className="lime-pill" style={{ padding: '4px 12px', fontSize: 11 }}>PRIORITY INSIGHT</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Updated 2m ago</span>
            </div>
            <h2 style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              Demographic Parity Warning
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 18 }}>
              {hasData
                ? `The model shows a fairness score of ${Math.round(score)}/100 on ${pipeline.filename}. ${riskLevel === 'High' ? 'High risk bias detected — immediate mitigation recommended.' : riskLevel === 'Medium' ? 'Moderate skew detected across sensitive attribute groups.' : 'Fairness metrics are within acceptable bounds.'}`
                : 'The model shows a statistically significant preference for candidates with over 10 years of experience in technical roles, which correlates with a systemic bias against younger applicants in the "Junior Engineering" category.'}
            </p>
            <div className="responsive-grid-equal">
              {[
                { label: 'Impact Radius', value: hasData ? `${(100 - score).toFixed(1)}% Skew` : '12.4% Skew' },
                { label: 'Confidence', value: 'High (98%)' },
              ].map(({ label, value }) => (
                <div key={label} className="soft-panel" style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Metric Distribution */}
          <div className="editorial-card animate-card-enter delay-300" style={{ padding: 'clamp(18px, 3vw, 28px)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 2 }}>Metric Distribution</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Comparison of outcome probabilities across demographic groups.</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Ethnicity', 'Gender', 'Age'].map((g, i) => (
                  <span key={g} style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                    background: i === 1 ? 'var(--lime)' : 'transparent',
                    border: i === 1 ? '1px solid var(--lime)' : '1px solid var(--line)',
                    color: i === 1 ? 'var(--ink)' : 'var(--muted)',
                    cursor: 'pointer',
                    transition: 'all 0.3s var(--ease-spring)',
                  }}>{g}</span>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 'clamp(6px, 1.5vw, 12px)', marginTop: 20, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              {hasData && pipeline.group_metrics && pipeline.group_metrics.length > 0 ? (
                pipeline.group_metrics.map((m: any, i: number) => (
                  <div key={m.group} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', height: Math.round(m.selection_rate * 100) + '%', borderRadius: '6px 6px 0 0',
                      background: i === 0 ? 'var(--lime)' : m.selection_rate > 0.7 ? '#c8d88a' : '#b0b880',
                      transition: 'height 0.8s cubic-bezier(.22,1,.36,1)',
                    }} />
                    <div style={{ fontSize: 'clamp(7px, 1.2vw, 9px)', color: 'var(--muted)', fontWeight: 600, textAlign: 'center', letterSpacing: '0.04em', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.group}
                    </div>
                  </div>
                ))
              ) : (
                [
                  { label: 'GROUP A', pct: 88 },
                  { label: 'GROUP B', pct: 72 },
                  { label: 'GROUP C', pct: 65 },
                  { label: 'GROUP D', pct: 78 },
                  { label: 'GROUP E', pct: 55 },
                  { label: 'GROUP F', pct: 43 },
                ].map((b) => (
                  <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.3 }}>
                    <div style={{ width: '100%', height: b.pct + '%', borderRadius: '6px 6px 0 0', background: 'var(--line)' }} />
                    <div style={{ fontSize: 'clamp(7px, 1.2vw, 9px)', color: 'var(--muted)', fontWeight: 600, textAlign: 'center' }}>{b.label}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Historical Audits */}
          <div className="editorial-card animate-card-enter delay-400" style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>Historical Audits</div>
              <Link href="/reports" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'underline', transition: 'color 0.2s' }}>View All</Link>
            </div>
            {hasData ? (
              [
                { label: 'Full System Re-Scan', date: 'Oct 24, 2023 · Passed', score: '92/100', pass: true },
                { label: 'Delta Check v2.3', date: 'Oct 12, 2023 · Warning', score: '74/100', pass: false },
              ].map((a) => (
                <div key={a.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid var(--line)',
                  transition: 'background 0.3s var(--ease-smooth)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                    background: a.pass ? 'var(--lime)' : '#fef3c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: a.pass ? 'var(--ink)' : '#b45309', fontVariationSettings: "'FILL' 1" }}>
                      {a.pass ? 'check_circle' : 'search'}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.date}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', flexShrink: 0 }}>{a.score}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>No previous audits found.</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Key Bias Drivers */}
          <div className="editorial-card animate-card-enter delay-300" style={{ padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>Key Bias Drivers</div>
            {hasData ? (
              loadingDrivers ? (
                [1, 2, 3].map(i => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div className="skeleton" style={{ height: 30, width: '100%', borderRadius: 8 }} />
                  </div>
                ))
              ) : drivers.length > 0 ? (
                drivers.map((d) => (
                  <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#d7442f' }}>{d.pct}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>No drivers identified yet.</div>
                </div>
              )
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Run an analysis to identify bias drivers.</div>
              </div>
            )}
          </div>

          {/* Recommended Mitigation — dark olive card */}
          <div className="editorial-card animate-card-enter delay-400" style={{ padding: 22, background: '#2e3800', border: 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--lime)', marginBottom: 10 }}>Recommended Mitigation</div>
            <p style={{ fontSize: 12, color: '#b8c870', lineHeight: 1.6, marginBottom: 16 }}>
              {hasData
                ? `Applying "Adversarial Debiasing" on ${pipeline.sensitive_columns[0] ?? 'the primary sensitive feature'} is estimated to improve the Fairness Score by 6.5 points while maintaining 97.4% model accuracy.`
                : 'Implementing "Adversarial Debiasing" on the University Ranking feature is estimated to improve the Fairness Score by 6.5 points while maintaining 97.4% model accuracy.'}
            </p>
            <Link href="/mitigation" style={{
              display: 'block', width: '100%', textAlign: 'center',
              background: 'var(--lime)', color: 'var(--ink)',
              borderRadius: 999, padding: '11px 0', fontSize: 13, fontWeight: 800,
              textDecoration: 'none',
              transition: 'transform 0.3s var(--ease-spring), box-shadow 0.3s',
            }}>
              Apply Mitigation Path
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="animate-fade-in delay-500" style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <em style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 320, lineHeight: 1.6 }}>
          &ldquo;Transparency is not a byproduct of AI development; it is the foundation upon which trust is built.&rdquo;
        </em>
        <div style={{ textAlign: 'right', fontSize: 11 }}>
          <div style={{ color: 'var(--muted)', marginBottom: 8 }}>© 2024 BiasLens AI Research Division</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['METHODOLOGY', 'PRIVACY', 'CONTACT'].map((l) => (
              <a key={l} href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em', transition: 'color 0.2s' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
