import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineUserCircle, HiOutlineLogout } from 'react-icons/hi'
import {
  HiOutlineClipboardList,
  HiOutlineHeart,
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
} from 'react-icons/hi'
import Drawer from '../ui/Drawer.jsx'
import { useApp } from '../../context/AppContext.jsx'

export default function UserDrawer({ open, onClose }) {
  const { user, isAuthed, orders, wishlist, logout, login, register, serverOnline } = useApp()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      setEmail('')
      setPassword('')
      setName('')
    } catch (_) {
      // toast is already displayed by login/register
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoLogin = async () => {
    setSubmitting(true)
    try {
      await login('alex@shopverse.io', 'password123')
    } catch (_) {}
    finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isAuthed ? 'My Account' : mode === 'login' ? 'Sign In' : 'Create Account'}
      subtitle={
        isAuthed
          ? `Hi, ${user?.name?.split(' ')[0] || 'Member'} 👋`
          : mode === 'login'
          ? 'Welcome back to ShopVerse'
          : 'Join ShopVerse & get 250 points'
      }
      icon={HiOutlineUserCircle}
      width="max-w-md"
    >
      {!isAuthed ? (
        <div className="p-6 space-y-4">
          <div className="flex rounded-xl bg-ink-100 p-1 text-sm font-semibold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                mode === 'login' ? 'bg-white shadow text-ink-900' : 'text-ink-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                mode === 'register' ? 'bg-white shadow text-ink-900' : 'text-ink-600'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            {mode === 'register' && (
              <label className="block">
                <span className="text-xs font-semibold text-ink-700">Full Name</span>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-3 text-ink-400">
                    <HiOutlineUser size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-ink-200 outline-none focus:border-brand-400 text-sm"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="text-xs font-semibold text-ink-700">Email address</span>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-3 text-ink-400">
                  <HiOutlineMail size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="alex@shopverse.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-ink-200 outline-none focus:border-brand-400 text-sm"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-ink-700">Password</span>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-3 text-ink-400">
                  <HiOutlineLockClosed size={18} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-ink-200 outline-none focus:border-brand-400 text-sm"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2 justify-center"
            >
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-ink-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-ink-400">Or demo account</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={submitting}
            className="btn-outline w-full justify-center text-sm"
          >
            ⚡ Quick Demo Login (Alex Carter)
          </button>

          {serverOnline ? (
            <p className="text-[11px] text-center text-emerald-600 font-medium">
              ● Connected to MongoDB & Express Backend
            </p>
          ) : (
            <p className="text-[11px] text-center text-amber-600">
              ℹ Backend starting or running offline
            </p>
          )}
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-fuchsia-50">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces&q=80'
              }
              alt={user?.name || 'User'}
              className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow"
            />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-ink-900">{user?.name}</p>
              <p className="text-sm text-ink-500 truncate">{user?.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="chip bg-white text-brand-700 border border-brand-100">
                  ⭐ {user?.tier || 'Gold'}
                </span>
                <span className="text-xs text-ink-500">{user?.points || 0} pts</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Orders" value={orders.length} />
            <Stat label="Wishlist" value={wishlist.length} />
            <Stat label="Points" value={user?.points || 0} />
          </div>

          {/* Links */}
          <ul className="rounded-2xl border border-ink-100 overflow-hidden">
            <Item to="/admin" onClose={onClose} icon={HiOutlineShieldCheck} label="🛡️ Admin Portal (Add Products)" />
            <Item to="/orders" onClose={onClose} icon={HiOutlineClipboardList} label="My Orders" />
            <Item to="/wishlist" onClose={onClose} icon={HiOutlineHeart} label="Wishlist" />
            <Item to="/account" onClose={onClose} icon={HiOutlineCog} label="Account Settings" />
            <Item to="/" onClose={onClose} icon={HiOutlineQuestionMarkCircle} label="Help Center" last />
          </ul>

          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className="btn-outline w-full text-rose-600 hover:text-white hover:bg-rose-500 hover:border-rose-500"
          >
            <HiOutlineLogout /> Sign out
          </button>
        </div>
      )}
    </Drawer>
  )
}

function Item({ to, onClose, icon: Icon, label, last }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 hover:bg-ink-50 ${!last && 'border-b border-ink-100'}`}
      >
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-ink-100 text-ink-700">
          <Icon size={18} />
        </span>
        <span className="font-medium text-ink-900 flex-1">{label}</span>
        <span className="text-ink-400">›</span>
      </Link>
    </li>
  )
}

function Stat({ label, value }) {
  return (
    <div className="p-3 rounded-2xl bg-white border border-ink-100">
      <p className="font-display font-bold text-xl text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  )
}
