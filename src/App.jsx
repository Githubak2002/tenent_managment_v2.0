import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import RentersList from './pages/RentersList';
import RenterDetail from './pages/RenterDetail';
import AddRenterModal from './components/modals/AddRenterModal';
import Auth from './pages/Auth';
import { supabase } from './lib/supabase';
import './index.css';
import { Loader2 } from 'lucide-react';

// ── 2-way Theme hook ──────────
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('tp-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tp-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme };
}

export default function App() {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [renters, setRenters] = useState([]);
  const [rentRecords, setRentRecords] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // 1. Check Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Data when logged in
  useEffect(() => {
    if (session) {
      loadData();
    } else {
      setRenters([]);
      setRentRecords([]);
    }
  }, [session]);

  const loadData = async () => {
    setIsDataLoading(true);
    // Fetch Renters
    const { data: rData, error: rErr } = await supabase
      .from('renters')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (rErr) console.error('Error fetching renters:', rErr);
    else setRenters(rData.map(mapRenterFromDB));

    // Fetch Rent Records
    const { data: recData, error: recErr } = await supabase
      .from('rent_records')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false }); // Needs complex sorting, doing basic here
    
    if (recErr) console.error('Error fetching rent records:', recErr);
    else setRentRecords(recData.map(mapRecordFromDB));

    setIsDataLoading(false);
  };

  // ── Database Mappings (camelCase to snake_case) ──
  const mapRenterToDB = (r) => ({
    landlord_id: session.user.id,
    name: r.name,
    phone: r.phone,
    flat: r.flat,
    status: r.status || 'active',
    monthly_rent: Math.round(Number(r.monthlyRent)) || 0,
    initial_light_reading: Math.round(Number(r.initialLightReading)) || 0,
    advance_paid: Boolean(r.advancePaid),
    advance_amount: Math.round(Number(r.advanceAmount)) || 0,
    moved_in_date: r.movedInDate,
    moved_out_date: r.movedOutDate || null,
    notes: r.notes || '',
    avatar: r.avatar || r.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  });

  const mapRenterFromDB = (dbInfo) => ({
    id: dbInfo.id,
    name: dbInfo.name,
    phone: dbInfo.phone,
    flat: dbInfo.flat,
    status: dbInfo.status,
    monthlyRent: Number(dbInfo.monthly_rent),
    initialLightReading: Number(dbInfo.initial_light_reading),
    advancePaid: dbInfo.advance_paid,
    advanceAmount: Number(dbInfo.advance_amount),
    movedInDate: dbInfo.moved_in_date,
    movedOutDate: dbInfo.moved_out_date,
    notes: dbInfo.notes,
    avatar: dbInfo.avatar,
    createdAt: dbInfo.created_at
  });

  const mapRecordToDB = (r, renter_id) => ({
    renter_id: renter_id || r.renterId,
    month: r.month,
    year: r.year,
    rent_amount: Math.round(Number(r.rentAmount)) || 0,
    light_reading_prev: Math.round(Number(r.lightReadingPrev)) || 0,
    light_reading_curr: Math.round(Number(r.lightReadingCurr)) || 0,
    light_units: Math.round(Number(r.lightUnits)) || 0,
    light_bill: Math.round(Number(r.lightBill)) || 0,
    water_bill: Math.round(Number(r.waterBill)) || 0,
    total_amount: Math.round(Number(r.totalAmount)) || 0,
    amount_paid: r.amountPaid !== undefined && r.amountPaid !== null ? Math.round(Number(r.amountPaid)) : null,
    rent_paid: Boolean(r.rentPaid),
    payment_mode: r.paymentMode || null,
    paid_date: r.paidDate || null,
    whatsapp_sent: Boolean(r.whatsappSent),
    notes: r.notes || ''
  });

  const mapRecordFromDB = (dbRecord) => ({
    id: dbRecord.id,
    renterId: dbRecord.renter_id,
    month: dbRecord.month,
    year: dbRecord.year,
    rentAmount: Number(dbRecord.rent_amount),
    lightReadingPrev: Number(dbRecord.light_reading_prev),
    lightReadingCurr: Number(dbRecord.light_reading_curr),
    lightUnits: Number(dbRecord.light_units),
    lightBill: Number(dbRecord.light_bill),
    waterBill: Number(dbRecord.water_bill),
    totalAmount: Number(dbRecord.total_amount),
    amountPaid: dbRecord.amount_paid !== null ? Number(dbRecord.amount_paid) : null,
    rentPaid: dbRecord.rent_paid,
    paymentMode: dbRecord.payment_mode,
    paidDate: dbRecord.paid_date,
    whatsappSent: dbRecord.whatsapp_sent,
    notes: dbRecord.notes
  });

  // ── CRUD Operations (Optimistic UI + Supabase) ──

  const addRenter = async (renterData) => {
    const dbPayload = mapRenterToDB(renterData);
    const tempId = Date.now().toString(); // Temporary ID for optimistic UI
    const optimisticRenter = mapRenterFromDB({ ...dbPayload, id: tempId, created_at: new Date().toISOString() });
    
    setRenters(prev => [optimisticRenter, ...prev]);

    const { data, error } = await supabase.from('renters').insert([dbPayload]).select().single();
    if (error) {
      console.error("Error adding renter:", error);
      setRenters(prev => prev.filter(r => r.id !== tempId)); // Revert on error
    } else {
      // Replace temp ID with real UUID
      setRenters(prev => prev.map(r => r.id === tempId ? mapRenterFromDB(data) : r));
    }
  };

  const updateRenter = async (id, updates) => {
    // Determine mapped payload (only what is passed in)
    const dbPayload = mapRenterToDB({ ...renters.find(r => r.id === id), ...updates });
    delete dbPayload.landlord_id; // Don't update landlord_id
    
    setRenters(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

    const { error } = await supabase.from('renters').update(dbPayload).eq('id', id);
    if (error) {
      console.error("Error updating renter:", error);
      loadData(); // Revert from server
    }
  };

  const deleteRenter = async (id) => {
    setRenters(prev => prev.filter(r => r.id !== id));
    setRentRecords(prev => prev.filter(r => r.renterId !== id));

    const { error } = await supabase.from('renters').delete().eq('id', id);
    if (error) {
      console.error("Error deleting renter:", error);
      loadData(); // Revert from server
    }
  };

  const addRentRecord = async (recordData) => {
    const dbPayload = mapRecordToDB(recordData);
    const tempId = Date.now().toString();
    const optimisticRecord = mapRecordFromDB({ ...dbPayload, id: tempId });

    setRentRecords(prev => [optimisticRecord, ...prev]);

    const { data, error } = await supabase.from('rent_records').insert([dbPayload]).select().single();
    if (error) {
      console.error("Error adding rent record:", error);
      setRentRecords(prev => prev.filter(r => r.id !== tempId));
    } else {
      setRentRecords(prev => prev.map(r => r.id === tempId ? mapRecordFromDB(data) : r));
    }
  };

  const updateRentRecord = async (id, updates) => {
    const dbPayload = mapRecordToDB({ ...rentRecords.find(r => r.id === id), ...updates });
    delete dbPayload.renter_id;

    setRentRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

    const { error } = await supabase.from('rent_records').update(dbPayload).eq('id', id);
    if (error) {
      console.error("Error updating rent record:", error);
      loadData();
    }
  };

  const deleteRentRecord = async (id) => {
    setRentRecords(prev => prev.filter(r => r.id !== id));

    const { error } = await supabase.from('rent_records').delete().eq('id', id);
    if (error) {
      console.error("Error deleting rent record:", error);
      loadData();
    }
  };

  // ── Render ──

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 size={32} className="animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (isDataLoading && renters.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[var(--accent-primary)] mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout onAddRenter={() => setShowAddModal(true)} theme={theme} onToggleTheme={toggleTheme} onSignOut={() => supabase.auth.signOut()}>
        <Routes>
          <Route path="/" element={<Dashboard renters={renters} rentRecords={rentRecords} />} />
          <Route path="/renters" element={
            <RentersList renters={renters} rentRecords={rentRecords} onAddRenter={addRenter} onOpenAddModal={() => setShowAddModal(true)} />
          } />
          <Route path="/renters/:id" element={
            <RenterDetail
              renters={renters}
              rentRecords={rentRecords}
              onUpdateRenter={updateRenter}
              onDeleteRenter={deleteRenter}
              onAddRentRecord={addRentRecord}
              onUpdateRentRecord={updateRentRecord}
              onDeleteRentRecord={deleteRentRecord}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {showAddModal && (
          <AddRenterModal
            onClose={() => setShowAddModal(false)}
            onSave={(data) => { addRenter(data); setShowAddModal(false); }}
          />
        )}
      </Layout>
    </BrowserRouter>
  );
}
