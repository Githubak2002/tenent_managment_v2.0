import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, FileText, FileJson, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

// ── Column name mapping → internal field names ──────────────────────────────
const RENTER_MAP = {
  'name': 'name', 'Name': 'name',
  'phone': 'phone', 'Phone': 'phone',
  'room / flat': 'flat', 'Room / Flat': 'flat', 'flat': 'flat', 'Flat': 'flat', 'room': 'flat',
  'status': 'status', 'Status': 'status',
  'moved in': 'movedInDate', 'Moved In': 'movedInDate', 'movedindate': 'movedInDate',
  'moved out': 'movedOutDate', 'Moved Out': 'movedOutDate',
  'monthly rent (₹)': 'monthlyRent', 'Monthly Rent (₹)': 'monthlyRent', 'monthly rent': 'monthlyRent',
  'advance paid': 'advancePaid', 'Advance Paid': 'advancePaid',
  'advance amount (₹)': 'advanceAmount', 'Advance Amount (₹)': 'advanceAmount',
  'notes': 'notes', 'Notes': 'notes',
};

const RECORD_MAP = {
  'month': 'month', 'Month': 'month',
  'year': 'year', 'Year': 'year',
  'rent amount (₹)': 'rentAmount', 'Rent Amount (₹)': 'rentAmount',
  'light prev reading': 'lightReadingPrev', 'Light Prev Reading': 'lightReadingPrev',
  'light curr reading': 'lightReadingCurr', 'Light Curr Reading': 'lightReadingCurr',
  'light units': 'lightUnits', 'Light Units': 'lightUnits',
  'light bill (₹)': 'lightBill', 'Light Bill (₹)': 'lightBill',
  'water bill (₹)': 'waterBill', 'Water Bill (₹)': 'waterBill',
  'total due (₹)': 'totalAmount', 'Total Due (₹)': 'totalAmount',
  'amount paid (₹)': 'amountPaid', 'Amount Paid (₹)': 'amountPaid',
  'payment status': 'paymentStatus', 'Payment Status': 'paymentStatus',
  'payment mode': 'paymentMode', 'Payment Mode': 'paymentMode',
  'paid on': 'paidDate', 'Paid On': 'paidDate',
};

function mapRow(row, mapping) {
  const out = {};
  Object.entries(row).forEach(([k, v]) => {
    const key = mapping[k] || mapping[k.toLowerCase()];
    if (key) out[key] = v;
  });
  return out;
}

// Parse flat rows (CSV / Excel Rent Data sheet) into renters + records
function parseRows(rows) {
  const renterMap = {}; // name+phone key → renter object
  const records = [];

  rows.forEach((row, idx) => {
    const r = mapRow(row, { ...RENTER_MAP, ...RECORD_MAP });
    if (!r.name) return;

    const key = `${r.name}__${r.phone}`;
    if (!renterMap[key]) {
      renterMap[key] = {
        _importIdx: idx,
        name: r.name || '',
        phone: String(r.phone || '').replace(/\D/g, '').slice(0, 10),
        flat: r.flat || '',
        status: String(r.status || '').toLowerCase() === 'inactive' ? 'inactive' : 'active',
        movedInDate: parseDate(r.movedInDate),
        movedOutDate: parseDate(r.movedOutDate),
        monthlyRent: Number(r.monthlyRent) || 0,
        advancePaid: String(r.advancePaid || '').toLowerCase() === 'yes',
        advanceAmount: Number(r.advanceAmount) || 0,
        notes: r.notes || '',
      };
    }

    if (r.month && r.year && r.rentAmount !== undefined) {
      const amtPaid = Number(r.amountPaid) || 0;
      const totalAmount = Number(r.totalAmount) || 0;
      const status = String(r.paymentStatus || '').toLowerCase();
      records.push({
        _renterKey: key,
        month: r.month,
        year: Number(r.year),
        rentAmount: Number(r.rentAmount) || 0,
        lightReadingPrev: Number(r.lightReadingPrev) || 0,
        lightReadingCurr: Number(r.lightReadingCurr) || 0,
        lightUnits: Number(r.lightUnits) || 0,
        lightBill: Number(r.lightBill) || 0,
        waterBill: Number(r.waterBill) || 0,
        totalAmount,
        amountPaid: amtPaid,
        rentPaid: status === 'paid' || (amtPaid >= totalAmount && totalAmount > 0),
        paymentMode: r.paymentMode || null,
        paidDate: parseDate(r.paidDate),
        whatsappSent: false,
        notes: '',
      });
    }
  });

  return { renters: Object.values(renterMap), records, renterMap };
}

function parseDate(val) {
  if (!val || val === '—') return null;
  const d = new Date(val);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return null;
}

