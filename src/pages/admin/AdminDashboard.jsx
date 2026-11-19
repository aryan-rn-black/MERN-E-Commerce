import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineCurrencyRupee,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineArrowLeft,
  HiOutlinePencilAlt,
} from 'react-icons/hi'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency } from '../../utils/format.js'
import api from '../../services/api.js'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isAuthed, products, categories, orders, refreshData, serverOnline } = useApp()
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'orders' | 'add-product'
  const [loading, setLoading] = useState(false)
  const [allOrders, setAllOrders] = useState([])

  // Form State for Adding Product
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: '',
    category: 'electronics',
    price: '',
    oldPrice: '',
    stock: 25,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80',
    description: '',
    colors: ['#0f172a', '#bae6fd'],
    sizes: [],
    isFeatured: true,
  })

  // Image picker mode ('upload' | 'url' | 'presets')
  const [imageInputMode, setImageInputMode] = useState('upload')
  const [fileName, setFileName] = useState('')

  // Stock Presets for quick product testing
  const STOCK_IMAGE_PRESETS = [
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop&q=80' },
    { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop&q=80' },
    { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop&q=80' },
    { label: 'DSLR Camera', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&fit=crop&q=80' },
    { label: 'Laptop', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&fit=crop&q=80' },
    { label: 'Perfume', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&fit=crop&q=80' },
  ]

  // File Upload Handler (Converts any local image into Base64 Data URI)
  const handleLocalImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP, etc.)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be under 5MB for best performance')
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setNewProduct((prev) => ({ ...prev, image: reader.result }))
      toast.success(`Photo "${file.name}" attached successfully!`)
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  // Load latest orders for admin
  useEffect(() => {
    const fetchAdminOrders = async () => {
      try {
        const res = await api.getOrders().catch(() => null)
        if (res?.data) {
          setAllOrders(res.data)
        }
      } catch (_) {}
    }
    fetchAdminOrders()
  }, [orders])

  const totalSales = useMemo(() => {
    const source = allOrders.length ? allOrders : orders
    return source.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  }, [allOrders, orders])

  // Handle Delete Product
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return
    setLoading(true)
    try {
      if (serverOnline) {
        await api.deleteProduct(id)
      }
      toast.success(`Deleted "${title}"`)
      await refreshData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  // Handle Update Order Status
  const handleUpdateStatus = async (id, status) => {
    try {
      if (serverOnline) {
        await api.updateOrderStatus(id, status)
      }
      toast.success(`Order ${id} marked as ${status}`)
      setAllOrders((prev) =>
        prev.map((o) => (o.id === id || o._id === id ? { ...o, status } : o))
      )
    } catch (err) {
      toast.error(err.message || 'Failed to update order status')
    }
  }

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault()
    if (!newProduct.title || !newProduct.brand || !newProduct.price || !newProduct.image) {
      toast.error('Please fill in required fields: Title, Brand, Price, Image')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...newProduct,
        id: 'p-' + Date.now().toString().slice(-6),
        price: Number(newProduct.price),
        oldPrice: newProduct.oldPrice ? Number(newProduct.oldPrice) : null,
        stock: Number(newProduct.stock) || 10,
        colors: typeof newProduct.colors === 'string' ? newProduct.colors.split(',').map((s) => s.trim()) : newProduct.colors,
        sizes: typeof newProduct.sizes === 'string' ? newProduct.sizes.split(',').map((s) => s.trim()).filter(Boolean) : newProduct.sizes,
      }

      if (serverOnline) {
        await api.createProduct(payload)
      }

      toast.success(`🎉 Product "${payload.title}" created successfully in MongoDB!`)
      await refreshData()
      setActiveTab('products')

      // Reset form
      setNewProduct({
        title: '',
        brand: '',
        category: 'electronics',
        price: '',
        oldPrice: '',
        stock: 25,
        badge: 'New',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80',
        description: '',
        colors: ['#0f172a', '#bae6fd'],
        sizes: [],
        isFeatured: true,
      })
    } catch (err) {
      toast.error(err.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <HiOutlineShieldCheck size={22} />
            </span>
            <h1 className="font-display text-3xl font-black text-ink-900">Admin Portal</h1>
            <span className="chip bg-purple-600 text-white text-xs font-semibold">Store Manager</span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Manage inventory, add products to MongoDB, and track Indian customer orders in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/" className="btn-outline text-xs">
            <HiOutlineArrowLeft /> Storefront
          </Link>
          <button
            onClick={() => refreshData()}
            className="btn-outline text-xs text-ink-700 hover:text-brand-600"
          >
            <HiOutlineRefresh /> Refresh Data
          </button>
          <button
            onClick={() => setActiveTab('add-product')}
            className="btn-primary text-xs shadow-brand"
          >
            <HiOutlinePlusCircle size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-ink-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <HiOutlineCurrencyRupee size={24} />
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live Revenue
            </span>
          </div>
          <p className="mt-4 font-display text-2xl md:text-3xl font-extrabold text-ink-900">
            {formatCurrency(totalSales)}
          </p>
          <p className="text-xs text-ink-500 mt-1">Total orders volume (INR)</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-ink-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <HiOutlineCube size={24} />
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              In Stock
            </span>
          </div>
          <p className="mt-4 font-display text-2xl md:text-3xl font-extrabold text-ink-900">
            {products.length}
          </p>
          <p className="text-xs text-ink-500 mt-1">Active MongoDB catalog items</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-ink-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <HiOutlineShoppingBag size={24} />
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Orders
            </span>
          </div>
          <p className="mt-4 font-display text-2xl md:text-3xl font-extrabold text-ink-900">
            {allOrders.length || orders.length}
          </p>
          <p className="text-xs text-ink-500 mt-1">Total customer orders placed</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-ink-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-fuchsia-50 text-fuchsia-600">
              <HiOutlineUsers size={24} />
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ● Connected
            </span>
          </div>
          <p className="mt-4 font-display text-2xl md:text-3xl font-extrabold text-ink-900">
            MongoDB
          </p>
          <p className="text-xs text-ink-500 mt-1">Database: shopverse (127.0.0.1)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex rounded-2xl bg-ink-100 p-1.5 max-w-md text-sm font-semibold">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'products' ? 'bg-white shadow text-ink-900' : 'text-ink-600 hover:text-ink-900'
          }`}
        >
          Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'orders' ? 'bg-white shadow text-ink-900' : 'text-ink-600 hover:text-ink-900'
          }`}
        >
          Orders ({allOrders.length || orders.length})
        </button>
        <button
          onClick={() => setActiveTab('add-product')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'add-product' ? 'bg-white shadow text-purple-700 font-bold' : 'text-ink-600 hover:text-ink-900'
          }`}
        >
          + Add Product
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {/* TAB 1: PRODUCTS TABLE */}
        {activeTab === 'products' && (
          <div className="rounded-3xl border border-ink-100 bg-white overflow-hidden shadow-soft">
            <div className="p-5 flex items-center justify-between border-b border-ink-100 bg-ink-50/50">
              <div>
                <h2 className="font-display font-bold text-lg text-ink-900">Product Inventory</h2>
                <p className="text-xs text-ink-500">Live products saved in MongoDB database.</p>
              </div>
              <button
                onClick={() => setActiveTab('add-product')}
                className="btn-primary text-xs py-2 px-3"
              >
                + Add New Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500 text-left">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price (INR)</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Badge</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {products.map((p) => (
                    <tr key={p.id || p._id} className="hover:bg-ink-50/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover bg-ink-100 border border-ink-100 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-ink-900 line-clamp-1">{p.title}</p>
                            <p className="text-xs text-ink-400 font-medium">{p.brand} · ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize px-2.5 py-1 rounded-lg bg-ink-100 text-ink-700 text-xs font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-ink-900">{formatCurrency(p.price)}</p>
                        {p.oldPrice && (
                          <p className="text-xs line-through text-ink-400">
                            {formatCurrency(p.oldPrice)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            p.stock > 10
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.badge ? (
                          <span className="chip bg-brand-50 text-brand-700 text-xs border border-brand-100 font-medium">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${p.id}`}
                            className="p-2 rounded-xl bg-ink-100 text-ink-600 hover:bg-brand-50 hover:text-brand-600 transition"
                            title="View on Store"
                          >
                            <HiOutlineEye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                            disabled={loading}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition"
                            title="Delete from MongoDB"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="rounded-3xl border border-ink-100 bg-white overflow-hidden shadow-soft">
            <div className="p-5 border-b border-ink-100 bg-ink-50/50">
              <h2 className="font-display font-bold text-lg text-ink-900">Customer Orders</h2>
              <p className="text-xs text-ink-500">Live orders received across India.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500 text-left">
                  <tr>
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">City & Address</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Total (INR)</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {(allOrders.length ? allOrders : orders).map((o) => (
                    <tr key={o.id || o._id} className="hover:bg-ink-50/50 transition">
                      <td className="px-5 py-3.5 font-bold text-ink-900">{o.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-ink-900">{o.customer?.name || 'Customer'}</p>
                        <p className="text-xs text-ink-400">{o.customer?.email || 'alex@shopverse.in'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-ink-600 max-w-xs truncate">
                        {o.customer?.city ? `${o.customer.address}, ${o.customer.city} (${o.customer.zip})` : 'Bengaluru, India'}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-ink-700">
                        {o.totalItems || o.items?.length || 1} item(s)
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-ink-900">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`chip text-xs font-semibold ${
                            o.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : o.status === 'Shipped'
                              ? 'bg-sky-50 text-sky-700'
                              : o.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {o.status || 'Processing'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <select
                          value={o.status || 'Processing'}
                          onChange={(e) => handleUpdateStatus(o.id || o._id, e.target.value)}
                          className="bg-white border border-ink-200 rounded-xl px-2.5 py-1 text-xs outline-none focus:border-brand-500 font-medium"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADD PRODUCT FORM */}
        {activeTab === 'add-product' && (
          <div className="rounded-3xl border border-ink-100 bg-white p-6 md:p-8 shadow-soft max-w-3xl mx-auto">
            <div className="flex items-center gap-2 pb-4 border-b border-ink-100">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <HiOutlinePlusCircle size={22} />
              </span>
              <div>
                <h2 className="font-display font-extrabold text-xl text-ink-900">
                  Add New Product to MongoDB
                </h2>
                <p className="text-xs text-ink-500">
                  Fill in the product details. It will be instantly saved to your MongoDB database.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddProductSubmit} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    placeholder="e.g. Wireless Noise-Cancelling Earbuds"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g. boAt, Sony, Lumen Audio"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm capitalize bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. 2499"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Original Price (₹ Old/MRP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newProduct.oldPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                    placeholder="e.g. 3999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm text-ink-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={newProduct.badge}
                    onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                    placeholder="e.g. Best Seller, New, 40% Off"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              {/* PRODUCT IMAGE SELECTOR (Supports Local Computer Photos & Web URLs) */}
              <div className="p-4 rounded-2xl bg-ink-50/70 border border-ink-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-ink-900">
                      Product Photo / Image *
                    </label>
                    <p className="text-[11px] text-ink-500">
                      You can <strong>upload ANY picture file</strong> from your computer/mobile OR <strong>paste any image URL</strong>.
                    </p>
                  </div>
                  <div className="flex bg-white p-1 rounded-xl border border-ink-200 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-3 py-1 rounded-lg transition ${
                        imageInputMode === 'upload'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-3 py-1 rounded-lg transition ${
                        imageInputMode === 'url'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      🔗 Web URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('presets')}
                      className={`px-3 py-1 rounded-lg transition ${
                        imageInputMode === 'presets'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      ✨ Presets
                    </button>
                  </div>
                </div>

                {/* Option 1: Upload Any Picture File from Computer */}
                {imageInputMode === 'upload' && (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-300 hover:border-brand-500 bg-white rounded-2xl p-6 cursor-pointer transition text-center group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalImageUpload}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                        📸
                      </div>
                      <p className="text-sm font-bold text-ink-900 mt-2">
                        Click to select ANY picture from your device
                      </p>
                      <p className="text-xs text-ink-500">
                        Supports PNG, JPG, JPEG, WEBP, GIF, SVG (Up to 5MB)
                      </p>
                      {fileName && (
                        <span className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          ✓ Selected: {fileName}
                        </span>
                      )}
                    </label>
                  </div>
                )}

                {/* Option 2: Paste Web URL */}
                {imageInputMode === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={newProduct.image}
                      onChange={(e) => {
                        setFileName('')
                        setNewProduct({ ...newProduct, image: e.target.value })
                      }}
                      placeholder="Paste image link, e.g. https://images.unsplash.com/... or https://cdn.shopify.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm bg-white"
                    />
                    <p className="text-[11px] text-ink-400 mt-1">
                      Works with any direct image link from Unsplash, Shopify, Imgur, Cloudinary, AWS S3, etc.
                    </p>
                  </div>
                )}

                {/* Option 3: Quick Stock Presets */}
                {imageInputMode === 'presets' && (
                  <div>
                    <p className="text-xs text-ink-500 mb-2">Click any preset to apply instantly:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {STOCK_IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setFileName('')
                            setNewProduct({ ...newProduct, image: preset.url })
                            toast.success(`Preset "${preset.label}" selected!`)
                          }}
                          className={`flex flex-col items-center p-2 rounded-xl border text-center transition bg-white ${
                            newProduct.image === preset.url
                              ? 'border-brand-500 ring-2 ring-brand-200 font-bold'
                              : 'border-ink-100 hover:border-ink-300'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="text-[10px] text-ink-700 mt-1 truncate w-full">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Image Preview Banner */}
                {newProduct.image && (
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-ink-100">
                    <img
                      src={newProduct.image}
                      alt="Product Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-ink-100 bg-ink-50 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink-900">Current Image Attached</p>
                      <p className="text-[11px] text-ink-400 truncate max-w-md">
                        {newProduct.image.startsWith('data:') ? 'Local file uploaded as Base64 Data URL' : newProduct.image}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        Ready to save in database
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewProduct({ ...newProduct, image: '' })
                        setFileName('')
                      }}
                      className="text-xs font-semibold text-rose-600 hover:underline px-2 py-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe the product features, specifications, and materials..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={newProduct.isFeatured}
                  onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium text-ink-800 cursor-pointer">
                  Feature this product on Homepage ("Featured Today" section)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-2.5 px-6 font-semibold shadow-brand"
                >
                  {loading ? 'Saving to Database...' : 'Save Product to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
