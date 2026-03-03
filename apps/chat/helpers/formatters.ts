/**
 * Formatting Helpers
 *
 * Contains centralized formatting functions for currency, dates, prices, etc.
 */

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100); // amounts in paise
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
