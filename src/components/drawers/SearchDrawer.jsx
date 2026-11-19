import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineSearch } from 'react-icons/hi'
import Drawer from '../ui/Drawer.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency } from '../../utils/format.js'

const TRENDING = ['oversized shirt', 'mechanical keyboard', 'yoga mat', 'cold brew', 'leather backpack']

export default function SearchDrawer({ open, onClose }) {
  const { products, categories } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      // focus after animation
      const id = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [open])

  const results = useMemo(() => {
    if (!q.trim()) return []
    const needle = q.toLowerCase()
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.brand.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle)
      )
      .slice(0, 8)
  }, [q])

  const go = (search) => {
    setQ(search)
    onClose()
    navigate(`/products?q=${encodeURIComponent(search)}`)
  }

  return (
    <Drawer
      open={open}
      onClose={() => {
        setQ('')
        onClose()
      }}
      title="Search ShopVerse"
      subtitle="Products, brands, categories…"
      icon={HiOutlineSearch}
      width="max-w-xl"
    >
      <div className="p-5">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-ink-200 focus-within:border-brand-400 focus-within:shadow-ring">
          <HiOutlineSearch className="text-ink-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && q.trim()) go(q.trim())
            }}
            placeholder="What are you looking for?"
            className="bg-transparent w-full outline-none text-base"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="text-xs text-ink-500 hover:text-ink-900"
            >
              Clear
            </button>
          )}
        </div>

        {!q && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
              Trending searches
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <button
                  key={t}
                  onClick={() => go(t)}
                  className="chip bg-ink-100 text-ink-700 hover:bg-brand-500 hover:text-white"
                >
                  {t}
                </button>
              ))}
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
              Browse categories
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.slice(0, 8).map((c) => (
                <button
                  key={c.key}
                  onClick={() => {
                    onClose()
                    navigate(`/products?category=${c.key}`)
                  }}
                  className={`p-3 rounded-2xl text-white text-sm font-medium bg-gradient-to-br ${c.color} hover:scale-[1.02] transition`}
                >
                  <span className="block text-2xl mb-1">{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {q && (
          <div className="mt-5">
            {results.length === 0 ? (
              <p className="text-sm text-ink-500">
                No matches for <b>"{q}"</b> — try a different keyword.
              </p>
            ) : (
              <ul className="space-y-2">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        onClose()
                        navigate(`/product/${p.id}`)
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-ink-50 text-left"
                    >
                      <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-ink-500">{p.brand}</p>
                      </div>
                      <span className="font-bold text-ink-900">{formatCurrency(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Drawer>
  )
}
