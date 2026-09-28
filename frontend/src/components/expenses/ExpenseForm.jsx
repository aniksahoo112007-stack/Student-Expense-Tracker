import { useState, useEffect } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants/categories';

export default function ExpenseForm({ onSubmit, initialData, loading }) {
  const [form, setForm] = useState({
    title: '', amount: '', category: 'Food', description: '',
    payment_method: 'UPI', expense_date: new Date().toISOString().split('T')[0],
    is_need: false,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        amount: String(initialData.amount || ''),
        category: initialData.category || 'Food',
        description: initialData.description || '',
        payment_method: initialData.payment_method || 'UPI',
        expense_date: initialData.expense_date || new Date().toISOString().split('T')[0],
        is_need: initialData.is_need || false,
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group" style={{ marginBottom: '1rem' }}>
        <label>Expense Name</label>
        <input className="input" placeholder="e.g., Domino's Pizza" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </div>

      <div className="input-group" style={{ marginBottom: '1rem' }}>
        <label>Amount (₹)</label>
        <input className="input" type="number" placeholder="420" min="1" step="0.01"
          value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
      </div>

      {/* Category quick select */}
      <div className="input-group" style={{ marginBottom: '1rem' }}>
        <label>Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} type="button"
              className={`category-tag ${form.category === cat.value ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, category: cat.value })}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="input-group">
          <label>Date</label>
          <input className="input" type="date" value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })} required />
        </div>

        <div className="input-group">
          <label>Payment Method</label>
          <select className="input" value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
            {PAYMENT_METHODS.map(pm => (
              <option key={pm.value} value={pm.value}>{pm.icon} {pm.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Need vs Want toggle */}
      <div className="input-group" style={{ marginBottom: '1rem' }}>
        <label>Type</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button"
            className={`category-tag ${!form.is_need ? 'selected' : ''}`}
            style={!form.is_need ? { background: 'rgba(245, 158, 11, 0.1)', borderColor: '#f59e0b', color: '#f59e0b' } : {}}
            onClick={() => setForm({ ...form, is_need: false })}>
            🎯 Want
          </button>
          <button type="button"
            className={`category-tag ${form.is_need ? 'selected' : ''}`}
            style={form.is_need ? { background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981', color: '#10b981' } : {}}
            onClick={() => setForm({ ...form, is_need: true })}>
            ✅ Need
          </button>
        </div>
      </div>

      <div className="input-group" style={{ marginBottom: '1.5rem' }}>
        <label>Description (optional)</label>
        <textarea className="input" rows={2} placeholder="Add a note..."
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ resize: 'vertical', minHeight: '60px' }} />
      </div>

      <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
        {loading ? <div className="spinner" /> : (initialData ? 'Update Expense' : 'Add Expense')}
      </button>
    </form>
  );
}
