const sizeClasses = {
  xs: 'h-8 w-8 text-xs',
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

function getAvatarPalette(name = '') {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `linear-gradient(135deg, hsl(${hue} 70% 58%), hsl(${(hue + 45) % 360} 78% 46%))`
}

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const initials = (name || '?')
    .trim()
    .slice(0, 1)
    .toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-2xl object-cover ring-2 ring-white/10 ${className}`}
      />
    )
  }

  return (
    <div
      style={{ backgroundImage: getAvatarPalette(name) }}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-2xl font-semibold text-white ring-2 ring-white/10 ${className}`}
    >
      {initials}
    </div>
  )
}
