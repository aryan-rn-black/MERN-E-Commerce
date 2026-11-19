import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineX,
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineShoppingBag,
  HiOutlineRefresh,
  HiOutlineExternalLink,
} from 'react-icons/hi'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency } from '../../utils/format.js'
import api from '../../services/api.js'
import toast from 'react-hot-toast'

// Client-side fallback guides in case server is booting or offline
const CLIENT_FALLBACK_GUIDES = {
  checkout: {
    title: 'How to Proceed with Checkout & Order',
    summary: 'Follow these 5 simple steps to complete your purchase smoothly.',
    steps: [
      {
        stepNumber: 1,
        title: 'Add Items to Cart',
        description: 'Choose your product options (color, size) and tap "Add to Cart".',
        actionUrl: '/products',
        actionLabel: 'Browse Products',
      },
      {
        stepNumber: 2,
        title: 'Review Cart',
        description: 'Check quantities, price breakdown, and discount vouchers in your cart.',
        actionUrl: '/cart',
        actionLabel: 'View Cart',
      },
      {
        stepNumber: 3,
        title: 'Provide Shipping Address',
        description: 'Enter your name, delivery address, postal zip, and phone number.',
        actionUrl: '/checkout',
        actionLabel: 'Proceed to Checkout',
      },
      {
        stepNumber: 4,
        title: 'Select Payment Method',
        description: 'Pick Credit/Debit Card, UPI / Net Banking, or Cash on Delivery (COD).',
      },
      {
        stepNumber: 5,
        title: 'Instant Confirmation & 10% Points',
        description: 'Receive an instant Order ID & earn 10% loyalty reward points.',
        actionUrl: '/orders',
        actionLabel: 'My Orders',
      },
    ],
  },
  track: {
    title: 'How to Track Your Order Status',
    summary: 'Track live warehouse packaging and courier transit updates.',
    steps: [
      {
        stepNumber: 1,
        title: 'Visit Orders Page',
        description: 'Go to your account order history at /orders.',
        actionUrl: '/orders',
        actionLabel: 'Open Orders',
      },
      {
        stepNumber: 2,
        title: 'Check Status Badge',
        description: 'Real-time status updates: Processing → Shipped → Delivered.',
      },
    ],
  },
  return: {
    title: 'Returns & Refund Policy',
    summary: 'Enjoy hassle-free 14-day returns on all eligible purchases.',
    steps: [
      {
        stepNumber: 1,
        title: '14-Day Window',
        description: 'Initiate returns within 14 days of package delivery.',
      },
      {
        stepNumber: 2,
        title: 'Doorstep Courier Pickup',
        description: 'Courier agent collects the item from your shipping address.',
      },
      {
        stepNumber: 3,
        title: 'Fast Refund',
        description: 'Amount is refunded directly to your original payment mode within 3-5 days.',
      },
    ],
  },
}

