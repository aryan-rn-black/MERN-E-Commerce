import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { optionalAuth, protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/').post(optionalAuth, createOrder).get(optionalAuth, getOrders)
router.route('/:id').get(getOrderById)
router.route('/:id/status').put(protect, updateOrderStatus)

export default router
