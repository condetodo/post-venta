export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}
