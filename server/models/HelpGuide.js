import mongoose from 'mongoose'

const stepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'check' },
    actionUrl: { type: String, default: null },
    actionLabel: { type: String, default: null },
  },
  { _id: false }
)

const helpGuideSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['procedure', 'policy', 'guide', 'faq'],
      default: 'procedure',
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    steps: [stepSchema],
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    relatedIntents: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Compound Full-text search index for fast contextual retrieval
helpGuideSchema.index({
  title: 'text',
  summary: 'text',
  tags: 'text',
  relatedIntents: 'text',
})

export const HelpGuide = mongoose.model('HelpGuide', helpGuideSchema)

