import api from './api';

export const dashboardService = {
  async getSummary() {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  async getCategoryBreakdown(params = {}) {
    const res = await api.get('/dashboard/category-breakdown', { params });
    return res.data;
  },

  async getMonthlyTrend(params = {}) {
    const res = await api.get('/dashboard/monthly-trend', { params });
    return res.data;
  },

  async getWeeklySpending() {
    const res = await api.get('/dashboard/weekly-spending');
    return res.data;
  },

  async getNeedsVsWants(params = {}) {
    const res = await api.get('/dashboard/needs-vs-wants', { params });
    return res.data;
  },

  async getCalendarData(year, month) {
    const res = await api.get(`/dashboard/calendar/${year}/${month}`);
    return res.data;
  },

  async getMonthlyReport(params = {}) {
    const res = await api.get('/dashboard/monthly-report', { params });
    return res.data;
  },

  async getInsights() {
    const res = await api.get('/insights');
    return res.data;
  },
};
