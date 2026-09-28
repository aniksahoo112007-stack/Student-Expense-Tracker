import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, getGreeting, getChangeIndicator } from '../utils/formatters';
import { getCategoryIcon } from '../constants/categories';
import { SkeletonGrid } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { Link } from 'react-router-dom';
import {
  TrendingDown, TrendingUp, Wallet, PiggyBank,
  ArrowRight, Receipt, BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await dashboardService.getSummary();
      setSummary(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ width: 250, height: 32, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 180, height: 20 }} />
        </div>
        <SkeletonGrid cards={4} height={130} />
      </div>
    );
  }

  const change = getChangeIndicator(summary?.expenseChange || 0);

  const statCards = [
    {
      label: 'Monthly Income',
      value: formatCurrency(summary?.monthlyIncome, user?.currency),
      icon: Wallet,
      gradient: 'var(--gradient-primary)',
      sub: summary?.currentMonth,
    },
    {
      label: 'Spent This Month',
      value: formatCurrency(summary?.totalExpenses, user?.currency),
      icon: summary?.expenseChange > 0 ? TrendingUp : TrendingDown,
      gradient: summary?.totalExpenses > (summary?.monthlyIncome * 0.8) ? 'var(--gradient-danger)' : 'var(--gradient-warning)',
      sub: `${change.icon} ${change.label}`,
      subColor: change.color,
    },
    {
      label: 'Remaining',
      value: formatCurrency(Math.max(0, summary?.remaining || 0), user?.currency),
      icon: Receipt,
      gradient: 'var(--gradient-success)',
      sub: `${summary?.expensePercentage || 0}% of income spent`,
    },
    {
      label: 'Total Saved',
      value: formatCurrency(summary?.totalSaved, user?.currency),
      icon: PiggyBank,
      gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
      sub: 'Across all goals',
    },
  ];

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div className="page-header">
        <h1>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your financial overview for {summary?.currentMonth} {summary?.currentYear}</p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid', gap: '1rem', marginBottom: '2rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      }}>
        {statCards.map((card, i) => (
          <div key={i} className="card card-gradient slide-up"
            style={{ background: card.gradient, animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', opacity: 0.9, fontWeight: 500 }}>{card.label}</span>
              <card.icon size={20} style={{ opacity: 0.7 }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Daily Average</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(summary?.dailyAverage, user?.currency)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Transactions</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{summary?.transactionCount || 0}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Top Category</div>
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>
            {summary?.topCategory ? `${getCategoryIcon(summary.topCategory.name)} ${summary.topCategory.name}` : '—'}
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Savings Rate</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: (summary?.monthlyIncome || 0) > 0 && (summary?.remaining || 0) > 0 ? '#10b981' : '#ef4444' }}>
            {(summary?.monthlyIncome || 0) > 0 ? `${Math.round(((summary?.remaining || 0) / summary.monthlyIncome) * 100)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Transactions</h2>
        <Link to="/expenses" className="btn btn-ghost btn-sm" style={{ gap: '0.25rem' }}>
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {(!summary?.recentExpenses || summary.recentExpenses.length === 0) ? (
        <EmptyState
          icon="🎉"
          title="No expenses yet"
          description="Add your first expense to start tracking your spending."
          action={<Link to="/expenses" className="btn btn-primary">+ Add Expense</Link>}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {summary.recentExpenses.map((exp, i) => (
            <div key={exp.id} style={{
              display: 'flex', alignItems: 'center', padding: '1rem 1.25rem',
              borderBottom: i < summary.recentExpenses.length - 1 ? '1px solid var(--border-color)' : 'none',
              gap: '0.875rem',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '12px',
                background: 'var(--bg-input)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0,
              }}>
                {getCategoryIcon(exp.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {exp.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.category}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#ef4444' }}>
                  - {formatCurrency(exp.amount, user?.currency)}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {new Date(exp.expense_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '2rem' }}>
        <Link to="/expenses?add=true" className="card" style={{ textDecoration: 'none', textAlign: 'center', cursor: 'pointer' }}>
          <Receipt size={24} style={{ color: '#6366f1', marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Add Expense</div>
        </Link>
        <Link to="/analytics" className="card" style={{ textDecoration: 'none', textAlign: 'center', cursor: 'pointer' }}>
          <BarChart3 size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>View Analytics</div>
        </Link>
        <Link to="/budgets" className="card" style={{ textDecoration: 'none', textAlign: 'center', cursor: 'pointer' }}>
          <Wallet size={24} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Set Budget</div>
        </Link>
        <Link to="/insights" className="card" style={{ textDecoration: 'none', textAlign: 'center', cursor: 'pointer' }}>
          <PiggyBank size={24} style={{ color: '#8b5cf6', marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Smart Insights</div>
        </Link>
      </div>
    </div>
  );
}
