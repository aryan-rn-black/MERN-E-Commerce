import { useEffect, useState } from 'react'
import { HiX } from 'react-icons/hi'
import clsx from 'clsx'

/**
 * Reusable left-side drawer with smooth slide-in animation and a backdrop.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title: string
 *  - subtitle?: string
 *  - width: tailwind width class (e.g. 'max-w-md', 'max-w-lg', 'max-w-xl')
 *  - children, footer
 */
export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  width = 'max-w-md',
  children,
  footer,
}) {
  // animate-out before unmount
  const [visible, setVisible] = useState(open)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setLeaving(false)
    } else if (visible) {
      setLeaving(true)
      const id = setTimeout(() => {
        setVisible(false)
        setLeaving(false)
      }, 280)
      return () => clearTimeout(id)
    }
  }, [open]) // eslint-disable-line

  if (!visible) return null

  return (
    <div
      className={clsx('fixed inset-0 z-[100]', 'flex')}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={clsx(
          'absolute inset-0 bg-ink-950/60 backdrop-blur-sm',
          leaving ? 'backdrop-exit' : 'backdrop-enter'
        )}
      />

      {/* Panel */}
      <aside
        className={clsx(
          'relative bg-white h-full shadow-2xl flex flex-col w-full',
          width,
          leaving ? 'drawer-exit' : 'drawer-enter'
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
            )}
            <div>
              <h2 className="font-display font-bold text-lg leading-tight text-ink-900">{title}</h2>
              {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center w-9 h-9 rounded-xl hover:bg-ink-100 text-ink-600 transition"
            aria-label="Close"
          >
            <HiX size={20} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <footer className="border-t border-ink-100 bg-white px-5 py-4">{footer}</footer>
        )}
      </aside>
    </div>
  )
}
