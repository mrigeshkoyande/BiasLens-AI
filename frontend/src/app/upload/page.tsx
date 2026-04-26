'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePipeline } from '@/lib/pipeline';
import { uploadDataset, analyzeDataset, ApiError } from '@/lib/api';

export default function UploadPage() {
  const router = useRouter();
  const { setDatasetResult, setAnalysisConfig, setAnalysisResult } = usePipeline();

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.match(/\.(csv|json|jsonl|parquet)$/i)) {
      setError('Please upload a CSV, JSON, JSONL, or Parquet file.');
      return;
    }
    setFile(f);
    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      const uploadRes = await uploadDataset(f);
      setProgress(45);
      setDatasetResult(uploadRes.dataset_id, f.name, uploadRes.row_count, uploadRes.columns);

      // Auto-detect target + sensitive cols
      const cols = uploadRes.columns;
      const target = cols.find(c => ['label', 'target', 'outcome', 'approved', 'hired'].includes(c.name.toLowerCase()))?.name ?? cols[cols.length - 1]?.name ?? '';
      const sensitive = cols.filter(c => ['gender', 'race', 'age', 'ethnicity', 'zip', 'zipcode', 'postal'].some(k => c.name.toLowerCase().includes(k))).map(c => c.name);
      setAnalysisConfig(target, sensitive);

      setUploading(false);
      setAnalyzing(true);
      setProgress(60);

      const analysisRes = await analyzeDataset({
        dataset_id: uploadRes.dataset_id,
        target_column: target,
        sensitive_columns: sensitive.length ? sensitive : [cols[0]?.name ?? ''],
        positive_label: 1,
      });
      setProgress(100);
      setAnalysisResult(analysisRes.analysis_id, analysisRes.metrics.fairness_score, analysisRes.metrics.risk_level);
      setTimeout(() => router.push('/analysis'), 300);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Upload or analysis failed. Is the backend running?');
      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
    }
  }, [setDatasetResult, setAnalysisConfig, setAnalysisResult, router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const isLoading = uploading || analyzing;
  const loadLabel = uploading ? 'Uploading dataset…' : analyzing ? 'Running bias analysis…' : '';

  return (
    <div className="page-shell">

      {/* Page header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
        <div className="section-kicker" style={{ marginBottom: 8 }}>AUDIT PREPARATION</div>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 14, lineHeight: 1.15 }}>
          Feed the engine with your datasets.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', maxWidth: 560, lineHeight: 1.65 }}>
          To identify bias patterns, we need to analyze your model's input/output training data. Your data is encrypted and used only for the local scrutiny session.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="responsive-grid">

        {/* Left: Dataset Source card */}
        <div className="editorial-card animate-card-enter delay-100" style={{ padding: 'clamp(18px, 3vw, 28px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 3 }}>Dataset Source</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Upload CSV, JSON, or Parquet files.</div>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 999, background: 'var(--lime)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--ink)', fontVariationSettings: "'FILL' 1" }}>storage</span>
            </div>
          </div>

          {/* Dropzone */}
          <label
            className={`dropzone${dragging ? ' active' : ''}`}
            style={{ display: 'block', padding: '52px 32px', textAlign: 'center', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
            onDragEnter={e => { e.preventDefault(); setDragging(true); }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input type="file" accept=".csv,.json,.jsonl,.parquet" style={{ display: 'none' }} disabled={isLoading} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {isLoading ? (
              <div>
                <div style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span className="w-6 h-6 border-4 border-[#1a1a0e]/20 border-t-[#1a1a0e] rounded-full animate-spin" style={{ display: 'block', width: 24, height: 24, borderRadius: 999, border: '4px solid rgba(23,22,13,.2)', borderTopColor: 'var(--ink)', animation: 'spin 0.8s linear infinite' }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{loadLabel}</div>
                {progress > 0 && (
                  <div style={{ width: 200, height: 4, background: 'var(--line)', borderRadius: 2, margin: '8px auto 0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--lime)', width: progress + '%', borderRadius: 2, transition: 'width 0.4s ease' }} />
                  </div>
                )}
              </div>
            ) : file ? (
              <div>
                <div style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 26, color: 'var(--ink)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{file.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            ) : (
              <div>
                <div style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 26, color: 'var(--ink)', fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Drop your dataset here</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>Or click to browse from your local machine</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {['CSV', 'JSONL', 'PARQUET'].map(f => (
                    <span key={f} style={{ padding: '4px 14px', borderRadius: 999, border: '1px solid var(--line)', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em' }}>{f}</span>
                  ))}
                </div>
              </div>
            )}
          </label>

          {/* Template hint */}
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 14, background: 'rgba(185,245,0,0.08)', border: '1px solid rgba(185,245,0,0.18)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--olive)' }}>info</span>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              Need a template?{' '}
              <a href="#" style={{ color: 'var(--olive)', fontWeight: 700, textDecoration: 'underline' }}>Download the BiasLens Standard Format.</a>
            </span>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Data Hygiene Tips */}
          <div className="editorial-card animate-card-enter delay-200" style={{ padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 18 }}>Data Hygiene Tips</div>
            {[
              { icon: 'person_off', title: 'Remove PII', desc: 'Ensure names and addresses are anonymized before upload.' },
              { icon: 'balance', title: 'Balanced Features', desc: 'Include sensitive attributes (race, gender) for intersectional analysis.' },
              { icon: 'table_rows', title: 'Row Limit', desc: 'Up to 2GB or 5M rows per individual scrutiny session.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--ink)', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Connect S3 — dark card */}
          <div className="editorial-card animate-card-enter delay-300" style={{ padding: 24, background: '#2e3800', border: 'none' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--lime)', marginBottom: 10 }}>Connect S3</div>
            <p style={{ fontSize: 13, color: '#b8c870', lineHeight: 1.6, marginBottom: 20 }}>
              Stream directly from your enterprise data lake for real-time audits.
            </p>
            <button style={{
              width: '100%', background: 'rgba(185,245,0,0.12)', border: '1px solid rgba(185,245,0,0.3)',
              borderRadius: 999, padding: '11px 0', color: 'var(--lime)', fontWeight: 800, fontSize: 12,
              letterSpacing: '0.08em', cursor: 'pointer',
            }}>
              SETUP INTEGRATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
