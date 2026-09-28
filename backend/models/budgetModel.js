const supabase = require('../config/supabase');

const BudgetModel = {
  async findAll(userId, { month, year } = {}) {
    let query = supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);

    query = query.order('category', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(id, userId) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByCategory(userId, category, month, year) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(budgetData) {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budgetData)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, userId, updates) {
    const { data, error } = await supabase
      .from('budgets')
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
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
};

module.exports = BudgetModel;
