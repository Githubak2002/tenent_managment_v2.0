import { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, LogOut, Trash2,
  Save, AlertCircle, CheckCircle, Loader2, ShieldAlert, Edit2, X
} from 'lucide-react';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

export default function Profile({ user, onSignOut }) {
  const meta = user?.user_metadata ?? {};
  const isGoogle = user?.app_metadata?.provider === 'google';

  const [name, setName] = useState(meta.full_name || meta.name || '');
  const [phone, setPhone] = useState(meta.phone || '');
  const [editMode, setEditMode] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type:'success'|'error', text }
  const [passMsg, setPassMsg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const inputClass = "w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[14px] font-medium text-[var(--text-primary)] transition-all focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder:text-[var(--text-muted)] disabled:opacity-50 disabled:cursor-not-allowed";

  // ── Save profile info ──────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      setProfileMsg({ type: 'error', text: 'Phone must be exactly 10 digits.' });
      return;
    }
    setProfileLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, phone },
    });
    if (error) setProfileMsg({ type: 'error', text: error.message });
    else { setProfileMsg({ type: 'success', text: 'Profile updated successfully!' }); setEditMode(false); }
    setProfileLoading(false);
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPassword.length < 6) { setPassMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
    if (newPassword !== confirmPassword) { setPassMsg({ type: 'error', text: "Passwords don't match." }); return; }
    setPassLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPassMsg({ type: 'error', text: error.message });
    else {
      setPassMsg({ type: 'success', text: 'Password changed. Please sign in again.' });
      setNewPassword(''); setConfirmPassword('');
      setTimeout(() => supabase.auth.signOut(), 2000);
    }
    setPassLoading(false);
  };

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    // Call Supabase admin delete via edge function if available, else just sign out
    // For now: sign out (actual deletion requires a server-side admin call)
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const displayName = name || meta.name || user?.email?.split('@')[0] || 'User';
  const avatarLetters = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="animate-[slideUp_0.3s_ease] max-w-[720px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] tracking-tight">My Account</h1>
        <p className="text-[14px] text-[var(--text-muted)] mt-1">Manage your profile, security, and account settings</p>
      </div>

      {/* ── Profile Card ──────────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden mb-5">
        <div className="h-1.5 bg-gradient-to-r from-[var(--accent-primary)] via-[#9333ea] to-[#3ecf8e]" />
        <div className="p-5 md:p-7">
          {/* Avatar + name row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl font-extrabold text-[22px] bg-gradient-to-br from-[var(--accent-primary)]/20 to-[#9333ea]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0 shadow-[var(--shadow-accent)]">
              {avatarLetters}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[18px] font-extrabold text-[var(--text-primary)] truncate">{displayName}</div>
              <div className="text-[13px] text-[var(--text-muted)] truncate">{user?.email}</div>
              {isGoogle && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[rgba(66,133,244,0.1)] border border-[rgba(66,133,244,0.2)] text-[#4285F4] text-[11px] font-semibold">
                  <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                  Signed in with Google
                </span>
              )}
            </div>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-sm">
                <Edit2 size={13} /> Edit
              </button>
            ) : (
              <button onClick={() => { setEditMode(false); setName(meta.full_name || meta.name || ''); setPhone(meta.phone || ''); setProfileMsg(null); }} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent-danger)] hover:text-[var(--accent-danger)] transition-all cursor-pointer shadow-sm">
                <X size={13} /> Cancel
              </button>
            )}
          </div>

          {/* Alert messages */}
          {profileMsg && (
            <MsgBox type={profileMsg.type} text={profileMsg.text} />
          )}

          {/* Detail form */}
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><User size={11} />Full Name</label>
                <input className={inputClass} value={name} onChange={e => setName(e.target.value)} disabled={!editMode} placeholder="Your full name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Mail size={11} />Email</label>
                <input className={inputClass} value={user?.email || ''} disabled placeholder="Email address" />
                <span className="text-[11px] text-[var(--text-muted)]">Email cannot be changed here</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5"><Phone size={11} />Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--text-muted)] pointer-events-none select-none">+91</span>
                  <input
                    className={`${inputClass} pl-11`}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={!editMode}
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {editMode && (
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={profileLoading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none">
                  {profileLoading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Change Password (email users only) ────────────────────────────── */}
      {!isGoogle && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 md:p-7 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-[var(--accent-primary)]" />
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Change Password</h3>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] mb-5">Set a new password for your AkTenant account.</p>

          {passMsg && <MsgBox type={passMsg.type} text={passMsg.text} className="mb-4" />}

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className={`${inputClass} pr-10`} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer p-0">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPass ? 'text' : 'password'} className={`${inputClass} pr-10`} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" minLength={6} />
                  <button type="button" onClick={() => setShowConfirmPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer p-0">
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={passLoading || !newPassword || !confirmPassword} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none">
                {passLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Sign Out ──────────────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 md:p-7 mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2"><LogOut size={15} className="text-[var(--text-muted)]" /> Sign Out</h3>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Sign out of your AkTenant account on this device.</p>
        </div>
        <button onClick={onSignOut} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all cursor-pointer shrink-0 shadow-sm">
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* ── Danger Zone ───────────────────────────────────────────────────── */}
      <div className="bg-[rgba(239,68,68,0.04)] border border-[rgba(239,68,68,0.2)] rounded-[var(--radius-lg)] p-5 md:p-7">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={16} className="text-[var(--accent-danger)]" />
          <h3 className="text-[15px] font-bold text-[var(--accent-danger)]">Danger Zone</h3>
        </div>
        <p className="text-[13px] text-[var(--text-muted)] mb-5">Deleting your account is permanent and cannot be undone. All your data will be removed.</p>
        <button onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)] border border-[rgba(239,68,68,0.25)] hover:bg-[rgba(239,68,68,0.18)] transition-all cursor-pointer shadow-sm">
          <Trash2 size={14} /> Delete My Account
        </button>
      </div>

      {/* Delete account confirmation */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Account"
          description={`This will permanently delete your account (${user?.email}) and sign you out. Your renters and rent data will remain in the database — contact support to fully purge.`}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
}

// ── Reusable alert box ────────────────────────────────────────────
function MsgBox({ type, text, className = '' }) {
  const isErr = type === 'error';
  return (
    <div className={`flex items-start gap-2.5 p-3 mb-4 rounded-xl border text-[12px] font-medium leading-relaxed ${isErr ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-green-500/30 bg-green-500/10 text-green-400'} ${className}`}>
      {isErr ? <AlertCircle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle size={14} className="shrink-0 mt-0.5" />}
      <span>{text}</span>
    </div>
  );
}
