import { Link } from 'react-router-dom'
import { HiOutlineClock } from 'react-icons/hi'

export default function DealBanner() {
  return (
    <section className="container-page mt-14">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-purple-900 to-brand-700 p-8 md:p-12 text-white">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-brand-500/40 blur-3xl" />
        <div className="absolute -left-10 -bottom-20 w-72 h-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="chip bg-white/10 backdrop-blur text-white">
              <HiOutlineClock /> Deal of the Day
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-extrabold leading-tight">
              Up to <span className="text-accent-400">60% off</span> the Edit
            </h2>
            <p className="mt-3 text-white/80 max-w-md">
              Hand-picked favorites from independent brands. New drops weekly, low stock often.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to="/deals" className="btn-primary">Shop deals</Link>
              <Link to="/products" className="btn-outline !text-white !border-white/40 hover:!bg-white/10">
                Browse all
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-3">
            {[
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
              'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
            ].map((src, i) => (
              <div
                key={i}
                className={`rounded-2xl overflow-hidden aspect-square bg-white/10 backdrop-blur ${
                  i === 1 ? 'translate-y-4' : ''
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
