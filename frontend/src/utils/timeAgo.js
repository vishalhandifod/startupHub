export function timeAgo(value) {
  if (!value) {
    return ''
  }

  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) {
    return 'just now'
  }

  if (seconds < 172800 && new Date().getDate() !== date.getDate()) {
    return 'Yesterday'
  }

  if (seconds > 604800) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const intervals = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [label, size] of intervals) {
    const amount = Math.floor(seconds / size)
    if (amount >= 1) {
      return `${amount} ${label}${amount > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}
