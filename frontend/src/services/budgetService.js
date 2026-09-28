import api from './api';

export const budgetService = {
  async getAll(params = {}) {
    const res = await api.get('/budgets', { params });
    return res.data;
  },

  async create(data) {
    const res = await api.post('/budgets', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/budgets/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  },
};
