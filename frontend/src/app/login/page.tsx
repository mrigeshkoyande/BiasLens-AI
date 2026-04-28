'use client';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

export default function LoginPage() {
  const { signInWithGoogle, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 20
    }}>
      <div className="editorial-card animate-pop-in" style={{
        width: '100%',
        maxWidth: 420,
        padding: 48,
        textAlign: 'center',
        background: 'var(--surface)'
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--ink)', fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 8 }}>BiasLens AI</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>Ethical AI Governance & Compliance</p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
            Sign in to access your fairness audits, compliance reports, and mitigation strategies.
          </p>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: 52,
              background: 'var(--ink)',
              color: 'white',
              borderRadius: 14,
              border: 'none',
              fontSize: 14,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'transform 0.2s var(--ease-spring)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.711c-.18-.54-.282-1.117-.282-1.711s.102-1.171.282-1.711V4.957H.957A8.996 8.996 0 0 0 0 9c0 1.497.366 2.91 1.008 4.149l3.048-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.957l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Powered by BiasLens Engine v4.2
          </p>
        </div>
      </div>
    </div>
  );
}
