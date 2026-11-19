import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HiOutlineAdjustments, HiOutlineViewGrid, HiOutlineViewList } from 'react-icons/hi'
import ProductCard from '../components/product/ProductCard.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function Products() {
  const { products, categories, openDrawer } = useApp()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const category = params.get('category') || 'all'
  const sort = params.get('sort') || 'featured'
  const [view, setView] = useState('grid')

  const setParam = (k, v) => {
    const next = new URLSearchParams(params)
    if (v == null || v === '' || v === 'all') next.delete(k)
    else next.set(k, v)
    setParams(next)
  }

  const filtered = useMemo(() => {
    let list = products.slice()
    if (category !== 'all') list = list.filter((p) => p.category === category)
    if (q.trim()) {
      const needle = q.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.brand.toLowerCase().includes(needle)
      )
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'trending':
        list.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        break
    }
    return list
  }, [category, q, sort])

  return (
    <div className="container-page py-10">
      {/* Breadcrumb / Title */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Shop</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink-900">
            {category === 'all' ? 'All products' : categories.find((c) => c.key === category)?.name}
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
            {q ? ` for "${q}"` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => openDrawer('filters')} className="btn-outline md:hidden">
            <HiOutlineAdjustments /> Filters
          </button>

          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="bg-white border border-ink-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest rated</option>
            <option value="trending">Most reviewed</option>
          </select>

          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-ink-100">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg ${view === 'grid' ? 'bg-white shadow' : 'text-ink-500'}`}
              aria-label="Grid view"
            >
              <HiOutlineViewGrid />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg ${view === 'list' ? 'bg-white shadow' : 'text-ink-500'}`}
              aria-label="List view"
            >
              <HiOutlineViewList />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <FilterCard title="Category">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setParam('category', 'all')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                      category === 'all' ? 'bg-brand-50 text-brand-700' : 'hover:bg-ink-50'
                    }`}
                  >
                    All
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.key}>
                    <button
                      onClick={() => setParam('category', c.key)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                        category === c.key ? 'bg-brand-50 text-brand-700' : 'hover:bg-ink-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${c.color}`} />
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterCard>

            <FilterCard title="Price">
              <ul className="space-y-1 text-sm">
                {['Under ₹500', '₹500 – ₹1,500', '₹1,500 – ₹3,000', '₹3,000 – ₹7,500', '₹7,500+'].map((p) => (
                  <li key={p}>
                    <label className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-ink-50 cursor-pointer">
                      <input type="radio" name="price" className="accent-brand-500" />
                      {p}
                    </label>
                  </li>
                ))}
              </ul>
            </FilterCard>

            <FilterCard title="Customer Rating">
              {[4, 3, 2].map((r) => (
                <label key={r} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-ink-50 cursor-pointer text-sm">
                  <input type="radio" name="rating" className="accent-brand-500" />
                  <span className="inline-flex items-center gap-1">
                    {'★'.repeat(r)}
                    {'☆'.repeat(5 - r)} & up
                  </span>
                </label>
              ))}
            </FilterCard>
          </div>
        </aside>

        {/* Results */}
        <div>
          {filtered.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-ink-100">
              <p className="text-ink-500">No products match your filters.</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid-products">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <ul className="space-y-4">
              {filtered.map((p) => (
                <Row key={p.id} product={p} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-white border border-ink-100 p-4">
      <h3 className="font-display font-semibold text-ink-900 mb-2">{title}</h3>
      {children}
    </div>
  )
}

function Row({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useApp()
  const liked = wishlist.includes(product.id)
  return (
    <li className="flex gap-4 p-4 bg-white rounded-2xl border border-ink-100 hover:shadow-soft transition">
      <Link to={`/product/${product.id}`} className="w-32 h-32 rounded-xl overflow-hidden bg-ink-100 shrink-0">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">{product.brand}</p>
        <Link
          to={`/product/${product.id}`}
          className="font-display font-semibold text-lg text-ink-900 hover:text-brand-600"
        >
          {product.title}
        </Link>
        <p className="text-sm text-ink-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-bold text-ink-900">{formatCurrency(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs line-through text-ink-400">{formatCurrency(product.oldPrice)}</span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => addToCart(product)} className="btn-primary">Add to cart</button>
          <button onClick={() => toggleWishlist(product.id)} className="btn-outline">
            {liked ? '♥ Saved' : '♡ Save'}
          </button>
        </div>
      </div>
    </li>
  )
}
