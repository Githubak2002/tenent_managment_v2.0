import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, IndianRupee, TrendingUp, Home, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Dashboard({ renters, rentRecords }) {
  const navigate = useNavigate();

  const activeRenters = renters.filter(r => r.status === 'active');
  const leftRenters = renters.filter(r => r.status === 'left');

  const currentDate = new Date();
  const currentMonth = MONTHS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

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

  return (
    <div className="animate-[slideUp_0.3s_ease]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] tracking-tight mb-1">Good evening! 👋</div>
          <div className="text-[14px] text-[var(--text-muted)] font-medium">Here's what's happening with your properties in {currentMonth} {currentYear}</div>
        </div>
        <div className="flex gap-2.5">
          <button className="inline-flex flex-1 md:flex-none items-center justify-center gap-2 px-4.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white shadow-[var(--shadow-accent)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(108,99,255,0.4)]" onClick={() => navigate('/renters')}>
            <Users size={16} /> Manage Renters
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-5 mb-7">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--accent-primary)] bg-[rgba(108,99,255,0.1)] group-hover:scale-110 transition-transform"><Home size={20} /></div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-[rgba(108,99,255,0.1)] color-[var(--accent-primary)]">Active</span>
          </div>
          <div className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] mt-auto leading-none mb-1 tracking-tight">{activeRenters.length}</div>
          <div className="text-[12px] md:text-[13px] font-semibold text-[var(--text-secondary)]">Total Active Renters</div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#22c55e] bg-[rgba(34,197,94,0.1)] group-hover:scale-110 transition-transform"><CheckCircle size={20} /></div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-[rgba(34,197,94,0.1)] text-[#22c55e]">{collectionRate}%</span>
          </div>
          <div className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] mt-auto leading-none mb-1 tracking-tight">{paidThisMonth.length}</div>
          <div className="text-[12px] md:text-[13px] font-semibold text-[var(--text-secondary)]">Paid This Month</div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#f59e0b] bg-[rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform"><Clock size={20} /></div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-[rgba(245,158,11,0.1)] text-[#f59e0b]">{pendingThisMonth.length} due</span>
          </div>
          <div className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] mt-auto leading-none mb-1 tracking-tight">{pendingThisMonth.length}</div>
          <div className="text-[12px] md:text-[13px] font-semibold text-[var(--text-secondary)]">Pending Payments</div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#22c55e] bg-[rgba(34,197,94,0.1)] group-hover:scale-110 transition-transform"><IndianRupee size={20} /></div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-[rgba(34,197,94,0.1)] text-[#22c55e]">↑ this month</span>
          </div>
          <div className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] mt-auto leading-none mb-1 tracking-tight">₹{(totalCollected / 1000).toFixed(1)}K</div>
          <div className="text-[12px] md:text-[13px] font-semibold text-[var(--text-secondary)]">Collected This Month</div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--accent-info)] bg-[rgba(56,189,248,0.1)] group-hover:scale-110 transition-transform"><TrendingUp size={20} /></div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-[rgba(56,189,248,0.1)] text-[var(--accent-info)]">Expected</span>
          </div>
          <div className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] mt-auto leading-none mb-1 tracking-tight">₹{(expectedTotal / 1000).toFixed(1)}K</div>
          <div className="text-[12px] md:text-[13px] font-semibold text-[var(--text-secondary)]">Expected This Month</div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--accent-danger)] bg-[rgba(239,68,68,0.1)] group-hover:scale-110 transition-transform"><UserX size={20} /></div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)]">moved out</span>
          </div>
          <div className="text-[24px] md:text-[28px] font-extrabold text-[var(--text-primary)] mt-auto leading-none mb-1 tracking-tight">{leftRenters.length}</div>
          <div className="text-[12px] md:text-[13px] font-semibold text-[var(--text-secondary)]">Renters Left</div>
        </div>
      </div>

      {/* Collection Progress */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
          <div className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight">{currentMonth} {currentYear} Collection Progress</div>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-[0.05em] bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]">{collectionRate}% collected</span>
        </div>
        <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden mb-2.5">
          <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#3b82f6] rounded-full transition-all duration-1000 ease-out" style={{ width: `${collectionRate}%` }} />
        </div>
        <div className="flex justify-between text-[12px] text-[var(--text-muted)]">
          <span>₹{totalCollected.toLocaleString()} collected</span>
          <span>₹{expectedTotal.toLocaleString()} expected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        {/* Pending Payments */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 md:p-6 flex flex-col max-h-[400px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)] shrink-0">
            <div className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2"><AlertCircle size={16} className="text-[var(--accent-warning)]" /> Pending Payments</div>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-[0.05em] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">{pendingThisMonth.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {pendingThisMonth.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-body)] rounded-xl border border-[var(--border-color)] border-dashed">
                <div className="text-[32px] mb-2 opacity-80 mix-blend-luminosity">🎉</div>
                <div className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">All paid!</div>
              </div>
            ) : (
              pendingThisMonth.map(renter => (
                <div key={renter.id}
                  className="flex items-center gap-3 p-3 border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer rounded-lg" onClick={() => navigate(`/renters/${renter.id}`)}>
                  <div className="w-10 h-10 rounded-full font-bold text-[13px] bg-gradient-to-br from-[var(--bg-input)] to-[var(--bg-body)] text-[var(--text-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-sm">{renter.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-[var(--text-primary)] truncate">{renter.name}</div>
                    <div className="text-[12px] text-[var(--text-muted)] truncate">{renter.flat} • ₹{renter.monthlyRent.toLocaleString()}</div>
                  </div>
                  <span className="shrink-0 inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.05em] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]">Due</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 md:p-6 flex flex-col max-h-[400px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)] shrink-0">
            <div className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight">📋 Recent Activity</div>
          </div>
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {recentActivity.map((item, i) => {
              const colorClass = item.color === 'green' ? 'bg-[#22c55e]' : item.color === 'yellow' ? 'bg-[#f59e0b]' : 'bg-[var(--accent-primary)]';
              return (
                <div key={i} className="flex items-start gap-4 p-3 hover:bg-[var(--bg-card-hover)] transition-colors rounded-lg border-b border-[var(--border-color)] last:border-0 relative">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] shrink-0 ${colorClass}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[var(--text-primary)] leading-tight mb-1">{item.text}</div>
                    <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 mb-4">
        <div className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight mb-3">⚡ Quick Actions</div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)] shadow-sm" onClick={() => navigate('/renters')}>
            <UserCheck size={16} /> Add New Renter
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all cursor-pointer bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] shadow-sm" onClick={() => navigate('/renters')}>
            <Users size={16} /> View All Renters
          </button>
        </div>
      </div>
    </div>
  );
}
