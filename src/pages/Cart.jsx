import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineShoppingBag } from 'react-icons/hi'
import { useApp } from '../context/AppContext.jsx'
import { formatCurrency } from '../utils/format.js'

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, cartSubtotal } = useApp()
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const shipping = cartSubtotal > 50 || cartSubtotal === 0 ? 0 : 6.99
  const tax = +(cartSubtotal * 0.08).toFixed(2)
  const total = cartSubtotal + shipping + tax - discount

  const applyCoupon = (e) => {
    e.preventDefault()
    if (coupon.trim().toUpperCase() === 'HELLO15') {
      setDiscount(cartSubtotal * 0.15)
    } else {
      setDiscount(0)
    }
  }

  if (!cart.length) {
    return (
      <div className="container-page py-20">
        <div className="max-w-md mx-auto text-center p-10 bg-white rounded-3xl border border-ink-100">
          <div className="mx-auto w-20 h-20 grid place-items-center rounded-3xl bg-brand-50 text-brand-500">
            <HiOutlineShoppingBag size={36} />
          </div>
          <h1 className="font-display font-bold text-2xl mt-3">Your cart is empty</h1>
          <p className="text-sm text-ink-500 mt-1">
            Looks like you haven't added anything yet. Let's change that.
          </p>
          <Link to="/products" className="btn-primary mt-5 inline-flex">Shop products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl md:text-4xl font-extrabold">Your Cart</h1>
      <p className="text-sm text-ink-500 mt-1">{cart.length} item{cart.length === 1 ? '' : 's'}</p>

      <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
        <ul className="space-y-3">
          {cart.map((item) => (
            <li
              key={`${item.id}-${item.color}-${item.size}`}
              className="flex gap-4 p-4 bg-white rounded-2xl border border-ink-100"
            >
              <Link to={`/product/${item.id}`} className="w-24 h-28 rounded-xl overflow-hidden bg-ink-100 shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-ink-900 line-clamp-1">{item.title}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {item.color && <span className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full border" style={{ background: item.color }} /> Color</span>}
                  {item.size && <span className="ml-2">Size {item.size}</span>}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="inline-flex items-center rounded-lg border border-ink-200 overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 hover:bg-ink-100">−</button>
                    <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 hover:bg-ink-100">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-sm text-rose-600 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
              <span className="font-bold text-ink-900 whitespace-nowrap">
                {formatCurrency(item.price * item.qty)}
              </span>
            </li>
          ))}

          <div className="flex justify-between pt-2">
            <Link to="/products" className="btn-outline">← Continue shopping</Link>
            <button onClick={clearCart} className="btn-ghost text-rose-600">Clear cart</button>
          </div>
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 self-start">
          <div className="p-5 bg-white rounded-3xl border border-ink-100 space-y-4">
            <h2 className="font-display font-bold text-lg">Order Summary</h2>

            <form onSubmit={applyCoupon} className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon (try HELLO15)"
                className="flex-1 px-3 py-2 rounded-xl border border-ink-200 text-sm outline-none focus:border-brand-400"
              />
              <button className="btn-outline px-4">Apply</button>
            </form>

            <SummaryRow label="Subtotal" value={formatCurrency(cartSubtotal)} />
            <SummaryRow label="Shipping" value={shipping === 0 ? 'Free' : formatCurrency(shipping)} />
            <SummaryRow label="Tax (est.)" value={formatCurrency(tax)} />
            {discount > 0 && <SummaryRow label="Coupon" value={`- ${formatCurrency(discount)}`} accent />}
            <hr className="border-ink-100" />
            <SummaryRow label="Total" value={formatCurrency(total)} bold />
            <Link to="/checkout" className="btn-primary w-full">Proceed to checkout</Link>
            <p className="text-xs text-ink-500 text-center">
              Secure checkout · 256-bit encryption
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, bold, accent }) {
  return (
    <div className={`flex items-center justify-between ${bold ? 'text-base' : 'text-sm'}`}>
      <span className={bold ? 'font-display font-bold text-ink-900' : 'text-ink-500'}>{label}</span>
      <span
        className={
          bold
            ? 'font-display font-bold text-ink-900'
            : accent
            ? 'text-emerald-600 font-medium'
            : 'text-ink-900 font-medium'
        }
      >
        {value}
      </span>
    </div>
  )
}
