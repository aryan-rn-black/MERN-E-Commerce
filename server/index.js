import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB, getDBStatus } from './config/db.js'
import { seedDatabase } from './seeder.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import botRoutes from './routes/botRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus()
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    message: 'ShopVerse API is running smoothly',
  })
})

// Mount API Routes
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/bot', botRoutes)

// Welcome route for /api
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to ShopVerse REST API',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      auth: '/api/auth',
      orders: '/api/orders',
      bot: '/api/bot',
      health: '/api/health',
    },
  })
})

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  })
})

// Centralized error handler
app.use(errorHandler)

// Start Server and connect Database
const startServer = async () => {
  try {
    const conn = await connectDB()
    if (conn) {
      await seedDatabase()
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 \x1b[36mShopVerse API Server running on port ${PORT}\x1b[0m`)
      console.log(`📡 Local:   \x1b[4mhttp://localhost:${PORT}/api\x1b[0m`)
      console.log(`🩺 Health:  \x1b[4mhttp://localhost:${PORT}/api/health\x1b[0m\n`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
  }
}

startServer()
