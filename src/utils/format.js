export function formatCurrency(n, currency = 'INR') {
  if (n === null || n === undefined || isNaN(n)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(n)
}

export function discount(oldPrice, price) {
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

export function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

export function pluralize(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural || singular + 's'}`
}
