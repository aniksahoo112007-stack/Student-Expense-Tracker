import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Plus, BarChart3, User } from 'lucide-react';

const mobileItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/expenses?add=true', icon: Plus, label: 'Add', isAdd: true },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <div className="mobile-nav">
      <div className="mobile-nav-items">
        {mobileItems.map(({ path, icon: Icon, label, isAdd }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `mobile-nav-link ${!isAdd && isActive ? 'active' : ''}`}
          >
            {isAdd ? (
              <div className="add-btn">
                <Icon size={22} />
              </div>
            ) : (
              <>
                <Icon size={20} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
