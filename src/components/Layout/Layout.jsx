import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Plus, Sun, Moon, Home } from 'lucide-react';

export default function Layout({ children, onAddRenter, theme, onToggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isRentersPage = location.pathname.startsWith('/renters');
  const isLeftTab = location.search.includes('tab=inactive');
  const showFAB = location.pathname === '/renters' && !isLeftTab;

  const ThemeIcon = theme === 'dark' ? Moon : Sun;
  const themeLabel = theme === 'dark' ? 'Dark' : 'Light';

  return (
    <div className="app-shell">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="sidebar">
        {/* Logo — transparent, links home */}
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo-icon-clear">
            <Home size={22} strokeWidth={1.8} />
          </div>
          <div>
            <div className="sidebar-logo-text">TenantPro</div>
            <div className="sidebar-logo-sub">Property Manager</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard className="nav-icon" size={18} />
            Dashboard
          </NavLink>

          <div className="sidebar-section-label" style={{ marginTop: '16px' }}>Renters</div>
          <NavLink to="/renters" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users className="nav-icon" size={18} />
            Renters List
          </NavLink>
        </nav>

        {/* Theme toggle in sidebar */}
        <div className="sidebar-theme-toggle" onClick={onToggleTheme} title="Toggle theme">
          <div className="sidebar-theme-icon">
            <ThemeIcon size={15} />
          </div>
          <div>
            <div className="sidebar-theme-label">{themeLabel} Mode</div>
            <div className="sidebar-theme-sub">Click to switch</div>
          </div>
          <div className="sidebar-theme-dot" data-theme={theme} />
        </div>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={14} />
            <span>TenantPro v1.0</span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px' }}>UI Preview Mode</div>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Home size={20} strokeWidth={1.8} style={{ color: 'var(--text-accent)' }} />
          <span className="mobile-topbar-text">TenantPro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="mobile-topbar-chip">📅 March 2025</div>
          <button className="mobile-theme-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <ThemeIcon size={16} />
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>{getPageTitle(location.pathname)}</h1>
            <div className="breadcrumb">TenantPro / {getPageTitle(location.pathname)}</div>
          </div>
          <div className="header-right">
            <div className="chip">📅 March 2025</div>
            <button className="header-theme-btn" onClick={onToggleTheme}>
              <ThemeIcon size={15} />
              <span>{themeLabel}</span>
            </button>
          </div>
        </header>

        <main className="page-content animate-fade-in">
          {children}
        </main>
      </div>

      {/* ===== MOBILE FAB ===== */}
      {showFAB && onAddRenter && (
        <button className="fab" onClick={onAddRenter} title="Add Renter">
          <Plus size={22} />
        </button>
      )}

      {/* ===== BOTTOM NAVIGATION (Mobile) — 3 tabs, centered ===== */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <NavLink to="/" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={22} />
            <span>Dashboard</span>
            {location.pathname === '/' && <div className="bottom-nav-dot" />}
          </NavLink>

          <NavLink to="/renters" className={`bottom-nav-item ${isRentersPage ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate('/renters'); }}>
            <Users size={22} />
            <span>Renters</span>
            {isRentersPage && <div className="bottom-nav-dot" />}
          </NavLink>

          <button className="bottom-nav-item" onClick={onToggleTheme}>
            <ThemeIcon size={22} />
            <span>{themeLabel}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function getPageTitle(pathname) {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/renters/')) return 'Renter Details';
  if (pathname === '/renters') return 'Renters';
  return 'TenantPro';
}
