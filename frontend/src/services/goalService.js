import api from './api';

export const goalService = {
  async getAll() {
    const res = await api.get('/goals');
    return res.data;
  },

  async create(data) {
    const res = await api.post('/goals', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/goals/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/goals/${id}`);
    return res.data;
  },
};
