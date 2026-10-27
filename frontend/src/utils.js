export const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n || 0);

export const dateOnly = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return Number.isNaN(+date) ? '' : date.toISOString().slice(0, 10);
};

export const formatDatePretty = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(+date)) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const calculateNights = (start, end) => {
  if (!start || !end) return 1;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};
