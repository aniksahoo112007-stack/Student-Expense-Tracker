import api from './api';

export const expenseService = {
  async getAll(params = {}) {
    const res = await api.get('/expenses', { params });
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/expenses/${id}`);
    return res.data;
  },

  async create(data) {
    const res = await api.post('/expenses', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },

  async getByDate(date) {
    const res = await api.get(`/expenses/date/${date}`);
    return res.data;
  },
};
