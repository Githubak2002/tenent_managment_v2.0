import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Calendar, Home, IndianRupee, MessageCircle, Plus, Edit2, Edit3, Trash2, CheckCircle, Clock } from 'lucide-react';
import AddRentRecordModal from '../components/modals/AddRentRecordModal';
import AddRenterModal from '../components/modals/AddRenterModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

const PAYMENT_MODE_CLASS = { Cash: 'badge-cash', UPI: 'badge-upi', 'Bank Transfer': 'badge-bank', Cheque: 'badge-bank' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function RenterDetail({ renters, rentRecords, onUpdateRenter, onDeleteRenter, onAddRentRecord, onUpdateRentRecord, onDeleteRentRecord }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const renter = renters.find(r => r.id === Number(id));

  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showEditRenter, setShowEditRenter] = useState(false);
  const [showDeleteRenter, setShowDeleteRenter] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null); // rent record to delete

  if (!renter) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Renter not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/renters')} style={{ marginTop: '16px' }}>← Back to Renters</button>
      </div>
    );
  }

  const myRecords = rentRecords
    .filter(r => r.renterId === renter.id)
    .sort((a, b) => b.year - a.year || MONTHS.indexOf(b.month) - MONTHS.indexOf(a.month));

  const totalPaid = myRecords.filter(r => r.rentPaid).reduce((s, r) => s + r.totalAmount, 0);
  const totalMonths = myRecords.length;
  const paidMonths = myRecords.filter(r => r.rentPaid).length;

  const handleWhatsApp = (record) => {
    const msg = encodeURIComponent(`Hi ${renter.name}, your rent for ${record.month} ${record.year} is due. Amount: ₹${record.totalAmount?.toLocaleString() || renter.monthlyRent.toLocaleString()}. Please pay at your earliest convenience. Thank you! 🙏`);
    window.open(`https://wa.me/91${renter.phone}?text=${msg}`, '_blank');
    if (!record.whatsappSent) onUpdateRentRecord(record.id, { whatsappSent: true });
  };

  const handleEditRenterSave = (data) => {
    const updatedAvatar = data.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    // If movedOutDate is set, also mark status as 'left'
    const status = data.movedOutDate ? 'left' : 'active';
    onUpdateRenter(renter.id, { ...data, avatar: updatedAvatar, status });
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

  return (
    <div className="animate-slide-up">
      {/* Back Button */}
      <button className="btn btn-ghost" style={{ marginBottom: '20px', padding: '6px 12px' }} onClick={() => navigate('/renters')}>
        <ArrowLeft size={16} /> Back to Renters
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{renter.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="profile-name">{renter.name}</div>
            <span className={`badge ${renter.status === 'active' ? 'badge-active' : 'badge-left'}`}>
              {renter.status === 'active' ? '● Active' : '● Left'}
            </span>
          </div>
          <div className="profile-flat"><Home size={12} style={{ display: 'inline', marginRight: '4px' }} />{renter.flat}</div>
          <div className="profile-meta">
            <div className="profile-meta-item"><Phone size={14} />{renter.phone}</div>
            <div className="profile-meta-item"><Calendar size={14} />Moved in: {new Date(renter.movedInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            {renter.movedOutDate && <div className="profile-meta-item"><Calendar size={14} />Moved out: {new Date(renter.movedOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
          </div>
        </div>
        <div className="profile-actions">
          <a href={`tel:${renter.phone}`} className="btn btn-secondary btn-sm"><Phone size={14} /> Call</a>
          <button className="btn btn-whatsapp btn-sm" onClick={() => window.open(`https://wa.me/91${renter.phone}`, '_blank')}>
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowEditRenter(true)}>
            <Edit3 size={14} /> Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteRenter(true)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <div className="info-item">
          <div className="info-item-label">Monthly Rent</div>
          <div className="info-item-value">₹{renter.monthlyRent.toLocaleString()}</div>
        </div>
        <div className="info-item">
          <div className="info-item-label">Advance Paid</div>
          <div className="info-item-value">{renter.advancePaid ? `₹${renter.advanceAmount.toLocaleString()}` : 'Not Paid'}</div>
          <div className="info-item-sub">{renter.advancePaid ? <span className="badge badge-paid">✓ Received</span> : <span className="badge badge-pending">Pending</span>}</div>
        </div>
        <div className="info-item">
          <div className="info-item-label">Initial Light Reading</div>
          <div className="info-item-value">{renter.initialLightReading} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>units</span></div>
        </div>
        <div className="info-item">
          <div className="info-item-label">Total Collected</div>
          <div className="info-item-value" style={{ color: 'var(--accent-secondary)' }}>₹{totalPaid.toLocaleString()}</div>
        </div>
        <div className="info-item">
          <div className="info-item-label">Months Recorded</div>
          <div className="info-item-value">{totalMonths}</div>
          <div className="info-item-sub">{paidMonths} paid, {totalMonths - paidMonths} pending</div>
        </div>
        {renter.notes && (
          <div className="info-item" style={{ gridColumn: 'span 2' }}>
            <div className="info-item-label">Notes</div>
            <div className="info-item-value" style={{ fontSize: '13px', fontWeight: '500' }}>{renter.notes}</div>
          </div>
        )}
      </div>

      {/* Rent History Header */}
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div className="section-title">📋 Rent History</div>
        {renter.status === 'active' && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddRecord(true)}>
            <Plus size={14} /> Add Record
          </button>
        )}
      </div>

      {myRecords.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">No rent records yet</div>
            <div className="empty-state-text">Add the first rent record for this renter</div>
          </div>
        </div>
      ) : (
        <>
          {/* ===== DESKTOP TABLE ===== */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month / Year</th>
                  <th>Rent</th>
                  <th>Light Reading</th>
                  <th>Light Bill</th>
                  <th>Water Bill</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Paid On</th>
                  <th>WhatsApp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.map(record => (
                  <tr key={record.id}>
                    <td><div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{record.month} {record.year}</div></td>
                    <td><span className="amount">₹{record.rentAmount.toLocaleString()}</span></td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.lightReadingPrev} → {record.lightReadingCurr}</div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-info)' }}>{record.lightUnits} units</div>
                    </td>
                    <td><span className="amount">₹{record.lightBill}</span></td>
                    <td><span className="amount">₹{record.waterBill}</span></td>
                    <td><span className="amount" style={{ color: 'var(--accent-secondary)', fontSize: '15px' }}>₹{record.totalAmount.toLocaleString()}</span></td>
                    <td>
                      {record.rentPaid ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="badge badge-paid"><CheckCircle size={10} /> Paid</span>
                          {record.paymentMode && <span className={`badge ${PAYMENT_MODE_CLASS[record.paymentMode] || 'badge-cash'}`} style={{ fontSize: '10px' }}>{record.paymentMode}</span>}
                        </div>
                      ) : (
                        <span className="badge badge-pending"><Clock size={10} /> Pending</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {record.paidDate ? new Date(record.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td>
                      {record.whatsappSent ? (
                        <span className="badge" style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)', fontSize: '10px' }}>✓ Sent</span>
                      ) : (
                        <button className="btn btn-whatsapp btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleWhatsApp(record)}>
                          <MessageCircle size={12} /> Send
                        </button>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-icon" onClick={() => setEditingRecord(record)} title="Edit record">
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-icon btn-icon-danger" onClick={() => setDeletingRecord(record)} title="Delete record">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== MOBILE CARDS ===== */}
          <div className="rent-cards-mobile">
            {myRecords.map(record => (
              <div key={record.id} className="rent-record-card">
                <div className="rent-record-card-header">
                  <div className="rent-record-month">{record.month} {record.year}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {record.rentPaid
                      ? <span className="badge badge-paid"><CheckCircle size={10} /> Paid</span>
                      : <span className="badge badge-pending"><Clock size={10} /> Pending</span>
                    }
                    <button className="btn-icon" style={{ padding: '6px' }} onClick={() => setEditingRecord(record)} title="Edit">
                      <Edit2 size={13} />
                    </button>
                    <button className="btn-icon btn-icon-danger" style={{ padding: '6px' }} onClick={() => setDeletingRecord(record)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="rent-record-grid">
                  <div>
                    <div className="rent-record-item-label">Rent</div>
                    <div className="rent-record-item-value">₹{record.rentAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="rent-record-item-label">Light Bill</div>
                    <div className="rent-record-item-value">₹{record.lightBill}</div>
                  </div>
                  <div>
                    <div className="rent-record-item-label">Water Bill</div>
                    <div className="rent-record-item-value">₹{record.waterBill}</div>
                  </div>
                  <div>
                    <div className="rent-record-item-label">Units Used</div>
                    <div className="rent-record-item-value" style={{ color: 'var(--accent-info)' }}>{record.lightUnits} u</div>
                  </div>
                </div>

                <div className="rent-record-footer">
                  <div>
                    <div className="rent-record-item-label">Total</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-secondary)' }}>
                      ₹{record.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {record.paymentMode && (
                      <span className={`badge ${PAYMENT_MODE_CLASS[record.paymentMode] || 'badge-cash'}`} style={{ fontSize: '10px' }}>{record.paymentMode}</span>
                    )}
                    {!record.whatsappSent && !record.rentPaid && (
                      <button className="btn btn-whatsapp btn-sm" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => handleWhatsApp(record)}>
                        <MessageCircle size={12} /> Remind
                      </button>
                    )}
                    {record.whatsappSent && (
                      <span className="badge" style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)', fontSize: '10px' }}>✓ Sent</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== MODALS ===== */}
      {showAddRecord && (
        <AddRentRecordModal
          renter={renter}
          existingRecords={myRecords}
          onClose={() => setShowAddRecord(false)}
          onSave={(data) => { onAddRentRecord({ ...data, renterId: renter.id }); setShowAddRecord(false); }}
        />
      )}
      {editingRecord && (
        <AddRentRecordModal
          renter={renter}
          existingRecords={myRecords}
          initialData={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(data) => { onUpdateRentRecord(editingRecord.id, data); setEditingRecord(null); }}
        />
      )}
      {showEditRenter && (
        <AddRenterModal
          initialData={renter}
          onClose={() => setShowEditRenter(false)}
          onSave={handleEditRenterSave}
        />
      )}

      {/* Delete Renter Confirmation */}
      {showDeleteRenter && (
        <DeleteConfirmModal
          title="Delete Renter"
          description={`You are about to permanently delete "${renter.name}" (${renter.flat}) and all their ${myRecords.length} rent record(s).`}
          onClose={() => setShowDeleteRenter(false)}
          onConfirm={handleDeleteRenter}
        />
      )}

      {/* Delete Rent Record Confirmation */}
      {deletingRecord && (
        <DeleteConfirmModal
          title="Delete Rent Record"
          description={`You are about to permanently delete the rent record for ${deletingRecord.month} ${deletingRecord.year} (₹${deletingRecord.totalAmount?.toLocaleString()}).`}
          onClose={() => setDeletingRecord(null)}
          onConfirm={handleDeleteRecord}
        />
      )}
    </div>
  );
}
