'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePipeline } from '@/lib/pipeline';
import { applyFix, ApiError, ApiFixResponse } from '@/lib/api';

const STRATEGIES = [
  { id: 'reweight',             label: 'Reweighing',               icon: 'balance',       desc: 'Re-weights training samples to equalize selection rates across protected groups. No structural changes to the model.',                                              fairnessDelta: +12, accDelta: -0.4 },
  { id: 'fairness_constraint',  label: 'Adversarial Debiasing',    icon: 'shield',        desc: 'Trains a secondary adversarial model to suppress demographic-correlated features. High effectiveness, slightly higher compute.',                                   fairnessDelta: +22, accDelta: -1.8 },
  { id: 'threshold_adjust',     label: 'Calibrated Eq. Odds',      icon: 'tune',          desc: 'Adjusts output thresholds for each demographic group to equalize true/false positive rates post-processing.',                                                       fairnessDelta: +18, accDelta: -0.9 },
  { id: 'remove_sensitive',     label: 'Disparate Impact Remover', icon: 'auto_fix_high', desc: 'Transforms feature distributions so that protected attribute information is minimized without removing the feature entirely.',                                        fairnessDelta: +15, accDelta: -0.6 },
];

function Sk({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ borderRadius:8, ...style }} />;
}

export default function MitigationPage() {
  const router = useRouter();
  const pipeline = usePipeline();
  const { analysisId } = pipeline;
  const [selected, setSelected] = useState('reweight');
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<ApiFixResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const strategy = STRATEGIES.find(s => s.id === selected) ?? STRATEGIES[0];
  const baseFairness = Math.round(pipeline.fairnessScore ?? 67);
  const baseAcc = 94.2;

  if (!analysisId) {
    return (
      <div className="page-shell" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
          <span className="material-symbols-outlined" style={{ fontSize:30, color:'var(--ink)' }}>auto_fix_high</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'var(--ink)', marginBottom:10 }}>No Analysis Found</h2>
        <p style={{ fontSize:14, color:'var(--muted)', marginBottom:24 }}>Run an analysis first.</p>
        <button onClick={()=>router.push('/upload')} className="btn-primary">Go to Upload</button>
      </div>
    );
  }

  const handleApply = async () => {
    setApplying(true); setError(null);
    try {
      const res = await applyFix(
        analysisId!,
        selected as 'reweight' | 'remove_sensitive' | 'fairness_constraint' | 'threshold_adjust'
      );
      setResult(res);
    } catch(err) {
      setError(err instanceof ApiError ? err.detail : 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="page-shell">
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div className="section-kicker" style={{ marginBottom:10 }}>MITIGATION ENGINE</div>
        <h1 style={{ fontSize:'clamp(22px, 4vw, 34px)', fontWeight:900, color:'var(--ink)', lineHeight:1.15, marginBottom:14 }}>
          Neutralize the{' '}
          <mark style={{ background:'var(--lime)', color:'var(--ink)', padding:'0 4px', borderRadius:4 }}>Bias Vector</mark>
        </h1>
        <p style={{ fontSize:14, color:'var(--ink-soft)', maxWidth:520, lineHeight:1.65 }}>
          Select a de-biasing strategy aligned with your compliance requirements and re-run the model in a sandboxed environment to project fairness improvements before committing to production.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom:20, padding:'14px 20px', borderRadius:16, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:13 }}>
          {error}
        </div>
      )}

      <div className="responsive-grid">

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Strategy selector */}
          <div className="editorial-card animate-card-enter delay-100" style={{ padding:'clamp(18px, 3vw, 28px)' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--ink)', marginBottom:18 }}>Select Debiasing Strategy</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
              {STRATEGIES.map(s => {
                const active = selected === s.id;
                return (
                  <button key={s.id} onClick={()=>setSelected(s.id)} style={{
                    padding:'18px 18px', borderRadius:18, border: active ? '2px solid var(--lime)' : '1px solid var(--line)',
                    background: active ? 'rgba(185,245,0,0.08)' : 'transparent', textAlign:'left', cursor:'pointer', transition:'all 0.18s ease',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize:18, color: active ? 'var(--olive)' : 'var(--muted)', fontVariationSettings:"'FILL' 1" }}>{s.icon}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:'var(--ink)' }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5 }}>{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expected Impact */}
          <div className="soft-panel animate-card-enter delay-200" style={{ padding:'clamp(18px, 3vw, 28px)' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--ink)', marginBottom:18 }}>Expected Impact</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12 }}>
              {[
                { label:'Fairness Score Δ', value:`+${strategy.fairnessDelta}`, good:true },
                { label:'Model Accuracy Δ', value:`${strategy.accDelta}%`, good: strategy.accDelta >= 0 },
                { label:'Compute Overhead', value: strategy.id === 'adversarial' ? 'High' : 'Low', good: strategy.id !== 'adversarial' },
              ].map(m=>(
                <div key={m.label} style={{ padding:'16px 18px', borderRadius:16, background:'var(--surface-2)', border:'1px solid var(--line)' }}>
                  <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, marginBottom:8, letterSpacing:'0.06em' }}>{m.label}</div>
                  <div style={{ fontSize:22, fontWeight:900, color: m.good ? 'var(--olive)' : 'var(--danger)' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="editorial-card animate-card-enter delay-300" style={{ padding:'clamp(18px, 3vw, 28px)' }}>
              <div style={{ fontSize:16, fontWeight:800, color:'var(--ink)', marginBottom:18 }}>Mitigation Results</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                {[
                  { label:'RISK BEFORE', value: Math.round(result.before_risk_score), bg:'var(--surface-2)', color: '#ef4444' },
                  { label:'RISK AFTER',  value: Math.round(result.after_risk_score),  bg:'var(--lime)', color: 'var(--olive)' },
                ].map(p=>(
                  <div key={p.label} style={{ padding:24, borderRadius:20, background:p.bg, textAlign:'center' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', letterSpacing:'0.1em', marginBottom:12 }}>{p.label}</div>
                    <div style={{ fontSize:48, fontWeight:900, color: p.color, lineHeight:1 }}>{p.value}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--muted)', marginTop:4 }}>Fairness Risk</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, padding:'12px 16px', borderRadius:12, background:'rgba(185,245,0,0.1)', border:'1px solid rgba(185,245,0,0.3)' }}>
                <div style={{ fontSize:14, color:'var(--olive)', fontWeight:800 }}>Risk Reduction: -{result.improvement.toFixed(1)}%</div>
                <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:4 }}>{result.description}</div>
              </div>
              <div style={{ marginTop:18, display:'flex', gap:12 }}>
                <button onClick={()=>router.push('/reports')} className="btn-primary" style={{ flex:1 }}>Generate Report</button>
                <button onClick={()=>setResult(null)} className="btn-secondary" style={{ flex:1 }}>Apply Another</button>
              </div>
            </div>
          )}

          {/* Apply button */}
          {!result && (
            <button onClick={handleApply} disabled={applying} className="btn-dark" style={{ alignSelf:'flex-start', opacity: applying ? 0.7 : 1 }}>
              {applying ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:16, height:16, borderRadius:999, border:'2px solid rgba(251,248,232,.2)', borderTopColor:'#fbf8e8', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                  Applying…
                </span>
              ) : 'Apply Mitigation Strategy'}
            </button>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Bias Severity card */}
          <div className="editorial-card animate-card-enter delay-200" style={{ padding:24 }}>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--ink)', marginBottom:16 }}>Bias Severity Index</div>
            {[
              { label:'Geographic Proxy', sev:86, color:'var(--danger)' },
              { label:'Age Correlation', sev:72, color:'#f59e0b' },
              { label:'Credit History Length', sev:58, color:'#f59e0b' },
              { label:'Employment Type', sev:34, color:'var(--olive)' },
            ].map(s=>(
              <div key={s.label} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:'var(--ink)', fontWeight:600 }}>{s.label}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:s.color }}>{s.sev}%</span>
                </div>
                <div style={{ height:6, background:'var(--surface-3)', borderRadius:999, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:s.sev+'%', background:s.color, borderRadius:999, opacity:0.85 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Compliance target dark card */}
          <div className="editorial-card" style={{ padding:24, background:'#2e3800', border:'none' }}>
            <div style={{ fontSize:14, fontWeight:800, color:'var(--lime)', marginBottom:10 }}>Compliance Target</div>
            <p style={{ fontSize:12, color:'#b8c870', lineHeight:1.6, marginBottom:18 }}>
              EU AI Act requires a minimum fairness score of 80/100 for high-risk applications. Current: {baseFairness}/100. Gap: {Math.max(0, 80 - baseFairness)} points.
            </p>
            {['EU AI Act', 'IEEE 7000', 'NIST AI RMF'].map(std=>(
              <div key={std} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <span className="material-symbols-outlined" style={{ fontSize:14, color:'var(--lime)', fontVariationSettings:"'FILL' 1" }}>radio_button_unchecked</span>
                <span style={{ fontSize:12, color:'#b8c870', fontWeight:600 }}>{std}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
