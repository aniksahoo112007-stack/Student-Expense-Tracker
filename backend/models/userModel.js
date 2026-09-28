const supabase = require('../config/supabase');

const UserModel = {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, monthly_income, currency, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create({ name, email, password_hash }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
      })
      .select('id, name, email, monthly_income, currency, created_at')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const allowed = ['name', 'monthly_income', 'currency'];
    const sanitized = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) sanitized[key] = updates[key];
    }
    sanitized.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(sanitized)
      .eq('id', id)
      .select('id, name, email, monthly_income, currency, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  },
};

module.exports = UserModel;
