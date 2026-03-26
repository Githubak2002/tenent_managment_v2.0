import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Home, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    let err = null;
    let data = null;

    if (mode === 'signup') {
      const { data: d, error: e } = await supabase.auth.signUp({ email, password });
      err = e; data = d;
      if (!e) setMsg("Success! Please check your email to verify your account (if email confirmation is turned on). Otherwise, you can log in.");
    } else {
      const { data: d, error: e } = await supabase.auth.signInWithPassword({ email, password });
      err = e; data = d;
    }

    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-primary)', color: 'white', marginBottom: '16px', boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
            <Home size={28} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-primary)' }}>TenantPro</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Sign in to manage your properties</p>
        </div>

        {error && (
          <div className="form-display form-display-warning" style={{ marginBottom: '20px', color: '#b91c1c', backgroundColor: '#fef2f2', borderColor: '#f87171' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '12px' }}>{error}</span>
          </div>
        )}

        {msg && (
          <div className="form-display form-display-success" style={{ marginBottom: '20px' }}>
            <span style={{ flex: 1, fontSize: '12px' }}>{msg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '15px' }} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer', padding: 0 }} onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null); setMsg(null); }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
