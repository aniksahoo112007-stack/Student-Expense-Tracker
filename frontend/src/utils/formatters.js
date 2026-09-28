export const formatCurrency = (amount, currency = 'INR') => {
  const num = Number(amount) || 0;
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '₹';

  if (currency === 'INR') {
    return `${symbol}${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return `${symbol}${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
};

export const formatFullDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

export const getChangeIndicator = (change) => {
  if (change > 0) return { direction: 'up', color: 'text-red-500', icon: '↑', label: `${Math.abs(change)}% more than last month` };
  if (change < 0) return { direction: 'down', color: 'text-green-500', icon: '↓', label: `${Math.abs(change)}% less than last month` };
  return { direction: 'same', color: 'text-gray-500', icon: '→', label: 'Same as last month' };
};
