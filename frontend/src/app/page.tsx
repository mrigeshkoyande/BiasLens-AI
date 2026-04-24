'use client';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/dashboard/MetricCard';
import BiasChart from '@/components/dashboard/BiasChart';
import ProgressRing from '@/components/ui/ProgressRing';
import RiskBadge from '@/components/ui/RiskBadge';
import BiasExplanationPanel from '@/components/explanation/BiasExplanationPanel';
import FeatureImportancePanel from '@/components/explanation/FeatureImportancePanel';
import SimulationSlider from '@/components/simulation/SimulationSlider';
import FixSuggestions from '@/components/autofix/FixSuggestions';
import ChatPanel from '@/components/chat/ChatPanel';
import {
  mockMetrics,
  mockGroupMetrics,
  mockExplanations,
  mockFeatureImportance,
  mockSimulation,
  mockFixStrategies,
  mockDataset,
} from '@/lib/mockData';
import {
  GitCompare,
  Download,
  Database,
  AlertOctagon,
  Scale,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Fairness Dashboard"
        subtitle="Bias analysis for hiring_dataset_2024.csv · Last analyzed 2 hours ago"
        breadcrumbs={[{ label: 'BiasLens AI' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/upload" className="btn-secondary text-[12px] py-2 px-3">
              <Database size={13} />
              New Dataset
            </Link>
            <button className="btn-primary text-[12px] py-2 px-3">
              <Download size={13} />
              Export PDF
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* ── BANNER ── */}
        <div
          className="rounded-2xl border border-[rgba(239,68,68,0.2)] p-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(124,58,237,0.06))' }}
        >
          <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.15)] flex items-center justify-center flex-shrink-0">
            <AlertOctagon size={20} className="text-[#ef4444]" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-[#f1f5f9]">
              High-Risk Bias Detected in <span className="text-[#00d4ff]">{mockDataset.filename}</span>
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-0.5">
              {mockDataset.rowCount.toLocaleString()} rows · {mockDataset.columnCount} columns · 3 sensitive attributes identified · 2 critical issues found
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level="high" />
            <button className="btn-primary text-[11px] py-1.5 px-3">
              <GitCompare size={12} />
              View Full Report
            </button>
          </div>
        </div>

        {/* ── ROW 1: Fairness Score + Metric Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Fairness Score gauge */}
          <div className="lg:col-span-1 rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-6 flex flex-col items-center justify-center gap-2"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
            <p className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-2">Overall Score</p>
            <ProgressRing score={mockMetrics.fairnessScore} size={160} />
            <div className="w-full mt-3 pt-3 border-t border-white/[0.06]">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-[#475569]">Dataset</div>
                  <div className="text-[11px] font-semibold text-[#f1f5f9] truncate">{mockDataset.filename.split('_')[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#475569]">Rows</div>
                  <div className="text-[11px] font-semibold text-[#f1f5f9]">{mockDataset.rowCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Demographic Parity"
              value={mockMetrics.demographicParity}
              suffix=" gap"
              decimals={2}
              description="Difference in selection rates between most and least favored groups"
              trend="up"
              trendValue="0.04"
              color="red"
              invert={true}
              icon={<Scale size={16} />}
            />
            <MetricCard
              title="Equal Opportunity"
              value={mockMetrics.equalOpportunity}
              suffix=" diff"
              decimals={2}
              description="Gap in true positive rates across demographic groups"
              trend="neutral"
              trendValue="0.00"
              color="amber"
              invert={true}
              icon={<Activity size={16} />}
            />
            <MetricCard
              title="Disparate Impact"
              value={mockMetrics.disparateImpact}
              suffix=" ratio"
              decimals={2}
              description="Ratio of selection rates (below 0.80 = adverse impact rule)"
              trend="down"
              trendValue="0.03"
              color="purple"
              invert={false}
              icon={<GitCompare size={16} />}
            />
          </div>
        </div>

        {/* ── ROW 2: Charts + Explanations ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3">
            <BiasChart groupMetrics={mockGroupMetrics} />
          </div>
          <div className="xl:col-span-2">
            <BiasExplanationPanel explanations={mockExplanations} />
          </div>
        </div>

        {/* ── ROW 3: Feature Importance + Simulation ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <FeatureImportancePanel features={mockFeatureImportance} />
          <SimulationSlider baseResult={mockSimulation} />
        </div>

        {/* ── ROW 4: Auto-Fix Suggestions ── */}
        <FixSuggestions strategies={mockFixStrategies} />
      </div>

      {/* Floating AI Chat */}
      <ChatPanel />
    </>
  );
}
