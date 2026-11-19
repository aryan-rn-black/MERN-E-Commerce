import { Product } from '../models/Product.js'
import { HelpGuide } from '../models/HelpGuide.js'
import { helpGuides as fallbackGuides } from '../data/helpGuides.js'
import {
  isGeminiConfigured,
  extractSearchIntentWithGemini,
  generateGroundedResponseWithGemini,
} from '../services/geminiService.js'

/**
 * @desc    Process Assistant query with Google Gemini AI + MongoDB RAG Grounding
 * @route   POST /api/bot/query
 * @access  Public
 */
export const handleBotQuery = async (req, res, next) => {
  try {
    const { query = '', intent = 'auto', params = {} } = req.body
    const cleanQuery = (query || '').trim()
    const lowerQuery = cleanQuery.toLowerCase()

    let detectedIntent = intent
    let extractedBudget = null
    let extractedCategory = null
    let extractedSearchTerm = null
    let extractedProcedureKey = null

    // -------------------------------------------------------------------------
    // STEP 1: INTENT & PARAMETER EXTRACTION (Gemini LLM or Deterministic Fallback)
    // -------------------------------------------------------------------------
    let targetPercent = null
    let isPercentDiscountQuery = false
    let percentCondition = 'lte' // 'lte' (up to / less than) or 'gte' (more than / at least)

    if (detectedIntent === 'auto') {
      let geminiParsed = null
      if (isGeminiConfigured() && cleanQuery.length > 3) {
        geminiParsed = await extractSearchIntentWithGemini(cleanQuery)
      }

      if (geminiParsed) {
        detectedIntent = geminiParsed.intent || 'general'
        extractedBudget = geminiParsed.budget
        extractedCategory = geminiParsed.category
        extractedSearchTerm = geminiParsed.searchTerm
        extractedProcedureKey = geminiParsed.procedureKey
      } else {
        // Check for discount percentage (e.g. "50 percent", "50%", "less than 50%", "more than 40 percent")
        const percentMatch = lowerQuery.match(/(?:(?:less than|under|up to|below|more than|over|above|at least)?\s*)(\d+)\s*(?:%|percent)/i)
        if (percentMatch) {
          isPercentDiscountQuery = true
          targetPercent = Number(percentMatch[1])
          if (lowerQuery.includes('more than') || lowerQuery.includes('over') || lowerQuery.includes('above') || lowerQuery.includes('at least')) {
            percentCondition = 'gte'
          } else {
            percentCondition = 'lte'
          }
          detectedIntent = 'deals'
        }

        // Fallback Deterministic Intent Detector
        if (!detectedIntent || detectedIntent === 'auto') {
          if (
            lowerQuery.includes('deal') ||
            lowerQuery.includes('discount') ||
            lowerQuery.includes('offer') ||
            lowerQuery.includes('sale') ||
            lowerQuery.includes('clearance') ||
            lowerQuery.includes('off')
          ) {
            detectedIntent = 'deals'
          } else if (
            lowerQuery.includes('checkout') ||
            lowerQuery.includes('how to buy') ||
            lowerQuery.includes('how to proceed') ||
            lowerQuery.includes('how to order') ||
            lowerQuery.includes('purchase')
          ) {
            detectedIntent = 'procedure'
            extractedProcedureKey = 'checkout_procedure'
          } else if (
            lowerQuery.includes('track') ||
            lowerQuery.includes('status') ||
            lowerQuery.includes('delivery') ||
            lowerQuery.includes('where is my order')
          ) {
            detectedIntent = 'procedure'
            extractedProcedureKey = 'order_tracking'
          } else if (
            lowerQuery.includes('return') ||
            lowerQuery.includes('refund') ||
            lowerQuery.includes('exchange') ||
            lowerQuery.includes('cancel')
          ) {
            detectedIntent = 'procedure'
            extractedProcedureKey = 'return_and_refund'
          } else if (
            lowerQuery.includes('point') ||
            lowerQuery.includes('reward') ||
            lowerQuery.includes('loyalty') ||
            lowerQuery.includes('tier')
          ) {
            detectedIntent = 'procedure'
            extractedProcedureKey = 'loyalty_rewards'
          } else if (
            lowerQuery.includes('pay') ||
            lowerQuery.includes('card') ||
            lowerQuery.includes('upi') ||
            lowerQuery.includes('cod')
          ) {
            detectedIntent = 'procedure'
            extractedProcedureKey = 'payment_methods'
          } else if (
            lowerQuery.includes('under') ||
            lowerQuery.includes('below') ||
            lowerQuery.includes('less than') ||
            lowerQuery.includes('more than') ||
            lowerQuery.includes('budget') ||
            lowerQuery.includes('filter') ||
            lowerQuery.includes('show') ||
            lowerQuery.includes('find') ||
            lowerQuery.includes('category') ||
            lowerQuery.includes('cheap') ||
            lowerQuery.includes('affordable')
          ) {
            detectedIntent = 'filter_products'
          } else {
            detectedIntent = 'general'
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // STEP 2: MONGODB DATA RETRIEVAL (Pipelines & Text Indexes)
    // -------------------------------------------------------------------------
    let products = []
    let guide = null
    let responseText = ''
    let suggestedActions = []

    // 1. INTENT: DEALS (MongoDB Aggregation Pipeline)
    if (detectedIntent === 'deals') {
      const dealsPipeline = [
        {
          $match: {
            oldPrice: { $ne: null, $gt: 0 },
            $expr: { $gt: ['$oldPrice', '$price'] },
          },
        },
        {
          $addFields: {
            discountPercent: {
              $round: [
                {
                  $multiply: [
                    { $divide: [{ $subtract: ['$oldPrice', '$price'] }, '$oldPrice'] },
                    100,
                  ],
                },
                0,
              ],
            },
            savingsAmount: {
              $round: [{ $subtract: ['$oldPrice', '$price'] }, 2],
            },
          },
        },
      ]

      // If user queried for specific percentage threshold (e.g. "less than 50%", "more than 30%")
      if (targetPercent !== null) {
        if (percentCondition === 'gte') {
          dealsPipeline.push({ $match: { discountPercent: { $gte: targetPercent } } })
        } else {
          dealsPipeline.push({ $match: { discountPercent: { $lte: targetPercent } } })
        }
      }

      dealsPipeline.push(
        { $sort: { discountPercent: -1, rating: -1 } },
        { $limit: 4 },
        {
          $project: {
            id: 1,
            title: 1,
            brand: 1,
            price: 1,
            oldPrice: 1,
            discountPercent: 1,
            savingsAmount: 1,
            image: 1,
            rating: 1,
            category: 1,
            badge: 1,
            stock: 1,
          },
        }
      )

      products = await Product.aggregate(dealsPipeline)

      // Fallback if specific threshold had zero items
      if (products.length === 0 && targetPercent !== null) {
        products = await Product.aggregate([
          { $match: { oldPrice: { $ne: null, $gt: 0 }, $expr: { $gt: ['$oldPrice', '$price'] } } },
          {
            $addFields: {
              discountPercent: {
                $round: [{ $multiply: [{ $divide: [{ $subtract: ['$oldPrice', '$price'] }, '$oldPrice'] }, 100] }, 0],
              },
            },
          },
          { $sort: { discountPercent: -1 } },
          { $limit: 4 },
        ])
        responseText = `Here are our best available deals currently live in ShopVerse:`
      } else if (targetPercent !== null) {
        responseText = percentCondition === 'gte'
          ? `🔥 Found ${products.length} deal(s) with **${targetPercent}% or more** discount:`
          : `🔥 Found ${products.length} deal(s) with **up to ${targetPercent}%** discount:`
      } else {
        responseText = `🔥 Here are the highest-discount deals currently live in ShopVerse (calculated live via MongoDB Aggregation):`
      }

      suggestedActions = [
        { label: '🎧 Electronics Deals', query: 'Show electronics deals' },
        { label: '💰 Items under ₹1,000 / $50', query: 'Show products under 50' },
        { label: '🛒 How to proceed to checkout?', query: 'How to checkout' },
      ]
    }

    // 2. INTENT: FILTER PRODUCTS (MongoDB $facet & Compound Filters)
    else if (detectedIntent === 'filter_products') {
      let matchStage = {}

      const budget = extractedBudget || (lowerQuery.match(/(?:under|below|less than|max)\s*[$₹]?\s*(\d+)/i)?.[1])
      if (budget) {
        matchStage.price = { $lte: Number(budget) }
      } else if (params.maxPrice) {
        matchStage.price = { $lte: Number(params.maxPrice) }
      }

      const knownCategories = ['electronics', 'fashion', 'shoes', 'accessories', 'home', 'beauty', 'sports']
      const cat = extractedCategory || knownCategories.find((c) => lowerQuery.includes(c))
      if (cat) {
        matchStage.category = cat
      }

      const rawSearch = extractedSearchTerm || lowerQuery
        .replace(/(under|below|less than|max|\d+|show|find|me|products|items)/gi, '')
        .trim()

      if (rawSearch.length > 2 && !matchStage.category) {
        matchStage.$or = [
          { title: { $regex: rawSearch, $options: 'i' } },
          { brand: { $regex: rawSearch, $options: 'i' } },
          { category: { $regex: rawSearch, $options: 'i' } },
        ]
      }

      const filterPipeline = [
        { $match: matchStage },
        {
          $facet: {
            matchingProducts: [
              { $sort: { rating: -1, price: 1 } },
              { $limit: 4 },
              {
                $project: {
                  id: 1,
                  title: 1,
                  brand: 1,
                  price: 1,
                  oldPrice: 1,
                  image: 1,
                  rating: 1,
                  category: 1,
                  badge: 1,
                  stock: 1,
                },
              },
            ],
            summaryStats: [
              {
                $group: {
                  _id: null,
                  totalMatches: { $sum: 1 },
                  avgPrice: { $avg: '$price' },
                  minPrice: { $min: '$price' },
                  maxPrice: { $max: '$price' },
                },
              },
            ],
          },
        },
      ]

      const [aggregationResult] = await Product.aggregate(filterPipeline)
      products = aggregationResult?.matchingProducts || []
      const stats = aggregationResult?.summaryStats[0] || { totalMatches: 0 }

      const budgetNote = matchStage.price?.$lte ? ` within your budget of ₹${matchStage.price.$lte} / $${matchStage.price.$lte}` : ''
      responseText = products.length > 0
        ? `Found ${stats.totalMatches} item(s)${budgetNote}. Here are our top recommendations:`
        : `I couldn't find exact items matching "${cleanQuery}". Here are some popular alternatives:`

      if (products.length === 0) {
        products = await Product.find().sort({ rating: -1 }).limit(3)
      }

      suggestedActions = [
        { label: '🔥 Show Hot Deals', query: 'Show me deals' },
        { label: '⭐ Top 5★ Rated', query: 'Show top rated products' },
        { label: '🛒 How to checkout?', query: 'How to checkout' },
      ]
    }

    // 3. INTENT: PROCEDURES (NoSQL HelpGuide Document Retrieval)
    else if (detectedIntent === 'procedure' || extractedProcedureKey) {
      const guideKey = extractedProcedureKey || 'checkout_procedure'
      guide = await HelpGuide.findOne({ key: guideKey })
      if (!guide) {
        guide = fallbackGuides.find((g) => g.key === guideKey)
      }

      if (guide) {
        responseText = `Here is the verified procedure for **${guide.title}**:`
        suggestedActions = [
          { label: '🛒 Place an Order', query: 'How to checkout' },
          { label: '📦 Track an Order', query: 'How to track my order' },
          { label: '🔥 Show Today\'s Deals', query: 'Show me deals' },
        ]
      }
    }

    // 4. GENERAL FALLBACK (Text & Keyword search on Product collection)
    if (!products.length && !guide) {
      // First try exact phrase
      products = await Product.find({
        $or: [
          { title: { $regex: cleanQuery, $options: 'i' } },
          { category: { $regex: cleanQuery, $options: 'i' } },
          { brand: { $regex: cleanQuery, $options: 'i' } },
          { description: { $regex: cleanQuery, $options: 'i' } },
        ],
      }).limit(4)

      // If no exact phrase match, tokenize words (> 2 chars)
      if (products.length === 0) {
        const keywords = cleanQuery.split(/\s+/).filter((w) => w.length > 2)
        if (keywords.length > 0) {
          products = await Product.find({
            $or: keywords.map((k) => ({
              $or: [
                { title: { $regex: k, $options: 'i' } },
                { category: { $regex: k, $options: 'i' } },
                { brand: { $regex: k, $options: 'i' } },
              ],
            })),
          }).limit(4)
        }
      }

      if (products.length > 0) {
        responseText = `Here are the matching items found in ShopVerse for "${cleanQuery}":`
      } else {
        // Fall back to top featured items
        products = await Product.find({ isFeatured: true }).limit(3)
        if (products.length === 0) {
          products = await Product.find().sort({ rating: -1 }).limit(3)
        }
        responseText = `I couldn't find exact matches for "${cleanQuery}", but here are our top-rated recommendations you might like:`
      }

      suggestedActions = [
        { label: '🔥 Show Hot Deals', query: 'Show me deals' },
        { label: '🛒 How to checkout?', query: 'How to checkout' },
        { label: '📦 Track an order', query: 'How to track my order' },
        { label: '↩️ Return policy', query: 'Return and refund policy' },
      ]
    }

    // -------------------------------------------------------------------------
    // STEP 3: GROUNDED RAG SYNTHESIS WITH GEMINI (If Key is present)
    // -------------------------------------------------------------------------
    if (isGeminiConfigured() && cleanQuery.length > 3) {
      const geminiReply = await generateGroundedResponseWithGemini(cleanQuery, products, guide)
      if (geminiReply) {
        responseText = geminiReply
      }
    }

    return res.status(200).json({
      success: true,
      intent: detectedIntent,
      reply: responseText,
      products,
      guide,
      suggestedActions,
      aiProvider: isGeminiConfigured() ? 'google-gemini' : 'nosql-native',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Get all procedure help guides
 * @route   GET /api/bot/guides
 * @access  Public
 */
export const getAllHelpGuides = async (req, res, next) => {
  try {
    let guides = await HelpGuide.find().sort({ category: 1, key: 1 })
    if (!guides || guides.length === 0) {
      guides = fallbackGuides
    }
    res.status(200).json({ success: true, count: guides.length, data: guides })
  } catch (err) {
    next(err)
  }
}
