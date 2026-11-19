import { User } from '../models/User.js'

// Send token response with cookie/json
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken()

  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    points: user.points,
    tier: user.tier,
    phone: user.phone,
    bio: user.bio,
    birthday: user.birthday,
    joined: user.createdAt?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
  }

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      })
    }

    const userExists = await User.findOne({ email: email.toLowerCase() })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      })
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      points: 250, // Welcome bonus
      tier: 'Bronze',
    })

    sendTokenResponse(user, 201, res)
  } catch (err) {
    next(err)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    sendTokenResponse(user, 200, res)
  } catch (err) {
    next(err)
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        points: user.points,
        tier: user.tier,
        phone: user.phone,
        bio: user.bio,
        birthday: user.birthday,
        joined: user.createdAt?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
      },
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      bio: req.body.bio,
      birthday: req.body.birthday,
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        points: user.points,
        tier: user.tier,
        phone: user.phone,
        bio: user.bio,
        birthday: user.birthday,
        joined: user.createdAt?.toISOString().slice(0, 10),
      },
    })
  } catch (err) {
    next(err)
  }
}
