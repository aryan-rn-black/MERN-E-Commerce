import { useApp } from '../context/AppContext.jsx'
import { formatCurrency } from '../utils/format.js'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  Processing: 'bg-amber-50 text-amber-700',
  Delivered: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-rose-50 text-rose-700',
  Shipped: 'bg-sky-50 text-sky-700',
}

export default function Orders() {
  const { orders } = useApp()
  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-extrabold">My Orders</h1>
      <p className="text-sm text-ink-500 mt-1">{orders.length} order{orders.length === 1 ? '' : 's'} placed.</p>

      {orders.length === 0 ? (
        <div className="mt-12 p-10 text-center bg-white rounded-3xl border border-ink-100">
          <p className="text-ink-500">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary mt-4 inline-flex">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-ink-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Items</th>
                <th className="text-left px-5 py-3">Total</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                  <td className="px-5 py-3 font-semibold text-ink-900">{o.id}</td>
                  <td className="px-5 py-3 text-ink-500">{o.date}</td>
                  <td className="px-5 py-3 text-ink-500">{o.items}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-3">
                    <span className={`chip ${STATUS_COLORS[o.status] || 'bg-ink-100 text-ink-700'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-brand-600 hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
