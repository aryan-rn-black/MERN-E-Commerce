import { Order } from '../models/Order.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (supports both guest checkout & authenticated user)
export const createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      items,
      subtotal,
      shippingFee,
      tax,
      total,
      shippingMethod,
      paymentMethod,
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items specified',
      })
    }

    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000)

    const order = await Order.create({
      id: orderId,
      user: req.user ? req.user._id : null,
      customer: customer || {
        name: req.user ? req.user.name : 'Guest User',
        email: req.user ? req.user.email : 'guest@shopverse.io',
        address: '221B Sunset Blvd',
        city: 'Los Angeles',
        zip: '90028',
        country: 'United States',
      },
      items: items.map((item) => ({
        product: item.id || item.product || 'p1',
        title: item.title,
        price: item.price,
        image: item.image,
        qty: item.qty || 1,
        color: item.color || null,
        size: item.size || null,
      })),
      totalItems: items.reduce((sum, item) => sum + (item.qty || 1), 0),
      subtotal: Number(subtotal || total),
      shippingFee: Number(shippingFee || 0),
      tax: Number(tax || 0),
      total: Number(total),
      shippingMethod: shippingMethod || 'Standard',
      paymentMethod: paymentMethod || 'Credit Card',
      status: 'Processing',
      isPaid: true,
      paidAt: new Date(),
    })

    // If user is logged in, award loyalty points (e.g. 10% of total)
    if (req.user) {
      req.user.points = (req.user.points || 0) + Math.round(order.total * 0.1)
      await req.user.save()
    }

    res.status(201).json({
      success: true,
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get logged in user orders or all orders
// @route   GET /api/orders
// @access  Public / Protected
export const getOrders = async (req, res, next) => {
  try {
    let query = {}

    if (req.user) {
      query.$or = [{ user: req.user._id }, { 'customer.email': req.user.email }]
    } else if (req.query.email) {
      query['customer.email'] = req.query.email.toLowerCase()
    }

    const orders = await Order.find(query).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params

    let order = await Order.findOne({ id })
    if (!order && id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id)
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      })
    }

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    let order = await Order.findOneAndUpdate(
      { id },
      { status },
      { new: true, runValidators: true }
    )

    if (!order && id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      )
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.status(200).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}
