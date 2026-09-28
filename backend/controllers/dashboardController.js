const ExpenseModel = require('../models/expenseModel');
const SavingGoalModel = require('../models/savingGoalModel');

// GET /api/dashboard/summary
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Current month dates
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${lastDay}`;

    // Previous month dates
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    const prevEndDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${prevLastDay}`;

    // Get expenses
    const currentExpenses = await ExpenseModel.getByDateRange(userId, startDate, endDate);
    const prevExpenses = await ExpenseModel.getByDateRange(userId, prevStartDate, prevEndDate);

    const totalExpenses = currentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const prevTotalExpenses = prevExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const monthlyIncome = Number(req.user.monthly_income) || 0;
    const remaining = monthlyIncome - totalExpenses;
    const expensePercentage = monthlyIncome > 0 ? Math.round((totalExpenses / monthlyIncome) * 100) : 0;

    // Change percentage from last month
    const expenseChange = prevTotalExpenses > 0
      ? Math.round(((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100)
      : 0;

    // Daily average
    const daysPassed = Math.min(now.getDate(), lastDay);
    const dailyAverage = daysPassed > 0 ? Math.round(totalExpenses / daysPassed) : 0;

    // Savings goals total
    const goals = await SavingGoalModel.findAll(userId);
    const totalSaved = goals.reduce((sum, g) => sum + Number(g.saved_amount), 0);

    // Recent transactions
    const recentExpenses = currentExpenses.slice(0, 5);

    // Top category
    const categoryTotals = {};
    for (const exp of currentExpenses) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    }
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || null;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    res.json({
      success: true,
      data: {
        currentMonth: monthNames[currentMonth - 1],
        currentYear,
        monthlyIncome,
        totalExpenses,
        remaining,
        totalSaved,
        expensePercentage,
        expenseChange,
        dailyAverage,
        transactionCount: currentExpenses.length,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
        recentExpenses,
        prevMonthExpenses: prevTotalExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/category-breakdown
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const breakdown = await ExpenseModel.getCategoryBreakdown(req.user.id, startDate, endDate);

    res.json({ success: true, data: { breakdown, month, year } });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/monthly-trend
const getMonthlyTrend = async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6;
    const trend = await ExpenseModel.getMonthlyTrend(req.user.id, Math.min(months, 12));

    res.json({ success: true, data: { trend } });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/weekly-spending
const getWeeklySpending = async (req, res, next) => {
  try {
    const weekly = await ExpenseModel.getWeeklySpending(req.user.id);

    res.json({ success: true, data: { weekly } });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/needs-vs-wants
const getNeedsVsWants = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const data = await ExpenseModel.getNeedsVsWants(req.user.id, startDate, endDate);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/calendar/:year/:month
const getCalendarData = async (req, res, next) => {
  try {
    const month = Number(req.params.month);
    const year = Number(req.params.year);

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month or year' });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const expenses = await ExpenseModel.getByDateRange(req.user.id, startDate, endDate);

    // Group by date
    const calendar = {};
    for (const exp of expenses) {
      const date = exp.expense_date;
      if (!calendar[date]) {
        calendar[date] = { expenses: [], total: 0 };
      }
      calendar[date].expenses.push(exp);
      calendar[date].total += Number(exp.amount);
    }

    res.json({ success: true, data: { calendar, month, year } });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/monthly-report
const getMonthlyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const expenses = await ExpenseModel.getByDateRange(req.user.id, startDate, endDate);

    // Previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    const prevEndDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${prevLastDay}`;
    const prevExpenses = await ExpenseModel.getByDateRange(req.user.id, prevStartDate, prevEndDate);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const prevTotal = prevExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const income = Number(req.user.monthly_income) || 0;
    const savings = income - totalExpenses;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100 * 10) / 10 : 0;

    // Category breakdown
    const categories = {};
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
    });
    const biggestCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    // Most expensive purchase
    const mostExpensive = expenses.reduce((max, e) => Number(e.amount) > Number(max?.amount || 0) ? e : max, null);

    // Expense change
    const expenseChange = prevTotal > 0 ? Math.round(((totalExpenses - prevTotal) / prevTotal) * 100) : 0;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    res.json({
      success: true,
      data: {
        month: monthNames[month - 1],
        year,
        income,
        totalExpenses,
        savings,
        savingsRate,
        biggestCategory: biggestCategory ? { name: biggestCategory[0], amount: biggestCategory[1] } : null,
        mostExpensive,
        dailyAverage: lastDay > 0 ? Math.round(totalExpenses / lastDay) : 0,
        transactionCount: expenses.length,
        expenseChange,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrend, getWeeklySpending, getNeedsVsWants, getCalendarData, getMonthlyReport };
