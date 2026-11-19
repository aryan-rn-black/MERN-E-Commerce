import { brands } from '../../data/products.js'

export default function BrandMarquee() {
  const items = [...brands, ...brands]
  return (
    <section className="container-page mt-14">
      <h2 className="section-title text-center">Brands we love</h2>
      <p className="text-sm text-ink-500 text-center mt-1">Independent makers, global names.</p>
      <div className="mt-6 overflow-hidden relative mask-fade">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-50 to-transparent z-10 pointer-events-none" />
        <div className="flex gap-10 animate-marquee whitespace-nowrap will-change-transform">
          {items.map((b, i) => (
            <span
              key={i}
              className="font-display font-extrabold text-2xl text-ink-400 hover:text-brand-500 transition shrink-0"
            >
              {b.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
