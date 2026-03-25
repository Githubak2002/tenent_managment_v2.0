import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, IndianRupee, TrendingUp, Home, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Dashboard({ renters, rentRecords }) {
  const navigate = useNavigate();
  const activeRenters = renters.filter(r => r.status === 'active');
  const leftRenters = renters.filter(r => r.status === 'left');

  const currentMonth = MONTHS[2]; // March
  const currentYear = 2025;

  const currentMonthRecords = rentRecords.filter(r => r.month === currentMonth && r.year === currentYear);
  const paidThisMonth = currentMonthRecords.filter(r => r.rentPaid);
  const pendingThisMonth = activeRenters.filter(r => !rentRecords.find(rec => rec.renterId === r.id && rec.month === currentMonth && rec.year === currentYear && rec.rentPaid));

  const totalCollected = paidThisMonth.reduce((sum, r) => sum + r.totalAmount, 0);
  const expectedTotal = activeRenters.reduce((sum, r) => sum + r.monthlyRent, 0);
  const collectionRate = activeRenters.length > 0 ? Math.round((paidThisMonth.length / activeRenters.length) * 100) : 0;

  const recentActivity = [
    { color: 'green', text: 'Vikram Singh paid March 2025 rent — ₹7,540', time: '2 days ago' },
    { color: 'green', text: 'Sneha Joshi paid February 2025 rent — ₹10,690', time: '5 days ago' },
    { color: 'purple', text: 'New renter Sneha Joshi added to Room 202', time: '12 Mar 2025' },
    { color: 'yellow', text: 'WhatsApp reminder sent to Priya Patel for March rent', time: '11 Mar 2025' },
    { color: 'red', text: 'Meera Nair moved out — Room 302 now vacant', time: '31 Dec 2024' },
    { color: 'green', text: 'Priya Patel paid February 2025 rent — ₹10,130', time: '6 Feb 2025' },
  ];

  return (
    <div className="animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Good evening! 👋</div>
          <div className="page-subtitle">Here's what's happening with your properties in March 2025</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/renters')}>
          <Users size={16} /> Manage Renters
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card primary">
          <div className="stat-header">
            <div className="stat-icon primary"><Home size={20} /></div>
            <span className="stat-trend up">Active</span>
          </div>
          <div className="stat-value">{activeRenters.length}</div>
          <div className="stat-label">Total Active Renters</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-icon success"><CheckCircle size={20} /></div>
            <span className="stat-trend up">{collectionRate}%</span>
          </div>
          <div className="stat-value">{paidThisMonth.length}</div>
          <div className="stat-label">Paid This Month</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-icon warning"><Clock size={20} /></div>
            <span className="stat-trend down">{pendingThisMonth.length} due</span>
          </div>
          <div className="stat-value">{pendingThisMonth.length}</div>
          <div className="stat-label">Pending Payments</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-icon success"><IndianRupee size={20} /></div>
            <span className="stat-trend up">↑ this month</span>
          </div>
          <div className="stat-value">₹{(totalCollected / 1000).toFixed(1)}K</div>
          <div className="stat-label">Collected This Month</div>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <div className="stat-icon info"><TrendingUp size={20} /></div>
            <span className="stat-trend" style={{color:'var(--accent-info)'}}>Expected</span>
          </div>
          <div className="stat-value">₹{(expectedTotal / 1000).toFixed(1)}K</div>
          <div className="stat-label">Expected This Month</div>
        </div>

        <div className="stat-card danger">
          <div className="stat-header">
            <div className="stat-icon danger"><UserX size={20} /></div>
            <span className="stat-trend down">moved out</span>
          </div>
          <div className="stat-value">{leftRenters.length}</div>
          <div className="stat-label">Renters Left</div>
        </div>
      </div>

      {/* Collection Progress */}
      <div className="card card-padding" style={{ marginBottom: '24px' }}>
        <div className="section-header">
          <div className="section-title">March 2025 Collection Progress</div>
          <span className="badge badge-paid">{collectionRate}% collected</span>
        </div>
        <div className="progress-bar" style={{ marginBottom: '10px' }}>
          <div className="progress-fill" style={{ width: `${collectionRate}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>₹{totalCollected.toLocaleString()} collected</span>
          <span>₹{expectedTotal.toLocaleString()} expected</span>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        {/* Pending Payments */}
        <div className="card card-padding">
          <div className="section-header">
            <div className="section-title">⚠️ Pending Payments</div>
            <span className="badge badge-pending">{pendingThisMonth.length}</span>
          </div>
          {pendingThisMonth.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <div>🎉</div>
              <div className="empty-state-title" style={{ fontSize: '14px' }}>All paid!</div>
            </div>
          ) : (
            pendingThisMonth.map(renter => (
              <div key={renter.id}
                   className="activity-item" onClick={() => navigate(`/renters/${renter.id}`)} style={{ cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="renter-avatar" style={{ width: '36px', height: '36px', fontSize: '12px' }}>{renter.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{renter.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{renter.flat} • ₹{renter.monthlyRent.toLocaleString()}</div>
                </div>
                <span className="badge badge-pending">Due</span>
              </div>
            ))
          )}
        </div>

        {/* Recent Activity */}
        <div className="card card-padding">
          <div className="section-header">
            <div className="section-title">📋 Recent Activity</div>
          </div>
          {recentActivity.map((item, i) => (
            <div key={i} className="activity-item">
              <div className={`activity-dot ${item.color}`} />
              <div>
                <div className="activity-text">{item.text}</div>
                <div className="activity-time">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '24px' }}>
        <div className="section-title" style={{ marginBottom: '14px' }}>⚡ Quick Actions</div>
        <div className="quick-actions-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/renters')}>
            <UserCheck size={16} /> Add New Renter
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/renters')}>
            <Users size={16} /> View All Renters
          </button>
          <button className="btn btn-success">
            <IndianRupee size={16} /> Record Rent Payment
          </button>
        </div>
      </div>
    </div>
  );
}
