import {
  HiOutlineTruck,
  HiOutlineBadgeCheck,
  HiOutlineCreditCard,
  HiOutlineRefresh,
} from 'react-icons/hi'

const ITEMS = [
  { icon: HiOutlineTruck, label: 'Free Shipping', sub: 'On orders over $50' },
  { icon: HiOutlineRefresh, label: '30-Day Returns', sub: 'No-fuss policy' },
  { icon: HiOutlineBadgeCheck, label: 'Authentic', sub: 'Verified brands only' },
  { icon: HiOutlineCreditCard, label: 'Secure Pay', sub: '256-bit encryption' },
]

export default function PromoStrip() {
  return (
    <section className="container-page mt-12">
      <div className="rounded-3xl bg-white border border-ink-100 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-100 overflow-hidden">
        {ITEMS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="p-5 flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <Icon size={22} />
            </span>
            <div>
              <p className="font-display font-semibold text-ink-900">{label}</p>
              <p className="text-xs text-ink-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
