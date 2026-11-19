import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'shopverse_super_secret_jwt_key_2025'
    )
    req.user = await User.findById(decoded.id)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      })
    }
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

// Optional auth - attaches user if token is present, but doesn't block guests
export const optionalAuth = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'shopverse_super_secret_jwt_key_2025'
      )
      req.user = await User.findById(decoded.id)
    } catch (_) {
      // Ignore token decode errors in optional auth
    }
  }
  next()
}
