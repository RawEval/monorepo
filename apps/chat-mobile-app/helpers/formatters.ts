/**
 * Formatters — ported from web chat app with hoisted Intl objects
 * (per js-hoist-intl RN skill rule)
 */

const currencyFormatters: Record<string, Intl.NumberFormat> = {
  INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number, currency: 'INR' | 'USD' = 'USD'): string {
  const formatter = currencyFormatters[currency];
  if (!formatter) return `${currency} ${amount}`;
  return formatter.format(amount);
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

export function timeAgo(date: Date | string | number): string {
  const now = Date.now();
  const d = typeof date === 'number' ? date : new Date(date).getTime();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(new Date(d).toISOString());
}
