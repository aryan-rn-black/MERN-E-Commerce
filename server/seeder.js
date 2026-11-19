import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Product } from './models/Product.js'
import { Category } from './models/Category.js'
import { User } from './models/User.js'
import { Order } from './models/Order.js'
import { HelpGuide } from './models/HelpGuide.js'
import { products } from './data/products.js'
import { categories } from './data/categories.js'
import { helpGuides } from './data/helpGuides.js'
import { connectDB } from './config/db.js'

dotenv.config()

export const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments()
    const categoryCount = await Category.countDocuments()

    if (categoryCount < categories.length) {
      console.log('🌱 Syncing categories into MongoDB...')
      for (const cat of categories) {
        await Category.findOneAndUpdate({ key: cat.key }, cat, { upsert: true, new: true })
      }
      console.log('✔ Categories synced successfully!')
    }

    if (productCount < products.length) {
      console.log(`🌱 Syncing ${products.length} products into MongoDB...`)
      for (const prod of products) {
        await Product.findOneAndUpdate({ id: prod.id }, prod, { upsert: true, new: true })
      }
      console.log(`✔ All ${products.length} products synced successfully!`)
    }

    // Check if demo user exists
    const demoUser = await User.findOne({ email: 'alex@shopverse.in' })
    let userId = demoUser?._id

    if (!demoUser) {
      console.log('🌱 Seeding default demo customer...')
      const createdUser = await User.create({
        name: 'Alex Carter',
        email: 'alex@shopverse.in',
        password: 'password123',
        points: 1280,
        tier: 'Gold',
        role: 'user',
        phone: '+91 98765 43210',
        bio: 'Tech enthusiast and music lover based in Bengaluru.',
        birthday: '1996-04-22',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces&q=80',
      })
      userId = createdUser._id
      console.log('✔ Demo user seeded: alex@shopverse.in (password: password123)')
    }

    // Check if Admin user exists
    const adminUser = await User.findOne({ email: 'admin@shopverse.in' })
    if (!adminUser) {
      console.log('🌱 Seeding default Admin user...')
      await User.create({
        name: 'Admin Manager',
        email: 'admin@shopverse.in',
        password: 'admin123',
        points: 9999,
        tier: 'Platinum',
        role: 'admin',
        phone: '+91 98765 00001',
        bio: 'ShopVerse Store Administrator & Inventory Manager.',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces&q=80',
      })
      console.log('✔ Admin user seeded: admin@shopverse.in (password: admin123)')
    }

    // Check if demo orders exist
    const orderCount = await Order.countDocuments()
    if (orderCount === 0) {
      console.log('🌱 Seeding sample orders...')
      await Order.create([
        {
          id: 'ORD-10231',
          user: userId,
          customer: {
            name: 'Alex Carter',
            email: 'alex@shopverse.in',
            address: '42, Brigade Road, MG Road Area',
            city: 'Bengaluru',
            zip: '560001',
            country: 'India',
          },
          items: [
            {
              product: 'p1',
              title: 'Aurora Wireless Headphones',
              price: 3499,
              image:
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80',
              qty: 1,
              color: '#0f172a',
            },
            {
              product: 'p6',
              title: 'Minimalist Leather Backpack',
              price: 2999,
              image:
                'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&q=80',
              qty: 1,
            },
          ],
          totalItems: 2,
          subtotal: 6498,
          total: 6498,
          status: 'Delivered',
        },
        {
          id: 'ORD-10188',
          user: userId,
          customer: {
            name: 'Alex Carter',
            email: 'alex@shopverse.in',
            address: '42, Brigade Road, MG Road Area',
            city: 'Bengaluru',
            zip: '560001',
            country: 'India',
          },
          items: [
            {
              product: 'p10',
              title: 'Heritage Denim Jacket',
              price: 2499,
              image:
                'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&h=800&fit=crop&q=80',
              qty: 1,
              size: 'M',
            },
          ],
          totalItems: 1,
          subtotal: 2499,
          total: 2499,
          status: 'Delivered',
        },
      ])
      console.log('✔ Sample orders seeded successfully!')
    }

    // Check if HelpGuides exist
    const guideCount = await HelpGuide.countDocuments()
    if (guideCount === 0) {
      console.log('🌱 Seeding procedural help guides into MongoDB...')
      await HelpGuide.insertMany(helpGuides)
      console.log('✔ Help guides seeded successfully!')
    }
  } catch (error) {
    console.error('Error during database seed:', error.message)
  }
}

// Direct execution (CLI)
if (process.argv[1]?.endsWith('seeder.js')) {
  ;(async () => {
    const conn = await connectDB()
    if (!conn || mongoose.connection.readyState !== 1) {
      console.error('✖ Database connection failed. Aborting database seed.')
      process.exit(1)
    }

    if (process.argv.includes('--destroy')) {
      console.log('⚠ Destroying all collections...')
      await Product.deleteMany()
      await Category.deleteMany()
      await User.deleteMany()
      await Order.deleteMany()
      await HelpGuide.deleteMany()
      console.log('✔ All collections wiped clean.')
    } else {
      await seedDatabase()
    }

    console.log('Done.')
    process.exit(0)
  })()
}
