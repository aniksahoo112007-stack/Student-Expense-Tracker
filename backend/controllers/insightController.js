const ExpenseModel = require('../models/expenseModel');
const BudgetModel = require('../models/budgetModel');
const SavingGoalModel = require('../models/savingGoalModel');

// GET /api/insights
const getInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Current month
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${lastDay}`;

    // Previous month
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    const prevEndDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${prevLastDay}`;

    const currentExpenses = await ExpenseModel.getByDateRange(userId, startDate, endDate);
    const prevExpenses = await ExpenseModel.getByDateRange(userId, prevStartDate, prevEndDate);

    const totalCurrent = currentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalPrev = prevExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const income = Number(req.user.monthly_income) || 0;

    const insights = [];

    // 1. Category spending insights
    const categoryTotals = {};
    const prevCategoryTotals = {};
    currentExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });
    prevExpenses.forEach(e => {
      prevCategoryTotals[e.category] = (prevCategoryTotals[e.category] || 0) + Number(e.amount);
    });

    // Top spending categories
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const [topCat, topAmount] = sortedCategories[0];
      const prevCatAmount = prevCategoryTotals[topCat] || 0;
      const catChange = prevCatAmount > 0 ? Math.round(((topAmount - prevCatAmount) / prevCatAmount) * 100) : 0;
      const percentOfTotal = totalCurrent > 0 ? Math.round((topAmount / totalCurrent) * 100) : 0;

      insights.push({
        type: 'spending',
        icon: '📊',
        title: `${topCat} is your top expense`,
        description: `You spent ₹${topAmount.toLocaleString('en-IN')} on ${topCat} this month (${percentOfTotal}% of total).${catChange !== 0 ? ` That's ${Math.abs(catChange)}% ${catChange > 0 ? 'higher' : 'lower'} than last month.` : ''}`,
        severity: catChange > 20 ? 'warning' : 'info',
      });
    }

    // 2. Categories that increased significantly
    for (const [cat, amount] of Object.entries(categoryTotals)) {
      const prev = prevCategoryTotals[cat] || 0;
      if (prev > 0) {
        const change = Math.round(((amount - prev) / prev) * 100);
        if (change > 30) {
          insights.push({
            type: 'warning',
            icon: '⚠️',
            title: `${cat} spending increased ${change}%`,
            description: `You spent ₹${amount.toLocaleString('en-IN')} on ${cat} vs ₹${prev.toLocaleString('en-IN')} last month. Consider reviewing these expenses.`,
            severity: 'warning',
          });
        }
      }
    }

    // 3. Daily average insight
    const daysPassed = Math.min(now.getDate(), lastDay);
    if (daysPassed > 0 && totalCurrent > 0) {
      const dailyAvg = Math.round(totalCurrent / daysPassed);
      const projectedMonthly = dailyAvg * lastDay;
      const reducedDaily = Math.round(dailyAvg * 0.8);
      const monthlySavings = (dailyAvg - reducedDaily) * 30;

      insights.push({
        type: 'tip',
        icon: '💡',
        title: 'Daily spending insight',
        description: `Your average daily expense is ₹${dailyAvg.toLocaleString('en-IN')}. Reducing it to ₹${reducedDaily.toLocaleString('en-IN')} would save approximately ₹${monthlySavings.toLocaleString('en-IN')}/month.`,
        severity: 'info',
      });

      if (income > 0 && projectedMonthly > income) {
        insights.push({
          type: 'alert',
          icon: '🚨',
          title: 'Spending pace alert',
          description: `At your current rate, you'll spend ₹${projectedMonthly.toLocaleString('en-IN')} this month — exceeding your income of ₹${income.toLocaleString('en-IN')}.`,
          severity: 'danger',
        });
      }
    }

    // 4. Needs vs Wants
    const needsVsWants = await ExpenseModel.getNeedsVsWants(userId, startDate, endDate);
    if (needsVsWants.wants.percentage > 40) {
      insights.push({
        type: 'tip',
        icon: '🎯',
        title: 'High "wants" spending',
        description: `${needsVsWants.wants.percentage}% of your expenses were wants this month (₹${needsVsWants.wants.total.toLocaleString('en-IN')}). Try to keep wants under 40% of total spending.`,
        severity: 'warning',
      });
    }

    // 5. Savings rate
    if (income > 0) {
      const savingsRate = Math.round(((income - totalCurrent) / income) * 100);
      if (savingsRate < 20) {
        insights.push({
          type: 'warning',
          icon: '💰',
          title: 'Low savings rate',
          description: `Your savings rate is ${savingsRate}%. Financial experts recommend saving at least 20% of your income.`,
          severity: savingsRate < 10 ? 'danger' : 'warning',
        });
      } else if (savingsRate >= 30) {
        insights.push({
          type: 'positive',
          icon: '🎉',
          title: 'Great savings rate!',
          description: `You're saving ${savingsRate}% of your income this month. Keep it up!`,
          severity: 'success',
        });
      }
    }

    // 6. Subscription spending
    const subscriptionExpenses = currentExpenses.filter(e => e.category === 'Subscriptions');
    if (subscriptionExpenses.length > 0) {
      const subTotal = subscriptionExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      insights.push({
        type: 'info',
        icon: '📱',
        title: 'Subscription costs',
        description: `You're spending ₹${subTotal.toLocaleString('en-IN')}/month on subscriptions. That's ₹${(subTotal * 12).toLocaleString('en-IN')}/year. Review if all subscriptions are necessary.`,
        severity: 'info',
      });
    }

    // 7. Overall month comparison
    if (totalPrev > 0) {
      const monthChange = Math.round(((totalCurrent - totalPrev) / totalPrev) * 100);
      if (monthChange < -10) {
        insights.push({
          type: 'positive',
          icon: '📉',
          title: 'Spending decreased!',
          description: `You've spent ${Math.abs(monthChange)}% less this month compared to last month. Great job controlling your expenses!`,
          severity: 'success',
        });
      }
    }

    // 8. Financial Health Score
    const healthScore = calculateHealthScore({ income, totalCurrent, totalPrev, needsVsWants, categoryTotals, budgets: await BudgetModel.findAll(userId, { month: currentMonth, year: currentYear }) }, currentExpenses);

    res.json({
      success: true,
      data: {
        insights,
        healthScore,
        summary: {
          totalExpenses: totalCurrent,
          previousTotal: totalPrev,
          income,
          savingsRate: income > 0 ? Math.round(((income - totalCurrent) / income) * 100) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

function calculateHealthScore({ income, totalCurrent, totalPrev, needsVsWants, categoryTotals, budgets }, expenses) {
  let score = 50; // Start at middle
  const factors = [];

  // 1. Savings percentage (max +25)
  if (income > 0) {
    const savingsRate = (income - totalCurrent) / income;
    if (savingsRate >= 0.3) {
      score += 25;
      factors.push({ factor: 'Excellent savings rate', impact: 'positive' });
    } else if (savingsRate >= 0.2) {
      score += 15;
      factors.push({ factor: 'Good savings rate', impact: 'positive' });
    } else if (savingsRate >= 0.1) {
      score += 5;
      factors.push({ factor: 'Moderate savings rate', impact: 'neutral' });
    } else if (savingsRate < 0) {
      score -= 20;
      factors.push({ factor: 'Spending exceeds income', impact: 'negative' });
    } else {
      score -= 10;
      factors.push({ factor: 'Low savings rate', impact: 'negative' });
    }
  }

  // 2. Budget adherence (max +20)
  if (budgets.length > 0) {
    const budgetMap = {};
    budgets.forEach(b => { budgetMap[b.category] = Number(b.monthly_limit); });

    let withinBudget = 0;
    let totalBudgets = 0;
    for (const [cat, limit] of Object.entries(budgetMap)) {
      totalBudgets++;
      if ((categoryTotals[cat] || 0) <= limit) withinBudget++;
    }

    const adherenceRate = totalBudgets > 0 ? withinBudget / totalBudgets : 0;
    if (adherenceRate >= 0.9) {
      score += 20;
      factors.push({ factor: 'Excellent budget adherence', impact: 'positive' });
    } else if (adherenceRate >= 0.7) {
      score += 10;
      factors.push({ factor: 'Good budget adherence', impact: 'positive' });
    } else {
      score -= 10;
      factors.push({ factor: 'Budget exceeded in some categories', impact: 'negative' });
    }
  }

  // 3. Needs vs Wants (max +15)
  if (needsVsWants.needs.total + needsVsWants.wants.total > 0) {
    if (needsVsWants.wants.percentage <= 30) {
      score += 15;
      factors.push({ factor: 'Wants spending well controlled', impact: 'positive' });
    } else if (needsVsWants.wants.percentage <= 45) {
      score += 5;
      factors.push({ factor: 'Moderate wants spending', impact: 'neutral' });
    } else {
      score -= 10;
      factors.push({ factor: 'High wants spending', impact: 'negative' });
    }
  }

  // 4. Month-over-month improvement (max +10)
  if (totalPrev > 0) {
    const change = (totalCurrent - totalPrev) / totalPrev;
    if (change < -0.1) {
      score += 10;
      factors.push({ factor: 'Spending decreased from last month', impact: 'positive' });
    } else if (change > 0.2) {
      score -= 10;
      factors.push({ factor: 'Spending increased significantly', impact: 'negative' });
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let level, label;
  if (score >= 80) { level = 'excellent'; label = 'Excellent'; }
  else if (score >= 60) { level = 'good'; label = 'Good'; }
  else if (score >= 40) { level = 'fair'; label = 'Fair'; }
  else { level = 'needs_improvement'; label = 'Needs Improvement'; }

  return { score, level, label, factors };
}

module.exports = { getInsights };
