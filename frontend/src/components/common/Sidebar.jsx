import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Receipt, BarChart3, Wallet, Target,
  Lightbulb, CalendarDays, User, LogOut, Sun, Moon, Monitor
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/budgets', icon: Wallet, label: 'Budgets' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/insights', icon: Lightbulb, label: 'Insights' },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const themeIcons = { light: Sun, dark: Moon, system: Monitor };
  const ThemeIcon = themeIcons[theme] || Monitor;
  const themeLabels = { light: 'Light', dark: 'Dark', system: 'System' };

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % 3]);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: 800,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          💸 SpendWise
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Smart Expense Tracker
        </p>
      </div>

      {/* User info */}
      {user && (
        <div style={{
          padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-input)',
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.875rem',
          }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
        <button onClick={cycleTheme} className="sidebar-link" style={{
          width: '100%', border: 'none', background: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit',
        }}>
          <ThemeIcon size={18} />
          {themeLabels[theme]} Mode
        </button>
        <NavLink to="/report" className="sidebar-link" onClick={onClose}>
          <Receipt size={18} />
          Monthly Report
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link" style={{
          width: '100%', border: 'none', background: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit',
          color: '#ef4444',
        }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
