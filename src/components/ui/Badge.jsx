import clsx from 'clsx'

export default function Badge({ children, color = 'brand', className }) {
  const palette = {
    brand: 'bg-brand-50 text-brand-700',
    accent: 'bg-accent-400/20 text-accent-600',
    ink: 'bg-ink-100 text-ink-700',
    success: 'bg-emerald-50 text-emerald-700',
    info: 'bg-sky-50 text-sky-700',
    danger: 'bg-rose-50 text-rose-700',
  }
  return (
    <span className={clsx('chip', palette[color], className)}>
      {children}
    </span>
  )
}
