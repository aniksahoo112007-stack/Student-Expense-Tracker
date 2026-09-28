const ExpenseModel = require('../models/expenseModel');

// GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const { page, limit, category, search, sortBy, sortOrder, startDate, endDate, payment_method, is_need } = req.query;

    const result = await ExpenseModel.findAll(req.user.id, {
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100),
      category,
      search,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      payment_method,
      is_need,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/:id
const getExpense = async (req, res, next) => {
  try {
    const expense = await ExpenseModel.findById(req.params.id, req.user.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, data: { expense } });
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const { title, description, amount, category, payment_method, expense_date, is_need } = req.body;

    const expense = await ExpenseModel.create({
      user_id: req.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      amount: Number(amount),
      category,
      payment_method: payment_method || 'Cash',
      expense_date,
      is_need: is_need !== undefined ? is_need : false,
    });

    res.status(201).json({ success: true, data: { expense } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const existing = await ExpenseModel.findById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const { title, description, amount, category, payment_method, expense_date, is_need } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (amount !== undefined) updates.amount = Number(amount);
    if (category !== undefined) updates.category = category;
    if (payment_method !== undefined) updates.payment_method = payment_method;
    if (expense_date !== undefined) updates.expense_date = expense_date;
    if (is_need !== undefined) updates.is_need = is_need;

    const expense = await ExpenseModel.update(req.params.id, req.user.id, updates);

    res.json({ success: true, data: { expense } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const existing = await ExpenseModel.findById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await ExpenseModel.delete(req.params.id, req.user.id);

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/date/:date
const getExpensesByDate = async (req, res, next) => {
  try {
    const expenses = await ExpenseModel.getDailyExpenses(req.user.id, req.params.date);
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({ success: true, data: { expenses, total, date: req.params.date } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getExpensesByDate };
