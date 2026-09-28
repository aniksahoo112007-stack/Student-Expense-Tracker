import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import { CHART_COLORS, getCategoryColor } from '../constants/categories';
import { SkeletonGrid } from '../components/common/Skeleton';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      padding: '0.75rem 1rem', borderRadius: '10px', boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.8125rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.8125rem', color: p.color }}>
          {p.name}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [needsWants, setNeedsWants] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      const [catRes, trendRes, weekRes, nwRes] = await Promise.all([
        dashboardService.getCategoryBreakdown(),
        dashboardService.getMonthlyTrend(),
        dashboardService.getWeeklySpending(),
        dashboardService.getNeedsVsWants(),
      ]);
      setCategoryData(catRes.data.breakdown || []);
      setTrendData(trendRes.data.trend || []);
      setWeeklyData(weekRes.data.weekly || []);
      setNeedsWants(nwRes.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Analytics</h1><p>Loading your financial data...</p></div>
        <SkeletonGrid cards={4} height={300} />
      </div>
    );
  }

  const needsWantsData = needsWants ? [
    { name: 'Needs', value: needsWants.needs.total, percentage: needsWants.needs.percentage },
    { name: 'Wants', value: needsWants.wants.total, percentage: needsWants.wants.percentage },
  ] : [];

  const incomeExpenseData = trendData.map(t => ({
    month: t.month,
    expenses: t.total,
    income: user?.monthly_income || 0,
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Visualize your spending patterns and trends</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))', gap: '1.5rem' }}>
        {/* Monthly Trend Line Chart */}
        <ChartCard title="📈 Monthly Expense Trend">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                <Area type="monotone" dataKey="total" name="Expenses" stroke="#6366f1"
                  fill="url(#trendGrad)" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>}
        </ChartCard>

        {/* Category Breakdown Donut */}
        <ChartCard title="📊 Expense Categories">
          {categoryData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                    dataKey="total" nameKey="category" paddingAngle={3}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={getCategoryColor(entry.category) || CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {categoryData.slice(0, 6).map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: getCategoryColor(cat.category) || CHART_COLORS[i] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.category} ({cat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>}
        </ChartCard>

        {/* Weekly Spending Bar Chart */}
        <ChartCard title="📅 Weekly Spending">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                <Bar dataKey="total" name="Spent" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>}
        </ChartCard>

        {/* Needs vs Wants */}
        <ChartCard title="🎯 Needs vs Wants">
          {needsWantsData.length > 0 && (needsWantsData[0].value > 0 || needsWantsData[1].value > 0) ? (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={needsWantsData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" paddingAngle={5}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span className="badge badge-need" style={{ marginBottom: '0.25rem' }}>Needs</span>
                  <div style={{ fontWeight: 700 }}>{formatCurrency(needsWants?.needs.total, user?.currency)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{needsWants?.needs.percentage}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span className="badge badge-want" style={{ marginBottom: '0.25rem' }}>Wants</span>
                  <div style={{ fontWeight: 700 }}>{formatCurrency(needsWants?.wants.total, user?.currency)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{needsWants?.wants.percentage}%</div>
                </div>
              </div>
            </div>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>}
        </ChartCard>

        {/* Income vs Expense */}
        <ChartCard title="💰 Income vs Expenses">
          {incomeExpenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>}
        </ChartCard>

        {/* Savings Trend */}
        <ChartCard title="📈 Savings Trend">
          {trendData.length > 0 && (user?.monthly_income || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData.map(t => ({ ...t, savings: Math.max(0, (user?.monthly_income || 0) - t.total) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                <Line type="monotone" dataKey="savings" name="Savings" stroke="#10b981"
                  strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Set your monthly income to see savings trend</p>}
        </ChartCard>
      </div>
    </div>
  );
}
