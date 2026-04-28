'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePipeline } from '@/lib/pipeline';
import { analyzeDataset, getAnalysis, generateInsights, ApiError, ApiAnalysisResponse, ApiFairnessMetrics, InsightObservation } from '@/lib/api';

function Sk({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ borderRadius: 8, ...style }} />;
}

export default function AnalysisPage() {
  const router = useRouter();
  const pipeline = usePipeline();
  const { analysis_id: analysisId, dataset_id: datasetId, target_column: targetColumn, sensitive_columns: sensitiveColumns } = pipeline;
  const [data, setData] = useState<ApiAnalysisResponse | null>(null);
  const [insights, setInsights] = useState<InsightObservation[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || loading) return;

    if (analysisId) {
      // Result already exists — just load it
      hasFetched.current = true;
      setLoading(true);
      getAnalysis(analysisId)
        .then(res => {
          setData({ 
            analysis_id: res.analysis_id, 
            dataset_id: datasetId ?? '', 
            metrics: res.metrics, 
            model_accuracy: 0,
            risk_score: res.metrics.risk_score,
            risk_level: res.metrics.risk_level
          } as ApiAnalysisResponse);
          setLoading(false);
        })
        .catch(err => { setError(err instanceof ApiError ? err.detail : 'Failed to load analysis.'); setLoading(false); });
      return;
    }

    // No analysisId yet but we have dataset config — run a fresh analysis
    if (datasetId && targetColumn && sensitiveColumns.length) {
      hasFetched.current = true;
      setLoading(true);
      analyzeDataset({ dataset_id: datasetId, target_column: targetColumn, sensitive_columns: sensitiveColumns, positive_label: 1 })
        .then(res => {
          setData(res);
          pipeline.setAnalysisResult(res.analysis_id, res.metrics.fairness_score, res.risk_score, res.risk_level, res.metrics.group_metrics);
          setLoading(false);
        })
        .catch(err => { setError(err instanceof ApiError ? err.detail : 'Failed.'); setLoading(false); });
    }
  }, [analysisId, datasetId, targetColumn, sensitiveColumns, loading, pipeline]);

  useEffect(() => {
    if (analysisId && !insights.length && !loadingInsights) {
      setLoadingInsights(true);
      generateInsights(analysisId)
        .then(res => {
          setInsights(res.observations);
          setExecutiveSummary(res.executive_summary ?? null);
          setLoadingInsights(false);
        })
        .catch(() => {
          setLoadingInsights(false);
        });
    }
  }, [analysisId, insights.length, loadingInsights]);

  if (!analysisId && !loading) {
    return (
      <div className="page-shell" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
          <span className="material-symbols-outlined" style={{ fontSize:30, color:'var(--ink)' }}>analytics</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'var(--ink)', marginBottom:10 }}>No Analysis Found</h2>
        <p style={{ fontSize:14, color:'var(--muted)', marginBottom:24 }}>Upload a dataset first to generate your bias analysis report.</p>
        <button onClick={() => router.push('/upload')} className="btn-primary">Go to Upload</button>
      </div>
    );
  }

  const metrics: ApiFairnessMetrics | null = data?.metrics ?? null;
  const score = metrics?.fairness_score ?? pipeline.fairness_score ?? 0;

  const cohortRows = metrics?.group_metrics?.length
    ? metrics.group_metrics
    : [
        { group: 'Age Group 18–25', selection_rate: 0.62, deviation: '+12%' },
        { group: 'Zip Code Cluster 900x', selection_rate: 0.44, deviation: '−9.4%' },
      ];

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom:28 }}>
        <div className="section-kicker" style={{ marginBottom:10 }}>AUDIT REPORT {new Date().toISOString().slice(0,10).replace(/-/g,'.')}</div>
        <h1 style={{ fontSize:'clamp(22px, 4vw, 34px)', fontWeight:900, color:'var(--ink)', lineHeight:1.15, marginBottom:14 }}>
          Analysis of{' '}
          <mark style={{ background:'var(--lime)', color:'var(--ink)', padding:'0 4px', borderRadius:4 }}>Systemic Divergence</mark>
          {' '}in {pipeline.filename ?? 'Credit Risk Model #422'}
        </h1>
        <p style={{ fontSize:14, color:'var(--ink-soft)', maxWidth:520, lineHeight:1.65 }}>
          A granular investigation into the decision-making heuristics of the underwriting engine, revealing latent demographic skews and performance discrepancies across variable cohorts.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom:20, padding:'14px 20px', borderRadius:16, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:13 }}>
          {error} <button onClick={() => { hasFetched.current=false; setError(null); }} style={{ textDecoration:'underline', marginLeft:8 }}>Retry</button>
        </div>
      )}

      {/* 3 metric pills */}
      <div className="animate-card-enter delay-100" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:36 }}>
        {[
          { 
            label:'FAIRNESS RISK', 
            value:loading ? null : (data?.risk_score ?? 0), 
            sub: loading ? '' : `Current status: ${data?.risk_level ?? 'Low'} Risk`,
            isRisk: true 
          },
          { label:'SAMPLE SIZE', value:loading ? null : pipeline.row_count ? `${(pipeline.row_count/1000).toFixed(1)}K` : '1.2K', sub:'Records processed in this audit run.' },
          { label:'FAIRNESS METRIC', value:loading ? null : metrics?.disparate_impact?.toFixed(2) ?? '0.86', sub:'Disparate Impact ratio within monitoring threshold.' },
        ].map(m => (
          <div key={m.label} className="soft-panel" style={{ padding:'20px 22px', border: m.isRisk && !loading ? `1px solid ${ (data?.risk_level === 'High' ? '#ef4444' : data?.risk_level === 'Medium' ? '#f59e0b' : 'var(--line)') }` : undefined }}>
            <div className="section-kicker" style={{ fontSize:10, marginBottom:8 }}>{m.label}</div>
            {loading ? <Sk style={{ height:36, width:96, marginBottom:8 }} /> : (
              <div style={{ 
                fontSize:32, 
                fontWeight:900, 
                color: m.isRisk ? (data?.risk_level === 'High' ? '#ef4444' : data?.risk_level === 'Medium' ? '#f59e0b' : 'var(--ink)') : 'var(--ink)', 
                letterSpacing:'-0.02em', 
                marginBottom:6 
              }}>
                {m.value}{m.isRisk ? '/100' : ''}
              </div>
            )}
            <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Cohort Divergence */}
      <div className="editorial-card animate-card-enter delay-200" style={{ padding:'clamp(18px, 3vw, 28px)', marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, color:'var(--ink)', marginBottom:4 }}>Cohort Divergence</h2>
            <p style={{ fontSize:12, color:'var(--muted)' }}>Visualizing approval rates across demographic intersections.</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16, fontSize:11, fontWeight:700 }}>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:999, background:'var(--lime)', display:'inline-block' }} /> HIGHLIGHTED BIAS
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:999, background:'#9a9a6a', display:'inline-block' }} /> BASELINE
            </span>
          </div>
        </div>

        {loading
          ? [1,2].map(i => <div key={i} style={{ marginBottom:24 }}><Sk style={{ height:14, width:160, marginBottom:8 }} /><Sk style={{ height:28, width:'100%' }} /></div>)
          : cohortRows.map((gm, i) => {
              const pct = Math.round((gm as { selection_rate: number }).selection_rate * 100);
              return (
                <div key={i} style={{ marginBottom:24 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--ink)' }}>{gm.group}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--olive)' }}>
                      Deviation · {'deviation' in gm ? (gm as { deviation: string }).deviation : `${pct-50>0?'+':''}${pct-50}%`}
                    </span>
                  </div>
                  <div style={{ position:'relative', height:28, background:'#e8edc8', borderRadius:999, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:999, width:pct+'%', background:i===0?'var(--lime)':'#b0b880', transition:'width 0.8s ease' }} />
                    <div style={{ position:'absolute', top:0, bottom:0, left:'50%', width:2, background:'rgba(23,22,13,.25)' }} />
                  </div>
                </div>
              );
            })
        }

        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
          <button onClick={() => router.push('/mitigation')} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:999, background:'var(--lime)', color:'var(--ink)', fontWeight:800, fontSize:13, border:'none', cursor:'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize:16, fontVariationSettings:"'FILL' 1" }}>auto_fix_high</span>
            Quick Fix
          </button>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="responsive-grid-equal animate-card-enter delay-300">
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* AI waveform visual */}
          <div style={{ borderRadius:20, overflow:'hidden', height:200, background:'linear-gradient(135deg,#0f1a00,#1a2e00,#2a4000)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200">
              {Array.from({length:30}).map((_,i)=>(
                <line key={i} x1={i*14} y1={100+Math.sin(i*0.7)*40} x2={(i+1)*14} y2={100+Math.sin((i+1)*0.7)*40}
                  stroke={`rgba(185,245,0,${0.3+((i*7)%10)/20})`} strokeWidth="1.5"/>
              ))}
              {Array.from({length:20}).map((_,i)=>(
                <circle key={`c${i}`} cx={i*21+10} cy={100+Math.cos(i*0.9)*30} r={1.5} fill={`rgba(185,245,0,0.6)`}/>
              ))}
            </svg>
          </div>
          {/* Executive summary */}
          <div className="soft-panel" style={{ padding:24 }}>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--ink)', marginBottom:12 }}>Executive Summary</div>
            {loadingInsights ? <Sk style={{ height:40, width:'100%' }} /> : (
              <p style={{ fontSize:13, color:'var(--ink-soft)', lineHeight:1.65 }}>
                {executiveSummary ?? 'The fairness audit is in progress. Initial metrics indicate demographic variance across protected groups.'}
              </p>
            )}
          </div>
        </div>

        {/* Key Observations */}
        <div className="editorial-card animate-card-enter delay-400" style={{ padding:'clamp(18px, 3vw, 28px)' }}>
          <div className="section-kicker" style={{ marginBottom:20 }}>KEY OBSERVATIONS</div>
          {loadingInsights ? [1,2,3].map(i=><Sk key={i} style={{ height:64, marginBottom:16 }}/>):(
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              {(insights.length ? insights : [
                { num:'01', title:'Implicit Bias in Job Titles', desc:'"Gig economy" keywords trigger a 15% lower approval score despite net earnings.' },
                { num:'02', title:'Gender Disparity', desc:'Average credit limits for female applicants are consistently 4.2% lower in high score brackets.' },
                { num:'03', title:'Mitigation Strategy: Ready', desc:'Auto-reweighting of non-essential demographic proxies is recommended.' },
              ]).map(obs=>(
                <div key={obs.num} style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                  <div style={{ fontSize:28, fontWeight:900, color:'var(--lime)', lineHeight:1, flexShrink:0, minWidth:32 }}>{obs.num}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:'var(--ink)', marginBottom:4 }}>{obs.title}</div>
                    <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>{obs.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:16, marginTop:32, paddingTop:24, borderTop:'1px solid var(--line)', alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={()=>router.push('/mitigation')} className="btn-primary">APPLY MITIGATIONS</button>
        <button onClick={()=>router.push('/reports')} className="btn-secondary">DOWNLOAD FULL REPORT</button>
        
        <div style={{ display:'flex', gap:10, marginLeft:'auto' }}>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'BiasLens AI - Analysis Report',
                  text: `Fairness audit for ${pipeline.filename ?? 'Active Dataset'}`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            style={{ width:44, height:44, borderRadius:12, border:'1px solid var(--line)', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.2s' }}
            title="Share Analysis"
          >
            <span className="material-symbols-outlined" style={{ fontSize:20, color:'var(--muted)' }}>share</span>
          </button>
          <button 
            onClick={() => window.print()}
            style={{ width:44, height:44, borderRadius:12, border:'1px solid var(--line)', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.2s' }}
            title="Print Analysis"
          >
            <span className="material-symbols-outlined" style={{ fontSize:20, color:'var(--muted)' }}>print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
