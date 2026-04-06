import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Home } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user back with a session on PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    // Also check if already in a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Sign out then redirect to login
      await supabase.auth.signOut();
      setTimeout(() => { window.location.href = '/'; }, 2200);
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-10 pl-10 text-[14px] text-white transition-all focus:outline-none focus:border-[#6c63ff] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)] placeholder:text-white/30";

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-[#0f1117] to-[#14101f] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#6c63ff]/8 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#9333ea] flex items-center justify-center shadow-[0_8px_24px_rgba(108,99,255,0.3)]">
            <Home size={18} className="text-white" />
          </div>
          <div className="text-white text-[16px] font-extrabold">AkTenant</div>
        </div>

        {success ? (
          <div className="animate-[slideUp_0.3s_ease]">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 mb-6 mx-auto">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h1 className="text-white text-[24px] font-extrabold text-center mb-2">Password updated!</h1>
            <p className="text-white/40 text-[13px] text-center">Signing you out... Please sign in with your new password.</p>
          </div>
        ) : !sessionReady ? (
          <div className="text-center">
            <Loader2 size={28} className="animate-spin text-[#6c63ff] mx-auto mb-4" />
            <p className="text-white/40 text-[13px]">Verifying reset link...</p>
          </div>
        ) : (
          <div className="animate-[slideUp_0.3s_ease]">
            <h1 className="text-white text-[26px] font-extrabold mb-1.5">Set new password</h1>
            <p className="text-white/40 text-[13px] mb-8">Choose a strong password for your AkTenant account.</p>

            {error && (
              <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-[12px] font-medium">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className={inputClass}
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer p-0">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={inputClass}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer p-0">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3.5 rounded-xl text-[15px] font-bold bg-gradient-to-br from-[#6c63ff] to-[#9333ea] text-white shadow-[0_4px_20px_rgba(108,99,255,0.35)] hover:shadow-[0_6px_28px_rgba(108,99,255,0.5)] hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
