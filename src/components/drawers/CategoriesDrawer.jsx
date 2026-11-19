import { Link } from 'react-router-dom'
import {
  HiOutlineMenu,
  HiChevronRight,
  HiOutlineSparkles,
} from 'react-icons/hi'
import Drawer from '../ui/Drawer.jsx'
import { useApp } from '../../context/AppContext.jsx'

export default function CategoriesDrawer({ open, onClose }) {
  const { categories } = useApp()
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Browse the Store"
      subtitle="Find what you love, faster"
      icon={HiOutlineMenu}
      width="max-w-lg"
    >
      <div className="p-5 space-y-6">
        {/* Featured row */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/deals"
            onClick={onClose}
            className="relative h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 to-rose-500 p-4 text-white flex flex-col justify-end"
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Today's Pick</p>
            <p className="font-display font-bold leading-tight">Up to 60% Off 🔥</p>
          </Link>
          <Link
            to="/products"
            onClick={onClose}
            className="relative h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white flex flex-col justify-end"
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">New In</p>
            <p className="font-display font-bold leading-tight">Just Landed ✨</p>
          </Link>
        </div>

        {/* Categories list */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3 flex items-center gap-1">
            <HiOutlineSparkles className="text-brand-500" /> All Categories
          </h3>
          <ul className="grid grid-cols-1 gap-2">
            {categories.map((c) => (
              <li key={c.key}>
                <Link
                  to={`/products?category=${c.key}`}
                  onClick={onClose}
                  className="group flex items-center gap-3 p-3 rounded-2xl border border-ink-100 hover:border-brand-200 hover:bg-brand-50 transition"
                >
                  <span className={`grid place-items-center w-11 h-11 rounded-xl text-xl bg-gradient-to-br ${c.color}`}>
                    {c.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-ink-900">{c.name}</p>
                    <p className="text-xs text-ink-500">
                      {c.sub?.length ? `${c.sub.length} subcategories` : `${c.count || 0} items`}
                    </p>
                  </div>
                  <HiChevronRight className="text-ink-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
                </Link>
                {/* Sub pills */}
                {c.sub?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-14 pr-2 pt-1.5">
                    {c.sub.slice(0, 4).map((s) => (
                      <Link
                        key={s}
                        to={`/products?category=${c.key}&q=${encodeURIComponent(s)}`}
                        onClick={onClose}
                        className="chip bg-ink-100 text-ink-700 hover:bg-brand-500 hover:text-white transition"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link to="/orders" onClick={onClose} className="px-3 py-2 rounded-lg hover:bg-ink-100">My Orders</Link>
            <Link to="/wishlist" onClick={onClose} className="px-3 py-2 rounded-lg hover:bg-ink-100">Wishlist</Link>
            <Link to="/account" onClick={onClose} className="px-3 py-2 rounded-lg hover:bg-ink-100">Account</Link>
            <Link to="/" onClick={onClose} className="px-3 py-2 rounded-lg hover:bg-ink-100">Customer Care</Link>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
