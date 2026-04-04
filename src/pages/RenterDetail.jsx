import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Calendar, Home, IndianRupee, MessageCircle, Plus, Edit2, Edit3, Trash2, CheckCircle, Clock, Download, AlertTriangle } from 'lucide-react';
import AddRentRecordModal from '../components/modals/AddRentRecordModal';
import AddRenterModal from '../components/modals/AddRenterModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import ExportModal from '../components/modals/ExportModal';

const PAYMENT_MODE_CLASS = { Cash: 'badge-cash', UPI: 'badge-upi', 'Bank Transfer': 'badge-bank', Cheque: 'badge-bank' };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ── Rich WhatsApp message builder ──────────────────────────────────────────
function buildWhatsAppMessage(renter, record) {
  const amtPaid = record.amountPaid ?? (record.rentPaid ? record.totalAmount : 0);
  const balance = record.totalAmount - amtPaid;
  const partial = amtPaid > 0 && amtPaid < record.totalAmount;
  const fullyPaid = record.rentPaid && balance <= 0;

  const lines = [
    `🏠 *AkTenent — Rent ${fullyPaid ? 'Receipt' : 'Reminder'}*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 *Renter:* ${renter.name}`,
    `🏢 *Room:* ${renter.flat}`,
    `📅 *Month:* ${record.month} ${record.year}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📊 *Bill Breakdown*`,
    ``,
    `   🏠 Rent:           ₹${record.rentAmount.toLocaleString('en-IN')}`,
    `   ⚡ Light (${record.lightUnits} units): ₹${record.lightBill.toLocaleString('en-IN')}`,
    `      Reading: ${record.lightReadingPrev} → ${record.lightReadingCurr}`,
    `   💧 Water Bill:     ₹${record.waterBill.toLocaleString('en-IN')}`,
    `   ━━━━━━━━━━━━━━━━`,
    `   💰 *Total Due:*    ₹${record.totalAmount.toLocaleString('en-IN')}`,
  ];

  if (fullyPaid) {
    lines.push(`   ✅ *Amount Paid:*  ₹${amtPaid.toLocaleString('en-IN')}`);
    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`✅ *Payment received. Thank you!* 🙏`);
  } else if (partial) {
    lines.push(`   ✅ *Paid So Far:*  ₹${amtPaid.toLocaleString('en-IN')}`);
    lines.push(`   ⏳ *Still Pending: ₹${balance.toLocaleString('en-IN')}*`);
    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`⚠️ Partial payment received. Please pay the remaining ₹${balance.toLocaleString('en-IN')} at your earliest convenience. Thank you! 🙏`);
  } else {
    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`⏳ *Payment pending.* Please pay ₹${record.totalAmount.toLocaleString('en-IN')} at your earliest convenience. Thank you! 🙏`);
  }

  return lines.join('\n');
}

