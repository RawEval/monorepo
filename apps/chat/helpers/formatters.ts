/**
 * Formatting Helpers
 *
 * Contains centralized formatting functions for currency, dates, prices, etc.
 */

export function formatCurrency(amount: number, currency = 'USD'): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatPrice(amount: number): string {
  if (amount === 0) return '$0';
  return `$${amount.toFixed(0)}`;
}
