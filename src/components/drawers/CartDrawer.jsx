import { useNavigate } from 'react-router-dom'
import { HiOutlineShoppingBag } from 'react-icons/hi'
import { useApp } from '../../context/AppContext.jsx'
import Drawer from '../ui/Drawer.jsx'
import { formatCurrency } from '../../utils/format.js'
import { useEffect, useState } from 'react'

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const {
    cart,
    updateQty,
    removeFromCart,
    cartSubtotal,
    closeDrawer,
  } = useApp()
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (!open) return
    setShake(true)
    const t = setTimeout(() => setShake(false), 700)
    return () => clearTimeout(t)
  }, [open])

  const goToCheckout = () => {
    closeDrawer('cart')
    navigate('/checkout')
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Your Cart"
      subtitle={cart.length ? `${cart.length} item${cart.length === 1 ? '' : 's'}` : 'Add something you love'}
      icon={HiOutlineShoppingBag}
      width="max-w-md"
      footer={
        cart.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Subtotal</span>
              <span className="font-display font-bold text-lg text-ink-900">
                {formatCurrency(cartSubtotal)}
              </span>
            </div>
            <p className="text-xs text-ink-500">
              Shipping & taxes calculated at checkout.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { closeDrawer('cart'); navigate('/cart') }} className="btn-outline flex-1">
                View cart
              </button>
              <button onClick={goToCheckout} className="btn-primary flex-1">
                Checkout
              </button>
            </div>
          </div>
        )
      }
    >
      {!cart.length ? (
        <EmptyState onClose={onClose} />
      ) : (
        <ul className="divide-y divide-ink-100">
          {cart.map((item, idx) => (
            <li
              key={`${item.id}-${idx}`}
              className={`flex gap-3 p-4 ${shake ? 'animate-pulse-soft' : ''}`}
            >
              <div className="w-20 h-24 rounded-xl overflow-hidden bg-ink-100 shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-ink-900 line-clamp-1">
                  {item.title}
                </p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {item.color && (
                    <span className="inline-block w-3 h-3 rounded-full align-middle mr-1 border" style={{ background: item.color }} />
                  )}
                  {item.size && <span className="ml-1">Size {item.size}</span>}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="inline-flex items-center rounded-lg border border-ink-200 overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 hover:bg-ink-100">−</button>
                    <span className="w-7 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 hover:bg-ink-100">+</button>
                  </div>
                  <span className="font-bold text-ink-900">{formatCurrency(item.price * item.qty)}</span>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-xs text-rose-600 hover:underline mt-1"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}

function EmptyState({ onClose }) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto w-24 h-24 grid place-items-center rounded-3xl bg-brand-50 text-brand-500">
        <HiOutlineShoppingBag size={40} />
      </div>
      <h3 className="font-display font-bold text-xl mt-4 text-ink-900">Your cart is empty</h3>
      <p className="text-sm text-ink-500 mt-1">Discover new arrivals and start your wishlist.</p>
      <button
        onClick={onClose}
        className="btn-primary mt-5"
      >
        Continue shopping
      </button>
    </div>
  )
}
