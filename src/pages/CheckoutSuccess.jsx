import { Link } from 'react-router-dom'
import { HiCheckCircle } from 'react-icons/hi'

export default function CheckoutSuccess() {
  return (
    <div className="container-page py-16">
      <div className="max-w-lg mx-auto text-center p-10 bg-white rounded-3xl border border-ink-100 shadow-soft">
        <div className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-emerald-50 text-emerald-500 animate-pulse-soft">
          <HiCheckCircle size={48} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold">Order confirmed!</h1>
        <p className="text-ink-500 mt-2">
          A receipt has been sent to your inbox. We can't wait for you to unbox it.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link to="/orders" className="btn-primary">View my orders</Link>
          <Link to="/products" className="btn-outline">Continue shopping</Link>
        </div>
      </div>
    </div>
  )
}
