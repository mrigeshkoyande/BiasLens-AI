'use client';
import { useState } from 'react';

interface ToggleProps {
  label: string;
  description: string;
  defaultOn?: boolean;
}

function Toggle({ label, description, defaultOn = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      className="flex items-center justify-between gap-4"
      style={{ padding: '16px 0', borderBottom: '1px solid var(--line)' }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{description}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        role="switch"
        aria-checked={on}
        aria-label={`Toggle ${label}`}
        style={{
          position: 'relative',
          flexShrink: 0,
          width: 44,
          height: 24,
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: on ? 'var(--lime)' : 'var(--surface-3)',
          boxShadow: on ? '0 0 0 1px var(--olive)' : '0 0 0 1px var(--line)',
          transition: 'background 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 20,
            height: 20,
            borderRadius: 999,
            background: on ? 'var(--olive-deep)' : 'var(--muted)',
            transition: 'transform 0.35s cubic-bezier(.22,1,.36,1), background 0.35s cubic-bezier(.22,1,.36,1)',
            transform: on ? 'translateX(20px)' : 'translateX(0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
      </button>
    </div>
  );
}

function SettingSection({
  title,
  icon,
  children,
  accent,
  className = '',
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  accent?: 'danger';
  className?: string;
}) {
  const isDanger = accent === 'danger';
  return (
    <div
      className={`editorial-card overflow-hidden ${className}`}
      style={isDanger ? { borderColor: 'rgba(215, 68, 47, 0.3)' } : {}}
    >
      <div
        style={{
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: `1px solid ${isDanger ? 'rgba(215, 68, 47, 0.15)' : 'var(--line)'}`,
          background: isDanger ? 'rgba(215, 68, 47, 0.04)' : 'transparent',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 17, color: isDanger ? 'var(--danger)' : 'var(--olive)' }}
        >
          {icon}
        </span>
        <h3
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: isDanger ? 'var(--danger)' : 'var(--ink)',
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ padding: '4px 24px 20px' }}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div
        className="animate-fade-in-up"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div className="section-kicker" style={{ marginBottom: 6 }}>Configuration</div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Settings
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 420 }}>
            Configure your fairness auditing preferences and thresholds.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary"
          style={saved ? { background: '#4a9c5d', boxShadow: '0 8px 18px rgba(74,156,93,0.24)' } : {}}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
            {saved ? 'check_circle' : 'save'}
          </span>
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Two-column responsive layout */}
      <div className="responsive-grid-equal">

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Fairness Thresholds */}
          <SettingSection title="Fairness Thresholds" icon="shield" className="animate-card-enter delay-100">
            {[
              { label: 'Demographic Parity Threshold', desc: 'Flag analysis when gap exceeds threshold', value: '0.10', unit: 'gap' },
              { label: 'Equal Opportunity Threshold', desc: 'Flag analysis when diff exceeds threshold', value: '0.10', unit: 'diff' },
              { label: 'Disparate Impact Threshold', desc: 'Flag analysis when ratio falls below', value: '0.80', unit: 'ratio' },
            ].map((item) => (
              <div
                key={item.label}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--line)' }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <input
                    type="number"
                    defaultValue={item.value}
                    step="0.01"
                    min="0"
                    max="1"
                    style={{
                      width: 72,
                      borderRadius: 12,
                      padding: '8px 12px',
                      fontSize: 14,
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      outline: 'none',
                      background: 'var(--surface-2)',
                      border: '1.5px solid var(--line)',
                      color: 'var(--ink)',
                      transition: 'border-color 0.3s cubic-bezier(.22,1,.36,1)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--lime)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 36 }}>
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </SettingSection>

          {/* API Configuration */}
          <SettingSection title="API Configuration" icon="key" className="animate-card-enter delay-200">
            <div style={{ paddingTop: 12 }}>
              {[
                { label: 'Backend API URL', placeholder: 'http://localhost:8000/api', defaultValue: 'http://localhost:8000/api', type: 'text' as const },
                { label: 'Gemini API Key', placeholder: 'AIza…', type: 'password' as const },
                { label: 'Report Storage Path', placeholder: '/reports', defaultValue: '/reports', type: 'text' as const },
              ].map((k) => (
                <div key={k.label} style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--olive)', marginBottom: 8 }}>
                    {k.label}
                  </label>
                  <input
                    type={k.type}
                    placeholder={k.placeholder}
                    defaultValue={k.defaultValue}
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      padding: '10px 16px',
                      fontSize: 14,
                      fontFamily: 'monospace',
                      outline: 'none',
                      background: 'var(--surface-2)',
                      border: '1.5px solid var(--line)',
                      color: 'var(--ink)',
                      transition: 'border-color 0.3s cubic-bezier(.22,1,.36,1)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--lime)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                  />
                </div>
              ))}
            </div>
          </SettingSection>

          {/* Danger Zone */}
          <SettingSection title="Danger Zone" icon="warning" accent="danger" className="animate-card-enter delay-300">
            <div style={{ padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Clear Pipeline Data</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    Remove all cached analysis results from this session.
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Clear all pipeline data? This cannot be undone.')) {
                      sessionStorage.clear();
                      window.location.reload();
                    }
                  }}
                  style={{
                    flexShrink: 0,
                    padding: '10px 20px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    border: '1.5px solid rgba(215, 68, 47, 0.4)',
                    color: 'var(--danger)',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
                  }}
                >
                  Clear Data
                </button>
              </div>
            </div>
          </SettingSection>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Protected Attributes */}
          <SettingSection title="Protected Attributes" icon="diversity_3" className="animate-card-enter delay-200">
            {[
              { label: 'Gender', desc: 'Flag gender as a sensitive attribute', on: true },
              { label: 'Age', desc: 'Flag age as a sensitive attribute', on: true },
              { label: 'Race / Ethnicity', desc: 'Flag race / ethnicity as a sensitive attribute', on: false },
              { label: 'ZIP Code', desc: 'Flag zip code as a sensitive attribute', on: true },
              { label: 'Religion', desc: 'Flag religion as a sensitive attribute', on: false },
              { label: 'Nationality', desc: 'Flag nationality as a sensitive attribute', on: false },
            ].map((attr) => (
              <Toggle key={attr.label} label={attr.label} description={attr.desc} defaultOn={attr.on} />
            ))}
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications" icon="notifications" className="animate-card-enter delay-300">
            <Toggle label="High-Risk Alerts" description="Get notified when fairness score drops below 40" defaultOn />
            <Toggle label="Analysis Complete" description="Notify when bias analysis finishes" defaultOn />
            <Toggle label="Weekly Summary" description="Weekly digest of fairness trends" />
          </SettingSection>

          {/* Appearance */}
          <SettingSection title="Appearance" icon="palette" className="animate-card-enter delay-400">
            <Toggle label="Compact Layout" description="Reduce padding for denser information display" />
            <Toggle label="High Contrast Mode" description="Improve accessibility with higher contrast" />
            <Toggle label="Animation Reduction" description="Reduce motion for accessibility (prefers-reduced-motion)" />
          </SettingSection>
        </div>
      </div>
    </div>
  );
}
