const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

const validateRequired = (fields, body) => {
  const missing = [];
  for (const field of fields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missing.push(field);
    }
  }
  return missing;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain a special character');
  return errors;
};

const validateExpense = (req, res, next) => {
  const { title, amount, category, expense_date } = req.body;

  const errors = [];

  if (!title || title.trim() === '') errors.push('Expense name is required');
  if (title && title.length > 200) errors.push('Expense name must be under 200 characters');

  if (amount === undefined || amount === null || amount === '') {
    errors.push('Amount is required');
  } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.push('Amount must be a positive number');
  } else if (Number(amount) > 10000000) {
    errors.push('Amount seems unreasonably large');
  }

  const validCategories = [
    'Food', 'Transport', 'Shopping', 'Entertainment', 'Education',
    'Subscriptions', 'Health', 'Gaming', 'Travel', 'Mobile Recharge',
    'Bills', 'Friends', 'Other'
  ];
  if (!category || !validCategories.includes(category)) {
    errors.push('Valid category is required');
  }

  if (!expense_date) {
    errors.push('Date is required');
  } else if (isNaN(Date.parse(expense_date))) {
    errors.push('Invalid date format');
  }

  const validPaymentMethods = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Wallet', 'Other'];
  if (req.body.payment_method && !validPaymentMethods.includes(req.body.payment_method)) {
    errors.push('Invalid payment method');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  // Sanitize
  req.body.title = sanitizeString(req.body.title);
  if (req.body.description) req.body.description = sanitizeString(req.body.description);

  next();
};

const validateBudget = (req, res, next) => {
  const { category, monthly_limit, month, year } = req.body;

  const errors = [];

  if (!category) errors.push('Category is required');
  if (!monthly_limit || isNaN(Number(monthly_limit)) || Number(monthly_limit) <= 0) {
    errors.push('Monthly limit must be a positive number');
  }
  if (!month || month < 1 || month > 12) errors.push('Valid month is required (1-12)');
  if (!year || year < 2020 || year > 2100) errors.push('Valid year is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  next();
};

const validateGoal = (req, res, next) => {
  const { title, target_amount } = req.body;

  const errors = [];

  if (!title || title.trim() === '') errors.push('Goal title is required');
  if (!target_amount || isNaN(Number(target_amount)) || Number(target_amount) <= 0) {
    errors.push('Target amount must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  req.body.title = sanitizeString(req.body.title);
  next();
};

module.exports = {
  sanitizeString,
  validateRequired,
  validateEmail,
  validatePassword,
  validateExpense,
  validateBudget,
  validateGoal,
};
