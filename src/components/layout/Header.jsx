import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  HiOutlineMenu,
  HiOutlineSearch,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUserCircle,
  HiOutlineBell,
} from 'react-icons/hi'
import { useApp } from '../../context/AppContext.jsx'

export default function Header() {
  const navigate = useNavigate()
  const {
    cartCount,
    wishlist,
    unreadCount,
    openDrawer,
    categories,
    serverOnline,
  } = useApp()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Promo bar */}
      <div className="bg-gradient-to-r from-brand-600 via-fuchsia-600 to-purple-600 text-white text-[13px]">
        <div className="container-page flex items-center justify-between py-2 overflow-hidden">
          <span className="opacity-90">
            ✨ Free express shipping across India on orders above ₹499 · Code <b className="text-accent-400">HELLO15</b> for 15% off
          </span>
          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
            <Link to="/admin" className="hover:underline text-brand-100 flex items-center gap-1">
              🛡️ Admin Portal
            </Link>
            <span>•</span>
            <Link to="/deals" className="hover:underline text-amber-200">
              🔥 Best Deals
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <header
        className={clsx(
          'sticky top-0 z-40 transition-all w-screen',
          scrolled
            ? 'bg-white/80 backdrop-blur shadow-sm border-b border-ink-100'
            : 'bg-white border-b border-transparent'
        )}
      >
        <div className="container-page flex items-center gap-4 py-3.5" style={{ minHeight: 'var(--header-h)' }}>
          {/* Left: Categories drawer (left drawer for browsing the store) */}
          <button
            onClick={() => openDrawer('categories')}
            className="grid place-items-center w-60 h-11 rounded-xl bg-ink-900 hover:bg-ink-700 text-white transition"
            aria-label="Open categories menu"
          >
            <HiOutlineMenu size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-600 text-white font-display font-extrabold">
              S
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">
              Shop<span className="text-brand-500">Verse</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-2 ">
            {categories.slice(0, 5).map((c) => (
              <NavLink
                key={c.key}
                to={`/products?category=${c.key}`}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium hover:bg-ink-200 text-ink-700 w-[84px]',
                    isActive && 'text-brand-600 bg-brand-50'
                  )
                }
              >
                {c.name}
              </NavLink>
            ))}
            <NavLink
              to="/deals"
              className={({ isActive }) =>
                clsx(
                  'ml-1 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent-400/10 text-accent-600',
                  isActive && 'bg-accent-400/15'
                )
              }
            >
              🔥 Deals
            </NavLink>
          </nav>

          {/* Search (desktop) */}
          <button
            onClick={() => openDrawer('search')}
            className="hidden md:flex items-center gap-2 ml-auto px-4 py-2.5 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-500 text-sm w-full max-w-md"
          >
            <HiOutlineSearch size={18} />
            <span>Search products, brands, categories…</span>
            <kbd className="ml-auto px-1.5 py-0.5 rounded-md bg-white text-ink-700 text-[10px] border border-ink-200">⌘ K</kbd>
          </button>

          {/* Right actions */}
          <div className="ml-auto md:ml-2 flex items-center gap-1.5">
            <IconBtn onClick={() => openDrawer('search')} label="Search" className="md:hidden">
              <HiOutlineSearch size={20} />
            </IconBtn>

            <IconBtn onClick={() => navigate('/wishlist')} label="Wishlist" badge={wishlist.length}>
              <HiOutlineHeart size={20} />
            </IconBtn>

            <IconBtn onClick={() => openDrawer('notifications')} label="Notifications" badge={unreadCount}>
              <HiOutlineBell size={20} />
            </IconBtn>

            <IconBtn onClick={() => openDrawer('user')} label="Account">
              <HiOutlineUserCircle size={22} />
            </IconBtn>

            <IconBtn onClick={() => openDrawer('cart')} label="Cart" badge={cartCount} highlight>
              <HiOutlineShoppingBag size={20} />
            </IconBtn>
          </div>
        </div>
      </header>
    </>
  )
}

function IconBtn({ children, onClick, label, badge, highlight, className }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={clsx(
        'relative grid place-items-center w-11 h-11 rounded-xl text-ink-700 hover:bg-ink-100 transition',
        highlight && 'bg-brand-500 text-white hover:bg-brand-600 shadow-soft',
        className
      )}
    >
      {children}
      {badge > 0 && (
        <span
          className={clsx(
            'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full text-[10px] font-bold',
            highlight
              ? 'bg-white text-brand-600 ring-2 ring-brand-500'
              : 'bg-brand-500 text-white ring-2 ring-white'
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}
