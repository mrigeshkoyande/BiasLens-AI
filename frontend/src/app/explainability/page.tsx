'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePipeline } from '@/lib/pipeline';
import { explainBias, ApiError, ApiExplanationResponse } from '@/lib/api';

function Sk({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ borderRadius:8, ...style }} />;
}

export default function ExplainabilityPage() {
  const router = useRouter();
  const { analysisId } = usePipeline();
  const [data, setData] = useState<ApiExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId || data || loading) return;
    setLoading(true);
    explainBias(analysisId)
      .then(res => { setData(res); setLoading(false); })
      .catch(err => { setError(err instanceof ApiError ? err.detail : 'Failed to load.'); setLoading(false); });
  }, [analysisId, data, loading]);

  if (!analysisId) {
    return (
      <div className="page-shell" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
          <span className="material-symbols-outlined" style={{ fontSize:30, color:'var(--ink)' }}>visibility</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'var(--ink)', marginBottom:10 }}>No Analysis Available</h2>
        <p style={{ fontSize:14, color:'var(--muted)', marginBottom:24 }}>Run a bias analysis first.</p>
        <button onClick={() => router.push('/upload')} className="btn-primary">Go to Upload</button>
      </div>
    );
  }

  const features = data?.feature_importance ?? [
    { feature: 'Zip Code Density', importance: 0.42, shap_value: 0.42, direction: 'increases_bias' as const },
    { feature: 'Income Frequency',  importance: 0.28, shap_value: 0.28, direction: 'decreases_bias' as const },
    { feature: 'Age Group',         importance: 0.16, shap_value: 0.16, direction: 'increases_bias' as const },
    { feature: 'Education Level',   importance: 0.11, shap_value: 0.11, direction: 'neutral' as const },
  ];
  const maxImp = Math.max(...features.map(f => f.importance));

  return (
    <div className="page-shell">
      {/* Header kicker */}
      <div style={{ display:'inline-block', padding:'5px 14px', borderRadius:999, background:'var(--lime)', fontSize:12, fontWeight:800, letterSpacing:'0.08em', marginBottom:16 }}>
        ENGINE LOGS: V4.2
      </div>

      <h1 style={{ fontSize:'clamp(22px, 4vw, 32px)', fontWeight:900, color:'var(--ink)', marginBottom:10 }}>Explainability Hub</h1>
      <p style={{ fontSize:14, color:'var(--ink-soft)', maxWidth:560, lineHeight:1.65, marginBottom:32 }}>
        Deconstructing the neural pathways of your model. We use SHAP (SHapley Additive exPlanations) values to isolate the exact features driving biased outcomes.
      </p>

      {error && (
        <div style={{ marginBottom:20, padding:'14px 20px', borderRadius:16, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:13 }}>
          {error}
        </div>
      )}

      <div className="responsive-grid">

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Human-Readable Insight */}
          <div className="editorial-card animate-card-enter delay-100" style={{ padding:'clamp(18px, 3vw, 28px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize:20, color:'var(--ink)' }}>psychology</span>
              </div>
              <div style={{ fontSize:16, fontWeight:800, color:'var(--ink)' }}>Human-Readable Insight</div>
            </div>

            {loading ? <Sk style={{ height:80, marginBottom:16 }} /> : (
              <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.7, marginBottom:18 }}>
                {data?.explanations?.[0]?.text ?? (
                  <>The current model exhibits a high sensitivity to <strong style={{ color:'var(--ink)' }}>Geographic Proxies</strong>. Analysis reveals that zip codes are acting as a secondary feature for socio-economic status, inadvertently creating a 14% variance in credit approval rates across demographic clusters.</>
                )}
              </p>
            )}

            <div style={{ display:'flex', gap:8 }}>
              {['LIVE SCENE: 0.82', 'BIAS IMPACT: HIGH'].map(tag => (
                <span key={tag} style={{ padding:'4px 12px', borderRadius:999, border:'1px solid var(--line)', fontSize:11, fontWeight:700, color:'var(--muted)', letterSpacing:'0.04em' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Feature Importance SHAP */}
          <div className="editorial-card animate-card-enter delay-200" style={{ padding:'clamp(18px, 3vw, 28px)' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--ink)', marginBottom:4 }}>Feature Importance (SHAP)</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', letterSpacing:'0.08em' }}>GLOBAL INFLUENCE ON PREDICTION</div>
              <div style={{ display:'flex', gap:14, fontSize:11, fontWeight:700 }}>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:999, background:'var(--lime)', display:'inline-block' }} /> POSITIVE
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:999, background:'#b0b880', display:'inline-block' }} /> NEGATIVE
                </span>
              </div>
            </div>

            {loading ? [1,2,3,4].map(i=>(
              <div key={i} style={{ marginBottom:20 }}>
                <Sk style={{ height:12, width:140, marginBottom:8 }} />
                <Sk style={{ height:10, width:'80%' }} />
              </div>
            )) : features.map(f => {
              const pct = (f.importance / maxImp) * 100;
              const isPos = f.direction !== 'increases_bias';
              return (
                <div key={f.feature} style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--ink)' }}>{f.feature}</span>
                    <span style={{ fontSize:12, fontWeight:800, color: isPos ? 'var(--olive)' : 'var(--danger)', fontFamily:'monospace' }}>
                      {isPos ? '+' : '-'}{f.importance.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ height:10, background:'var(--surface-3)', borderRadius:999, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:999, width:pct+'%', background: isPos ? 'var(--lime)' : '#b0b880', transition:'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Sample Analysis card */}
          <div className="editorial-card animate-card-enter delay-200" style={{ padding:22 }}>
            <div style={{ fontSize:14, fontWeight:800, color:'var(--muted)', marginBottom:4 }}>Sample Analysis #829</div>
            <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5, marginBottom:18 }}>
              Detailed view of a single instance where the model predicted &lsquo;High Risk&rsquo;.
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--surface-2)', borderRadius:12, marginBottom:16 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--muted)', letterSpacing:'0.06em' }}>DECISION SCORE</span>
              <span style={{ fontSize:22, fontWeight:900, color:'var(--ink)' }}>0.89</span>
            </div>
            <div style={{ height:6, background:'var(--surface-3)', borderRadius:999, overflow:'hidden', marginBottom:18 }}>
              <div style={{ height:'100%', width:'89%', background:'var(--lime)', borderRadius:999 }} />
            </div>

            {[
              { label:'Debt-to-Income', sub:'Strong negative correlation (−0.12)', icon:'trending_down' },
              { label:'Employment History', sub:'Positive influence (+0.08)', icon:'trending_up' },
            ].map(item=>(
              <div key={item.label} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
                <span className="material-symbols-outlined" style={{ fontSize:16, color:'var(--lime)', marginTop:2, fontVariationSettings:"'FILL' 1" }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)' }}>{item.label}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Neural Mapping visual */}
          <div style={{ borderRadius:20, overflow:'hidden', height:160, background:'linear-gradient(135deg,#2e3800,#1a2800)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 280 160" style={{ position:'absolute', inset:0 }}>
              {Array.from({length:12}).map((_,i)=>(
                <circle key={i} cx={(i%4)*70+35} cy={Math.floor(i/4)*50+30} r={8} fill="rgba(185,245,0,0.15)" stroke="rgba(185,245,0,0.4)" strokeWidth="1"/>
              ))}
              {Array.from({length:8}).map((_,i)=>(
                <line key={`l${i}`} x1={(i%4)*70+35} y1={30} x2={((i+2)%4)*70+35} y2={80} stroke="rgba(185,245,0,0.2)" strokeWidth="1"/>
              ))}
            </svg>
            <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
              <div style={{ fontSize:36, fontWeight:900, color:'var(--lime)', opacity:0.7 }}>AI</div>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--lime)', marginTop:4 }}>Neural Mapping</div>
              <div style={{ fontSize:11, color:'#b8c870' }}>Visualizing layer activation</div>
            </div>
          </div>

          {/* Needs Correction CTA */}
          <div className="editorial-card" style={{ padding:22, background:'var(--lime)', border:'none' }}>
            <div style={{ fontSize:15, fontWeight:900, color:'var(--ink)', marginBottom:8 }}>Needs Correction?</div>
            <p style={{ fontSize:12, color:'var(--olive-deep)', lineHeight:1.6, marginBottom:18 }}>
              Apply bias mitigation filters directly to the model weights to neutralize Zip Code influence.
            </p>
            <button onClick={()=>router.push('/mitigation')} style={{ width:'100%', background:'var(--olive-deep)', color:'#fbf8e8', border:'none', borderRadius:999, padding:'11px 0', fontWeight:800, fontSize:12, letterSpacing:'0.08em', cursor:'pointer' }}>
              JUMP TO MITIGATION
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop:48, paddingTop:24, borderTop:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:40 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--muted)', letterSpacing:'0.1em', marginBottom:4 }}>DOCUMENT ID</div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)' }}>BL-EXP-9920-X</div>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--muted)', letterSpacing:'0.1em', marginBottom:4 }}>LAST UPDATED</div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)' }}>OCT 24, 2023</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {['share','print'].map(ic=>(
            <button key={ic} style={{ width:40, height:40, borderRadius:12, border:'1px solid var(--line)', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize:18, color:'var(--muted)' }}>{ic}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
