import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { goalService } from '../services/goalService';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Skeleton';
import { Plus, Trash2, Edit2, Target } from 'lucide-react';

export default function Goals() {
  const { user } = useAuth();
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ title: '', target_amount: '', saved_amount: '', target_date: '' });

  const loadGoals = useCallback(async () => {
    try {
      const res = await goalService.getAll();
      setGoals(res.data.goals || []);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await goalService.create({
        title: form.title,
        target_amount: Number(form.target_amount),
        saved_amount: Number(form.saved_amount) || 0,
        target_date: form.target_date || null,
      });
      toast.success('Goal created! 🎯');
      setShowForm(false);
      setForm({ title: '', target_amount: '', saved_amount: '', target_date: '' });
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await goalService.update(editGoal.id, {
        title: form.title,
        target_amount: Number(form.target_amount),
        saved_amount: Number(form.saved_amount),
        target_date: form.target_date || null,
      });
      toast.success('Goal updated! ✅');
      setEditGoal(null);
      loadGoals();
    } catch {
      toast.error('Failed to update goal');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await goalService.delete(id);
      toast.success('Goal deleted');
      loadGoals();
    } catch {
      toast.error('Failed to delete goal');
    }
  };

  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.saved_amount), 0);

  if (loading) {
    return (<div><div className="page-header"><h1>Savings Goals</h1></div><SkeletonGrid cards={4} height={180} /></div>);
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1>Savings Goals 🎯</h1><p>Track your progress towards financial goals</p></div>
        <button className="btn btn-primary" onClick={() => {
          setForm({ title: '', target_amount: '', saved_amount: '', target_date: '' });
          setShowForm(true);
        }}>
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Overview */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Target</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalTarget, user?.currency)}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Saved</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(totalSaved, user?.currency)}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Goal Cards */}
      {goals.length === 0 ? (
        <EmptyState icon="🎯" title="No savings goals" description="Create a goal to start saving towards something you want!"
          action={<button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Goal</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {goals.map(g => {
            const pct = Number(g.target_amount) > 0 ? Math.round((Number(g.saved_amount) / Number(g.target_amount)) * 100) : 0;
            const remaining = Number(g.target_amount) - Number(g.saved_amount);
            return (
              <div key={g.id} className="card slide-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={20} style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{g.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }}
                      onClick={() => {
                        setEditGoal(g);
                        setForm({ title: g.title, target_amount: String(g.target_amount), saved_amount: String(g.saved_amount), target_date: g.target_date || '' });
                      }}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px', color: '#ef4444' }}
                      onClick={() => handleDelete(g.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(g.saved_amount, user?.currency)} / {formatCurrency(g.target_amount, user?.currency)}
                  </span>
                  <span style={{ fontWeight: 700, color: pct >= 100 ? '#10b981' : '#6366f1' }}>{Math.min(pct, 100)}%</span>
                </div>

                <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                  <div className={`progress-bar-fill ${pct >= 100 ? 'success' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{remaining > 0 ? `${formatCurrency(remaining, user?.currency)} remaining` : '🎉 Goal reached!'}</span>
                  {g.target_date && <span>By {new Date(g.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm || !!editGoal} onClose={() => { setShowForm(false); setEditGoal(null); }}
        title={editGoal ? 'Edit Goal' : 'Create Goal'}>
        <form onSubmit={editGoal ? handleUpdate : handleCreate}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Goal Title</label>
            <input className="input" placeholder="e.g., Buy New Headphones" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="input-group">
              <label>Target Amount (₹)</label>
              <input className="input" type="number" min="1" placeholder="8000" value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Saved So Far (₹)</label>
              <input className="input" type="number" min="0" placeholder="0" value={form.saved_amount}
                onChange={(e) => setForm({ ...form, saved_amount: e.target.value })} />
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>Target Date (optional)</label>
            <input className="input" type="date" value={form.target_date}
              onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={formLoading}>
            {formLoading ? <div className="spinner" /> : (editGoal ? 'Update Goal' : 'Create Goal')}
          </button>
        </form>
      </Modal>
    </div>
  );
}
