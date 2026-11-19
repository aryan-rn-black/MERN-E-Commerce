import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import api from '../services/api.js'
import { products as initialProducts } from '../data/products.js'
import { categories as initialCategories } from '../data/categories.js'

const STORAGE_KEY = 'shopverse_state_v1'

/* ---------------- Mock user for fallback ---------------- */
const DEFAULT_USER = {
  id: 'u-001',
  name: 'Alex Carter',
  email: 'alex@shopverse.io',
  avatar:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces&q=80',
  joined: '2024-02-12',
  points: 1280,
  tier: 'Gold',
}

/* ---------------- Initial state ---------------- */
const initialState = {
  cart: [], // {id, title, price, image, qty, color, size}
  wishlist: [], // [id]
  recentlyViewed: [], // [id]
  orders: [
    {
      id: 'ORD-10231',
      date: '2025-07-12',
      total: 248.4,
      status: 'Delivered',
      items: 3,
    },
    {
      id: 'ORD-10188',
      date: '2025-06-02',
      total: 89.99,
      status: 'Delivered',
      items: 1,
    },
  ],
  notifications: [
    { id: 'n1', title: 'Welcome to ShopVerse 🎉', body: 'Get 15% off your first order with code HELLO15.', time: '2m', unread: true },
    { id: 'n2', title: 'Flash deal live', body: 'Up to 60% off electronics — ends tonight.', time: '1h', unread: true },
    { id: 'n3', title: 'Order delivered', body: 'Your order ORD-10231 has been delivered.', time: '1d', unread: false },
  ],
  user: DEFAULT_USER,
  isAuthed: true,
  drawers: {
    cart: false,
    wishlist: false,
    categories: false,
    user: false,
    search: false,
    notifications: false,
    filters: false,
  },
}

