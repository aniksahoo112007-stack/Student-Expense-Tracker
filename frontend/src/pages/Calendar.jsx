import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import { getCategoryIcon } from '../constants/categories';
import { SkeletonGrid } from '../components/common/Skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const { user } = useAuth();
  const toast = useToast();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getCalendarData(year, month);
      setCalendarData(res.data.calendar || {});
    } catch {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [year, month, toast]);

  useEffect(() => { loadCalendar(); }, [loadCalendar]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  // Find max daily expense for intensity scaling
  const dailyTotals = Object.values(calendarData).map(d => d.total);
  const maxDaily = Math.max(...dailyTotals, 1);

  const todayStr = now.toISOString().split('T')[0];

  if (loading) {
    return (<div><div className="page-header"><h1>Spending Calendar</h1></div><SkeletonGrid cards={1} height={400} /></div>);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Spending Calendar 📅</h1>
        <p>Visualize your daily expenses</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{monthNames[month - 1]} {year}</h3>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>

        {/* Day Headers */}
        <div className="calendar-grid" style={{ marginBottom: '0.5rem' }}>
          {dayNames.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.5rem 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {/* Empty cells for padding */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-cell" style={{ opacity: 0 }} />
          ))}

          {/* Date cells */}
          {Array.from({ length: lastDate }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = calendarData[dateStr];
            const hasExpenses = !!dayData;
            const isHigh = dayData && dayData.total > maxDaily * 0.6;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <div key={day}
                className={`calendar-cell ${hasExpenses ? (isHigh ? 'high-expense' : 'has-expenses') : ''} ${isToday ? 'today' : ''}`}
                style={{
                  cursor: hasExpenses ? 'pointer' : 'default',
                  ...(isSelected ? { background: 'rgba(99, 102, 241, 0.15)', borderColor: '#6366f1' } : {}),
                }}
                onClick={() => hasExpenses && setSelectedDate(dateStr === selectedDate ? null : dateStr)}
              >
                <span style={{ fontWeight: isToday ? 700 : 400, fontSize: '0.875rem' }}>{day}</span>
                {dayData && (
                  <span className="amount" style={{ color: isHigh ? '#ef4444' : '#6366f1' }}>
                    ₹{dayData.total > 999 ? `${(dayData.total / 1000).toFixed(1)}k` : dayData.total}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && calendarData[selectedDate] && (
        <div className="card slide-up">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {calendarData[selectedDate].expenses.map((exp, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '0.75rem 0',
              borderBottom: i < calendarData[selectedDate].expenses.length - 1 ? '1px solid var(--border-color)' : 'none',
              gap: '0.75rem',
            }}>
              <span style={{ fontSize: '1.25rem' }}>{getCategoryIcon(exp.category)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{exp.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.category}</div>
              </div>
              <span style={{ fontWeight: 700, color: '#ef4444' }}>{formatCurrency(exp.amount, user?.currency)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem',
            display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatCurrency(calendarData[selectedDate].total, user?.currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
