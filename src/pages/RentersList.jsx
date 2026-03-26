import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Phone, Calendar, Home, IndianRupee, Download } from 'lucide-react';
import ExportModal from '../components/modals/ExportModal';

export default function RentersList({ renters, rentRecords, onAddRenter, onOpenAddModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInactiveTab = location.search.includes('tab=inactive');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExport, setShowExport] = useState(false);

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
    // 1. Renter had not paid rent for current month
    const currentMonth = rentRecords.find(r => String(r.renterId) === String(renterId) && r.month === 'March' && r.year === 2025);
    const unpaidCurrent = !currentMonth || !currentMonth.rentPaid;

    // 2. Status in rent history is pending (unpaid or partially paid)
    const hasPendingHistory = rentRecords.some(r => String(r.renterId) === String(renterId) && (!r.rentPaid || (r.amountPaid !== null && r.amountPaid < r.totalAmount)));

    return unpaidCurrent && hasPendingHistory;
  };

  // Use onOpenAddModal (from App/FAB) or fallback to inline handler
  const handleAddClick = () => {
    if (onOpenAddModal) onOpenAddModal();
  };

  return (
    <div className="animate-slide-up">
      {/* Export Modal */}
      {showExport && (
        <ExportModal renters={renters} rentRecords={rentRecords} onClose={() => setShowExport(false)} />
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{isInactiveTab ? 'Inactive Renters' : 'Active Renters'}</div>
          <div className="page-subtitle">
            {isInactiveTab
              ? `${inactiveRenters.length} renters currently inactive`
              : `${activeRenters.length} renters currently staying`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowExport(true)}>
            <Download size={16} /> Export
          </button>
          {!isInactiveTab && (
            <button className="btn btn-primary" onClick={handleAddClick}>
              <Plus size={16} /> Add Renter
            </button>
          )}
        </div>
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="tabs">
          <button
            className={`tab-btn ${!isInactiveTab ? 'active' : ''}`}
            onClick={() => navigate('/renters')}
          >
            ✅ Active ({activeRenters.length})
          </button>
          <button
            className={`tab-btn ${isInactiveTab ? 'active' : ''}`}
            onClick={() => navigate('/renters?tab=inactive')}
          >
            🚪 Inactive ({inactiveRenters.length})
          </button>
        </div>

        <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            className="search-input"
            placeholder="Search by name, room, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Renters Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <div className="empty-state-title">No renters found</div>
          <div className="empty-state-text">
            {searchQuery ? 'Try a different search term' : isInactiveTab ? 'No one has left yet' : 'Add your first renter to get started'}
          </div>
          {!isInactiveTab && !searchQuery && (
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleAddClick}>
              <Plus size={16} /> Add First Renter
            </button>
          )}
        </div>
      ) : (
        <div className="renters-grid">
          {filtered.map(renter => {
            const lastPay = getLastPayment(renter.id);
            const pendingMarch = !isInactiveTab && isPendingPayer(renter.id);
            return (
              <div key={renter.id} className="renter-card" onClick={() => navigate(`/renters/${renter.id}`)}>
                {pendingMarch && (
                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <span className="badge badge-pending" style={{ fontSize: '10px' }}>⚠ Pending</span>
                  </div>
                )}
                <div className="renter-header">
                  <div className="renter-avatar">{renter.avatar}</div>
                  <div className="renter-info">
                    <div className="renter-name">{renter.name}</div>
                    <div className="renter-flat">
                      <Home size={11} style={{ display: 'inline', marginRight: '4px' }} />
                      {renter.flat}
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span className={`badge ${renter.status === 'active' ? 'badge-active' : 'badge-left'}`}>
                        {renter.status === 'active' ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="renter-details">
                  <div className="renter-detail-row">
                    <Phone className="renter-detail-icon" size={13} />
                    {renter.phone}
                  </div>
                  <div className="renter-detail-row">
                    <Calendar className="renter-detail-icon" size={13} />
                    Moved in: {new Date(renter.movedInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {renter.movedOutDate && (
                    <div className="renter-detail-row">
                      <Calendar className="renter-detail-icon" size={13} />
                      Moved out: {new Date(renter.movedOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                  {renter.advancePaid && (
                    <div className="renter-detail-row">
                      <IndianRupee className="renter-detail-icon" size={13} />
                      Advance: ₹{renter.advanceAmount.toLocaleString()}
                      <span className="badge badge-paid" style={{ fontSize: '9px', padding: '1px 6px' }}>Paid</span>
                    </div>
                  )}
                  {lastPay && (
                    <div className="renter-detail-row" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Last paid: {lastPay.month} {lastPay.year} via {lastPay.paymentMode}
                    </div>
                  )}
                </div>

                <div className="renter-footer">
                  <div>
                    <div className="renter-rent">₹{renter.monthlyRent.toLocaleString()}</div>
                    <div className="renter-rent-label">per month</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/renters/${renter.id}`); }}>
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
