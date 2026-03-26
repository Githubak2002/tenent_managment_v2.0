import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, IndianRupee, TrendingUp, Home, AlertCircle, CheckCircle, Clock, Database, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
// import seedData from '../data/seed.json';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Dashboard({ renters, rentRecords }) {
  const navigate = useNavigate();
  const [isMigrating, setIsMigrating] = useState(false);

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

  // Generate dynamic recent activity from rentRecords and renters
  const recentActivity = rentRecords
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.paidDate || 0) - new Date(a.createdAt || a.paidDate || 0))
    .slice(0, 5)
    .map(r => {
      const renter = renters.find(ren => ren.id === r.renterId);
      const name = renter ? renter.name : 'A renter';

      // Simple logic mapping based on record status
      if (r.rentPaid) {
        return { color: 'green', text: `${name} paid ${r.month} ${r.year} rent — ₹${r.totalAmount.toLocaleString('en-IN')}`, time: r.paidDate || 'Recently' };
      } else if (r.amountPaid > 0) {
        return { color: 'yellow', text: `${name} partially paid ${r.month} rent — ₹${r.amountPaid.toLocaleString('en-IN')}`, time: r.paidDate || 'Recently' };
      } else if (r.whatsappSent) {
        return { color: 'primary', text: `WhatsApp reminder sent to ${name} for ${r.month} rent`, time: 'Recently' };
      }
      return null;
    })
    .filter(Boolean);

  if (recentActivity.length === 0) {
    recentActivity.push({ color: 'primary', text: 'No recent activity yet', time: 'Just now' });
  }

  const handleMigrate = async () => {
    if (!window.confirm("Are you sure you want to migrate seed.json? Only do this once!")) return;
    setIsMigrating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const landlordId = session.user.id;
      const idMap = {}; // Maps old string ID -> new UUID

      // 1. Insert Renters
      // for (const r of seedData.renters) {
      //   const payload = { ...r, landlord_id: landlordId };
      //   const oldId = payload.original_id;
      //   delete payload.original_id;

      //   const { data, error } = await supabase.from('renters').insert([payload]).select().single();
      //   if (data) {
      //     idMap[oldId] = data.id;
      //   } else {
      //     console.error("Renter insert error:", error);
      //   }
      // }

      // 2. Insert Records
      // for (const p of seedData.payments) {
      //   const newRenterId = idMap[p.original_renter_id];
      //   if (!newRenterId) continue;

      //   const payload = { ...p, renter_id: newRenterId };
      //   delete payload.original_renter_id;

      //   await supabase.from('rent_records').insert([payload]);
      // }

      alert("Migration Complete! The page will now reload to fetch live data.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Migration failed. Check console.");
    }
    setIsMigrating(false);
  };

  return (
    <div className="animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Good evening! 👋</div>
          <div className="page-subtitle">Here's what's happening with your properties in March 2025</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {renters.length === 0 && (
            <button className="btn btn-secondary" onClick={handleMigrate} disabled={isMigrating}>
              {isMigrating ? <Loader2 size={16} className="spin" /> : <Database size={16} />}
              {isMigrating ? 'Migrating...' : 'Migrate Old Data'}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/renters')}>
            <Users size={16} /> Manage Renters
          </button>
        </div>
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
            <span className="stat-trend" style={{ color: 'var(--accent-info)' }}>Expected</span>
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
