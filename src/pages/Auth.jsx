import { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Home, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff,
  CheckCircle, ArrowLeft, User, Phone, TrendingUp, Bell, Download, Users
} from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, title: 'Rent Tracking', desc: 'Track every payment, partial or full, with a full history.' },
  { icon: Bell, title: 'WhatsApp Reminders', desc: 'Send pre-formatted reminders to tenants in one tap.' },
  { icon: Download, title: 'Export Anytime', desc: 'Download your data as Excel, CSV, or JSON for backup.' },
  { icon: Users, title: 'Multi-Renter Support', desc: 'Manage all your tenants and flats from one place.' },
];

// Google SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const reset = () => { setError(null); setMsg(null); };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    reset();

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setError(error.message);
      else setMsg('Password reset email sent! Check your inbox.');
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        setLoading(false);
        return;
      }
      if (!phone || !/^[0-9]{10}$/.test(phone)) {
        setError('Enter a valid 10-digit Indian mobile number.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          },
        },
      });
      if (error) setError(error.message);
      else setMsg('Account created! Check your email to verify, then sign in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-4 pl-10 text-[14px] text-white transition-all focus:outline-none focus:border-[#6c63ff] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)] placeholder:text-white/30";

  return (
    <div className="min-h-screen flex bg-[#0f1117]">

      {/* ===== LEFT MARKETING PANEL (hidden on mobile) ===== */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-gradient-to-br from-[#0f1117] via-[#1a1330] to-[#0f1117]">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full bg-[#6c63ff]/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-[#9333ea]/15 blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#6c63ff]/5 blur-[120px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#9333ea] flex items-center justify-center shadow-[0_8px_24px_rgba(108,99,255,0.4)]">
              <Home size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white text-[17px] font-extrabold tracking-tight">AkTenant</div>
              <div className="text-white/40 text-[11px]">Property Manager</div>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 max-w-[420px]">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6c63ff]/15 border border-[#6c63ff]/30 text-[#a78bfa] text-[12px] font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] inline-block" />
            Free to use · No credit card required
          </div> */}
          <h2 className="text-[38px] xl:text-[44px] font-extrabold text-white leading-[1.12] tracking-tight mb-5">
            Manage your tenants<br />
            <span className="bg-gradient-to-r from-[#6c63ff] to-[#c084fc] bg-clip-text text-transparent">like a pro.</span>
          </h2>
          <p className="text-[15px] text-white/50 leading-relaxed mb-10">
            Track rent, bills, and payments for all your renters in one clean dashboard. Send WhatsApp reminders in one tap, export data instantly.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/3 border border-white/6 hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#6c63ff]/15 border border-[#6c63ff]/20 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-[#a78bfa]" />
                </div>
                <div>
                  <div className="text-white text-[13px] font-bold mb-0.5">{title}</div>
                  <div className="text-white/40 text-[12px] leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial footer */}
        {/* <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/4 border border-white/8">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#9333ea] flex items-center justify-center text-white text-[13px] font-extrabold shrink-0">AK</div>
            <div>
              <div className="text-white/80 text-[12px] leading-relaxed">"Finally a rent tracker that doesn't need a spreadsheet. My whole building is managed from my phone."</div>
              <div className="text-white/35 text-[11px] mt-1">— Anurag K., Landlord, Udaipur</div>
            </div>
          </div>
        </div> */}
      </div>

      {/* ===== RIGHT AUTH PANEL ===== */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1117] to-[#14101f] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#6c63ff]/8 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#9333ea] flex items-center justify-center shadow-[0_8px_24px_rgba(108,99,255,0.3)]">
              <Home size={18} className="text-white" />
            </div>
            <div className="text-white text-[16px] font-extrabold">AkTenant</div>
          </div>

          {/* Mode: Password Reset */}
          {mode === 'reset' ? (
            <div className="animate-[slideUp_0.3s_ease]">
              <button onClick={() => { setMode('login'); reset(); }} className="flex items-center gap-1.5 text-white/40 text-[12px] font-medium mb-6 hover:text-white/70 transition-colors bg-transparent border-none cursor-pointer p-0">
                <ArrowLeft size={14} /> Back to sign in
              </button>
              <h1 className="text-white text-[26px] font-extrabold mb-1.5">Reset password</h1>
              <p className="text-white/40 text-[13px] mb-8">Enter your email and we'll send you a reset link.</p>

              {error && <AlertBox type="error" msg={error} />}
              {msg && <AlertBox type="success" msg={msg} />}

              {!msg && (
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <InputField icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  <button type="submit" disabled={loading} className="w-full mt-1 py-3.5 rounded-xl text-[15px] font-bold bg-gradient-to-br from-[#6c63ff] to-[#9333ea] text-white shadow-[0_4px_20px_rgba(108,99,255,0.35)] hover:shadow-[0_6px_28px_rgba(108,99,255,0.5)] hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </div>

          ) : (
            <div className="animate-[slideUp_0.3s_ease]">
              {/* Heading */}
              <div className="mb-7">
                {mode === 'login' ? (
                  <>
                    <h1 className="text-white text-[26px] font-extrabold mb-1">Welcome back 👋</h1>
                    <p className="text-white/40 text-[13px]">Sign in to your AkTenant account</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-white text-[26px] font-extrabold mb-1">Create account ✨</h1>
                    <p className="text-white/40 text-[13px]">Free forever. No credit card needed.</p>
                  </>
                )}
              </div>

              {error && <AlertBox type="error" msg={error} />}
              {msg && <AlertBox type="success" msg={msg} />}

              {/* Google button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/12 bg-white/5 text-white text-[14px] font-semibold hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? <Loader2 size={17} className="animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-white/25 text-[11px] font-medium uppercase tracking-wider">or with email</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="flex flex-col gap-3.5">
                {mode === 'signup' && (
                  <>
                    <InputField icon={User} type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
                    {/* Phone — required, +91, digits only */}
                    <InputField icon={Phone}
                      type="text"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      required
                    />
                  </>
                )}

                <InputField icon={Mail} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />

                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={`${inputClass} pr-10`}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer p-0">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {mode === 'signup' && (
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      className={`${inputClass} pr-10`}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowConfirmPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer p-0">
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right -mt-1">
                    <button type="button" onClick={() => { setMode('reset'); reset(); }} className="text-[12px] text-[#a78bfa] hover:text-[#c4b5fd] transition-colors bg-transparent border-none cursor-pointer p-0 font-medium">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-3.5 rounded-xl text-[15px] font-bold bg-gradient-to-br from-[#6c63ff] to-[#9333ea] text-white shadow-[0_4px_20px_rgba(108,99,255,0.35)] hover:shadow-[0_6px_28px_rgba(108,99,255,0.5)] hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Free Account')}
                </button>
              </form>

              {/* Toggle mode */}
              <p className="text-center text-[13px] text-white/35 mt-6">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); reset(); setPassword(''); setConfirmPassword(''); }}
                  className="text-[#a78bfa] font-semibold hover:text-[#c4b5fd] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reusable sub-components ─────────────────────────
function InputField({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-4 pl-10 text-[14px] text-white transition-all focus:outline-none focus:border-[#6c63ff] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)] placeholder:text-white/30"
        {...props}
      />
    </div>
  );
}

function AlertBox({ type, msg }) {
  const isErr = type === 'error';
  return (
    <div className={`flex items-start gap-2.5 p-3 mb-4 rounded-xl border text-[12px] font-medium leading-relaxed ${isErr ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-green-500/30 bg-green-500/10 text-green-300'}`}>
      {isErr ? <AlertCircle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle size={14} className="shrink-0 mt-0.5" />}
      <span>{msg}</span>
    </div>
  );
}