export default function RenterDetail({ renters, rentRecords, onUpdateRenter, onDeleteRenter, onAddRentRecord, onUpdateRentRecord, onDeleteRentRecord }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const renter = renters.find(r => String(r.id) === String(id));

  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showEditRenter, setShowEditRenter] = useState(false);
  const [showDeleteRenter, setShowDeleteRenter] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [showExport, setShowExport] = useState(false);

  if (!renter) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-color)] border-dashed my-8">
        <div className="text-[48px] mb-4 opacity-80 mix-blend-luminosity">🔍</div>
        <div className="text-[18px] font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Renter not found</div>
        <button className="mt-4 inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)]" onClick={() => navigate('/renters')}>← Back to Renters</button>
      </div>
    );
  }

  const myRecords = rentRecords
    .filter(r => r.renterId === renter.id)
    .sort((a, b) => b.year - a.year || MONTHS.indexOf(b.month) - MONTHS.indexOf(a.month));

  const totalPaid = myRecords.filter(r => r.rentPaid).reduce((s, r) => s + (r.amountPaid ?? r.totalAmount), 0);
  const totalMonths = myRecords.length;
  const paidMonths = myRecords.filter(r => r.rentPaid).length;

  const handleWhatsApp = (record) => {
    const msg = encodeURIComponent(buildWhatsAppMessage(renter, record));
    window.open(`https://wa.me/91${renter.phone}?text=${msg}`, '_blank');
    if (!record.whatsappSent) onUpdateRentRecord(record.id, { whatsappSent: true });
  };

  const handleEditRenterSave = (data) => {
    const updatedAvatar = data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    onUpdateRenter(renter.id, { ...data, avatar: updatedAvatar });
    setShowEditRenter(false);
  };

  const handleDeleteRenter = () => {
    onDeleteRenter(renter.id);
    navigate('/renters');
  };

  const handleDeleteRecord = () => {
    if (!deletingRecord) return;
    onDeleteRentRecord(deletingRecord.id);
    setDeletingRecord(null);
  };

  // Helper: determine payment display state for a record
  const getPaymentState = (record) => {
    const amtPaid = record.amountPaid ?? (record.rentPaid ? record.totalAmount : 0);
    const balance = record.totalAmount - amtPaid;
    if (!record.rentPaid) return { state: 'unpaid', amtPaid, balance };
    if (balance > 0) return { state: 'partial', amtPaid, balance };
    return { state: 'paid', amtPaid, balance: 0 };
  };

  return (
    <div className="animate-[slideUp_0.3s_ease]">
      {/* Back */}
      <button className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-lg text-[13px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] cursor-pointer" onClick={() => navigate('/renters')}>
        <ArrowLeft size={16} /> Back to Renters
      </button>

      {/* ===== Profile Header ============================================================ */}
      {/* Mobile: stacked card  |  Desktop: horizontal banner with stats on right */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] mb-6 overflow-hidden">
        {/* Top banner strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--accent-primary)] via-[#9333ea] to-[#3ecf8e]" />

        <div className="p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          {/* Avatar */}
          <div className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-2xl font-extrabold text-[24px] bg-gradient-to-br from-[var(--accent-primary)]/20 to-[#9333ea]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0 shadow-[var(--shadow-accent)]"
          >{renter.avatar}</div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h2 className="text-[22px] md:text-[26px] font-extrabold text-[var(--text-primary)] tracking-tight leading-none">{renter.name}</h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${renter.status === 'active'
                  ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.25)]'
                  : 'bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)] border-[rgba(239,68,68,0.25)]'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full inline-block bg-current" />
                {renter.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
              <span className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)]">
                <Home size={13} className="shrink-0" /> {renter.flat}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)]">
                <Phone size={13} className="shrink-0" /> +91 {renter.phone}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)]">
                <Calendar size={13} className="shrink-0" />
                Since {new Date(renter.movedInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {renter.movedOutDate && (
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--accent-danger)]">
                  <Calendar size={13} className="shrink-0" />
                  Left {new Date(renter.movedOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Desktop: quick stat pills */}
          <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
            <div className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] min-w-[90px]">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Monthly</span>
              <span className="text-[15px] font-extrabold text-[var(--text-primary)]">₹{renter.monthlyRent.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] min-w-[90px]">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Collected</span>
              <span className="text-[15px] font-extrabold text-[#3ecf8e]">₹{totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] min-w-[70px]">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Months</span>
              <span className="text-[15px] font-extrabold text-[var(--text-primary)]">{paidMonths}<span className="text-[var(--text-muted)] font-medium">/{totalMonths}</span></span>
            </div>
          </div>

          {/* Mobile: action buttons row */}
          <div className="flex md:hidden flex-wrap gap-2 w-full">
            <a href={`tel:${renter.phone}`} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all cursor-pointer shadow-sm">
              <Phone size={13} /> Call
            </a>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-[#25d366] hover:bg-[#20bd5a] text-white shadow-sm border-none cursor-pointer transition-all" onClick={() => window.open(`https://wa.me/91${renter.phone}`, '_blank')}>
              <MessageCircle size={13} /> WhatsApp
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-sm" onClick={() => setShowExport(true)}>
              <Download size={13} /> Export
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-sm" onClick={() => setShowEditRenter(true)}>
              <Edit3 size={13} /> Edit
            </button>
            <button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-[rgba(239,68,68,0.08)] text-[var(--accent-danger)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)] transition-all cursor-pointer shadow-sm" onClick={() => setShowDeleteRenter(true)}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        {/* Desktop: action button strip at the bottom of the header card */}
        <div className="hidden md:flex items-center gap-2 px-7 pb-5 pt-1">
          <a href={`tel:${renter.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all cursor-pointer shadow-sm">
            <Phone size={13} /> Call
          </a>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-[#25d366] hover:bg-[#20bd5a] text-white shadow-sm border-none cursor-pointer transition-all" onClick={() => window.open(`https://wa.me/91${renter.phone}`, '_blank')}>
            <MessageCircle size={13} /> WhatsApp
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-sm" onClick={() => setShowExport(true)}>
            <Download size={13} /> Export
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-sm" onClick={() => setShowEditRenter(true)}>
            <Edit3 size={13} /> Edit
          </button>
          <div className="ml-auto">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-[rgba(239,68,68,0.08)] text-[var(--accent-danger)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)] transition-all cursor-pointer shadow-sm" onClick={() => setShowDeleteRenter(true)}>
              <Trash2 size={13} /> Delete Renter
            </button>
          </div>
        </div>

        {/* Info stat row — mobile only */}
        <div className="md:hidden grid grid-cols-3 border-t border-[var(--border-color)] divide-x divide-[var(--border-color)]">
          <div className="flex flex-col items-center py-3 px-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Monthly</span>
            <span className="text-[14px] font-extrabold text-[var(--text-primary)]">₹{renter.monthlyRent.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center py-3 px-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Collected</span>
            <span className="text-[14px] font-extrabold text-[#3ecf8e]">₹{totalPaid.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center py-3 px-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Months</span>
            <span className="text-[14px] font-extrabold text-[var(--text-primary)]">{paidMonths}<span className="text-[var(--text-muted)] font-medium">/{totalMonths}</span></span>
          </div>
        </div>
      </div>

      {/* Info Grid — desktop: show notes below stats; mobile: 2-col grid same as before */}
      <div className="hidden md:grid grid-cols-5 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Monthly Rent</div>
          <div className="text-[20px] font-extrabold text-[var(--text-primary)] mt-auto">₹{renter.monthlyRent.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Advance Paid</div>
          <div className="text-[20px] font-extrabold text-[var(--text-primary)] mt-auto">{renter.advancePaid ? `₹${renter.advanceAmount.toLocaleString()}` : '—'}</div>
          <div className="mt-1">{renter.advancePaid ? <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.05em] bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]">✓ Received</span> : <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.05em] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">Pending</span>}</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Initial Reading</div>
          <div className="text-[20px] font-extrabold text-[var(--text-primary)] mt-auto">{renter.initialLightReading} <span className="text-[12px] text-[var(--text-muted)] font-medium">units</span></div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Months Recorded</div>
          <div className="text-[20px] font-extrabold text-[var(--text-primary)] mt-auto">{totalMonths}</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">{paidMonths} paid · {totalMonths - paidMonths} pending</div>
        </div>
        {renter.notes ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col">
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Notes</div>
            <div className="text-[12px] font-medium text-[var(--text-primary)] leading-relaxed mt-auto">{renter.notes}</div>
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] border-dashed rounded-[var(--radius-md)] p-4 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em]">No Notes</div>
          </div>
        )}
      </div>

      {/* Info Grid — mobile: 2-col */}
      <div className="md:hidden grid grid-cols-2 gap-3 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Monthly Rent</div>
          <div className="text-[18px] font-extrabold text-[var(--text-primary)] mt-auto leading-tight">₹{renter.monthlyRent.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Total Collected</div>
          <div className="text-[18px] font-extrabold text-[#3ecf8e] mt-auto leading-tight">₹{totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Months Recorded</div>
          <div className="text-[18px] font-extrabold text-[var(--text-primary)] mt-auto leading-tight">{totalMonths}</div>
          <div className="text-[11px] font-semibold text-[var(--text-muted)] mt-1">{paidMonths} paid, {totalMonths - paidMonths} pending</div>
        </div>
        {renter.notes && (
          <div className="bg-[input] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col col-span-2">
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Notes</div>
            <div className="text-[13px] font-medium text-[var(--text-primary)]">{renter.notes}</div>
          </div>
        )}
      </div>

      {/* Rent History Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
        <div className="text-[16px] md:text-[18px] font-extrabold text-[var(--text-primary)] tracking-tight">📋 Rent History</div>
        {renter.status === 'active' && (
          <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-bold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-sm hover:-translate-y-px" onClick={() => setShowAddRecord(true)}>
            <Plus size={14} /> Add Record
          </button>
        )}
      </div>

      {myRecords.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-color)]">
          <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-body)] rounded-[var(--radius-lg)] border border-[var(--border-color)] border-dashed m-4">
            <div className="text-[32px] mb-4 opacity-80 mix-blend-luminosity">📄</div>
            <div className="text-[16px] font-extrabold text-[var(--text-primary)] tracking-tight mb-1">No rent records yet</div>
            <div className="text-[13px] text-[var(--text-muted)]">Add the first rent record for this renter</div>
          </div>
        </div>
      ) : (
        <>
          {/* ===== DESKTOP TABLE — no whitespace-nowrap so cols wrap, no horizontal scroll ===== */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-sm hidden md:block custom-scrollbar">
            <table className="w-full border-collapse text-left text-[13px] text-[var(--text-primary)]" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)] first:rounded-tl-[var(--radius-lg)]">Month / Year</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">Rent</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">Light Reading</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">Light Bill</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">Water Bill</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">Total Amount</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">Received</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">Status</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">Paid On</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">WhatsApp</th>
                  <th className="px-4 py-3 bg-[var(--bg-body)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)] last:rounded-tr-[var(--radius-lg)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.map(record => {
                  const { state, amtPaid, balance } = getPaymentState(record);
                  const isPartialOrUnpaid = state !== 'paid';
                  return (
                    <tr key={record.id} className="group hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle"><div className="font-semibold text-[var(--text-primary)]">{record.month} {record.year}</div></td>
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle"><span className="font-extrabold text-[var(--text-primary)]">₹{record.rentAmount.toLocaleString()}</span></td>
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle">
                        <div className="text-[12px] text-[var(--text-muted)] font-medium">{record.lightReadingPrev} → {record.lightReadingCurr}</div>
                        <div className="text-[11px] text-[var(--accent-info)] font-bold">{record.lightUnits} units</div>
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle"><span className="font-extrabold text-[var(--text-primary)]">₹{record.lightBill}</span></td>
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle"><span className="font-extrabold text-[var(--text-primary)]">₹{record.waterBill}</span></td>
                      {/* Total — red if any pending */}
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle">
                        <span className={`font-extrabold text-[15px] ${isPartialOrUnpaid ? 'text-[var(--accent-danger)]' : 'text-[#3ecf8e]'}`}>
                          ₹{record.totalAmount.toLocaleString()}
                        </span>
                      </td>
                      {/* Amount Received */}
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle">
                        {state === 'paid' && <span className="font-extrabold text-[#3ecf8e]">₹{amtPaid.toLocaleString()}</span>}
                        {state === 'partial' && (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-extrabold text-[var(--accent-warning)]">₹{amtPaid.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-[var(--accent-danger)] uppercase tracking-wider">{balance.toLocaleString()} due</span>
                          </div>
                        )}
                        {state === 'unpaid' && <span className="text-[14px] text-[var(--text-muted)] font-bold">—</span>}
                      </td>
                      {/* Status badge */}
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle">
                        <div className="flex flex-col gap-1 items-start">
                          {state === 'paid' && <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]"><CheckCircle size={10} className="mr-1" /> Paid</span>}
                          {state === 'partial' && <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]"><AlertTriangle size={10} className="mr-1" /> Partial</span>}
                          {state === 'unpaid' && <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]"><Clock size={10} className="mr-1" /> Pending</span>}
                          {record.paymentMode && state !== 'unpaid' && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.05em] bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)]">{record.paymentMode}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle text-[12px] font-semibold text-[var(--text-muted)]">
                        {record.paidDate ? new Date(record.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle">
                        {record.whatsappSent ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(37,211,102,0.1)] text-[#25d366] border border-[rgba(37,211,102,0.3)]">✓ Sent</span>
                        ) : (
                          <button className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-bold transition-all cursor-pointer bg-[#25d366] hover:bg-[#20bd5a] text-white shadow-sm border-none" onClick={() => handleWhatsApp(record)}>
                            <MessageCircle size={12} /> Send
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border-color)] group-last:border-0 align-middle">
                        <div className="flex items-center gap-1.5">
                          <button className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-all cursor-pointer shadow-none" onClick={() => setEditingRecord(record)} title="Edit record"><Edit2 size={13} /></button>
                          <button className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-danger)] hover:bg-[rgba(239,68,68,0.1)] transition-all cursor-pointer shadow-none" onClick={() => setDeletingRecord(record)} title="Delete record"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ===== MOBILE CARDS ===== */}
          <div className="md:hidden flex flex-col gap-4">
            {myRecords.map(record => {
              const { state, amtPaid, balance } = getPaymentState(record);
              const isPartialOrUnpaid = state !== 'paid';
              return (
                <div key={record.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]">
                  <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-body)] border-b border-[var(--border-color)]">
                    <div className="font-extrabold text-[14px] text-[var(--text-primary)]">{record.month} {record.year}</div>
                    <div className="flex items-center gap-2">
                      {state === 'paid' && <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]"><CheckCircle size={10} className="mr-1" /> Paid</span>}
                      {state === 'partial' && <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]"><AlertTriangle size={10} className="mr-1" /> Partial</span>}
                      {state === 'unpaid' && <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]"><Clock size={10} className="mr-1" /> Pending</span>}
                      <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-all cursor-pointer shadow-none" onClick={() => setEditingRecord(record)} title="Edit"><Edit2 size={13} /></button>
                      <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-danger)] hover:bg-[rgba(239,68,68,0.1)] transition-all cursor-pointer shadow-none" onClick={() => setDeletingRecord(record)} title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 p-4 border-b border-[var(--border-color)]">
                    <div>
                      <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Rent</div>
                      <div className="font-extrabold text-[14px] text-[var(--text-primary)]">₹{record.rentAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Light Bill</div>
                      <div className="font-extrabold text-[14px] text-[var(--text-primary)]">₹{record.lightBill} <span className="text-[10px] text-[var(--text-muted)] font-medium">({record.lightUnits}u)</span></div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Water Bill</div>
                      <div className="font-extrabold text-[14px] text-[var(--text-primary)]">₹{record.waterBill}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">Readings</div>
                      <div className="font-bold text-[13px] text-[var(--accent-info)]">{record.lightReadingPrev}→{record.lightReadingCurr}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-card)]">
                    <div>
                      <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">{isPartialOrUnpaid ? 'Total Due' : 'Total Paid'}</div>
                      <div className={`text-[18px] font-extrabold ${isPartialOrUnpaid ? 'text-[var(--accent-danger)]' : 'text-[#3ecf8e]'}`}>
                        ₹{state === 'paid' ? amtPaid.toLocaleString() : record.totalAmount.toLocaleString()}
                      </div>
                      {state === 'partial' && (
                        <div className="text-[11px] font-bold text-[var(--accent-warning)] uppercase tracking-wider mt-0.5">
                          Paid ₹{amtPaid.toLocaleString()} · ₹{balance.toLocaleString()} due
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {record.paymentMode && state !== 'unpaid' && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.05em] bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)]">{record.paymentMode}</span>
                      )}
                      {!record.whatsappSent ? (
                        <button className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-bold transition-all cursor-pointer bg-[#25d366] hover:bg-[#20bd5a] text-white shadow-sm border-none" onClick={() => handleWhatsApp(record)}>
                          <MessageCircle size={12} /> Remind
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(37,211,102,0.1)] text-[#25d366] border border-[rgba(37,211,102,0.3)]">✓ Sent</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===== MODALS ===== */}
      {showAddRecord && (
        <AddRentRecordModal renter={renter} existingRecords={myRecords} onClose={() => setShowAddRecord(false)}
          onSave={(data) => { onAddRentRecord({ ...data, renterId: renter.id }); setShowAddRecord(false); }} />
      )}
      {editingRecord && (
        <AddRentRecordModal renter={renter} existingRecords={myRecords} initialData={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(data) => { onUpdateRentRecord(editingRecord.id, data); setEditingRecord(null); }} />
      )}
      {showEditRenter && (
        <AddRenterModal initialData={renter} onClose={() => setShowEditRenter(false)} onSave={handleEditRenterSave} />
      )}
      {showExport && (
        <ExportModal renters={renters} rentRecords={rentRecords} defaultRenter={renter} onClose={() => setShowExport(false)} />
      )}
      {showDeleteRenter && (
        <DeleteConfirmModal title="Delete Renter"
          description={`Permanently delete "${renter.name}" (${renter.flat}) and all ${myRecords.length} rent record(s).`}
          onClose={() => setShowDeleteRenter(false)} onConfirm={handleDeleteRenter} />
      )}
      {deletingRecord && (
        <DeleteConfirmModal title="Delete Rent Record"
          description={`Permanently delete the rent record for ${deletingRecord.month} ${deletingRecord.year} (₹${deletingRecord.totalAmount?.toLocaleString()}).`}
          onClose={() => setDeletingRecord(null)} onConfirm={handleDeleteRecord} />
      )}
    </div>
  );
}