function reducer(state, action) {
  switch (action.type) {
    /* ----- Drawers ----- */
    case 'OPEN_DRAWER':
      return { ...state, drawers: { ...state.drawers, [action.key]: true } }
    case 'CLOSE_DRAWER':
      return { ...state, drawers: { ...state.drawers, [action.key]: false } }
    case 'TOGGLE_DRAWER':
      return { ...state, drawers: { ...state.drawers, [action.key]: !state.drawers[action.key] } }
    case 'CLOSE_ALL_DRAWERS':
      return { ...state, drawers: Object.fromEntries(Object.keys(state.drawers).map((k) => [k, false])) }

    /* ----- Cart ----- */
    case 'ADD_TO_CART': {
      const { product, qty = 1, color, size } = action.payload
      const existing = state.cart.find(
        (i) => i.id === product.id && i.color === color && i.size === size
      )
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i === existing ? { ...i, qty: i.qty + qty } : i
          ),
        }
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            qty,
            color: color || product.colors?.[0] || null,
            size: size || product.sizes?.[0] || null,
          },
        ],
      }
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.id !== action.id) }
    case 'UPDATE_QTY':
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
        ),
      }
    case 'CLEAR_CART':
      return { ...state, cart: [] }

    /* ----- Wishlist ----- */
    case 'TOGGLE_WISHLIST': {
      const id = action.id
      const inList = state.wishlist.includes(id)
      return {
        ...state,
        wishlist: inList
          ? state.wishlist.filter((x) => x !== id)
          : [id, ...state.wishlist],
      }
    }

    /* ----- Recently viewed ----- */
    case 'ADD_RECENT': {
      const id = action.id
      const filtered = state.recentlyViewed.filter((x) => x !== id)
      return { ...state, recentlyViewed: [id, ...filtered].slice(0, 8) }
    }

    /* ----- Notifications ----- */
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, unread: false })),
      }
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] }

    /* ----- Auth ----- */
    case 'LOGIN':
      return { ...state, isAuthed: true, user: action.user }
    case 'LOGOUT':
      return { ...state, isAuthed: false, user: null }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.user } }

    /* ----- Orders ----- */
    case 'SET_ORDERS':
      return { ...state, orders: action.orders }
    case 'PLACE_ORDER':
      return {
        ...state,
        cart: [],
        orders: [action.order, ...state.orders],
      }

    /* ----- Hydration ----- */
    case 'HYDRATE':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        return { ...init, ...saved }
      }
    } catch (_) {}
    return init
  })

  // Dynamic server data
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState(initialCategories)
  const [serverOnline, setServerOnline] = useState(false)
  const [loading, setLoading] = useState(true)

  /* Fetch initial data from Express + MongoDB backend */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const health = await api.getHealth().catch(() => null)
      if (health && health.status === 'online') {
        setServerOnline(true)

        // Load categories
        const catRes = await api.getCategories().catch(() => null)
        if (catRes?.data?.length) {
          setCategories(catRes.data)
        }

        // Load products
        const prodRes = await api.getProducts().catch(() => null)
        if (prodRes?.data?.length) {
          setProducts(prodRes.data)
        }

        // If user token exists, fetch profile & orders
        if (api.getToken()) {
          const meRes = await api.getMe().catch(() => null)
          if (meRes?.user) {
            dispatch({ type: 'LOGIN', user: meRes.user })
          }
          const ordersRes = await api.getOrders().catch(() => null)
          if (ordersRes?.data) {
            const formatted = ordersRes.data.map((o) => ({
              id: o.id,
              date: (o.createdAt || o.paidAt || new Date()).toString().slice(0, 10),
              total: o.total,
              status: o.status,
              items: o.totalItems || o.items?.length || 1,
            }))
            dispatch({ type: 'SET_ORDERS', orders: formatted })
          }
        }
      }
    } catch (err) {
      console.warn('Backend server offline or unreachable, using local data.', err.message)
      setServerOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* Persist client state */
  useEffect(() => {
    try {
      const { drawers, ...rest } = state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
    } catch (_) {}
  }, [state])

  /* Close drawers on ESC */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') dispatch({ type: 'CLOSE_ALL_DRAWERS' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Lock body scroll when a drawer is open */
  useEffect(() => {
    const anyOpen = Object.values(state.drawers).some(Boolean)
    document.body.style.overflow = anyOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [state.drawers])

  /* Drawer Actions */
  const openDrawer = useCallback((key) => dispatch({ type: 'OPEN_DRAWER', key }), [])
  const closeDrawer = useCallback((key) => dispatch({ type: 'CLOSE_DRAWER', key }), [])
  const toggleDrawer = useCallback((key) => dispatch({ type: 'TOGGLE_DRAWER', key }), [])
  const closeAllDrawers = useCallback(() => dispatch({ type: 'CLOSE_ALL_DRAWERS' }), [])

  /* Cart Actions */
  const addToCart = useCallback((product, opts = {}) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, ...opts } })
    toast.success(`Added "${product.title}" to cart`)
  }, [])
  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'REMOVE_FROM_CART', id })
    toast('Removed from cart', { icon: '🗑️' })
  }, [])
  const updateQty = useCallback(
    (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty }),
    []
  )
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])

  /* Wishlist & Recent Actions */
  const toggleWishlist = useCallback((id) => {
    dispatch({ type: 'TOGGLE_WISHLIST', id })
    toast.success('Wishlist updated')
  }, [])

  const addRecent = useCallback((id) => dispatch({ type: 'ADD_RECENT', id }), [])

  /* Backend Order Action */
  const placeOrder = useCallback(
    async (orderDataOrTotal, itemCount) => {
      try {
        let total = typeof orderDataOrTotal === 'object' ? orderDataOrTotal.total : orderDataOrTotal
        let items = typeof orderDataOrTotal === 'object' ? orderDataOrTotal.items : state.cart

        let createdOrder = null
        if (serverOnline) {
          const payload = typeof orderDataOrTotal === 'object'
            ? orderDataOrTotal
            : {
                total,
                subtotal: state.cart.reduce((s, i) => s + i.qty * i.price, 0),
                items: state.cart,
                customer: state.user
                  ? {
                      name: state.user.name,
                      email: state.user.email,
                      address: '221B Sunset Blvd',
                      city: 'Los Angeles',
                      zip: '90028',
                      country: 'United States',
                    }
                  : undefined,
              }

          const res = await api.createOrder(payload).catch((e) => {
            console.warn('Backend order placement failed:', e.message)
            return null
          })

          if (res?.data) {
            createdOrder = {
              id: res.data.id,
              date: new Date().toISOString().slice(0, 10),
              total: res.data.total,
              status: res.data.status || 'Processing',
              items: res.data.totalItems || items.length,
            }
          }
        }

        if (!createdOrder) {
          createdOrder = {
            id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
            date: new Date().toISOString().slice(0, 10),
            total,
            status: 'Processing',
            items: itemCount || items.length,
          }
        }

        dispatch({ type: 'PLACE_ORDER', order: createdOrder })
        return createdOrder
      } catch (err) {
        console.error('Error placing order:', err)
      }
    },
    [serverOnline, state.cart, state.user]
  )

  /* Backend Auth Actions */
  const loginUser = useCallback(async (email, password) => {
    try {
      const res = await api.login(email, password)
      if (res?.user) {
        dispatch({ type: 'LOGIN', user: res.user })
        toast.success(`Welcome back, ${res.user.name}!`)
        return res.user
      }
    } catch (err) {
      toast.error(err.message || 'Login failed')
      throw err
    }
  }, [])

  const registerUser = useCallback(async (name, email, password) => {
    try {
      const res = await api.register(name, email, password)
      if (res?.user) {
        dispatch({ type: 'LOGIN', user: res.user })
        toast.success(`Account created! Welcome, ${res.user.name}!`)
        return res.user
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed')
      throw err
    }
  }, [])

  const logoutUser = useCallback(() => {
    api.logout()
    dispatch({ type: 'LOGOUT' })
    toast('Signed out', { icon: '👋' })
  }, [])

  const updateUserProfile = useCallback(async (profileData) => {
    try {
      if (serverOnline && api.getToken()) {
        const res = await api.updateProfile(profileData)
        if (res?.user) {
          dispatch({ type: 'UPDATE_USER', user: res.user })
          toast.success('Profile updated successfully!')
          return res.user
        }
      } else {
        dispatch({ type: 'UPDATE_USER', user: profileData })
        toast.success('Profile updated!')
      }
    } catch (err) {
      toast.error(err.message || 'Could not update profile')
      throw err
    }
  }, [serverOnline])

  /* Selectors */
  const cartCount = useMemo(
    () => state.cart.reduce((s, i) => s + i.qty, 0),
    [state.cart]
  )
  const cartSubtotal = useMemo(
    () => state.cart.reduce((s, i) => s + i.qty * i.price, 0),
    [state.cart]
  )
  const unreadCount = useMemo(
    () => state.notifications.filter((n) => n.unread).length,
    [state.notifications]
  )

  const value = {
    ...state,
    products,
    categories,
    loading,
    serverOnline,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    closeAllDrawers,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    toggleWishlist,
    addRecent,
    cartCount,
    cartSubtotal,
    unreadCount,
    placeOrder,
    markAllRead: () => dispatch({ type: 'MARK_ALL_READ' }),
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateProfile: updateUserProfile,
    refreshData: fetchData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
