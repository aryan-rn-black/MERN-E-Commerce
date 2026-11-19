import { useApp } from '../context/AppContext.jsx'
import ProductCard from '../components/product/ProductCard.jsx'
export default function Wishlist() {
  const { wishlist, products } = useApp()
  const list = products.filter((p) => wishlist.includes(p.id))

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-extrabold">My Wishlist</h1>
      <p className="text-sm text-ink-500 mt-1">
        {list.length} saved item{list.length === 1 ? '' : 's'}
      </p>

      {!list.length ? (
        <div className="mt-12 p-10 text-center bg-white rounded-3xl border border-ink-100">
          <p className="text-ink-500">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="mt-8 grid-products">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
