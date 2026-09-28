export const CATEGORIES = [
  { value: 'Food', label: 'Food', icon: '🍔', color: '#ef4444' },
  { value: 'Transport', label: 'Transport', icon: '🚕', color: '#3b82f6' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#f59e0b' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { value: 'Education', label: 'Education', icon: '📚', color: '#10b981' },
  { value: 'Subscriptions', label: 'Subscriptions', icon: '💳', color: '#ec4899' },
  { value: 'Health', label: 'Health', icon: '🏥', color: '#14b8a6' },
  { value: 'Gaming', label: 'Gaming', icon: '🎮', color: '#6366f1' },
  { value: 'Travel', label: 'Travel', icon: '✈️', color: '#06b6d4' },
  { value: 'Mobile Recharge', label: 'Mobile Recharge', icon: '📱', color: '#84cc16' },
  { value: 'Bills', label: 'Bills', icon: '🧾', color: '#f97316' },
  { value: 'Friends', label: 'Friends', icon: '👥', color: '#a855f7' },
  { value: 'Other', label: 'Other', icon: '➕', color: '#64748b' },
];

export const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', icon: '💵' },
  { value: 'UPI', label: 'UPI', icon: '📲' },
  { value: 'Debit Card', label: 'Debit Card', icon: '💳' },
  { value: 'Credit Card', label: 'Credit Card', icon: '🏦' },
  { value: 'Net Banking', label: 'Net Banking', icon: '🌐' },
  { value: 'Wallet', label: 'Wallet', icon: '👛' },
  { value: 'Other', label: 'Other', icon: '💰' },
];

export const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

export const CHART_COLORS = [
  '#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#14b8a6',
  '#3b82f6', '#a855f7', '#64748b',
];

export const getCategoryIcon = (category) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? cat.icon : '📋';
};

export const getCategoryColor = (category) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? cat.color : '#64748b';
};
