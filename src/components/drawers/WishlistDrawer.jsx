import { Link } from 'react-router-dom'
import { HiOutlineHeart } from 'react-icons/hi'
import Drawer from '../ui/Drawer.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency } from '../../utils/format.js'

export default function WishlistDrawer({ open, onClose }) {
  const { wishlist, products, toggleWishlist, addToCart, closeDrawer } = useApp()
  const list = products.filter((p) => wishlist.includes(p.id))

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Wishlist"
      subtitle={list.length ? `${list.length} saved` : 'Save your favorites'}
      icon={HiOutlineHeart}
      width="max-w-md"
      footer={
        list.length > 0 && (
          <Link
            to="/wishlist"
            onClick={onClose}
            className="btn-outline w-full"
          >
            Open full wishlist
          </Link>
        )
      }
    >
      {!list.length ? (
        <div className="p-10 text-center">
          <div className="mx-auto w-24 h-24 grid place-items-center rounded-3xl bg-rose-50 text-rose-500">
            <HiOutlineHeart size={40} />
          </div>
          <h3 className="font-display font-bold text-xl mt-4">No saved items yet</h3>
          <p className="text-sm text-ink-500 mt-1">
            Tap the heart on any product to save it for later.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-ink-100">
          {list.map((p) => (
            <li key={p.id} className="flex gap-3 p-4">
              <Link to={`/product/${p.id}`} onClick={onClose} className="w-20 h-24 rounded-xl overflow-hidden bg-ink-100 shrink-0">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">{p.brand}</p>
                <Link to={`/product/${p.id}`} onClick={onClose} className="font-display font-semibold text-ink-900 line-clamp-1 hover:text-brand-600">
                  {p.title}
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-ink-900">{formatCurrency(p.price)}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="btn-ghost px-2 py-1 text-xs"
                      aria-label="Remove from wishlist"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        addToCart(p)
                        closeDrawer('wishlist')
                      }}
                      className="btn-primary px-3 py-1 text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}
