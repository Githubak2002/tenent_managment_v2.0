import { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, FileJson, Users, User, CheckCircle } from 'lucide-react';
import {
  exportExcel, exportExcelSingle,
  exportCSV, exportCSVSingle,
  exportJSON, exportJSONSingle,
} from '../../utils/exportUtils';

const FORMATS = [
  { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: '#22c55e', desc: '2 sheets: full data + summary' },
  { id: 'csv', label: 'CSV (.csv)', icon: FileText, color: '#38bdf8', desc: 'Universal spreadsheet format' },
  { id: 'json', label: 'JSON (.json)', icon: FileJson, color: '#f59e0b', desc: 'Raw structured data' },
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
      const fn = `AkTenent_AllRenters_${ts}`;
      if (format === 'excel') exportExcel(renters, rentRecords, fn);
      else if (format === 'csv') exportCSV(renters, rentRecords, fn);
      else exportJSON(renters, rentRecords, fn);
    } else {
      if (!selectedRenter) return;
      const fn = `AkTenent_${selectedRenter.name.replace(/\s+/g, '_')}_${ts}`;
      if (format === 'excel') exportExcelSingle(selectedRenter, rentRecords, fn);
      else if (format === 'csv') exportCSVSingle(selectedRenter, rentRecords, fn);
      else exportJSONSingle(selectedRenter, rentRecords, fn);
    }
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-end md:items-center justify-center z-[200] animate-[fadeIn_0.2s_ease] px-4 md:pl-[260px] md:pt-[72px] md:pb-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-[var(--bg-modal)] md:border border-[var(--border-color)] rounded-b-none rounded-t-3xl md:rounded-[var(--radius-xl)] p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[slideUpSheet_0.3s_ease] md:animate-[slideUp_0.25s_ease] relative mt-auto md:mt-0 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[18px] font-bold"><Download size={18} className="inline mr-2" />Export Data</div>
            <div className="text-[13px] text-[var(--text-muted)] mt-[2px]">Choose format and scope</div>
          </div>
          <button className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center transition-all cursor-pointer hover:border-[var(--accent-danger)] hover:text-[var(--accent-danger)]" onClick={onClose}><X size={16} /></button>
        </div>

        {done ? (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 rounded-full bg-[rgba(62,207,142,0.12)] border-2 border-[var(--accent-secondary)] flex items-center justify-center mx-auto mb-4 text-[var(--accent-secondary)] shadow-[0_4px_16px_rgba(62,207,142,0.2)]">
              <CheckCircle size={28} />
            </div>
            <div className="text-[18px] font-bold text-[var(--text-primary)]">Download started!</div>
            <div className="text-[13px] text-[var(--text-muted)] mt-2">Your file is being downloaded…</div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* ── Format ── */}
            <div>
              <div className="text-[11px] font-bold text-[var(--text-accent)] uppercase tracking-[0.08em] mb-3">📄 File Format</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FORMATS.map(f => (
                  <button key={f.id}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-center bg-[var(--bg-card)] ${format === f.id ? 'border-[color:var(--fmt-color)] bg-[color:color-mix(in_srgb,var(--fmt-color)_8%,transparent)] shadow-[0_4px_16px_color-mix(in_srgb,var(--fmt-color)_20%,transparent)] -translate-y-[2px]' : 'border-[var(--border-color)] hover:border-[var(--text-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'}`}
                    onClick={() => setFormat(f.id)} style={{ '--fmt-color': f.color }}>
                    <f.icon size={22} className={`mb-2 transition-all ${format === f.id ? '' : 'grayscale opacity-50'}`} style={{ color: format === f.id ? f.color : undefined }} />
                    <div className={`text-[13px] font-bold mb-1 ${format === f.id ? 'text-[var(--text-primary)]' : ''}`}>{f.label}</div>
                    <div className="text-[10px] opacity-80 font-medium leading-[1.3]">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Scope ── */}
            <div>
              <div className="text-[11px] font-bold text-[var(--text-accent)] uppercase tracking-[0.08em] mb-3">🎯 Export Scope</div>
              <div className="flex gap-2.5">
                <button className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all border cursor-pointer ${scope === 'all' ? 'bg-[rgba(108,99,255,0.1)] border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`} onClick={() => setScope('all')}>
                  <Users size={16} /> All Renters ({renters.length})
                </button>
                <button className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all border cursor-pointer ${scope === 'single' ? 'bg-[rgba(108,99,255,0.1)] border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`} onClick={() => setScope('single')}>
                  <User size={16} /> Single Renter
                </button>
              </div>

              {scope === 'single' && (
                <div className="flex flex-col gap-1.5 mt-3.5">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.05em]">Select Renter</label>
                  <select className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] transition-all w-full focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] placeholder-[var(--text-muted)] appearance-none cursor-pointer" value={selectedRenterId} onChange={e => setSelectedRenterId(e.target.value)}>
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
                    <div className="mt-2 text-[12px] text-[var(--text-muted)] font-medium">
                      {rentRecords.filter(r => r.renterId === selectedRenter.id).length} rent record(s) will be included
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Preview ── */}
            <div className="mt-2 p-4 bg-[var(--bg-card)] border border-[rgba(108,99,255,0.15)] rounded-[var(--radius-md)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-primary)]" />
              <div className="text-[11px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-[0.08em]">What's included</div>
              <div className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                {scope === 'all'
                  ? `All ${renters.length} renters with their complete rent history (${rentRecords.length} records total)`
                  : selectedRenter
                    ? `${selectedRenter.name} — ${selectedRenter.flat} with ${rentRecords.filter(r => r.renterId === selectedRenter.id).length} rent records`
                    : 'Select a renter above'}
              </div>
              {format === 'excel' && scope === 'all' && (
                <div className="text-[11px] text-[var(--accent-primary)] mt-1.5 font-semibold">✦ Excel includes a Summary sheet with totals per renter</div>
              )}
            </div>
          </div>
        )}

        {!done && (
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-6 pt-5 border-t border-[var(--border-color)]">
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)]" onClick={onClose}>Cancel</button>
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleExport} disabled={scope === 'single' && !selectedRenter}>
              <Download size={15} />
              Export {format.toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