// Parse JSON export format
function parseJSON(json) {
  try {
    const data = JSON.parse(json);
    const renterList = data.renters || (data.renter ? [data.renter] : []);
    const renters = [];
    const records = [];
    renterList.forEach((r, i) => {
      const key = `${r.name}__${r.phone}`;
      renters.push({
        _importIdx: i, _key: key,
        name: r.name || '', phone: String(r.phone || '').replace(/\D/g, '').slice(0, 10),
        flat: r.flat || '', status: r.status || 'active',
        movedInDate: r.movedInDate || null, movedOutDate: r.movedOutDate || null,
        monthlyRent: Number(r.monthlyRent) || 0,
        advancePaid: Boolean(r.advancePaid), advanceAmount: Number(r.advanceAmount) || 0,
        notes: r.notes || '',
      });
      (r.rentHistory || []).forEach(rec => {
        records.push({ _renterKey: key, ...rec, _id: undefined, id: undefined, renterId: undefined });
      });
    });
    return { renters, records, renterMap: Object.fromEntries(renters.map(r => [r._key, r])) };
  } catch {
    return null;
  }
}

export default function ImportModal({ onClose, onImport }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(null); // { renters, records, renterMap }
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null); setParsing(true); setPreview(null);
    try {
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'json') {
        const text = await file.text();
        const result = parseJSON(text);
        if (!result) throw new Error('Invalid JSON format. Please use a AkTenent export file.');
        setPreview(result);
      } else if (ext === 'csv') {
        const text = await file.text();
        const wb = XLSX.read(text, { type: 'string' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        setPreview(parseRows(rows));
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        // Prefer 'Rent Data' sheet, else first sheet
        const sheetName = wb.SheetNames.includes('Rent Data') ? 'Rent Data' : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws);
        setPreview(parseRows(rows));
      } else {
        throw new Error('Unsupported file type. Please upload .xlsx, .csv, or .json');
      }
    } catch (e) {
      setError(e.message || 'Failed to parse file.');
    }
    setParsing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      await onImport(preview.renters, preview.records, preview.renterMap);
      setDone(true);
      setTimeout(() => onClose(), 2000);
    } catch (e) {
      setError(e.message || 'Import failed.');
    }
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-end md:items-center justify-center z-[200] animate-[fadeIn_0.2s_ease] px-4 md:pl-[260px] md:pt-[72px] md:pb-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[520px] bg-[var(--bg-modal)] md:border border-[var(--border-color)] rounded-b-none rounded-t-3xl md:rounded-[var(--radius-xl)] p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[slideUpSheet_0.3s_ease] md:animate-[slideUp_0.25s_ease] mt-auto md:mt-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <div className="text-[18px] font-bold flex items-center gap-2"><Upload size={18} className="text-[var(--accent-primary)]" />Import Data</div>
            <div className="text-[13px] text-[var(--text-muted)] mt-0.5">Upload Excel, CSV, or JSON from a AkTenent export</div>
          </div>
          <button className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center transition-all cursor-pointer hover:border-[var(--accent-danger)] hover:text-[var(--accent-danger)]" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {done ? (
            <div className="py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/12 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4 text-green-400">
                <CheckCircle size={28} />
              </div>
              <div className="text-[18px] font-bold text-[var(--text-primary)]">Import successful!</div>
              <p className="text-[13px] text-[var(--text-muted)] mt-2">Your data has been imported. The page will refresh.</p>
            </div>
          ) : (
            <>
              {/* Supported formats */}
              <div className="flex gap-2.5 mb-5">
                {[
                  { Icon: FileSpreadsheet, label: '.xlsx', color: '#22c55e' },
                  { Icon: FileText, label: '.csv', color: '#38bdf8' },
                  { Icon: FileJson, label: '.json', color: '#f59e0b' },
                ].map(({ Icon, label, color }) => (
                  <div key={label} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[12px] font-semibold text-[var(--text-secondary)]">
                    <Icon size={15} style={{ color }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-5 ${dragging ? 'border-[var(--accent-primary)] bg-[rgba(108,99,255,0.08)]' : 'border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:bg-[rgba(108,99,255,0.04)]'}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.json" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                {parsing ? (
                  <Loader2 size={28} className="animate-spin text-[var(--accent-primary)] mx-auto mb-3" />
                ) : (
                  <Upload size={28} className={`mx-auto mb-3 transition-colors ${dragging ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                )}
                <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
                  {parsing ? 'Parsing file…' : 'Drop file here or click to browse'}
                </p>
                <p className="text-[12px] text-[var(--text-muted)]">Supports Excel, CSV, or JSON exported from AkTenent</p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-[12px] font-medium">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}

              {/* Preview */}
              {preview && !error && (
                <div className="bg-[var(--bg-card)] border border-[rgba(108,99,255,0.2)] rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-primary)]" />
                  <div className="text-[11px] font-bold text-[var(--text-accent)] uppercase tracking-wider mb-3">Preview — ready to import</div>
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">Renters</span>
                      <span className="text-[22px] font-extrabold text-[var(--text-primary)]">{preview.renters.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">Rent Records</span>
                      <span className="text-[22px] font-extrabold text-[var(--text-primary)]">{preview.records.length}</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-[var(--text-muted)] mt-3">
                    ⚠️ Import will <strong>add</strong> these as new entries. Existing renters will not be affected.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {!done && (
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-5 pt-5 border-t border-[var(--border-color)] shrink-0">
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)]" onClick={onClose}>Cancel</button>
            <button
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!preview || importing || !!error}
              onClick={handleImport}
            >
              {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Import {preview ? `(${preview.renters.length} renters)` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
