'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from 'recharts';
import type { GroupMetric } from '@/lib/types';
import { fairnessTrendData, radarData } from '@/lib/mockData';
import { useState } from 'react';

interface BiasChartProps {
  groupMetrics: GroupMetric[];
}

type ChartTab = 'groups' | 'radar' | 'trend';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="custom-tooltip-value" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value < 1
            ? `${(p.value * 100).toFixed(1)}%`
            : p.value}
        </p>
      ))}
    </div>
  );
};

export default function BiasChart({ groupMetrics }: BiasChartProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('groups');

  const tabs: { id: ChartTab; label: string }[] = [
    { id: 'groups', label: 'Selection Rates' },
    { id: 'radar', label: 'Fairness Radar' },
    { id: 'trend', label: 'Trend Analysis' },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-[#f1f5f9]">Bias Visualization</h3>
          <p className="text-[11px] text-[#475569] mt-0.5">Demographic parity across groups</p>
        </div>
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[rgba(0,212,255,0.2)] to-[rgba(124,58,237,0.2)] text-[#00d4ff] border border-[rgba(0,212,255,0.2)]'
                  : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="h-[260px]">
        {activeTab === 'groups' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupMetrics} barSize={28} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="group" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="selection_rate" name="Selection Rate" radius={[6, 6, 0, 0]}
                fill="url(#barGradient)" />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'radar' && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
              <Radar name="Score" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fairnessTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#475569', paddingTop: 8 }} />
              <defs>
                <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="score" name="Fairness Score" stroke="#00d4ff" strokeWidth={2.5} dot={{ fill: '#00d4ff', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#00d4ff' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
