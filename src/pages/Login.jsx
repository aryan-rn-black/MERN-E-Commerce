import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiCheck,
} from 'react-icons/hi'
import { useApp } from '../context/AppContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/account'

  const { login, register, isAuthed, user, serverOnline } = useApp()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // If already authenticated, redirect
  if (isAuthed && user) {
    if (user.role === 'admin' && redirect === '/account') {
      navigate('/admin')
    } else {
      navigate(redirect)
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const u = await login(email, password)
        if (u?.role === 'admin' && redirect === '/account') {
          navigate('/admin')
        } else {
          navigate(redirect)
        }
      } else {
        await register(name, email, password)
        navigate(redirect)
      }
    } catch (_) {
      // Toast error handled in AppContext
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (role) => {
    setLoading(true)
    try {
      if (role === 'admin') {
        await login('admin@shopverse.in', 'admin123')
        navigate('/admin')
      } else {
        await login('alex@shopverse.in', 'password123')
        navigate(redirect)
      }
    } catch (_) {
      // Fallback for demo
      try {
        await login('alex@shopverse.io', 'password123')
        navigate(redirect)
      } catch (err) {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page py-12">
      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-ink-100 bg-white shadow-card">
        {/* Left Side: Brand Promo banner */}
        <div className="bg-gradient-to-br from-brand-600 via-purple-700 to-indigo-800 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-60 h-60 rounded-full bg-brand-400/30 blur-2xl" />
          <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-fuchsia-400/20 blur-xl" />

          <div className="relative z-10">
            <Link to="/" className="font-display text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-white text-brand-700 grid place-items-center font-black text-lg shadow">
                S
              </span>
              ShopVerse India
            </Link>
            <p className="mt-2 text-sm text-brand-100 font-medium">
              India's premier modern lifestyle & electronics destination.
            </p>
          </div>

          <div className="relative z-10 my-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-white/10 text-accent-300">
                <HiOutlineSparkles size={20} />
              </span>
              <div>
                <p className="font-semibold text-sm">250 Welcome Points</p>
                <p className="text-xs text-brand-100/80">Get ₹250 worth of rewards instantly upon signing up.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-white/10 text-emerald-300">
                <HiOutlineTruck size={20} />
              </span>
              <div>
                <p className="font-semibold text-sm">Fast Pan-India Delivery</p>
                <p className="text-xs text-brand-100/80">Free express delivery on all orders above ₹499.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-white/10 text-sky-300">
                <HiOutlineShieldCheck size={20} />
              </span>
              <div>
                <p className="font-semibold text-sm">100% Genuine & Secure</p>
                <p className="text-xs text-brand-100/80">256-bit encrypted checkout with UPI & Card support.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-brand-200/80 flex items-center justify-between pt-4 border-t border-white/10">
            <span>© {new Date().getFullYear()} ShopVerse Technologies</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {serverOnline ? 'Backend Online' : 'Local Mode'}
            </span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          {/* Mode Switcher */}
          <div className="flex rounded-2xl bg-ink-100 p-1.5 text-sm font-semibold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-xl transition ${
                mode === 'login' ? 'bg-white shadow text-ink-900 font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-xl transition ${
                mode === 'register' ? 'bg-white shadow text-ink-900 font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-6">
            <h1 className="font-display text-2xl font-extrabold text-ink-900">
              {mode === 'login' ? 'Welcome back! 👋' : 'Create your account 🎉'}
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              {mode === 'login'
                ? 'Enter your credentials to access your account & orders.'
                : 'Join ShopVerse today to start shopping and earning rewards.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-ink-400">
                    <HiOutlineUser size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-ink-400">
                  <HiOutlineMail size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-ink-700">Password</label>
                {mode === 'login' && (
                  <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-ink-400">
                  <HiOutlineLockClosed size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 justify-center text-sm font-semibold shadow-brand"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Register Now'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-ink-100">
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-bold text-center mb-3">
              ⚡ 1-Click Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                disabled={loading}
                className="btn-outline justify-center text-xs py-2 px-2 hover:bg-ink-50"
              >
                👤 Customer (Alex)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="btn-outline justify-center text-xs py-2 px-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                🛡️ Admin Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
