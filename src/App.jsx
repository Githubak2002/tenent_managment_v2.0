import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import RentersList from './pages/RentersList';
import RenterDetail from './pages/RenterDetail';
import AddRenterModal from './components/modals/AddRenterModal';
import { renters as initialRenters, rentRecords as initialRecords } from './data/dummyData';
import './index.css';

// ── 2-way Theme hook (dark / light only, system default on first load) ──────────
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('tp-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // First visit → use system preference
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
  const [renters, setRenters] = useState(initialRenters);
  const [rentRecords, setRentRecords] = useState(initialRecords);
  const [showAddModal, setShowAddModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const addRenter = (renter) => {
    const newRenter = {
      ...renter, id: Date.now(), status: 'active',
      avatar: renter.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };
    setRenters(prev => [...prev, newRenter]);
  };

  const updateRenter = (id, updates) => {
    setRenters(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRenter = (id) => {
    setRenters(prev => prev.filter(r => r.id !== id));
    setRentRecords(prev => prev.filter(r => r.renterId !== id));
  };

  const addRentRecord = (record) => {
    setRentRecords(prev => [...prev, { ...record, id: Date.now() }]);
  };

  const updateRentRecord = (id, updates) => {
    setRentRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRentRecord = (id) => {
    setRentRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <BrowserRouter>
      <Layout onAddRenter={() => setShowAddModal(true)} theme={theme} onToggleTheme={toggleTheme}>
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
