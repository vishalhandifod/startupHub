export function formatNumber(value) {
  if (value == null) {
    return '0'
  }

  if (value < 1000) {
    return `${value}`
  }

  if (value < 1000000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  }

  return `${(value / 1000000).toFixed(1)}m`
}
