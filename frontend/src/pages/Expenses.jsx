import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { expenseService } from '../services/expenseService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryIcon, CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Skeleton';
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Expenses() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(searchParams.get('add') === 'true');
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('expense_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [needFilter, setNeedFilter] = useState('');

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sortBy, sortOrder };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (paymentFilter) params.payment_method = paymentFilter;
      if (needFilter !== '') params.is_need = needFilter;
      const res = await expenseService.getAll(params);
      setExpenses(res.data.expenses);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, sortBy, sortOrder, paymentFilter, needFilter, toast]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await expenseService.create(data);
      toast.success('Expense added successfully! ✅');
      setShowForm(false);
      setPage(1);
      loadExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await expenseService.update(editingExpense.id, data);
      toast.success('Expense updated successfully! ✅');
      setEditingExpense(null);
      loadExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await expenseService.delete(deleteId);
      toast.success('Expense deleted');
      setDeleteId(null);
      loadExpenses();
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setPaymentFilter('');
    setNeedFilter('');
    setSortBy('expense_date');
    setSortOrder('desc');
    setSearchInput('');
    setPage(1);
  };

  const hasFilters = categoryFilter || paymentFilter || needFilter !== '' || search;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Expenses</h1>
          <p>{total} transaction{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search expenses..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
        </div>
        <button className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} /> Filters
        </button>
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}><X size={14} /> Clear</button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card" style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div className="input-group">
            <label>Category</label>
            <select className="input" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Payment</label>
            <select className="input" value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}>
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Type</label>
            <select className="input" value={needFilter} onChange={(e) => { setNeedFilter(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="true">Needs</option>
              <option value="false">Wants</option>
            </select>
          </div>
          <div className="input-group">
            <label>Sort</label>
            <select className="input" value={`${sortBy}-${sortOrder}`} onChange={(e) => {
              const [s, o] = e.target.value.split('-');
              setSortBy(s); setSortOrder(o); setPage(1);
            }}>
              <option value="expense_date-desc">Newest First</option>
              <option value="expense_date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      )}

      {/* Expense List */}
      {loading ? (
        <SkeletonGrid cards={6} height={80} />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon="🎉"
          title={hasFilters ? 'No matching expenses' : 'No expenses yet'}
          description={hasFilters ? 'Try adjusting your filters.' : 'Add your first expense to start understanding your spending.'}
          action={!hasFilters && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Expense</button>}
        />
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {expenses.map((exp, i) => (
              <div key={exp.id} style={{
                display: 'flex', alignItems: 'center', padding: '0.875rem 1.25rem',
                borderBottom: i < expenses.length - 1 ? '1px solid var(--border-color)' : 'none',
                gap: '0.875rem', transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '12px',
                  background: 'var(--bg-input)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
                }}>
                  {getCategoryIcon(exp.category)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exp.title}
                    </span>
                    <span className={`badge ${exp.is_need ? 'badge-need' : 'badge-want'}`}>
                      {exp.is_need ? 'Need' : 'Want'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                    <span>{exp.category}</span>
                    <span>•</span>
                    <span>{exp.payment_method}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                      {formatCurrency(exp.amount, user?.currency)}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {formatDate(exp.expense_date)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }}
                      onClick={() => setEditingExpense(exp)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px', color: '#ef4444' }}
                      onClick={() => setDeleteId(exp.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1}
                onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Expense">
        <ExpenseForm onSubmit={handleCreate} loading={formLoading} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title="Edit Expense">
        <ExpenseForm onSubmit={handleUpdate} initialData={editingExpense} loading={formLoading} />
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Expense" maxWidth="380px">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          Are you sure you want to delete this expense? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
