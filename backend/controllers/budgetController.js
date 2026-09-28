const BudgetModel = require('../models/budgetModel');
const ExpenseModel = require('../models/expenseModel');

// GET /api/budgets
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const budgets = await BudgetModel.findAll(req.user.id, { month, year });

    // Get actual spending per category for this month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const categoryBreakdown = await ExpenseModel.getCategoryBreakdown(req.user.id, startDate, endDate);
    const spendingMap = {};
    categoryBreakdown.forEach(cat => { spendingMap[cat.category] = cat.total; });

    const budgetsWithSpending = budgets.map(budget => ({
      ...budget,
      spent: spendingMap[budget.category] || 0,
      remaining: budget.monthly_limit - (spendingMap[budget.category] || 0),
      percentage: budget.monthly_limit > 0
        ? Math.round(((spendingMap[budget.category] || 0) / budget.monthly_limit) * 100)
        : 0,
      isOverBudget: (spendingMap[budget.category] || 0) > budget.monthly_limit,
      isNearBudget: (spendingMap[budget.category] || 0) >= budget.monthly_limit * 0.8,
    }));

    res.json({ success: true, data: { budgets: budgetsWithSpending, month, year } });
  } catch (error) {
    next(error);
  }
};

// POST /api/budgets
const createBudget = async (req, res, next) => {
  try {
    const { category, monthly_limit, month, year } = req.body;

    // Check if budget for this category/month already exists
    const existing = await BudgetModel.findByCategory(req.user.id, category, month, year);
    if (existing) {
      return res.status(409).json({ success: false, message: `Budget for ${category} already exists for this month` });
    }

    const budget = await BudgetModel.create({
      user_id: req.user.id,
      category,
      monthly_limit: Number(monthly_limit),
      month: Number(month),
      year: Number(year),
    });

    res.status(201).json({ success: true, data: { budget } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/budgets/:id
const updateBudget = async (req, res, next) => {
  try {
    const existing = await BudgetModel.findById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const updates = {};
    if (req.body.monthly_limit !== undefined) updates.monthly_limit = Number(req.body.monthly_limit);
    if (req.body.category !== undefined) updates.category = req.body.category;

    const budget = await BudgetModel.update(req.params.id, req.user.id, updates);

    res.json({ success: true, data: { budget } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/budgets/:id
const deleteBudget = async (req, res, next) => {
  try {
    const existing = await BudgetModel.findById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    await BudgetModel.delete(req.params.id, req.user.id);

    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
