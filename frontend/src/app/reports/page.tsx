'use client';
import Header from '@/components/layout/Header';
import { mockReports } from '@/lib/mockData';
import RiskBadge from '@/components/ui/RiskBadge';
import { FileText, Download, Plus, Calendar, Database, BarChart2, Eye } from 'lucide-react';

export default function ReportsPage() {
  return (
    <>
      <Header
        title="Audit Reports"
        subtitle="Generated fairness audit reports for compliance and review"
        breadcrumbs={[{ label: 'BiasLens AI' }, { label: 'Reports' }]}
        actions={
          <button className="btn-primary text-[12px] py-2 px-3">
            <Plus size={13} />
            Generate Report
          </button>
        }
      />
      <div className="p-6 space-y-5 max-w-[900px]">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Reports', value: '3', icon: FileText, color: '#00d4ff' },
            { label: 'High Risk Findings', value: '1', icon: BarChart2, color: '#ef4444' },
            { label: 'Datasets Audited', value: '3', icon: Database, color: '#10b981' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-[#475569]">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Report list */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-[13px] font-semibold text-[#f1f5f9]">Report History</h3>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {mockReports.map((report) => (
              <div key={report.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-[#94a3b8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#f1f5f9] truncate">{report.title}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-[#475569]">
                      <Calendar size={10} /> {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#475569]">
                      <Database size={10} /> {report.datasetName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[16px] font-bold font-mono" style={{
                      color: report.riskLevel === 'high' ? '#ef4444' : report.riskLevel === 'medium' ? '#f59e0b' : '#10b981'
                    }}>{report.fairnessScore}</div>
                    <div className="text-[9px] text-[#475569]">score</div>
                  </div>
                  <RiskBadge level={report.riskLevel} size="sm" />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#475569] hover:text-[#00d4ff] transition-colors" title="View">
                      <Eye size={12} />
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#475569] hover:text-[#10b981] transition-colors" title="Download PDF">
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
