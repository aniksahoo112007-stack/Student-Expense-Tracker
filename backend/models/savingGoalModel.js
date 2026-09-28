const supabase = require('../config/supabase');

const SavingGoalModel = {
  async findAll(userId) {
    const { data, error } = await supabase
      .from('saving_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async findById(id, userId) {
    const { data, error } = await supabase
      .from('saving_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(goalData) {
    const { data, error } = await supabase
      .from('saving_goals')
      .insert({
        ...goalData,
        saved_amount: goalData.saved_amount || 0,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, userId, updates) {
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('saving_goals')
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
      .from('saving_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
};

module.exports = SavingGoalModel;
