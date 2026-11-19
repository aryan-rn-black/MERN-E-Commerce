import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiOutlineTruck, HiOutlineRefresh, HiOutlineBadgeCheck } from 'react-icons/hi'
import { useApp } from '../context/AppContext.jsx'
import { formatCurrency, discount } from '../utils/format.js'
import Rating from '../components/ui/Rating.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProductCard from '../components/product/ProductCard.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const { products, toggleWishlist, addToCart, wishlist, addRecent, openDrawer } = useApp()
  const product = useMemo(
    () => products.find((p) => p.id === id || p._id === id),
    [products, id]
  )

  const [imgIdx, setImgIdx] = useState(0)
  const [color, setColor] = useState(product?.colors?.[0] || null)
  const [size, setSize] = useState(product?.sizes?.[0] || null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product) addRecent(product.id)
  }, [product]) // eslint-disable-line

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="font-display text-2xl font-bold">Product not found</h2>
        <Link to="/products" className="btn-primary mt-4 inline-flex">Continue shopping</Link>
      </div>
    )
  }

  const liked = wishlist.includes(product.id)
  const off = discount(product.oldPrice, product.price)
  const images = product.images?.length ? product.images : [product.image]
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="container-page py-8">
      <nav className="text-xs text-ink-500 mb-5">
        <Link to="/" className="hover:text-ink-900">Home</Link> ›
        <Link to="/products" className="hover:text-ink-900 ml-1">Shop</Link> ›
        <Link to={`/products?category=${product.category}`} className="hover:text-ink-900 ml-1 capitalize">{product.category}</Link> ›
        <span className="text-ink-900 ml-1">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-3xl overflow-hidden bg-ink-100 ring-1 ring-ink-100">
            <img src={images[imgIdx]} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden ring-2 transition ${
                  imgIdx === i ? 'ring-brand-500' : 'ring-transparent hover:ring-ink-200'
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            {product.badge && <Badge>{product.badge}</Badge>}
            {off > 0 && <Badge color="danger">Save {off}%</Badge>}
          </div>
          <p className="mt-3 text-sm text-ink-500 uppercase tracking-wider font-semibold">
            {product.brand}
          </p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-extrabold text-ink-900">
            {product.title}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <Rating value={product.rating} />
            <span className="text-sm text-ink-500">
              {product.rating} · {(product.reviews || 0).toLocaleString()} reviews
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-ink-900">
              {formatCurrency(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-base line-through text-ink-400">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
          <p className="mt-4 text-ink-600 leading-relaxed">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-ink-900 mb-2">Color</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label="Select color"
                    className={`w-9 h-9 rounded-full border-2 transition ${
                      color === c ? 'border-brand-500 scale-110' : 'border-white shadow ring-1 ring-ink-200'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-ink-900 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition ${
                      size === s
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-ink-200 hover:border-ink-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + CTAs */}
          <div className="mt-6 flex flex-wrap items-stretch gap-2">
            <div className="inline-flex items-center rounded-xl border border-ink-200 overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-11 hover:bg-ink-100">−</button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-11 hover:bg-ink-100">+</button>
            </div>
            <button
              onClick={() => addToCart(product, { color, size, qty })}
              className="btn-primary flex-1 sm:flex-none"
            >
              <HiOutlineShoppingBag /> Add to cart
            </button>
            <button
              onClick={() => {
                addToCart(product, { color, size, qty })
                openDrawer('cart')
              }}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Buy now
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`btn-outline ${liked ? 'text-brand-600 border-brand-200 bg-brand-50' : ''}`}
              aria-label="Toggle wishlist"
            >
              {liked ? <HiHeart className="text-brand-500" /> : <HiOutlineHeart />}
            </button>
          </div>

          <p className="mt-2 text-xs text-ink-500">
            {product.stock > 5 ? 'In stock — ready to ship' : `Only ${product.stock} left!`}
          </p>

          {/* Trust */}
          <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
            <Trust icon={HiOutlineTruck} label="Free delivery over ₹499" />
            <Trust icon={HiOutlineRefresh} label="7-day easy returns" />
            <Trust icon={HiOutlineBadgeCheck} label="1-year brand warranty" />
          </ul>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title">You may also like</h2>
          <div className="mt-4 grid-products">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Trust({ icon: Icon, label }) {
  return (
    <li className="flex items-center gap-2 p-3 rounded-xl bg-white border border-ink-100">
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-ink-100 text-ink-700">
        <Icon size={16} />
      </span>
      <span className="text-ink-700">{label}</span>
    </li>
  )
}
