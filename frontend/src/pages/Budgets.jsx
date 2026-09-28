import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { budgetService } from '../services/budgetService';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES, getCategoryIcon } from '../constants/categories';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Skeleton';
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';

export default function Budgets() {
  const { user } = useAuth();
  const toast = useToast();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ category: 'Food', monthly_limit: '' });

  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  const loadBudgets = useCallback(async () => {
    try {
      const res = await budgetService.getAll({ month, year });
      setBudgets(res.data.budgets || []);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [month, year, toast]);

  useEffect(() => { loadBudgets(); }, [loadBudgets]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await budgetService.create({ ...form, monthly_limit: Number(form.monthly_limit), month, year });
      toast.success('Budget created! 📊');
      setShowForm(false);
      setForm({ category: 'Food', monthly_limit: '' });
      loadBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create budget');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await budgetService.update(editBudget.id, { monthly_limit: Number(form.monthly_limit) });
      toast.success('Budget updated! ✅');
      setEditBudget(null);
      loadBudgets();
    } catch {
      toast.error('Failed to update budget');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await budgetService.delete(id);
      toast.success('Budget deleted');
      loadBudgets();
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + Number(b.monthly_limit), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0);

  if (loading) {
    return (<div><div className="page-header"><h1>Budgets</h1></div><SkeletonGrid cards={4} height={140} /></div>);
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1>Budgets</h1><p>Set spending limits for each category</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ category: 'Food', monthly_limit: '' }); setShowForm(true); }}>
          <Plus size={18} /> Set Budget
        </button>
      </div>

      {/* Overview */}
      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Budget</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalBudget, user?.currency)}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Spent</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalSpent > totalBudget ? '#ef4444' : '#10b981' }}>
              {formatCurrency(totalSpent, user?.currency)}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Remaining</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: (totalBudget - totalSpent) >= 0 ? '#10b981' : '#ef4444' }}>
              {formatCurrency(Math.abs(totalBudget - totalSpent), user?.currency)}
            </div>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <EmptyState icon="📊" title="No budgets set" description="Create category budgets to track your spending limits."
          action={<button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Set Budget</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {budgets.map(b => {
            const pct = Math.min(b.percentage, 100);
            const barClass = b.isOverBudget ? 'danger' : b.isNearBudget ? 'warning' : 'success';
            return (
              <div key={b.id} className="card slide-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{getCategoryIcon(b.category)}</span>
                    <span style={{ fontWeight: 600 }}>{b.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }}
                      onClick={() => { setEditBudget(b); setForm({ category: b.category, monthly_limit: String(b.monthly_limit) }); }}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px', color: '#ef4444' }}
                      onClick={() => handleDelete(b.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(b.spent, user?.currency)} / {formatCurrency(b.monthly_limit, user?.currency)}
                  </span>
                  <span style={{ fontWeight: 600, color: b.isOverBudget ? '#ef4444' : b.isNearBudget ? '#f59e0b' : '#10b981' }}>
                    {b.percentage}%
                  </span>
                </div>

                <div className="progress-bar">
                  <div className={`progress-bar-fill ${barClass}`} style={{ width: `${pct}%` }} />
                </div>

                {b.isOverBudget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444' }}>
                    <AlertTriangle size={14} />
                    Budget exceeded by {formatCurrency(Math.abs(b.remaining), user?.currency)}
                  </div>
                )}
                {b.isNearBudget && !b.isOverBudget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#f59e0b' }}>
                    <AlertTriangle size={14} />
                    Budget is almost exhausted
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Set Budget">
        <form onSubmit={handleCreate}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>Monthly Limit (₹)</label>
            <input className="input" type="number" min="1" placeholder="3000" value={form.monthly_limit}
              onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={formLoading}>
            {formLoading ? <div className="spinner" /> : 'Create Budget'}
          </button>
        </form>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal isOpen={!!editBudget} onClose={() => setEditBudget(null)} title={`Edit ${editBudget?.category} Budget`}>
        <form onSubmit={handleUpdate}>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>Monthly Limit (₹)</label>
            <input className="input" type="number" min="1" value={form.monthly_limit}
              onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={formLoading}>
            {formLoading ? <div className="spinner" /> : 'Update Budget'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
