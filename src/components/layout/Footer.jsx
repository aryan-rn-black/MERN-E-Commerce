import { Link } from 'react-router-dom'
import { HiOutlineMail } from 'react-icons/hi'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  return (
    <footer className="mt-20 bg-ink-900 text-ink-300">
      {/* Newsletter */}
      <div className="border-b border-white/5">
        <div className="container-page py-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
              Join the Verse ✨
            </h3>
            <p className="text-ink-400 mt-2 max-w-md">
              Early access to drops, members-only deals and stories from independent makers.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!email.includes('@')) return toast.error('Enter a valid email')
              toast.success('Subscribed! Check your inbox.')
              setEmail('')
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 w-full">
              <HiOutlineMail className="text-ink-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@verse.io"
                className="bg-transparent outline-none w-full text-white placeholder-ink-500"
              />
            </div>
            <button className="btn-primary whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Columns */}
      <div className="container-page py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-600 text-white font-display font-extrabold">
              S
            </span>
            <span className="font-display text-xl font-extrabold text-white">
              Shop<span className="text-brand-400">Verse</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-ink-400 max-w-xs">
            Curated goods from independent brands. Designed to make shopping feel calm again.
          </p>
        </div>

        <Column
          title="Shop"
          links={[
            ['New In', '/products'],
            ['Best Sellers', '/products?sort=best'],
            ['Deals', '/deals'],
            ['Gift Cards', '/products'],
          ]}
        />
        <Column
          title="Help"
          links={[
            ['Customer Care', '/'],
            ['Shipping & Returns', '/'],
            ['Order Tracking', '/orders'],
            ['Contact', '/'],
          ]}
        />
        <Column
          title="Company"
          links={[
            ['About', '/'],
            ['Sustainability', '/'],
            ['Careers', '/'],
            ['Press', '/'],
          ]}
        />
      </div>

      <div className="border-t border-white/5">
        <div className="container-page py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ink-500">
          <p>© {new Date().getFullYear()} ShopVerse, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-white">Privacy</Link>
            <Link to="/" className="hover:text-white">Terms</Link>
            <Link to="/" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Column({ title, links }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-ink-400 hover:text-white transition">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
