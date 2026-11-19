import { Link } from 'react-router-dom'
import { HiHeart, HiOutlineHeart, HiEye } from 'react-icons/hi'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency, discount } from '../../utils/format.js'
import Badge from '../ui/Badge.jsx'
import Rating from '../ui/Rating.jsx'

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart } = useApp()
  const liked = wishlist.includes(product.id)
  const off = discount(product.oldPrice, product.price)

  return (
    <article className="group relative bg-white border border-ink-100 rounded-2xl overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-100">
        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full"
        >
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
        </Link>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start pointer-events-none">
          {product.badge && <Badge>{product.badge}</Badge>}
          {off > 0 && <Badge color="danger">-{off}%</Badge>}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 z-10">
          <button
            aria-label="Toggle wishlist"
            onClick={() => toggleWishlist(product.id)}
            className="grid place-items-center w-9 h-9 rounded-full bg-white shadow text-ink-700 hover:text-brand-600"
          >
            {liked ? <HiHeart className="text-brand-500" /> : <HiOutlineHeart />}
          </button>
          <Link
            to={`/product/${product.id}`}
            aria-label="Quick view"
            className="grid place-items-center w-9 h-9 rounded-full bg-white shadow text-ink-700 hover:text-brand-600"
          >
            <HiEye />
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
          {product.brand}
        </p>
        <Link
          to={`/product/${product.id}`}
          className="font-display font-semibold text-ink-900 line-clamp-1 hover:text-brand-600"
        >
          {product.title}
        </Link>

        <div className="flex items-center gap-2">
          <Rating value={product.rating} />
          <span className="text-xs text-ink-500">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-ink-900">
              {formatCurrency(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs line-through text-ink-400">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => addToCart(product)}
          className="mt-1 btn-outline w-full hover:bg-brand-500 hover:text-white hover:border-brand-500"
        >
          Add to cart
        </button>
      </div>
    </article>
  )
}
