import Hero from '../components/home/Hero.jsx'
import PromoStrip from '../components/home/PromoStrip.jsx'
import CategoriesGrid from '../components/home/CategoriesGrid.jsx'
import ProductSection from '../components/home/ProductSection.jsx'
import DealBanner from '../components/home/DealBanner.jsx'
import BrandMarquee from '../components/home/BrandMarquee.jsx'
import ReviewsStrip from '../components/home/ReviewsStrip.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function Home() {
  const { products } = useApp()
  const featured = products.slice(0, 8)
  const trending = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 8)
  const deals = [...products]
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .sort((a, b) => (b.oldPrice - b.price) - (a.oldPrice - a.price))
    .slice(0, 4)

  return (
    <div>
      <Hero />
      <PromoStrip />
      <CategoriesGrid />

      <ProductSection
        subtitle="Hand-picked"
        title="Featured today"
        products={featured}
        cta={{ label: 'See more', href: '/products' }}
      />

      <DealBanner />

      <ProductSection
        subtitle="Loved by many"
        title="Trending now"
        products={trending}
        cta={{ label: 'Explore', href: '/products?sort=trending' }}
      />

      <BrandMarquee />
      <ReviewsStrip />

      {deals.length > 0 && (
        <ProductSection
          subtitle="Limited time"
          title="Today's best deals"
          products={deals}
          cta={{ label: 'All deals', href: '/deals' }}
        />
      )}
    </div>
  )
}
