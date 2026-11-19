import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: '✨',
    },
    color: {
      type: String,
      default: 'from-brand-500 to-indigo-600',
    },
    sub: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

export const Category = mongoose.model('Category', categorySchema)
