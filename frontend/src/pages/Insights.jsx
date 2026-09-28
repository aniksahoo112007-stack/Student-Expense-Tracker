import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import { SkeletonGrid } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { Calculator } from 'lucide-react';

function HealthScoreRing({ score, label }) {
  const radius = 60;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#6366f1';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="score-ring" style={{ width: 160, height: 160 }}>
      <svg width="160" height="160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--border-color)" strokeWidth={stroke} />
        <circle cx="80" cy="80" r={radius} fill="none" stroke={getColor(score)}
          strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <span className="score-value" style={{ color: getColor(score) }}>{score}</span>
      <span className="score-label">{label}</span>
    </div>
  );
}

function SavingsSimulator() {
  const [daily, setDaily] = useState('');
  const weekly = Number(daily) * 7;
  const monthly = Number(daily) * 30;
  const yearly = Number(daily) * 365;

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calculator size={20} style={{ color: '#6366f1' }} /> What If I Save?
      </h3>
      <div className="input-group" style={{ marginBottom: '1rem' }}>
        <label>Daily unnecessary spending you could avoid (₹)</label>
        <input className="input" type="number" min="0" placeholder="100" value={daily}
          onChange={(e) => setDaily(e.target.value)} />
      </div>
      {Number(daily) > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Weekly</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981' }}>₹{weekly.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Monthly</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981' }}>₹{monthly.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Yearly</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981' }}>₹{yearly.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}
      {Number(daily) > 0 && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.6 }}>
          💡 If you save <strong>₹{Number(daily).toLocaleString('en-IN')}</strong> every day instead of spending it,
          you could save approximately <strong style={{ color: '#10b981' }}>₹{yearly.toLocaleString('en-IN')}</strong> in one year.
        </p>
      )}
    </div>
  );
}

export default function Insights() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = useCallback(async () => {
    try {
      const res = await dashboardService.getInsights();
      setData(res.data);
    } catch {
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  if (loading) {
    return (<div><div className="page-header"><h1>Insights</h1></div><SkeletonGrid cards={4} height={200} /></div>);
  }

  const severityColors = {
    success: { bg: 'rgba(16, 185, 129, 0.08)', border: '#10b981' },
    info: { bg: 'rgba(99, 102, 241, 0.08)', border: '#6366f1' },
    warning: { bg: 'rgba(245, 158, 11, 0.08)', border: '#f59e0b' },
    danger: { bg: 'rgba(239, 68, 68, 0.08)', border: '#ef4444' },
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Smart Insights 💡</h1>
        <p>Data-driven suggestions to improve your finances</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))', gap: '1.5rem' }}>
        {/* Health Score */}
        {data?.healthScore && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', alignSelf: 'flex-start' }}>
              Financial Health Score
            </h3>
            <HealthScoreRing score={data.healthScore.score} label={data.healthScore.label} />
            <div style={{ marginTop: '1.25rem', width: '100%' }}>
              {data.healthScore.factors?.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0', fontSize: '0.8125rem',
                }}>
                  <span>{f.impact === 'positive' ? '✅' : f.impact === 'negative' ? '❌' : '➖'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Savings Simulator */}
        <SavingsSimulator />

        {/* Insights List */}
        {(!data?.insights || data.insights.length === 0) ? (
          <EmptyState icon="💡" title="No insights yet" description="Add more expenses to get personalized financial insights." />
        ) : (
          data.insights.map((insight, i) => {
            const colors = severityColors[insight.severity] || severityColors.info;
            return (
              <div key={i} className="card slide-up"
                style={{
                  background: colors.bg, borderLeft: `4px solid ${colors.border}`,
                  animationDelay: `${i * 0.08}s`, animationFillMode: 'both',
                }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{insight.icon}</span>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.375rem' }}>{insight.title}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
