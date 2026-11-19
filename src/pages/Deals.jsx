import { useApp } from '../context/AppContext.jsx'
import ProductCard from '../components/product/ProductCard.jsx'

export default function Deals() {
  const { products } = useApp()
  const deals = products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .sort((a, b) => (b.oldPrice - b.price) - (a.oldPrice - a.price))

  return (
    <div className="container-page py-10">
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-ink-900 via-purple-900 to-brand-700 p-8 md:p-12 text-white relative">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-brand-500/40 blur-3xl" />
        <p className="chip bg-white/10 backdrop-blur">🔥 Limited Time</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold">
          The best of ShopVerse, on sale
        </h1>
        <p className="mt-2 max-w-xl opacity-90">
          Hand-picked favorites across every category. Discounts up to 60% while supplies last.
        </p>
      </div>

      <h2 className="section-title mt-10">{deals.length} deals live now</h2>
      <div className="mt-6 grid-products">
        {deals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
