import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Plus, Sun, Moon, Home, LogOut, UserCircle, Upload, Download } from 'lucide-react';

export default function Layout({ children, onAddRenter, theme, onToggleTheme, onSignOut, user, onShowImport, onShowExport }) {
  const location = useLocation();
  const navigate = useNavigate();
  const now = new Date();
  const dateChip = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const isProfilePage = location.pathname === '/profile';

  const isRentersPage = location.pathname.startsWith('/renters');
  const isLeftTab = location.search.includes('tab=inactive');
  const showFAB = location.pathname === '/renters' && !isLeftTab;

  const ThemeIcon = theme === 'dark' ? Moon : Sun;
  const themeLabel = theme === 'dark' ? 'Dark' : 'Light';

  return (
    <div className="flex min-h-screen">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-[100] transition-all duration-300">
        {/* Logo — transparent, links home */}
        <div className="p-6 flex items-center gap-3 border-b border-[var(--border-color)] cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-purple-600 flex items-center justify-center text-white shadow-[var(--shadow-accent)]">
            <Home size={22} strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-base font-bold text-[var(--text-primary)]">AkTenent</div>
            <div className="text-[11px] text-[var(--text-muted)] font-normal">Property Manager</div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-2 py-2 mt-2">Main Menu</div>
          <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[var(--text-secondary)] transition-all duration-200 relative cursor-pointer ${isActive ? 'bg-gradient-to-br from-[rgba(108,99,255,0.2)] to-[rgba(147,51,234,0.1)] text-[var(--text-accent)] border border-[rgba(108,99,255,0.3)]' : 'hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'}`}>
            <LayoutDashboard className={`w-[18px] h-[18px] shrink-0 ${location.pathname === '/' ? 'text-[var(--accent-primary)]' : ''}`} size={18} />
            Dashboard
          </NavLink>

          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-2 py-2 mt-4">Renters</div>
          <NavLink to="/renters" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[var(--text-secondary)] transition-all duration-200 relative cursor-pointer ${isActive ? 'bg-gradient-to-br from-[rgba(108,99,255,0.2)] to-[rgba(147,51,234,0.1)] text-[var(--text-accent)] border border-[rgba(108,99,255,0.3)]' : 'hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'}`}>
            <Users className={`w-[18px] h-[18px] shrink-0 ${isRentersPage ? 'text-[var(--accent-primary)]' : ''}`} size={18} />
            Renters List
          </NavLink>

          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-2 py-2 mt-4">Account</div>
          <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[var(--text-secondary)] transition-all duration-200 relative cursor-pointer ${isActive ? 'bg-gradient-to-br from-[rgba(108,99,255,0.2)] to-[rgba(147,51,234,0.1)] text-[var(--text-accent)] border border-[rgba(108,99,255,0.3)]' : 'hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'}`}>
            <UserCircle className={`w-[18px] h-[18px] shrink-0 ${isProfilePage ? 'text-[var(--accent-primary)]' : ''}`} size={18} />
            My Profile
          </NavLink>

          {onShowImport && (
            <button onClick={onShowImport} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer w-full bg-transparent border-none text-left">
              <Upload className="w-[18px] h-[18px] shrink-0" size={18} />
              Import Data
            </button>
          )}
          {onShowExport && (
            <button onClick={onShowExport} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer w-full bg-transparent border-none text-left">
              <Download className="w-[18px] h-[18px] shrink-0" size={18} />
              Export Data
            </button>
          )}
        </nav>

        {/* Theme toggle in sidebar */}
        <div className="flex items-center gap-3 p-3 mx-3 mb-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] cursor-pointer transition-all duration-200 hover:border-[var(--accent-primary)] hover:bg-[rgba(108,99,255,0.08)]" onClick={onToggleTheme} title="Toggle theme">
          <div className="w-8 h-8 rounded-lg bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.2)] flex items-center justify-center text-[var(--text-accent)] shrink-0">
            <ThemeIcon size={15} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[var(--text-primary)]">{themeLabel} Mode</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-[1px]">Click to switch</div>
          </div>
          <div className={`w-2 h-2 rounded-full shrink-0 ml-auto transition-all ${theme === 'dark' ? 'bg-[#6c63ff] shadow-[0_0_8px_rgba(108,99,255,0.6)]' : 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
        </div>

        <div className="p-4 border-t border-[var(--border-color)] flex flex-col justify-end text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Building2 size={14} />
            <span>AkTenent v1.0</span>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-[var(--bg-secondary)]/95 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-4 z-[100]" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 95%, transparent)' }}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] flex items-center justify-center text-base shadow-[var(--shadow-accent)]">
            <Home size={16} strokeWidth={2} className="text-white" />
          </div>
          <span className="text-[15px] font-bold text-[var(--text-primary)]">AkTenent</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[rgba(108,99,255,0.12)] border border-[rgba(108,99,255,0.25)] rounded-full text-[11px] font-semibold text-[var(--accent-primary)]">
            📅 {dateChip}
          </div>
          <button className="flex items-center justify-center w-[34px] h-[34px] rounded-lg bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.2)] text-[var(--text-accent)] cursor-pointer transition-all hover:bg-[rgba(108,99,255,0.2)] active:scale-95" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <ThemeIcon size={16} />
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 md:ml-[260px] pb-[68px] md:pb-0 pt-[60px] md:pt-0 flex flex-col transition-all duration-300">
        <header className="hidden md:flex h-[72px] bg-[var(--bg-secondary)]/85 backdrop-blur-xl border-b border-[var(--border-color)] items-center justify-between px-8 z-50 sticky top-0" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 85%, transparent)' }}>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">{getPageTitle(location.pathname)}</h1>
            <div className="text-xs text-[var(--text-muted)] mt-[1px]">AkTenent / {getPageTitle(location.pathname)}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full text-[11px] font-semibold text-[var(--text-secondary)]">📅 {dateChip}</div>
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-semibold cursor-pointer transition-all hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)] hover:bg-[rgba(108,99,255,0.08)]" onClick={onToggleTheme}>
              <ThemeIcon size={15} />
              <span>{themeLabel}</span>
            </button>
            {onSignOut && (
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-semibold cursor-pointer transition-all hover:border-[var(--accent-primary)] hover:text-[var(--text-accent)] hover:bg-[rgba(108,99,255,0.08)]" onClick={onSignOut} title="Sign Out">
                <LogOut size={15} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-7 md:px-8 animate-fade-in mx-auto w-full max-w-[1200px]">
          {children}
        </main>
      </div>

      {/* ===== MOBILE FAB ===== */}
      {showFAB && onAddRenter && (
        <button className="md:hidden fixed bottom-[84px] right-4 w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[#9333ea] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(108,99,255,0.5),0_2px_8px_rgba(0,0,0,0.4)] z-[90] transition-all active:scale-95 hover:shadow-[0_6px_28px_rgba(108,99,255,0.65)] hover:-translate-y-0.5 border-none cursor-pointer" onClick={onAddRenter} title="Add Renter">
          <Plus size={22} />
        </button>
      )}

      {/* ===== BOTTOM NAVIGATION (Mobile) — 4 tabs, centered with glassy strong blur ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)]/90 backdrop-blur-2xl border-t border-[var(--border-color)] z-[100] pb-[env(safe-area-inset-bottom,0px)]" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 98%, transparent)' }}>
        <div className="flex items-center justify-around max-w-md mx-auto px-1 py-2">
          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 pt-1 pb-1.5 rounded-xl text-[10px] font-semibold transition-all relative no-underline ${isActive ? 'text-[var(--accent-primary)] bg-[rgba(108,99,255,0.1)]' : 'text-[var(--text-muted)]'}`}>
            <LayoutDashboard size={22} strokeWidth={location.pathname === '/' ? 2.2 : 1.8} className={location.pathname === '/' ? 'text-[var(--accent-primary)] drop-shadow-[0_0_6px_rgba(108,99,255,0.5)]' : ''} />
            <span>Dashboard</span>
            {location.pathname === '/' && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--accent-primary)] rounded-full shadow-[0_0_6px_rgba(108,99,255,0.8)]" />}
          </NavLink>

          <NavLink to="/renters" className={`flex flex-col items-center justify-center gap-1 w-16 pt-1 pb-1.5 rounded-xl text-[10px] font-semibold transition-all relative no-underline ${isRentersPage ? 'text-[var(--accent-primary)] bg-[rgba(108,99,255,0.1)]' : 'text-[var(--text-muted)]'}`}
            onClick={(e) => { e.preventDefault(); navigate('/renters'); }}>
            <Users size={22} strokeWidth={isRentersPage ? 2.2 : 1.8} className={isRentersPage ? 'text-[var(--accent-primary)] drop-shadow-[0_0_6px_rgba(108,99,255,0.5)]' : ''} />
            <span>Renters</span>
            {isRentersPage && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--accent-primary)] rounded-full shadow-[0_0_6px_rgba(108,99,255,0.8)]" />}
          </NavLink>

          <NavLink to="/profile" className={`flex flex-col items-center justify-center gap-1 w-16 pt-1 pb-1.5 rounded-xl text-[10px] font-semibold transition-all relative no-underline ${isProfilePage ? 'text-[var(--accent-primary)] bg-[rgba(108,99,255,0.1)]' : 'text-[var(--text-muted)]'}`}>
            <UserCircle size={22} strokeWidth={isProfilePage ? 2.2 : 1.8} className={isProfilePage ? 'text-[var(--accent-primary)] drop-shadow-[0_0_6px_rgba(108,99,255,0.5)]' : ''} />
            <span>Profile</span>
            {isProfilePage && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--accent-primary)] rounded-full shadow-[0_0_6px_rgba(108,99,255,0.8)]" />}
          </NavLink>

          <button className="flex flex-col items-center justify-center gap-1 w-16 pt-1 pb-1.5 rounded-xl text-[10px] font-semibold text-[var(--text-muted)] transition-all bg-transparent border-none cursor-pointer active:scale-95" onClick={onToggleTheme}>
            <ThemeIcon size={22} strokeWidth={1.8} />
            <span>{themeLabel}</span>
          </button>

          {onSignOut && (
            <button className="flex flex-col items-center justify-center gap-1 w-16 pt-1 pb-1.5 rounded-xl text-[10px] font-semibold text-[var(--text-muted)] transition-all bg-transparent border-none cursor-pointer active:scale-95" onClick={onSignOut}>
              <LogOut size={22} strokeWidth={1.8} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

function getPageTitle(pathname) {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/renters/')) return 'Renter Details';
  if (pathname === '/renters') return 'Renters';
  if (pathname === '/profile') return 'My Profile';
  return 'AkTenent';
}
