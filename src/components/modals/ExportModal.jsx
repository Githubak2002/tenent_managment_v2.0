import { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, FileJson, Users, User, CheckCircle } from 'lucide-react';
import {
  exportExcel, exportExcelSingle,
  exportCSV, exportCSVSingle,
  exportJSON, exportJSONSingle,
} from '../../utils/exportUtils';

const FORMATS = [
  { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: '#22c55e', desc: '2 sheets: full data + summary' },
  { id: 'csv',   label: 'CSV (.csv)',   icon: FileText,        color: '#38bdf8', desc: 'Universal spreadsheet format' },
  { id: 'json',  label: 'JSON (.json)', icon: FileJson,        color: '#f59e0b', desc: 'Raw structured data' },
];

export default function ExportModal({ renters, rentRecords, defaultRenter, onClose }) {
  const [format, setFormat] = useState('excel');
  const [scope, setScope] = useState(defaultRenter ? 'single' : 'all');
  const [selectedRenterId, setSelectedRenterId] = useState(defaultRenter?.id ?? (renters[0]?.id ?? null));
  const [done, setDone] = useState(false);

  const selectedRenter = renters.find(r => r.id === Number(selectedRenterId));
  const activeRenters = renters.filter(r => r.status === 'active');
  const inactiveRenters = renters.filter(r => r.status !== 'active');

  const handleExport = () => {
    const ts = new Date().toISOString().slice(0, 10);
    if (scope === 'all') {
      const fn = `TenantPro_AllRenters_${ts}`;
      if (format === 'excel') exportExcel(renters, rentRecords, fn);
      else if (format === 'csv') exportCSV(renters, rentRecords, fn);
      else exportJSON(renters, rentRecords, fn);
    } else {
      if (!selectedRenter) return;
      const fn = `TenantPro_${selectedRenter.name.replace(/\s+/g,'_')}_${ts}`;
      if (format === 'excel') exportExcelSingle(selectedRenter, rentRecords, fn);
      else if (format === 'csv') exportCSVSingle(selectedRenter, rentRecords, fn);
      else exportJSONSingle(selectedRenter, rentRecords, fn);
    }
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title"><Download size={18} style={{ display:'inline', marginRight:'8px' }} />Export Data</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Choose format and scope</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(62,207,142,0.12)', border: '2px solid var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-secondary)' }}>
              <CheckCircle size={28} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Download started!</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Your file is being downloaded…</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Format ── */}
            <div>
              <div className="export-section-label">📄 File Format</div>
              <div className="export-format-grid">
                {FORMATS.map(f => (
                  <button key={f.id} className={`export-format-card ${format === f.id ? 'selected' : ''}`}
                    onClick={() => setFormat(f.id)} style={{ '--fmt-color': f.color }}>
                    <f.icon size={22} style={{ color: f.color }} />
                    <div className="export-format-label">{f.label}</div>
                    <div className="export-format-desc">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Scope ── */}
            <div>
              <div className="export-section-label">🎯 Export Scope</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className={`export-scope-btn ${scope === 'all' ? 'active' : ''}`} onClick={() => setScope('all')}>
                  <Users size={16} /> All Renters ({renters.length})
                </button>
                <button className={`export-scope-btn ${scope === 'single' ? 'active' : ''}`} onClick={() => setScope('single')}>
                  <User size={16} /> Single Renter
                </button>
              </div>

              {scope === 'single' && (
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label">Select Renter</label>
                  <select className="form-select" value={selectedRenterId} onChange={e => setSelectedRenterId(e.target.value)}>
                    {activeRenters.length > 0 && (
                      <optgroup label="Active Renters">
                        {activeRenters.map(r => <option key={r.id} value={r.id}>{r.name} — {r.flat}</option>)}
                      </optgroup>
                    )}
                    {inactiveRenters.length > 0 && (
                      <optgroup label="Inactive Renters">
                        {inactiveRenters.map(r => <option key={r.id} value={r.id}>{r.name} — {r.flat}</option>)}
                      </optgroup>
                    )}
                  </select>
                  {selectedRenter && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {rentRecords.filter(r => r.renterId === selectedRenter.id).length} rent record(s) will be included
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Preview ── */}
            <div className="export-preview-box">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>What's included</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {scope === 'all'
                  ? `All ${renters.length} renters with their complete rent history (${rentRecords.length} records total)`
                  : selectedRenter
                    ? `${selectedRenter.name} — ${selectedRenter.flat} with ${rentRecords.filter(r => r.renterId === selectedRenter.id).length} rent records`
                    : 'Select a renter above'}
              </div>
              {format === 'excel' && scope === 'all' && (
                <div style={{ fontSize: '11px', color: 'var(--text-accent)', marginTop: '6px' }}>✦ Excel includes a Summary sheet with totals per renter</div>
              )}
            </div>
          </div>
        )}

        {!done && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleExport} disabled={scope === 'single' && !selectedRenter}
              style={{ gap: '8px' }}>
              <Download size={15} />
              Export {format.toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
