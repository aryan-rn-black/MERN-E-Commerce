const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiService {
  constructor() {
    this.token = localStorage.getItem('shopverse_token') || null
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('shopverse_token', token)
    } else {
      localStorage.removeItem('shopverse_token')
    }
  }

  getToken() {
    return this.token || localStorage.getItem('shopverse_token')
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`)
      }

      return data
    } catch (error) {
      console.warn(`[API] ${options.method || 'GET'} ${endpoint} failed:`, error.message)
      throw error
    }
  }

  /* ---------------- Health & Server Status ---------------- */
  async getHealth() {
    return this.request('/health')
  }

  /* ---------------- Products ---------------- */
  async getProducts(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        query.append(k, v)
      }
    })
    const qs = query.toString() ? `?${query.toString()}` : ''
    return this.request(`/products${qs}`)
  }

  async getFeaturedProducts() {
    return this.request('/products/featured')
  }

  async getDeals() {
    return this.request('/products/deals')
  }

  async getProductById(id) {
    return this.request(`/products/${id}`)
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  /* ---------------- Categories ---------------- */
  async getCategories() {
    return this.request('/categories')
  }

  /* ---------------- Auth ---------------- */
  async register(name, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    if (data.token) this.setToken(data.token)
    return data
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.token) this.setToken(data.token)
    return data
  }

  async getMe() {
    return this.request('/auth/me')
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  logout() {
    this.setToken(null)
  }

  /* ---------------- Orders ---------------- */
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrders(email) {
    const qs = email ? `?email=${encodeURIComponent(email)}` : ''
    return this.request(`/orders${qs}`)
  }

  async getOrderById(id) {
    return this.request(`/orders/${id}`)
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  /* ---------------- AI Assistant / Bot ---------------- */
  async queryBot(payload) {
    return this.request('/bot/query', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getHelpGuides() {
    return this.request('/bot/guides')
  }
}

export const api = new ApiService()
export default api
