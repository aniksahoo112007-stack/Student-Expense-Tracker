import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import { getCategoryIcon } from '../constants/categories';
import { SkeletonGrid } from '../components/common/Skeleton';
import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';

export default function MonthlyReport() {
  const { user } = useAuth();
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getMonthlyReport({ month, year });
      setReport(res.data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [month, year, toast]);

  useEffect(() => { loadReport(); }, [loadReport]);

  if (loading) {
    return (<div><div className="page-header"><h1>Monthly Report</h1></div><SkeletonGrid cards={6} height={100} /></div>);
  }

  if (!report) return null;

  const categoryEntries = Object.entries(report.categories || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Monthly Report 📋</h1>
        <p>{report.month} {report.year}</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card card-gradient" style={{ background: 'var(--gradient-primary)' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>Income</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(report.income, user?.currency)}</div>
        </div>
        <div className="card card-gradient" style={{ background: 'var(--gradient-danger)' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>Expenses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(report.totalExpenses, user?.currency)}</div>
        </div>
        <div className="card card-gradient" style={{ background: 'var(--gradient-success)' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>Savings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(Math.max(0, report.savings), user?.currency)}</div>
        </div>
        <div className="card card-gradient" style={{ background: 'linear-gradient(135deg, #06b6d4, #22d3ee)' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>Savings Rate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{report.savingsRate}%</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Biggest Category</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {report.biggestCategory ? `${getCategoryIcon(report.biggestCategory.name)} ${report.biggestCategory.name}` : '—'}
          </div>
          {report.biggestCategory && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formatCurrency(report.biggestCategory.amount, user?.currency)}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Most Expensive Purchase</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {report.mostExpensive ? formatCurrency(report.mostExpensive.amount, user?.currency) : '—'}
          </div>
          {report.mostExpensive && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.mostExpensive.title}</div>
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Daily Average</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{formatCurrency(report.dailyAverage, user?.currency)}</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Transactions</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{report.transactionCount}</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Compared to Last Month</div>
          <div style={{
            fontSize: '1.125rem', fontWeight: 700,
            color: report.expenseChange < 0 ? '#10b981' : report.expenseChange > 0 ? '#ef4444' : 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}>
            {report.expenseChange < 0 ? <TrendingDown size={18} /> : report.expenseChange > 0 ? <TrendingUp size={18} /> : <ArrowRight size={18} />}
            {report.expenseChange === 0 ? 'No change' : `${Math.abs(report.expenseChange)}% ${report.expenseChange < 0 ? 'decrease' : 'increase'}`}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryEntries.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Category Breakdown</h3>
          {categoryEntries.map(([cat, amount], i) => {
            const pct = report.totalExpenses > 0 ? Math.round((amount / report.totalExpenses) * 100) : 0;
            return (
              <div key={cat} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0',
                borderBottom: i < categoryEntries.length - 1 ? '1px solid var(--border-color)' : 'none',
              }}>
                <span style={{ fontSize: '1.125rem' }}>{getCategoryIcon(cat)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{cat}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(amount, user?.currency)}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 32, textAlign: 'right' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
