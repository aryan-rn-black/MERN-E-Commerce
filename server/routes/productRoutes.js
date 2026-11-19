import express from 'express'
import {
  getProducts,
  getFeaturedProducts,
  getDeals,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/').get(getProducts).post(protect, createProduct)
router.route('/featured').get(getFeaturedProducts)
router.route('/deals').get(getDeals)
router
  .route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct)

export default router
