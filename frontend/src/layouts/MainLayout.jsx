import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import MobileNav from '../components/common/MobileNav';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header */}
      <div className="lg:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 30,
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', padding: '4px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span style={{ fontWeight: 700, fontSize: '1.125rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SpendWise
        </span>
        <div style={{ width: 24 }} />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 35, display: 'block',
          }}
          className="lg:hidden"
        />
      )}

      <main className="main-content" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
        <div className="lg:hidden" style={{ height: '3rem' }} />
        <Outlet />
      </main>

      <MobileNav />
    </div>
  );
}
