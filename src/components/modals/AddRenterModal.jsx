import { useState } from 'react';
import { X, User, Phone, Home, Calendar, IndianRupee, FileText } from 'lucide-react';

const DEFAULT_FORM = {
  name: '', phone: '', flat: '', movedInDate: '', movedOutDate: '',
  initialLightReading: '', advancePaid: false, advanceAmount: '',
  monthlyRent: '', notes: ''
};

export default function AddRenterModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState(
    initialData
      ? { ...DEFAULT_FORM, ...initialData, monthlyRent: String(initialData.monthlyRent || ''), initialLightReading: String(initialData.initialLightReading || ''), advanceAmount: String(initialData.advanceAmount || '') }
      : DEFAULT_FORM
  );
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit phone';
    if (!form.flat.trim()) e.flat = 'Room/Flat is required';
    if (!form.movedInDate) e.movedInDate = 'Move-in date is required';
    if (!form.monthlyRent || isNaN(form.monthlyRent) || Number(form.monthlyRent) <= 0) e.monthlyRent = 'Enter valid rent amount';
    if (!form.initialLightReading || isNaN(form.initialLightReading)) e.initialLightReading = 'Enter initial meter reading';
    if (form.advancePaid && (!form.advanceAmount || isNaN(form.advanceAmount))) e.advanceAmount = 'Enter advance amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      monthlyRent: Number(form.monthlyRent),
      initialLightReading: Number(form.initialLightReading),
      advanceAmount: form.advancePaid ? Number(form.advanceAmount) : 0,
      movedOutDate: form.movedOutDate || null,
    });
  };

  const inputStyle = (field) => `bg-[var(--bg-input)] border rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none placeholder-[var(--text-muted)] ${errors[field] ? 'border-[var(--accent-danger)] focus:border-[var(--accent-danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)]'}`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-center justify-center z-[200] animate-[fadeIn_0.2s_ease]" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[680px] max-h-[92vh] md:max-h-[90vh] overflow-y-auto bg-[var(--bg-modal)] md:border border-[var(--border-color)] rounded-t-3xl md:rounded-[var(--radius-xl)] p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[slideUpSheet_0.3s_ease] md:animate-[slideUp_0.25s_ease] relative mt-auto md:mt-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[18px] font-bold">🏠 {isEditing ? 'Edit Renter' : 'Add New Renter'}</div>
            <div className="text-[13px] text-[var(--text-muted)] mt-[2px]">
              {isEditing ? 'Update renter details below' : 'Fill in the renter\'s details below'}
            </div>
          </div>
          <button className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center transition-all cursor-pointer hover:border-[var(--accent-danger)] hover:text-[var(--accent-danger)]" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Personal Details */}
          <div>
            <div className="text-[12px] font-bold text-[var(--text-accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5">
              <User size={13} /> Personal Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Full Name *</label>
                <input className={inputStyle('name')} placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
                {errors.name && <span className="text-[11px] text-[var(--accent-danger)]">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Phone Number *</label>
                <input className={inputStyle('phone')} placeholder="10-digit mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={10} inputMode="tel" />
                {errors.phone && <span className="text-[11px] text-[var(--accent-danger)]">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Room & Dates */}
          <div>
            <div className="text-[12px] font-bold text-[var(--text-accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5">
              <Home size={13} /> Room & Dates
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Room / Flat *</label>
                <input className={inputStyle('flat')} placeholder="e.g. Room 101, Flat 2B" value={form.flat} onChange={e => set('flat', e.target.value)} />
                {errors.flat && <span className="text-[11px] text-[var(--accent-danger)]">{errors.flat}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Move-In Date *</label>
                <input type="date" className={inputStyle('movedInDate')} value={form.movedInDate} onChange={e => set('movedInDate', e.target.value)} />
                {errors.movedInDate && <span className="text-[11px] text-[var(--accent-danger)]">{errors.movedInDate}</span>}
              </div>
              {/* Show Move-Out Date only when editing */}
              {isEditing && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">
                    <Calendar size={11} className="inline mr-1" />
                    Move-Out Date <span className="text-[var(--text-muted)] font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <input type="date" className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)]" value={form.movedOutDate || ''} onChange={e => set('movedOutDate', e.target.value)} />
                  <span className="text-[11px] text-[var(--text-muted)] mt-[2px]">Set this if the renter has moved out</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div>
            <div className="text-[12px] font-bold text-[var(--text-accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5">
              <IndianRupee size={13} /> Financial Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Monthly Rent (₹) *</label>
                <input type="number" className={inputStyle('monthlyRent')} placeholder="e.g. 8000" value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} inputMode="numeric" />
                {errors.monthlyRent && <span className="text-[11px] text-[var(--accent-danger)]">{errors.monthlyRent}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Initial Light Meter Reading *</label>
                <input type="number" className={inputStyle('initialLightReading')} placeholder="e.g. 1245" value={form.initialLightReading} onChange={e => set('initialLightReading', e.target.value)} inputMode="numeric" />
                {errors.initialLightReading && <span className="text-[11px] text-[var(--accent-danger)]">{errors.initialLightReading}</span>}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <input type="checkbox" id="advancePaid" className="w-[18px] h-[18px] accent-[var(--accent-primary)] cursor-pointer" checked={form.advancePaid} onChange={e => set('advancePaid', e.target.checked)} />
                <label htmlFor="advancePaid" className="text-[14px] color-[var(--text-primary)] cursor-pointer font-medium">
                  Advance Paid?
                </label>
              </div>
              {form.advancePaid && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Advance Amount (₹) *</label>
                  <input type="number" className={inputStyle('advanceAmount')} placeholder="e.g. 5000" value={form.advanceAmount} onChange={e => set('advanceAmount', e.target.value)} inputMode="numeric" />
                  {errors.advanceAmount && <span className="text-[11px] text-[var(--accent-danger)]">{errors.advanceAmount}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]"><FileText size={12} className="inline mr-1" />Notes (optional)</label>
            <textarea className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)] resize-y" rows={2} placeholder="Any additional notes about this renter..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-6 pt-5 border-t border-[var(--border-color)]">
          <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)]" onClick={onClose}>Cancel</button>
          <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)]" onClick={handleSubmit}>
            {isEditing ? '✓ Save Changes' : '+ Add Renter'}
          </button>
        </div>
      </div>
    </div>
  );
}
