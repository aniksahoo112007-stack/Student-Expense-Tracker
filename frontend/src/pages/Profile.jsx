import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { CURRENCIES } from '../constants/categories';
import { User, Mail, Wallet, Sun, Moon, Monitor } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    monthly_income: String(user?.monthly_income || ''),
    currency: user?.currency || 'INR',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile({
        name: form.name,
        monthly_income: Number(form.monthly_income) || 0,
        currency: form.currency,
      });
      updateUser(res.data.user);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Profile 👤</h1>
        <p>Manage your account settings</p>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Avatar */}
        <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '20px', margin: '0 auto 1rem',
            background: 'var(--gradient-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '2rem', fontWeight: 800,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.email}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Member since {new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Edit Form */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label><User size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />Full Name</label>
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label><Mail size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />Email</label>
              <input className="input" value={user?.email} disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label><Wallet size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />Monthly Income</label>
              <input className="input" type="number" min="0" placeholder="15000" value={form.monthly_income}
                onChange={(e) => setForm({ ...form, monthly_income: e.target.value })} />
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label>Currency</label>
              <select className="input" value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <div className="spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Theme Settings */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Appearance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { key: 'light', icon: Sun, label: 'Light' },
              { key: 'dark', icon: Moon, label: 'Dark' },
              { key: 'system', icon: Monitor, label: 'System' },
            ].map(({ key, icon: Icon, label }) => (
              <button key={key}
                onClick={() => setTheme(key)}
                className="card"
                style={{
                  textAlign: 'center', cursor: 'pointer',
                  border: theme === key ? '2px solid #6366f1' : undefined,
                  background: theme === key ? 'rgba(99, 102, 241, 0.05)' : undefined,
                }}>
                <Icon size={24} style={{ marginBottom: '0.375rem', color: theme === key ? '#6366f1' : 'var(--text-muted)' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: theme === key ? 600 : 400 }}>{label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
