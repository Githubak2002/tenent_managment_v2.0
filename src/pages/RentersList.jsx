import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Phone, Calendar, Home, IndianRupee, Download, Upload } from 'lucide-react';
import ExportModal from '../components/modals/ExportModal';
import ImportModal from '../components/modals/ImportModal';

export default function RentersList({ renters, rentRecords, onAddRenter, onOpenAddModal, onImport }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInactiveTab = location.search.includes('tab=inactive');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const now = new Date();
  const currentMonth = MONTHS[now.getMonth()];
  const currentYear = now.getFullYear();

  const activeRenters = renters.filter(r => r.status === 'active');
  const inactiveRenters = renters.filter(r => r.status !== 'active');
  const list = isInactiveTab ? inactiveRenters : activeRenters;

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.flat.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  }, [list, searchQuery]);

  const getLastPayment = (renterId) => {
    const records = rentRecords.filter(r => r.renterId === renterId && r.rentPaid);
    if (!records.length) return null;
    return records[records.length - 1];
  };

  const isPendingPayer = (renterId) => {
    // Renter is pending if their current-month record does NOT have rentPaid = true
    const rec = rentRecords.find(r =>
      String(r.renterId) === String(renterId) &&
      r.month === currentMonth &&
      r.year === currentYear
    );
    return !rec || !rec.rentPaid;
  };

  // Use onOpenAddModal (from App/FAB) or fallback to inline handler
  const handleAddClick = () => {
    if (onOpenAddModal) onOpenAddModal();
  };

  return (
    <div className="animate-slide-up">
      {/* Modals */}
      {showExport && (
        <ExportModal renters={renters} rentRecords={rentRecords} onClose={() => setShowExport(false)} />
      )}
      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onImport={async (...args) => { if (onImport) await onImport(...args); setShowImport(false); }} />
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] tracking-tight mb-1">{isInactiveTab ? 'Inactive Renters' : 'Active Renters'}</div>
          <div className="text-[14px] text-[var(--text-muted)] font-medium">
            {isInactiveTab
              ? `${inactiveRenters.length} renters currently inactive`
              : `${activeRenters.length} renters currently staying`}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button className="inline-flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)] shadow-sm" onClick={() => setShowImport(true)}>
            <Upload size={15} /> Import
          </button>
          <button className="inline-flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] shadow-sm" onClick={() => setShowExport(true)}>
            <Download size={15} /> Export
          </button>
          {!isInactiveTab && (
            <button className="inline-flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)]" onClick={handleAddClick}>
              <Plus size={16} /> Add Renter
            </button>
          )}
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-7 w-full">
        {/* Tab switcher — pill style, never wraps */}
        <div className="inline-flex p-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shrink-0 h-[44px]">
          <button
            className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${!isInactiveTab
                ? 'bg-[var(--bg-body)] text-[var(--text-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(0,0,0,0.02)] cursor-pointer'
              }`}
            onClick={() => navigate('/renters')}
          >
            ✅ Active ({activeRenters.length})
          </button>
          <button
            className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${isInactiveTab
                ? 'bg-[var(--bg-body)] text-[var(--text-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(0,0,0,0.02)] cursor-pointer'
              }`}
            onClick={() => navigate('/renters?tab=inactive')}
          >
            🚪 Inactive ({inactiveRenters.length})
          </button>
        </div>

        <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--radius-sm)] px-4 py-2 transition-all focus-within:border-[var(--accent-primary)] focus-within:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] flex-1 min-w-[200px] h-[44px] w-full">
          <Search size={16} className="text-[var(--text-muted)] shrink-0 mr-2.5" />
          <input
            className="flex-1 bg-transparent border-none text-[14px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:font-normal focus:outline-none min-w-0"
            placeholder="Search by name, room, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Renters Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-color)] border-dashed my-8">
          <div className="text-[48px] mb-4 opacity-60">🏠</div>
          <div className="text-[18px] font-extrabold text-[var(--text-primary)] tracking-tight mb-2">No renters found</div>
          <div className="text-[14px] text-[var(--text-muted)] max-w-[280px]">
            {searchQuery ? 'Try a different search term' : isInactiveTab ? 'No one has left yet' : 'Add your first renter to get started'}
          </div>
          {!isInactiveTab && !searchQuery && (
            <button className="mt-6 inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-body)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] shadow-sm" onClick={handleAddClick}>
              <Plus size={16} /> Add First Renter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 pb-8">
          {filtered.map(renter => {
            const lastPay = getLastPayment(renter.id);
            const pendingMarch = !isInactiveTab && isPendingPayer(renter.id);
            return (
              <div key={renter.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 relative transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[var(--shadow-md)] cursor-pointer hover:border-[rgba(108,99,255,0.3)] flex flex-col h-full" onClick={() => navigate(`/renters/${renter.id}`)}>
                {pendingMarch && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">⚠ Pending</span>
                  </div>
                )}
                <div className="flex items-start gap-4 mb-5 border-b border-[var(--border-color)] pb-5">
                  <div className="w-12 h-12 rounded-full font-extrabold text-[15px] bg-gradient-to-br from-[var(--bg-input)] to-[var(--bg-body)] text-[var(--text-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-sm">{renter.avatar}</div>
                  <div className="flex flex-col justify-center min-w-0 pr-12">
                    <div className="text-[16px] font-extrabold text-[var(--text-primary)] tracking-tight truncate leading-tight mb-1">{renter.name}</div>
                    <div className="text-[13px] font-semibold text-[var(--text-secondary)] flex items-center truncate">
                      <Home size={11} className="inline mr-1" />
                      {renter.flat}
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-[0.05em] border ${renter.status === 'active' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.2)]' : 'bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)] border-[rgba(239,68,68,0.2)]'}`}>
                        {renter.status === 'active' ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-5 flex-1">
                  <div className="flex items-center text-[13px] text-[var(--text-secondary)] font-medium">
                    <Phone className="text-[var(--text-muted)] mr-2 shrink-0" size={14} />
                    {renter.phone}
                  </div>
                  <div className="flex items-center text-[13px] text-[var(--text-secondary)] font-medium">
                    <Calendar className="text-[var(--text-muted)] mr-2 shrink-0" size={14} />
                    Moved in: {new Date(renter.movedInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {renter.movedOutDate && (
                    <div className="flex items-center text-[13px] text-[var(--accent-danger)] font-medium">
                      <Calendar className="text-[var(--accent-danger)] opacity-80 mr-2 shrink-0" size={14} />
                      Moved out: {new Date(renter.movedOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                  {renter.advancePaid && (
                    <div className="flex items-center text-[13px] text-[var(--text-secondary)] font-medium">
                      <IndianRupee className="text-[var(--text-muted)] mr-2 shrink-0" size={14} />
                      Advance: ₹{renter.advanceAmount.toLocaleString()}
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.05em] bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)] ml-2">Paid</span>
                    </div>
                  )}
                  {lastPay && (
                    <div className="flex items-center text-[11px] text-[var(--text-muted)] font-medium mt-1">
                      Last paid: {lastPay.month} {lastPay.year} via {lastPay.paymentMode}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                  <div>
                    <div className="text-[20px] font-extrabold text-[var(--text-primary)] tracking-tight leading-none mb-1">₹{renter.monthlyRent.toLocaleString()}</div>
                    <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">per month</div>
                  </div>
                  <button className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer bg-[var(--bg-body)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] shadow-sm" onClick={e => { e.stopPropagation(); navigate(`/renters/${renter.id}`); }}>
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
