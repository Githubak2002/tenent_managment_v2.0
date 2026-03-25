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

  const inputStyle = (field) => `form-input${errors[field] ? ' form-input-error' : ''}`;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <div>
            <div className="modal-title">🏠 {isEditing ? 'Edit Renter' : 'Add New Renter'}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isEditing ? 'Update renter details below' : 'Fill in the renter\'s details below'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Personal Details */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={13} /> Personal Details
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className={inputStyle('name')} placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
                {errors.name && <span style={{ fontSize: '11px', color: 'var(--accent-danger)' }}>{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className={inputStyle('phone')} placeholder="10-digit mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={10} inputMode="tel" />
                {errors.phone && <span style={{ fontSize: '11px', color: 'var(--accent-danger)' }}>{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Room & Dates */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Home size={13} /> Room & Dates
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Room / Flat *</label>
                <input className={inputStyle('flat')} placeholder="e.g. Room 101, Flat 2B" value={form.flat} onChange={e => set('flat', e.target.value)} />
                {errors.flat && <span style={{ fontSize: '11px', color: 'var(--accent-danger)' }}>{errors.flat}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Move-In Date *</label>
                <input type="date" className={inputStyle('movedInDate')} value={form.movedInDate} onChange={e => set('movedInDate', e.target.value)} />
                {errors.movedInDate && <span style={{ fontSize: '11px', color: 'var(--accent-danger)' }}>{errors.movedInDate}</span>}
              </div>
              {/* Show Move-Out Date only when editing */}
              {isEditing && (
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    Move-Out Date <span style={{ color: 'var(--text-muted)', fontWeight: '400', textTransform: 'none', letterSpacing: '0' }}>(optional)</span>
                  </label>
                  <input type="date" className="form-input" value={form.movedOutDate || ''} onChange={e => set('movedOutDate', e.target.value)} />
                  <span className="form-hint">Set this if the renter has moved out</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IndianRupee size={13} /> Financial Details
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Monthly Rent (₹) *</label>
                <input type="number" className={inputStyle('monthlyRent')} placeholder="e.g. 8000" value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} inputMode="numeric" />
                {errors.monthlyRent && <span style={{ fontSize: '11px', color: 'var(--accent-danger)' }}>{errors.monthlyRent}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Initial Light Meter Reading *</label>
                <input type="number" className={inputStyle('initialLightReading')} placeholder="e.g. 1245" value={form.initialLightReading} onChange={e => set('initialLightReading', e.target.value)} inputMode="numeric" />
                {errors.initialLightReading && <span style={{ fontSize: '11px', color: 'var(--accent-danger)' }}>{errors.initialLightReading}</span>}
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div className="form-toggle" style={{ marginBottom: '10px' }}>
                <input type="checkbox" id="advancePaid" className="toggle-input" checked={form.advancePaid} onChange={e => set('advancePaid', e.target.checked)} />
                <label htmlFor="advancePaid" style={{ fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>
                  Advance Paid?
                </label>
              </div>
              {form.advancePaid && (
                <div className="form-group">
                  <label className="form-label">Advance Amount (₹) *</label>
                  <input type="number" className={inputStyle('advanceAmount')} placeholder="e.g. 5000" value={form.advanceAmount} onChange={e => set('advanceAmount', e.target.value)} inputMode="numeric" />
                  {errors.advanceAmount && <span style={{ fontSize: '11px', color: 'var(--accent-danger)' }}>{errors.advanceAmount}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label"><FileText size={12} style={{ display:'inline', marginRight:'4px' }} />Notes (optional)</label>
            <textarea className="form-input" rows={2} placeholder="Any additional notes about this renter..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEditing ? '✓ Save Changes' : '+ Add Renter'}
          </button>
        </div>
      </div>
    </div>
  );
}
