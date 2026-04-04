import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ title, description, onClose, onConfirm }) {
  const [typed, setTyped] = useState('');
  const isMatch = typed === 'DELETE';

  const handleConfirm = () => {
    if (!isMatch) return;
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-end md:items-center justify-center z-[200] animate-[fadeIn_0.2s_ease] px-4 md:pl-[260px] md:pt-[72px] md:pb-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[420px] bg-[var(--bg-modal)] md:border border-[var(--border-color)] rounded-3xl md:rounded-[var(--radius-xl)] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[slideUpSheet_0.3s_ease] md:animate-[slideUp_0.25s_ease] mt-auto md:mt-0 relative flex flex-col items-center text-center">
        
        {/* Close */}
        <button className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center transition-all cursor-pointer hover:border-[var(--accent-danger)] hover:text-[var(--accent-danger)]" onClick={onClose}>
          <X size={16} />
        </button>

        {/* Danger Icon */}
        <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.1)] border-[4px] border-[rgba(239,68,68,0.05)] text-[var(--accent-danger)] flex items-center justify-center mb-5 animate-[pulse_2s_infinite]">
          <Trash2 size={28} />
        </div>

        {/* Title */}
        <div className="text-[20px] font-bold text-[var(--text-primary)] mb-2 tracking-tight">{title}</div>
        <div className="text-[14px] text-[var(--text-muted)] max-w-[85%] leading-relaxed mb-6">{description}</div>

        {/* Warning */}
        <div className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[var(--accent-warning)] text-[12px] font-medium w-full mb-6">
          <AlertTriangle size={14} />
          <span>This action <strong className="font-bold text-[var(--accent-warning)] opacity-100">cannot be undone</strong>.</span>
        </div>

        {/* Type to confirm */}
        <div className="w-full text-left bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl mb-6">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em] block mb-2">
            Type <span className="bg-[rgba(239,68,68,0.15)] text-[var(--accent-danger)] px-1.5 py-0.5 rounded ml-1 tracking-wider font-mono font-bold select-none cursor-text">DELETE</span> to confirm
          </label>
          <input
            className={`w-full bg-[var(--bg-input)] border rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all focus:outline-none placeholder-[var(--text-muted)] text-center tracking-[0.2em] uppercase ${isMatch ? 'border-[var(--accent-danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)] text-[var(--accent-danger)]' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)]'}`}
            placeholder="Type DELETE here"
            value={typed}
            onChange={e => setTyped(e.target.value.toUpperCase())}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse md:flex-row w-full gap-3 mt-2">
          <button className="flex-1 inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)]" onClick={onClose}>Cancel</button>
          <button
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)] bg-gradient-to-br from-[#ef4444] to-[#dc2626] ${isMatch ? 'opacity-100 cursor-pointer hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)]' : 'opacity-40 cursor-not-allowed'}`}
            disabled={!isMatch}
            onClick={handleConfirm}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
