import { useState } from 'react';
import { X, Zap, Droplets, IndianRupee, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PAYMENT_MODES = ["Cash", "Online", "Bank Transfer", "Cheque"];
const LIGHT_RATE_PER_UNIT = 10;

const DEFAULT_FORM = {
  month: 'March', year: 2025,
  rentAmount: '', lightReadingPrev: '', lightReadingCurr: '',
  lightUnits: 0, lightBill: 0, waterBill: 200,
  totalAmount: 0, amountPaid: '',
  rentPaid: false, paymentMode: '',
  paidDate: '', whatsappSent: false, notes: ''
};

export default function AddRentRecordModal({ renter, existingRecords, onClose, onSave, initialData }) {
  const isEditing = Boolean(initialData);

  const [form, setForm] = useState(isEditing
    ? {
        ...initialData,
        rentAmount: String(initialData.rentAmount),
        lightReadingPrev: String(initialData.lightReadingPrev),
        lightReadingCurr: String(initialData.lightReadingCurr),
        lightBill: String(initialData.lightBill),
        waterBill: String(initialData.waterBill),
        totalAmount: initialData.totalAmount,
        // Key fix: preserve amountPaid separately from totalAmount
        amountPaid: String(initialData.amountPaid ?? initialData.totalAmount),
      }
    : {
        ...DEFAULT_FORM,
        rentAmount: String(renter.monthlyRent),
        lightReadingPrev: existingRecords.length > 0
          ? String(existingRecords[0].lightReadingCurr)
          : String(renter.initialLightReading)
      }
  );

  const [errors, setErrors] = useState({});
  const [lightBillManual, setLightBillManual] = useState(isEditing);
  // Track if user has manually set amountPaid (so auto-calc doesn't reset it)
  const [amountPaidTouched, setAmountPaidTouched] = useState(isEditing);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  // Auto-calc light units when readings change
  const handleReadingChange = (field, val) => {
    set(field, val);
    if (!lightBillManual) {
      // Will recalculate via derived logic below
      setLightBillManual(false);
    }
  };

  // Derived computed values whenever dependencies change
  const calcLightUnits = () => {
    const prev = Number(form.lightReadingPrev) || 0;
    const curr = Number(form.lightReadingCurr) || 0;
    return Math.max(0, curr - prev);
  };

  const autoLightBill = lightBillManual
    ? Number(form.lightBill)
    : calcLightUnits() * LIGHT_RATE_PER_UNIT;

  const autoLightUnits = lightBillManual
    ? form.lightUnits
    : calcLightUnits();

  const autoTotal = (Number(form.rentAmount) || 0) + autoLightBill + (Number(form.waterBill) || 0);

  // Sync amountPaid to total only when user hasn't touched it
  const displayAmountPaid = amountPaidTouched ? form.amountPaid : String(autoTotal);

  const validate = () => {
    const e = {};
    if (!form.month) e.month = 'Select month';
    if (!form.rentAmount || isNaN(form.rentAmount)) e.rentAmount = 'Enter rent amount';
    if (!form.lightReadingPrev || isNaN(form.lightReadingPrev)) e.lightReadingPrev = 'Enter previous reading';
    if (!form.lightReadingCurr || isNaN(form.lightReadingCurr)) e.lightReadingCurr = 'Enter current reading';
    if (Number(form.lightReadingCurr) < Number(form.lightReadingPrev)) e.lightReadingCurr = 'Cannot be less than previous';
    if (form.rentPaid && !form.paymentMode) e.paymentMode = 'Select payment mode';
    if (form.rentPaid && !form.paidDate) e.paidDate = 'Enter paid date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const finalAmountPaid = amountPaidTouched ? Number(displayAmountPaid) : autoTotal;
    onSave({
      ...form,
      rentAmount: Number(form.rentAmount),
      lightReadingPrev: Number(form.lightReadingPrev),
      lightReadingCurr: Number(form.lightReadingCurr),
      lightUnits: autoLightUnits,
      lightBill: autoLightBill,
      waterBill: Number(form.waterBill),
      totalAmount: autoTotal,
      amountPaid: finalAmountPaid,
      year: Number(form.year),
    });
  };

  const partial = amountPaidTouched && Number(displayAmountPaid) < autoTotal && Number(displayAmountPaid) > 0;

  const sectionLabel = (icon, text) => (
    <div className="text-[11px] font-bold text-[var(--text-accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5">
      {icon} {text}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-end md:items-center justify-center z-[200] animate-[fadeIn_0.2s_ease] md:pl-[260px] md:pt-[72px] md:pb-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[680px] max-h-[92vh] md:max-h-[85vh] overflow-y-auto bg-[var(--bg-modal)] md:border border-[var(--border-color)] rounded-t-3xl md:rounded-[var(--radius-xl)] p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[slideUpSheet_0.3s_ease] md:animate-[slideUp_0.25s_ease] relative mt-auto md:mt-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[18px] font-bold">📋 {isEditing ? 'Edit Rent Record' : 'Add Rent Record'}</div>
            <div className="text-[13px] text-[var(--text-muted)] mt-[2px]">
              For <strong className="text-[var(--text-primary)]">{renter.name}</strong> — {renter.flat}
            </div>
          </div>
          <button className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center transition-all cursor-pointer hover:border-[var(--accent-danger)] hover:text-[var(--accent-danger)]" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="flex flex-col gap-6">

          {/* ── Period ── */}
          <div>
            {sectionLabel(<Calendar size={13} />, 'Period')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Month *</label>
                <select className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)] appearance-none" value={form.month} onChange={e => set('month', e.target.value)}>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
                {errors.month && <span className="text-[11px] text-[var(--accent-danger)]">{errors.month}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Year *</label>
                <select className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)] appearance-none" value={form.year} onChange={e => set('year', e.target.value)}>
                  {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Light Meter ── */}
          <div>
            {sectionLabel(<Zap size={13} />, 'Light Meter Reading')}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Previous *</label>
                <input type="number" className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)]" placeholder="e.g. 1245" inputMode="numeric"
                  value={form.lightReadingPrev}
                  onChange={e => { set('lightReadingPrev', e.target.value); setLightBillManual(false); }} />
                {errors.lightReadingPrev && <span className="text-[11px] text-[var(--accent-danger)]">{errors.lightReadingPrev}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Current *</label>
                <input type="number" className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)]" placeholder="e.g. 1289" inputMode="numeric"
                  value={form.lightReadingCurr}
                  onChange={e => { set('lightReadingCurr', e.target.value); setLightBillManual(false); }} />
                {errors.lightReadingCurr && <span className="text-[11px] text-[var(--accent-danger)]">{errors.lightReadingCurr}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Units</label>
                <div className="form-display form-display-info">{autoLightUnits} units</div>
              </div>
            </div>
          </div>

          {/* ── Bills ── */}
          <div>
            {sectionLabel(<IndianRupee size={13} />, 'Bills & Rent')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Rent (₹) *</label>
                <input type="number" className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)]" inputMode="numeric"
                  value={form.rentAmount} onChange={e => set('rentAmount', e.target.value)} />
                {errors.rentAmount && <span className="text-[11px] text-[var(--accent-danger)]">{errors.rentAmount}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Water Bill (₹)</label>
                <input type="number" className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)]" inputMode="numeric"
                  value={form.waterBill} onChange={e => set('waterBill', e.target.value)} />
              </div>

              {/* Light Bill — editable */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>⚡ Light Bill (₹)</span>
                  <button type="button" className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${lightBillManual ? 'bg-[rgba(245,158,11,0.1)] text-[var(--accent-warning)] border-[rgba(245,158,11,0.2)] hover:bg-[rgba(245,158,11,0.2)]' : 'bg-[rgba(56,189,248,0.1)] text-[var(--accent-info)] border-[rgba(56,189,248,0.2)] hover:bg-[rgba(56,189,248,0.2)]'}`}
                    onClick={() => setLightBillManual(m => !m)}>
                    {lightBillManual ? '✏ Manual' : '⚡ Auto'}
                  </button>
                </label>
                {lightBillManual ? (
                  <input type="number" className="bg-[rgba(108,99,255,0.05)] border border-[rgba(108,99,255,0.3)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--accent-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)]" inputMode="numeric"
                    placeholder="Enter actual bill"
                    value={form.lightBill}
                    onChange={e => { set('lightBill', e.target.value); }} />
                ) : (
                  <div className="px-4 py-3 rounded-[var(--radius-sm)] text-[14px] font-semibold flex flex-col justify-center bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[var(--accent-warning)] cursor-pointer hover:bg-[rgba(245,158,11,0.15)] transition-colors" onClick={() => setLightBillManual(true)}>
                    ₹{autoLightBill}
                    <span className="text-[10px] font-medium opacity-80 mt-1 uppercase tracking-wider">₹{LIGHT_RATE_PER_UNIT}/unit · tap to edit</span>
                  </div>
                )}
              </div>

              {/* Total Amount — always auto */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Total Amount (₹)</label>
                <div className="px-4 py-3 rounded-[var(--radius-sm)] font-semibold flex flex-col justify-center bg-[rgba(62,207,142,0.1)] border border-[rgba(62,207,142,0.2)] text-[#3ecf8e] text-[18px]">
                  ₹{autoTotal.toLocaleString()}
                  <span className="text-[10px] font-medium opacity-80 mt-1 uppercase tracking-wider">rent + light + water</span>
                </div>
              </div>
            </div>

            {/* Amount Actually Paid */}
            <div className="mt-5 p-5 bg-[rgba(108,99,255,0.04)] border border-[rgba(108,99,255,0.15)] rounded-2xl relative">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em] flex items-center gap-2">
                  <IndianRupee size={11} />
                  Amount Received (₹)
                  <span className="ml-auto text-[10px] text-[var(--text-muted)] font-medium normal-case tracking-normal">leave blank if same as total</span>
                </label>
                <input type="number" className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)]" inputMode="numeric"
                  placeholder={`₹${autoTotal.toLocaleString()} (full amount)`}
                  value={displayAmountPaid}
                  onChange={e => { set('amountPaid', e.target.value); setAmountPaidTouched(true); }}
                  onFocus={() => { if (!amountPaidTouched) { set('amountPaid', String(autoTotal)); setAmountPaidTouched(true); } }}
                />
                {partial && (
                  <span className="text-[11px] font-semibold text-[var(--accent-warning)] mt-1.5 inline-block">
                    ⚠ Partial — ₹{(autoTotal - Number(displayAmountPaid)).toLocaleString()} still pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Payment Status ── */}
          <div>
            {sectionLabel(<CheckCircle size={13} />, 'Payment Status')}

            <label className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl cursor-pointer transition-all hover:border-[rgba(108,99,255,0.3)]">
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-semibold text-[var(--text-primary)]">Mark as Paid</span>
                <span className="text-[11px] text-[var(--text-muted)]">Toggle once full or partial payment received</span>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${form.rentPaid ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] shadow-[0_0_12px_rgba(108,99,255,0.4)]' : 'bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]'}`}
                onClick={() => set('rentPaid', !form.rentPaid)}>
                <div className={`absolute top-[1px] left-[1px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ${form.rentPaid ? 'translate-x-[20px]' : 'translate-x-[0px]'}`} />
              </div>
            </label>

            {form.rentPaid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Payment Mode *</label>
                  <select className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)] appearance-none" value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)}>
                    <option value="">Select mode...</option>
                    {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                  {errors.paymentMode && <span className="text-[11px] text-[var(--accent-danger)]">{errors.paymentMode}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Date Paid *</label>
                  <input type="date" className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)]" value={form.paidDate} onChange={e => set('paidDate', e.target.value)} />
                  {errors.paidDate && <span className="text-[11px] text-[var(--accent-danger)]">{errors.paidDate}</span>}
                </div>
              </div>
            )}
          </div>

          {/* ── WhatsApp ── */}
          {/* ── WhatsApp ── */}
          <label className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[rgba(37,211,102,0.2)] rounded-xl cursor-pointer transition-all hover:bg-[rgba(37,211,102,0.02)]">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold flex items-center gap-2 text-[var(--text-primary)]">
                <MessageCircle size={14} style={{ color: '#25d366' }} /> WhatsApp reminder sent
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Mark if you've already sent a reminder</span>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${form.whatsappSent ? 'bg-[#25d366] border-[#25d366] shadow-[0_0_12px_rgba(37,211,102,0.4)]' : 'bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]'}`}
              onClick={() => set('whatsappSent', !form.whatsappSent)}>
              <div className={`absolute top-[1px] left-[1px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ${form.whatsappSent ? 'translate-x-[20px]' : 'translate-x-[0px]'}`} />
            </div>
          </label>

          {/* ── Notes ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Notes (optional)</label>
            <textarea className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)] resize-y" rows={2} placeholder="Any notes about this payment..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-6 pt-5 border-t border-[var(--border-color)]">
          <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)]" onClick={onClose}>Cancel</button>
          <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)]" onClick={handleSubmit}>
            {isEditing ? '✓ Save Changes' : '+ Add Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
