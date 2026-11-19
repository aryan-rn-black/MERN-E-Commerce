import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Account() {
  const { user, orders, wishlist, updateProfile, isAuthed, openDrawer } = useApp()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+1 213 555 0100',
    birthday: '1996-04-22',
    bio: 'Loves coffee, ceramics and a good playlist.',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+1 213 555 0100',
        birthday: user.birthday || '1996-04-22',
        bio: user.bio || 'Loves coffee, ceramics and a good playlist.',
      })
    }
  }, [user])

  if (!isAuthed || !user) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Please sign in to view account</h1>
        <p className="text-sm text-ink-500 mt-2">Manage your profile, orders, and rewards.</p>
        <button onClick={() => openDrawer('user')} className="btn-primary mt-4 inline-flex">
          Sign In
        </button>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
    } catch (_) {}
    finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-extrabold">Account Settings</h1>

      <div className="mt-8 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="rounded-3xl bg-white border border-ink-100 p-5">
          <div className="flex items-center gap-3">
            <img
              src={
                user.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces&q=80'
              }
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover ring-4 ring-brand-100"
            />
            <div className="min-w-0">
              <p className="font-display font-bold truncate">{user.name}</p>
              <p className="text-xs text-ink-500 truncate">{user.email}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-1 text-sm">
            {['Profile', 'Orders', 'Addresses', 'Payments', 'Notifications', 'Security'].map((x) => (
              <li key={x}>
                <a
                  href={`#${x}`}
                  className={`block px-3 py-2 rounded-lg hover:bg-ink-50 ${
                    x === 'Profile' ? 'bg-brand-50 text-brand-700' : ''
                  }`}
                >
                  {x}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-600 text-white">
            <p className="text-xs opacity-80">Rewards</p>
            <p className="font-display text-2xl font-bold">{user.points || 0} pts</p>
            <p className="text-xs opacity-80 mt-1">Tier: {user.tier || 'Gold'}</p>
          </div>
        </aside>

        <section className="rounded-3xl bg-white border border-ink-100 p-6">
          <h2 className="font-display font-bold text-lg">Profile</h2>
          <form onSubmit={handleSubmit} className="mt-4 grid sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Birthday"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            />
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold text-ink-700 mb-2">Bio</p>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-400"
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>

          <h2 className="font-display font-bold text-lg mt-10">Quick stats</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Stat label="Orders" value={orders.length} />
            <Stat label="Wishlist" value={wishlist.length} />
            <Stat label="Points" value={user.points || 0} />
          </div>
        </section>
      </div>
    </div>
  )
}

function Input({ label, ...rest }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-700">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full px-3 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-400"
      />
    </label>
  )
}

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-ink-50">
      <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  )
}
