import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ count: -1, name: 1 })

    // Optional: dynamically enrich counts from Product collection if available
    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ])

    const countMap = Object.fromEntries(
      productCounts.map((c) => [c._id ? c._id.toLowerCase() : '', c.count])
    )

    const enriched = categories.map((cat) => {
      const obj = cat.toObject()
      if (countMap[cat.key.toLowerCase()] !== undefined) {
        obj.count = countMap[cat.key.toLowerCase()]
      }
      return obj
    })

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Create category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body)
    res.status(201).json({ success: true, data: category })
  } catch (err) {
    next(err)
  }
}
