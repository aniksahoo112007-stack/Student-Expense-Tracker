-- ====================================================
-- SpendWise Database Schema
-- Run this in Supabase SQL Editor
-- ====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================
-- USERS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  monthly_income DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ====================================================
-- EXPENSES TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  expense_date DATE NOT NULL,
  is_need BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);

-- ====================================================
-- BUDGETS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  monthly_limit DECIMAL(12,2) NOT NULL CHECK (monthly_limit > 0),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, month, year)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month, year);

-- ====================================================
-- SAVING GOALS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS saving_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
  saved_amount DECIMAL(12,2) DEFAULT 0 CHECK (saved_amount >= 0),
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saving_goals_user_id ON saving_goals(user_id);

-- ====================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================
-- Since we use service_role key on the backend,
-- RLS is bypassed. But we add policies for safety.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saving_goals ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can view own expenses" ON expenses
  FOR ALL USING (true);

CREATE POLICY "Users can view own budgets" ON budgets
  FOR ALL USING (true);

CREATE POLICY "Users can view own goals" ON saving_goals
  FOR ALL USING (true);
