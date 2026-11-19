import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard.jsx'

export default function ProductSection({ title, subtitle, products, cta }) {
  return (
    <section className="container-page mt-14">
      <header className="flex items-end justify-between">
        <div>
          {subtitle && (
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {subtitle}
            </p>
          )}
          <h2 className="section-title">{title}</h2>
        </div>
        {cta && (
          <Link to={cta.href} className="text-sm font-semibold text-brand-600 hover:underline">
            {cta.label} →
          </Link>
        )}
      </header>

      <div className="mt-6 grid-products">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
