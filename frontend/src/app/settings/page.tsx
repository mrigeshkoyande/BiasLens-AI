'use client';
import Header from '@/components/layout/Header';
import { Shield, Bell, Key, Palette, Database, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

interface ToggleProps { label: string; description: string; defaultOn?: boolean }
function Toggle({ label, description, defaultOn = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-[13px] font-medium text-[#f1f5f9]">{label}</div>
        <div className="text-[11px] text-[#475569]">{description}</div>
      </div>
      <button onClick={() => setOn(!on)} className="transition-all">
        {on
          ? <ToggleRight size={28} className="text-[#00d4ff]" />
          : <ToggleLeft size={28} className="text-[#475569]" />}
      </button>
    </div>
  );
}

interface SettingSectionProps { title: string; icon: React.ReactNode; children: React.ReactNode }
function SettingSection({ title, icon, children }: SettingSectionProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0f0f1a] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
        {icon}
        <h3 className="text-[13px] font-semibold text-[#f1f5f9]">{title}</h3>
      </div>
      <div className="px-5 divide-y divide-white/[0.04]">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <Header
        title="Settings"
        subtitle="Configure your fairness auditing preferences"
        breadcrumbs={[{ label: 'BiasLens AI' }, { label: 'Settings' }]}
        actions={
          <button className="btn-primary text-[12px] py-2 px-3">
            <Save size={13} /> Save Changes
          </button>
        }
      />
      <div className="p-6 max-w-[700px] space-y-5">
        <SettingSection title="Fairness Thresholds" icon={<Shield size={14} className="text-[#00d4ff]" />}>
          {[
            { label: 'Demographic Parity Threshold', value: '0.10', unit: 'gap' },
            { label: 'Equal Opportunity Threshold', value: '0.10', unit: 'diff' },
            { label: 'Disparate Impact Threshold', value: '0.80', unit: 'ratio' },
          ].map((item) => (
            <div key={item.label} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-medium text-[#f1f5f9]">{item.label}</div>
                <div className="text-[11px] text-[#475569]">Flag analysis when exceeded</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={item.value}
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-20 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[12px] text-[#f1f5f9] text-center font-mono outline-none focus:border-[rgba(0,212,255,0.3)] transition-colors"
                />
                <span className="text-[11px] text-[#475569]">{item.unit}</span>
              </div>
            </div>
          ))}
        </SettingSection>

        <SettingSection title="Protected Attributes" icon={<Database size={14} className="text-[#7c3aed]" />}>
          {['Gender', 'Age', 'Race / Ethnicity', 'ZIP Code', 'Religion', 'Nationality'].map((attr) => (
            <Toggle key={attr} label={attr} description={`Flag ${attr.toLowerCase()} as a sensitive attribute`} defaultOn={['Gender', 'Age', 'ZIP Code'].includes(attr)} />
          ))}
        </SettingSection>

        <SettingSection title="Notifications" icon={<Bell size={14} className="text-[#f59e0b]" />}>
          <Toggle label="High-Risk Alerts" description="Get notified when fairness score drops below 40" defaultOn />
          <Toggle label="Analysis Complete" description="Notify when bias analysis finishes" defaultOn />
          <Toggle label="Weekly Summary" description="Weekly digest of fairness trends" />
        </SettingSection>

        <SettingSection title="API Keys" icon={<Key size={14} className="text-[#10b981]" />}>
          <div className="py-3 space-y-3">
            {[
              { label: 'Gemini API Key', placeholder: 'AIza...' },
              { label: 'Supabase URL', placeholder: 'https://xxx.supabase.co' },
              { label: 'Supabase Anon Key', placeholder: 'eyJhbGc...' },
            ].map((k) => (
              <div key={k.label}>
                <label className="block text-[11px] font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wider">{k.label}</label>
                <input
                  type="password"
                  placeholder={k.placeholder}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] text-[#f1f5f9] placeholder-[#475569] font-mono outline-none focus:border-[rgba(0,212,255,0.3)] transition-colors"
                />
              </div>
            ))}
          </div>
        </SettingSection>

        <SettingSection title="Appearance" icon={<Palette size={14} className="text-[#ef4444]" />}>
          <Toggle label="Dark Mode" description="Use dark theme (recommended)" defaultOn />
          <Toggle label="High Contrast Mode" description="Improve accessibility with higher contrast" />
          <Toggle label="Compact Layout" description="Reduce padding for denser information display" />
        </SettingSection>
      </div>
    </>
  );
}
