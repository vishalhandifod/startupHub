function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  ...props
}) {
  const variantClass = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/30',
    secondary: 'bg-white/5 text-[rgb(var(--text))] hover:bg-white/10 border border-white/10',
    ghost: 'bg-transparent text-[rgb(var(--text))] hover:bg-white/10',
    success: 'bg-accent text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20',
  }[variant]

  const sizeClass = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }[size]

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl text-center font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${sizeClass} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}
