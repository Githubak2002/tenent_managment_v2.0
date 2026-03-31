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
    <div className="min-h-screen flex items-center justify-center p-5 bg-[var(--bg-primary)]">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-md w-full max-w-[400px] p-8 md:px-6 animate-[slideUp_0.3s_ease]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white mb-4 shadow-[0_8px_24px_rgba(108,99,255,0.3)]">
            <Home size={28} strokeWidth={2} />
          </div>
          <h1 className="text-[24px] font-extrabold m-0 mb-1 text-[var(--text-primary)]">TenantPro</h1>
          <p className="text-[14px] text-[var(--text-muted)]">Sign in to manage your properties</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3 mb-5 rounded-lg border border-[#f87171] bg-[#fef2f2] text-[#b91c1c]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1 text-[12px] font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {msg && (
          <div className="flex items-start gap-3 p-3 mb-5 rounded-lg border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] text-[#22c55e]">
            <span className="flex-1 text-[12px] font-medium leading-relaxed">{msg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[var(--text-primary)] mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-[13px] text-[var(--text-muted)]" />
              <input
                type="email"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl py-3 pr-4 pl-[38px] text-[14px] text-[var(--text-primary)] transition-all focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder:text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[var(--text-primary)] mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-[13px] text-[var(--text-muted)]" />
              <input
                type="password"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl py-3 pr-4 pl-[38px] text-[14px] text-[var(--text-primary)] transition-all focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder:text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="w-full mt-2 inline-flex items-center justify-center gap-2 p-3.5 rounded-xl text-[15px] font-bold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-[13px] text-[var(--text-secondary)]">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button className="bg-transparent border-none text-[var(--accent-primary)] font-semibold cursor-pointer p-0 hover:text-[var(--accent-primary-hover)] transition-colors inline-block" onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null); setMsg(null); }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
