import { useState } from 'react';
import { X, Zap, Droplets, IndianRupee, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { MONTHS, PAYMENT_MODES, LIGHT_RATE_PER_UNIT } from '../../data/dummyData';

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
    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {icon} {text}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <div>
            <div className="modal-title">📋 {isEditing ? 'Edit Rent Record' : 'Add Rent Record'}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              For <strong style={{ color: 'var(--text-primary)' }}>{renter.name}</strong> — {renter.flat}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Period ── */}
          <div>
            {sectionLabel(<Calendar size={13} />, 'Period')}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Month *</label>
                <select className="form-select" value={form.month} onChange={e => set('month', e.target.value)}>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
                {errors.month && <span className="form-error">{errors.month}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Year *</label>
                <select className="form-select" value={form.year} onChange={e => set('year', e.target.value)}>
                  {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Light Meter ── */}
          <div>
            {sectionLabel(<Zap size={13} />, 'Light Meter Reading')}
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Previous *</label>
                <input type="number" className="form-input" placeholder="e.g. 1245" inputMode="numeric"
                  value={form.lightReadingPrev}
                  onChange={e => { set('lightReadingPrev', e.target.value); setLightBillManual(false); }} />
                {errors.lightReadingPrev && <span className="form-error">{errors.lightReadingPrev}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Current *</label>
                <input type="number" className="form-input" placeholder="e.g. 1289" inputMode="numeric"
                  value={form.lightReadingCurr}
                  onChange={e => { set('lightReadingCurr', e.target.value); setLightBillManual(false); }} />
                {errors.lightReadingCurr && <span className="form-error">{errors.lightReadingCurr}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Units</label>
                <div className="form-display form-display-info">{autoLightUnits} units</div>
              </div>
            </div>
          </div>

          {/* ── Bills ── */}
          <div>
            {sectionLabel(<IndianRupee size={13} />, 'Bills & Rent')}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Rent (₹) *</label>
                <input type="number" className="form-input" inputMode="numeric"
                  value={form.rentAmount} onChange={e => set('rentAmount', e.target.value)} />
                {errors.rentAmount && <span className="form-error">{errors.rentAmount}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Water Bill (₹)</label>
                <input type="number" className="form-input" inputMode="numeric"
                  value={form.waterBill} onChange={e => set('waterBill', e.target.value)} />
              </div>

              {/* Light Bill — editable */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>⚡ Light Bill (₹)</span>
                  <button type="button" className={`mode-pill ${lightBillManual ? 'mode-pill-manual' : 'mode-pill-auto'}`}
                    onClick={() => setLightBillManual(m => !m)}>
                    {lightBillManual ? '✏ Manual' : '⚡ Auto'}
                  </button>
                </label>
                {lightBillManual ? (
                  <input type="number" className="form-input form-input-accent" inputMode="numeric"
                    placeholder="Enter actual bill"
                    value={form.lightBill}
                    onChange={e => { set('lightBill', e.target.value); }} />
                ) : (
                  <div className="form-display form-display-warning" onClick={() => setLightBillManual(true)} style={{ cursor: 'pointer' }}>
                    ₹{autoLightBill}
                    <span className="form-display-hint">₹{LIGHT_RATE_PER_UNIT}/unit · tap to edit</span>
                  </div>
                )}
              </div>

              {/* Total Amount — always auto */}
              <div className="form-group">
                <label className="form-label">Total Amount (₹)</label>
                <div className="form-display form-display-success form-display-lg">
                  ₹{autoTotal.toLocaleString()}
                  <span className="form-display-hint">rent + light + water</span>
                </div>
              </div>
            </div>

            {/* Amount Actually Paid */}
            <div className="amount-paid-box">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IndianRupee size={11} />
                  Amount Received (₹)
                  <span className="form-hint-inline">leave blank if same as total</span>
                </label>
                <input type="number" className="form-input" inputMode="numeric"
                  placeholder={`₹${autoTotal.toLocaleString()} (full amount)`}
                  value={displayAmountPaid}
                  onChange={e => { set('amountPaid', e.target.value); setAmountPaidTouched(true); }}
                  onFocus={() => { if (!amountPaidTouched) { set('amountPaid', String(autoTotal)); setAmountPaidTouched(true); } }}
                />
                {partial && (
                  <span className="form-warning-msg">
                    ⚠ Partial — ₹{(autoTotal - Number(displayAmountPaid)).toLocaleString()} still pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Payment Status ── */}
          <div>
            {sectionLabel(<CheckCircle size={13} />, 'Payment Status')}

            <label className="custom-toggle-row">
              <div className="custom-toggle-info">
                <span className="custom-toggle-label">Mark as Paid</span>
                <span className="custom-toggle-desc">Toggle once full or partial payment received</span>
              </div>
              <div className={`custom-toggle-switch ${form.rentPaid ? 'on' : ''}`}
                onClick={() => set('rentPaid', !form.rentPaid)}>
                <div className="custom-toggle-thumb" />
              </div>
            </label>

            {form.rentPaid && (
              <div className="form-grid" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Payment Mode *</label>
                  <select className="form-select" value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)}>
                    <option value="">Select mode...</option>
                    {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                  {errors.paymentMode && <span className="form-error">{errors.paymentMode}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date Paid *</label>
                  <input type="date" className="form-input" value={form.paidDate} onChange={e => set('paidDate', e.target.value)} />
                  {errors.paidDate && <span className="form-error">{errors.paidDate}</span>}
                </div>
              </div>
            )}
          </div>

          {/* ── WhatsApp ── */}
          <label className="custom-toggle-row custom-toggle-row-whatsapp">
            <div className="custom-toggle-info">
              <span className="custom-toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={14} style={{ color: '#25d366' }} /> WhatsApp reminder sent
              </span>
              <span className="custom-toggle-desc">Mark if you've already sent a reminder</span>
            </div>
            <div className={`custom-toggle-switch custom-toggle-switch-green ${form.whatsappSent ? 'on' : ''}`}
              onClick={() => set('whatsappSent', !form.whatsappSent)}>
              <div className="custom-toggle-thumb" />
            </div>
          </label>

          {/* ── Notes ── */}
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-input" rows={2} placeholder="Any notes about this payment..."
              value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEditing ? '✓ Save Changes' : '+ Add Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
