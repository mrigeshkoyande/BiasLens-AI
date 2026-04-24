'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/layout/Header';
import {
  Upload, FileText, CheckCircle, AlertCircle, X,
  Database, Columns3, Table2, Loader2,
} from 'lucide-react';

interface FileState {
  file: File | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    status: 'idle',
    progress: 0,
  });

  const onDrop = useCallback((accepted: File[], rejected: { errors: { message: string }[] }[]) => {
    if (rejected.length > 0) {
      setFileState({ file: null, status: 'error', progress: 0, error: rejected[0].errors[0].message });
      return;
    }
    if (accepted.length === 0) return;
    const file = accepted[0];
    setFileState({ file, status: 'uploading', progress: 0 });

    // Simulate upload progress
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setFileState({ file, status: 'success', progress: 100 });
      } else {
        setFileState((prev) => ({ ...prev, progress: Math.round(p) }));
      }
    }, 200);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    disabled: fileState.status === 'uploading',
  });

  const reset = () => setFileState({ file: null, status: 'idle', progress: 0 });

  return (
    <>
      <Header
        title="Upload Dataset"
        subtitle="Upload a CSV file to begin your fairness audit"
        breadcrumbs={[{ label: 'BiasLens AI' }, { label: 'Upload' }]}
      />
      <div className="p-6 max-w-[760px] space-y-5">

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: FileText, label: 'CSV Format', desc: '.csv files only', color: '#00d4ff' },
            { icon: Database, label: 'Max Size', desc: '100 MB per file', color: '#7c3aed' },
            { icon: Columns3, label: 'Columns', desc: 'Any structure', color: '#10b981' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#f1f5f9]">{item.label}</div>
                <div className="text-[10px] text-[#475569]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Drop zone */}
        {fileState.status === 'idle' || fileState.status === 'error' ? (
          <div
            {...getRootProps()}
            className={`dropzone flex flex-col items-center justify-center py-16 px-8 text-center cursor-pointer transition-all ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))' }}
            >
              <Upload size={28} className="text-[#00d4ff]" />
            </div>
            <p className="text-[15px] font-semibold text-[#f1f5f9] mb-1">
              {isDragActive ? 'Drop your CSV here…' : 'Drag & drop your CSV file'}
            </p>
            <p className="text-[12px] text-[#475569] mb-4">or click to browse from your computer</p>
            <span className="btn-secondary text-[12px] py-2 px-4">Browse Files</span>
            {fileState.status === 'error' && (
              <p className="mt-4 text-[11px] text-[#ef4444] flex items-center gap-1">
                <AlertCircle size={12} /> {fileState.error}
              </p>
            )}
          </div>
        ) : null}

        {/* Upload progress */}
        {fileState.status === 'uploading' && fileState.file && (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                <Table2 size={16} className="text-[#00d4ff]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#f1f5f9] truncate">{fileState.file.name}</div>
                <div className="text-[11px] text-[#475569]">{(fileState.file.size / 1024).toFixed(1)} KB</div>
              </div>
              <Loader2 size={16} className="text-[#00d4ff] animate-spin" />
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${fileState.progress}%`, background: 'linear-gradient(90deg, #00d4ff, #7c3aed)' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#475569]">
              <span>Uploading…</span>
              <span>{fileState.progress}%</span>
            </div>
          </div>
        )}

        {/* Success state */}
        {fileState.status === 'success' && fileState.file && (
          <div className="rounded-2xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.04)] p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.12)] flex items-center justify-center">
                <CheckCircle size={18} className="text-[#10b981]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#f1f5f9] truncate">{fileState.file.name}</div>
                <div className="text-[11px] text-[#10b981]">Upload complete — ready for analysis</div>
              </div>
              <button onClick={reset} className="text-[#475569] hover:text-[#94a3b8] transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 btn-primary justify-center text-[13px] py-2.5">
                Start Bias Analysis
              </button>
              <button onClick={reset} className="btn-secondary text-[13px] py-2.5 px-4">
                Upload Another
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-5">
          <h3 className="text-[12px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Tips for Best Results</h3>
          <ul className="space-y-2">
            {[
              'Include a binary target column (e.g., hired, approved, selected)',
              'Keep sensitive attributes like gender, age, and race in the dataset for analysis',
              'Ensure at least 500 rows for statistically meaningful fairness metrics',
              'Use consistent categorical values (e.g., "Male"/"Female" not mixed casing)',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-[11px] text-[#475569]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]/40 mt-1.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
