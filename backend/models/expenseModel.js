const supabase = require('../config/supabase');

const ExpenseModel = {
  async findAll(userId, { page = 1, limit = 20, category, search, sortBy = 'expense_date', sortOrder = 'desc', startDate, endDate, payment_method, is_need } = {}) {
    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (category) query = query.eq('category', category);
    if (payment_method) query = query.eq('payment_method', payment_method);
    if (is_need !== undefined && is_need !== null && is_need !== '') {
      query = query.eq('is_need', is_need === 'true' || is_need === true);
    }
    if (search) query = query.ilike('title', `%${search}%`);
    if (startDate) query = query.gte('expense_date', startDate);
    if (endDate) query = query.lte('expense_date', endDate);

    const validSorts = ['expense_date', 'amount', 'created_at', 'title', 'category'];
    const sort = validSorts.includes(sortBy) ? sortBy : 'expense_date';
    const order = sortOrder === 'asc' ? true : false;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order(sort, { ascending: order }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      expenses: data || [],
      total: count || 0,
      page: Number(page),
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async findById(id, userId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(expenseData) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, userId, updates) {
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id, userId) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async getByDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCategoryBreakdown(userId, startDate, endDate) {
    const expenses = await this.getByDateRange(userId, startDate, endDate);
    const breakdown = {};
    let total = 0;

    for (const exp of expenses) {
      const amount = Number(exp.amount);
      total += amount;
      if (!breakdown[exp.category]) {
        breakdown[exp.category] = { category: exp.category, total: 0, count: 0 };
      }
      breakdown[exp.category].total += amount;
      breakdown[exp.category].count += 1;
    }

    return Object.values(breakdown).map(cat => ({
      ...cat,
      percentage: total > 0 ? Math.round((cat.total / total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  },

  async getMonthlyTrend(userId, months = 6) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const endDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

      const expenses = await this.getByDateRange(userId, startDate, endDate);
      const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      trends.push({
        month: monthNames[date.getMonth()],
        monthNum: date.getMonth() + 1,
        year: date.getFullYear(),
        total,
        count: expenses.length,
      });
    }

    return trends;
  },

  async getWeeklySpending(userId) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekly = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .eq('expense_date', dateStr);

      if (error) throw error;

      const total = (data || []).reduce((sum, e) => sum + Number(e.amount), 0);
      weekly.push({ day: dayNames[i], date: dateStr, total });
    }

    return weekly;
  },

  async getNeedsVsWants(userId, startDate, endDate) {
    const expenses = await this.getByDateRange(userId, startDate, endDate);

    let needs = 0;
    let wants = 0;
    let needsCount = 0;
    let wantsCount = 0;

    for (const exp of expenses) {
      const amount = Number(exp.amount);
      if (exp.is_need) {
        needs += amount;
        needsCount++;
      } else {
        wants += amount;
        wantsCount++;
      }
    }

    const total = needs + wants;
    return {
      needs: { total: needs, count: needsCount, percentage: total > 0 ? Math.round((needs / total) * 100) : 0 },
      wants: { total: wants, count: wantsCount, percentage: total > 0 ? Math.round((wants / total) * 100) : 0 },
    };
  },

  async getDailyExpenses(userId, date) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('expense_date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMonthExpenses(userId, month, year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    return this.getByDateRange(userId, startDate, endDate);
  },
};

module.exports = ExpenseModel;
