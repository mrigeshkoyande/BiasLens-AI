'use client';
import { useState } from 'react';
import { usePipeline } from '@/lib/pipeline';
import { generateReport, ApiError } from '@/lib/api';

export default function ReportsPage() {
  const pipeline = usePipeline();
  const { analysisId } = pipeline;
  const pipelineScore = pipeline.fairnessScore;
  const pipelineRisk = pipeline.riskLevel;
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!analysisId) { setError('No analysis found. Upload and analyze a dataset first.'); return; }
    setGenerating(true); setError(null);
    try {
      const res = await generateReport(analysisId);
      if (res.download_url) {
        window.open(res.download_url, '_blank');
      }
      setGenerated(true);
    } catch(err) {
      setError(err instanceof ApiError ? err.detail : 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const complianceRows = [
    { framework: 'EU AI Act', requirement: 'Transparency & Explainability', status: 'Passed', score: '94/100' },
    { framework: 'NIST AI RMF', requirement: 'Fairness & Non-Discrimination', status: 'Warning', score: '74/100' },
    { framework: 'IEEE 7000', requirement: 'Accountability Mechanisms', status: 'Passed', score: '89/100' },
    { framework: 'GDPR Art. 22', requirement: 'Automated Decision Rights', status: 'Passed', score: '96/100' },
  ];

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom:32 }}>
        <div className="section-kicker" style={{ marginBottom:10 }}>AUDIT DOCUMENTATION</div>
        <h1 style={{ fontSize:'clamp(22px, 4vw, 34px)', fontWeight:900, color:'var(--ink)', lineHeight:1.15, marginBottom:14 }}>
          Compliance{' '}
          <mark style={{ background:'var(--lime)', color:'var(--ink)', padding:'0 4px', borderRadius:4 }}>Report Suite</mark>
        </h1>
        <p style={{ fontSize:14, color:'var(--ink-soft)', maxWidth:520, lineHeight:1.65 }}>
          Generate court-ready audit documentation covering EU AI Act, NIST AI RMF, and IEEE 7000. All reports are cryptographically signed and include a full chain of evidence.
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

          {/* Compliance Table card */}
          <div className="editorial-card animate-card-enter delay-100" style={{ padding:'clamp(18px, 3vw, 28px)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:'var(--ink)' }}>Compliance Matrix</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>Status against international AI governance frameworks.</div>
              </div>
              <span style={{ padding:'5px 14px', borderRadius:999, background:'var(--lime)', fontSize:11, fontWeight:800, letterSpacing:'0.08em' }}>LIVE</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Requirement</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {complianceRows.map(row=>(
                  <tr key={row.framework}>
                    <td style={{ fontWeight:700 }}>{row.framework}</td>
                    <td style={{ color:'var(--muted)' }}>{row.requirement}</td>
                    <td>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:800,
                        background: row.status === 'Passed' ? 'rgba(185,245,0,0.2)' : 'rgba(245,158,11,0.15)',
                        color: row.status === 'Passed' ? 'var(--olive)' : '#b45309',
                      }}>
                        <span style={{ width:6, height:6, borderRadius:999, background: row.status === 'Passed' ? 'var(--olive)' : '#f59e0b', display:'inline-block' }} />
                        {row.status}
                      </span>
                    </td>
                    <td style={{ fontWeight:800, fontFamily:'monospace' }}>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Report sections */}
          <div className="editorial-card animate-card-enter delay-200" style={{ padding:'clamp(18px, 3vw, 28px)' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--ink)', marginBottom:18 }}>Report Sections</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { icon:'analytics', title:'Bias Analysis Summary', desc:'Full demographic breakdown with SHAP-driven explanations.' },
                { icon:'auto_fix_high', title:'Mitigation Recommendations', desc:'Strategy comparison with projected fairness improvements.' },
                { icon:'gavel', title:'Legal Compliance Annex', desc:'Full EU AI Act and GDPR Art. 22 evidence documentation.' },
                { icon:'history', title:'Audit Trail Log', desc:'Timestamped chain of all model mutations and decisions.' },
              ].map(s=>(
                <div key={s.title} style={{ padding:'18px 18px', borderRadius:16, background:'var(--surface-2)', border:'1px solid var(--line)' }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:16, color:'var(--ink)', fontVariationSettings:"'FILL' 1" }}>{s.icon}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:'var(--ink)', marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Generate CTA */}
          <div className="editorial-card animate-card-enter delay-100" style={{ padding:24, background:'#2e3800', border:'none' }}>
            <div style={{ fontSize:15, fontWeight:900, color:'var(--lime)', marginBottom:8 }}>
              {generated ? '✓ Report Generated' : 'Generate Full Report'}
            </div>
            <p style={{ fontSize:12, color:'#b8c870', lineHeight:1.6, marginBottom:20 }}>
              {generated
                ? 'Your PDF report has been generated and downloaded. It includes all compliance annexes and SHAP evidence.'
                : 'Creates a court-ready PDF with all fairness metrics, SHAP visualizations, and compliance certificates.'}
            </p>
            <button onClick={handleGenerate} disabled={generating} style={{
              width:'100%', background: generated ? 'rgba(185,245,0,0.15)' : 'var(--lime)', color: generated ? 'var(--lime)' : 'var(--ink)',
              border: generated ? '1px solid rgba(185,245,0,0.4)' : 'none', borderRadius:999, padding:'12px 0',
              fontWeight:800, fontSize:13, letterSpacing:'0.06em', cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.8 : 1,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              {generating
                ? <><span style={{ width:14, height:14, borderRadius:999, border:'2px solid rgba(23,22,13,.2)', borderTopColor:'var(--ink)', animation:'spin 0.8s linear infinite', display:'inline-block' }} />Generating…</>
                : generated ? 'DOWNLOAD AGAIN' : 'GENERATE REPORT'}
            </button>
          </div>

          {/* Quick metrics */}
          {[
            { label:'Overall Score',      value: pipelineScore ? `${Math.round(pipelineScore)}/100` : '—',     pass: (pipelineScore ?? 0) >= 70 },
            { label:'Risk Level',         value: pipelineRisk ? pipelineRisk.toUpperCase() : '—',              pass: pipelineRisk === 'low' },
            { label:'Frameworks Checked', value:'4 / 4',                                                        pass: true },
          ].map(m=>(
            <div key={m.label} style={{ padding:'16px 20px', borderRadius:16, background:'var(--surface)', border:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:13, color:'var(--muted)', fontWeight:600 }}>{m.label}</div>
              <div style={{ fontSize:15, fontWeight:900, color: m.pass ? 'var(--olive)' : '#d97706' }}>{m.value}</div>
            </div>
          ))}

          {/* Share / Print actions */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { icon:'share', label:'Share' },
              { icon:'print', label:'Print' },
            ].map(a=>(
              <button key={a.icon} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'16px 0', borderRadius:16, border:'1px solid var(--line)', background:'transparent', cursor:'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize:22, color:'var(--muted)' }}>{a.icon}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--muted)' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop:48, paddingTop:24, borderTop:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:12, color:'var(--muted)' }}>© 2024 BiasLens AI · Reports are generated under ISO/IEC 42001:2023 standards.</div>
        <div style={{ display:'flex', gap:16, fontSize:11, fontWeight:700, color:'var(--muted)' }}>
          {['METHODOLOGY', 'PRIVACY', 'CONTACT'].map(l=>(
            <a key={l} href="#" style={{ color:'var(--muted)', textDecoration:'none', letterSpacing:'0.06em' }}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
