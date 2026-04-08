export function formatCurrency(amount: string | number, currency = 'USD'): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}
