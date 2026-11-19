import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'

export default function CategoriesGrid() {
  const { categories } = useApp()
  return (
    <section className="container-page mt-12">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="text-sm text-ink-500 mt-1">Pick a vibe. We curated the rest.</p>
        </div>
        <Link to="/products" className="text-sm font-semibold text-brand-600 hover:underline">
          View all →
        </Link>
      </header>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((c) => (
          <Link
            key={c.key}
            to={`/products?category=${c.key}`}
            className="group relative overflow-hidden rounded-2xl aspect-square bg-white border border-ink-100 hover:-translate-y-0.5 hover:shadow-soft transition"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-90`} />
            <div className="relative h-full p-3 flex flex-col justify-between text-white">
              <span className="text-3xl">{c.icon}</span>
              <div>
                <p className="font-display font-bold leading-tight">{c.name}</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {c.sub?.length ? `${c.sub.length} sub` : `${c.count || 0} items`}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
