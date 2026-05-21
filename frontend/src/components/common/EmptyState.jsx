import Button from './Button.jsx'

export default function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center ${className}`}>
      {Icon ? (
        <div className="mb-4 rounded-3xl bg-primary/12 p-4 text-primary">
          <Icon size={28} />
        </div>
      ) : null}
      <h3 className="font-display text-2xl font-bold">{title}</h3>
      <p className="mt-3 max-w-md text-center text-sm text-[rgb(var(--text-soft))]">{message}</p>
      {actionLabel && onAction ? (
        <Button type="button" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