export default function HelpBot() {
  const navigate = useNavigate()
  const { products: storeProducts, addToCart } = useApp()

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiProvider, setAiProvider] = useState('nosql-native')
  const messagesEndRef = useRef(null)

  const initialWelcomeMessage = {
    id: 'welcome',
    sender: 'bot',
    text: "👋 Hi! I'm your **ShopVerse AI Shopping Assistant**.\n\nI can help you filter products by budget, discover live discount deals, or guide you step-by-step through our checkout and order procedures.",
    suggestedActions: [
      { label: '🔥 Show Hot Deals', query: 'Show me deals' },
      { label: '🛒 How to Checkout?', query: 'How to checkout' },
      { label: '🎧 Audio under $100', query: 'Show electronics under 100' },
      { label: '📦 How to Track Order?', query: 'How to track my order' },
      { label: '↩️ Return Policy', query: 'Return and refund policy' },
    ],
  }

  const [messages, setMessages] = useState([initialWelcomeMessage])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, loading])

  // Handle Query Submission
  const handleSend = async (customText = null) => {
    const userQuery = (customText || input).trim()
    if (!userQuery || loading) return

    const userMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userQuery,
    }

    setMessages((prev) => [...prev, userMessage])
    if (!customText) setInput('')
    setLoading(true)

    try {
      // 1. Try Live Backend Query (MongoDB Aggregation / Text Search / Gemini)
      const res = await api.queryBot({ query: userQuery })

      if (res && res.success) {
        if (res.aiProvider) setAiProvider(res.aiProvider)
        const botMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: res.reply,
          products: res.products || [],
          guide: res.guide || null,
          suggestedActions: res.suggestedActions || [],
        }
        setMessages((prev) => [...prev, botMessage])
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('Backend bot query fallback:', err.message)
    }

    // 2. Client-side Intelligent Fallback if server is unavailable
    handleClientFallback(userQuery)
    setLoading(false)
  }

  // Fallback simulator using client-side catalog and data
  const handleClientFallback = (query) => {
    const lower = query.toLowerCase()
    let botReply = ''
    let recommendedProducts = []
    let procedureGuide = null
    let suggestions = [
      { label: '🔥 Show Hot Deals', query: 'Show me deals' },
      { label: '🛒 How to Checkout?', query: 'How to checkout' },
      { label: '📦 How to Track Order?', query: 'How to track my order' },
    ]

    // Check if query is about deals, discounts, or percentages (e.g. "less than 50 percent", "50% off")
    const percentMatch = lower.match(/(\d+)\s*(?:%|percent)/i)
    if (percentMatch || lower.includes('deal') || lower.includes('discount') || lower.includes('sale') || lower.includes('off')) {
      const dealsList = (storeProducts || []).filter((p) => p.oldPrice && p.oldPrice > p.price)
      const targetPercent = percentMatch ? Number(percentMatch[1]) : null

      if (targetPercent) {
        const isMore = lower.includes('more than') || lower.includes('over') || lower.includes('above')
        recommendedProducts = dealsList.filter((p) => {
          const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
          return isMore ? discount >= targetPercent : discount <= targetPercent
        }).slice(0, 4)

        if (recommendedProducts.length > 0) {
          botReply = isMore
            ? `🔥 Found ${recommendedProducts.length} deal(s) with ${targetPercent}% or more discount:`
            : `🔥 Found ${recommendedProducts.length} deal(s) with up to ${targetPercent}% discount:`
        } else {
          recommendedProducts = dealsList.slice(0, 4)
          botReply = `Here are our best available deals currently live in ShopVerse:`
        }
      } else {
        botReply = '🔥 Here are the top featured deals with verified discounts:'
        recommendedProducts = dealsList.slice(0, 4)
      }
    } else if (lower.includes('checkout') || lower.includes('buy') || lower.includes('order') || lower.includes('proceed')) {
      botReply = 'Here is the step-by-step procedure to complete your purchase:'
      procedureGuide = CLIENT_FALLBACK_GUIDES.checkout
    } else if (lower.includes('track') || lower.includes('status') || lower.includes('delivery')) {
      botReply = 'Here is how you can track your live order delivery:'
      procedureGuide = CLIENT_FALLBACK_GUIDES.track
    } else if (lower.includes('return') || lower.includes('refund') || lower.includes('policy')) {
      botReply = 'Here is our transparent 14-day return and refund procedure:'
      procedureGuide = CLIENT_FALLBACK_GUIDES.return
    } else {
      // Budget/Category filter fallback
      const budgetMatch = lower.match(/(?:under|below|less than)\s*[$₹]?\s*(\d+)/i)
      const budget = budgetMatch ? Number(budgetMatch[1]) : null

      recommendedProducts = (storeProducts || []).filter((p) => {
        let match = true
        if (budget && p.price > budget) match = false
        if (lower.includes('electronic') && p.category !== 'electronics') match = false
        if (lower.includes('shoe') && p.category !== 'shoes') match = false
        if (lower.includes('fashion') && p.category !== 'fashion') match = false
        return match
      }).slice(0, 4)

      if (recommendedProducts.length > 0) {
        botReply = `Found ${recommendedProducts.length} matching products for you:`
      } else {
        botReply = `Here are our top-rated recommendations you might like:`
        recommendedProducts = (storeProducts || []).slice(0, 3)
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: botReply,
        products: recommendedProducts,
        guide: procedureGuide,
        suggestedActions: suggestions,
      },
    ])
  }

  const handleAddToCart = (product) => {
    addToCart(product, 1, product.colors?.[0] || null, product.sizes?.[0] || null)
    toast.success(`Added ${product.title} to cart!`, { icon: '🛒' })
  }

  const handleResetChat = () => {
    setMessages([initialWelcomeMessage])
  }

  return (
    <>
      {/* Floating Action Trigger Button (Hidden when modal is open to avoid clipping) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Shopping Assistant"
            className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-brand-600 via-fuchsia-600 to-purple-600 text-white rounded-full shadow-2xl shadow-brand-500/40 hover:shadow-brand-500/60 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-white/30 dark:ring-ink-900/40"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs text-white">
              <HiOutlineSparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </div>
            <div className="text-left pr-1">
              <span className="block font-bold text-[10px] uppercase tracking-wider text-amber-200 leading-none">
                AI Assistant
              </span>
              <span className="font-extrabold text-sm tracking-tight text-white leading-tight">
                Ask ShopVerse
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="ShopVerse Shopping & Procedure Assistant"
          className="fixed bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[85vh] h-[640px] bg-white dark:bg-ink-900 rounded-3xl shadow-2xl border border-ink-200 dark:border-ink-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 via-fuchsia-600 to-purple-600 px-4 py-3.5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold shadow-inner">
                <HiOutlineSparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5 font-display">
                  ShopVerse Assistant
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                    aiProvider === 'google-gemini'
                      ? 'bg-amber-400/25 text-amber-100 border-amber-300/40'
                      : 'bg-emerald-500/25 text-emerald-100 border-emerald-400/40'
                  }`}>
                    {aiProvider === 'google-gemini' ? 'Gemini ✦ RAG' : 'NoSQL AI'}
                  </span>
                </h3>
                <p className="text-[11px] text-brand-100 opacity-90">
                  Live Deals • Filters • Procedures
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart Conversation"
                className="p-1.5 hover:bg-white/15 rounded-xl text-brand-100 hover:text-white transition-colors"
              >
                <HiOutlineRefresh className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 hover:bg-white/15 rounded-xl text-brand-100 hover:text-white transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ink-50/70 dark:bg-ink-950/70 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Text Bubble */}
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-fuchsia-600 text-white rounded-br-none shadow-brand-500/20'
                      : 'bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 border border-ink-200 dark:border-ink-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Procedure Guide Timeline Display */}
                {msg.guide && (
                  <div className="w-full mt-3 bg-white dark:bg-ink-900 rounded-2xl p-4 border border-brand-200 dark:border-brand-900/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-ink-100 dark:border-ink-800">
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                      <h4 className="font-bold text-xs text-brand-700 dark:text-brand-300 uppercase tracking-wider font-display">
                        {msg.guide.title}
                      </h4>
                    </div>
                    <p className="text-xs text-ink-600 dark:text-ink-300 mb-3 leading-relaxed">
                      {msg.guide.summary}
                    </p>

                    {/* Step-by-Step Flow */}
                    <div className="space-y-2.5">
                      {msg.guide.steps?.map((step) => (
                        <div
                          key={step.stepNumber}
                          className="flex items-start gap-2.5 text-xs bg-ink-50 dark:bg-ink-950/80 p-2.5 rounded-xl border border-ink-200/70 dark:border-ink-800"
                        >
                          <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {step.stepNumber}
                          </span>
                          <div className="flex-1">
                            <span className="font-bold text-ink-900 dark:text-white block">
                              {step.title}
                            </span>
                            <span className="text-ink-600 dark:text-ink-400 text-[11px] leading-tight block mt-0.5">
                              {step.description}
                            </span>
                            {step.actionUrl && (
                              <button
                                onClick={() => {
                                  navigate(step.actionUrl)
                                  setIsOpen(false)
                                }}
                                className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                              >
                                {step.actionLabel || 'Proceed'} &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Recommendation Cards (MongoDB Aggregated) */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.products.map((p) => {
                      const discount = p.discountPercent || (p.oldPrice && p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : null)
                      return (
                        <div
                          key={p.id || p._id}
                          className="bg-white dark:bg-ink-900 rounded-2xl p-2.5 border border-ink-200 dark:border-ink-800 shadow-xs flex flex-col justify-between group hover:border-brand-400 transition-all"
                        >
                          <div className="flex gap-2.5">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-14 h-14 object-cover rounded-xl shrink-0 bg-ink-100 dark:bg-ink-800"
                            />
                            <div className="min-w-0 flex-1">
                              {discount && discount > 0 ? (
                                <span className="inline-block text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md border border-emerald-300/40 mb-0.5">
                                  {discount}% OFF
                                </span>
                              ) : null}
                              <h5 className="text-xs font-bold text-ink-900 dark:text-ink-100 truncate">
                                {p.title}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs font-extrabold text-ink-900 dark:text-white">
                                  {formatCurrency(p.price)}
                                </span>
                                {p.oldPrice && (
                                  <span className="text-[10px] line-through text-ink-400">
                                    {formatCurrency(p.oldPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between gap-1">
                            <button
                              onClick={() => {
                                navigate(`/product/${p.id || p._id}`)
                                setIsOpen(false)
                              }}
                              className="text-[11px] font-semibold text-ink-600 dark:text-ink-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-0.5"
                            >
                              Details <HiOutlineExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleAddToCart(p)}
                              className="px-2.5 py-1 bg-gradient-to-r from-brand-500 to-fuchsia-600 hover:from-brand-600 hover:to-fuchsia-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                            >
                              <HiOutlineShoppingBag className="w-3 h-3" /> Add
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action.query)}
                        className="text-[11px] font-medium px-3 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-ink-800 dark:hover:bg-ink-700 text-brand-700 dark:text-brand-300 rounded-full border border-brand-200/80 dark:border-ink-700 shadow-2xs transition-all active:scale-95"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-ink-400 text-xs py-1">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[11px] text-ink-500 dark:text-ink-400 font-medium">
                  Querying MongoDB pipelines...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Filter Bar */}
          <div className="px-3 py-2 bg-ink-100 dark:bg-ink-950 border-t border-ink-200 dark:border-ink-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-ink-400 font-bold shrink-0 uppercase text-[10px]">Quick:</span>
            <button
              onClick={() => handleSend('Show me deals')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-200 border border-ink-200 dark:border-ink-800 whitespace-nowrap hover:border-brand-500 font-medium shadow-2xs"
            >
              🏷️ Deals
            </button>
            <button
              onClick={() => handleSend('How to checkout')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-200 border border-ink-200 dark:border-ink-800 whitespace-nowrap hover:border-brand-500 font-medium shadow-2xs"
            >
              🛒 Checkout
            </button>
            <button
              onClick={() => handleSend('How to track my order')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-200 border border-ink-200 dark:border-ink-800 whitespace-nowrap hover:border-brand-500 font-medium shadow-2xs"
            >
              📦 Track
            </button>
            <button
              onClick={() => handleSend('less than 50 percent')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-200 border border-ink-200 dark:border-ink-800 whitespace-nowrap hover:border-brand-500 font-medium shadow-2xs"
            >
              🎯 &lt; 50% Off
            </button>
            <button
              onClick={() => handleSend('Return and refund policy')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-200 border border-ink-200 dark:border-ink-800 whitespace-nowrap hover:border-brand-500 font-medium shadow-2xs"
            >
              ↩️ Return Policy
            </button>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-white dark:bg-ink-900 border-t border-ink-200 dark:border-ink-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. 'less than 50 percent', 'how to buy')..."
              className="flex-1 text-xs sm:text-sm bg-ink-100 dark:bg-ink-800 border-0 rounded-2xl px-4 py-2.5 text-ink-900 dark:text-white placeholder-ink-400 focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-gradient-to-r from-brand-500 to-fuchsia-600 hover:from-brand-600 hover:to-fuchsia-700 disabled:opacity-40 text-white rounded-2xl shadow-xs transition-all shrink-0 active:scale-95"
            >
              <HiOutlinePaperAirplane className="w-4 h-4 transform rotate-90" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
