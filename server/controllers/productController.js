import { Product } from '../models/Product.js'

// @desc    Get all products with filtering, search & sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { category, q, sort, badge, minPrice, maxPrice, rating, limit } = req.query

    let query = {}

    if (category && category !== 'all') {
      query.category = category.toLowerCase()
    }

    if (badge) {
      query.badge = badge
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    if (rating) {
      query.rating = { $gte: Number(rating) }
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i')
      query.$or = [
        { title: regex },
        { brand: regex },
        { description: regex },
        { category: regex },
      ]
    }

    let productQuery = Product.find(query)

    // Sorting
    switch (sort) {
      case 'price-asc':
        productQuery = productQuery.sort({ price: 1 })
        break
      case 'price-desc':
        productQuery = productQuery.sort({ price: -1 })
        break
      case 'rating':
        productQuery = productQuery.sort({ rating: -1 })
        break
      case 'trending':
        productQuery = productQuery.sort({ reviews: -1 })
        break
      case 'newest':
        productQuery = productQuery.sort({ createdAt: -1 })
        break
      default:
        productQuery = productQuery.sort({ isFeatured: -1, createdAt: -1 })
        break
    }

    if (limit) {
      productQuery = productQuery.limit(Number(limit))
    }

    const products = await productQuery.exec()

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8)
    res.status(200).json({ success: true, count: products.length, data: products })
  } catch (err) {
    next(err)
  }
}

// @desc    Get deal products
// @route   GET /api/products/deals
// @access  Public
export const getDeals = async (req, res, next) => {
  try {
    const products = await Product.find({
      oldPrice: { $ne: null, $gt: 0 },
      $expr: { $gt: ['$oldPrice', '$price'] },
    }).sort({ reviews: -1 })

    res.status(200).json({ success: true, count: products.length, data: products })
  } catch (err) {
    next(err)
  }
}

// @desc    Get single product by custom id or mongo _id
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params

    let product = await Product.findOne({ id })
    if (!product && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id)
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found`,
      })
    }

    // Get related products from same category
    const related = await Product.find({
      category: product.category,
      id: { $ne: product.id },
    }).limit(4)

    res.status(200).json({
      success: true,
      data: product,
      related,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Create product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res, next) => {
  try {
    const customId = req.body.id || 'p' + Date.now()
    const product = await Product.create({ ...req.body, id: customId })
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    let product = await Product.findOneAndUpdate({ id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!product && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      })
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.status(200).json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    let product = await Product.findOneAndDelete({ id })
    if (!product && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndDelete(id)
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' })
  } catch (err) {
    next(err)
  }
}
