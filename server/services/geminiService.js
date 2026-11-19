/**
 * Google Gemini Integration Service (Native REST API via global fetch)
 *
 * Implements RAG (Retrieval-Augmented Generation) & Intent Analysis
 * grounded on real MongoDB NoSQL data.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

/**
 * Check if Gemini is configured
 */
export const isGeminiConfigured = () => {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5)
}

/**
 * Call Gemini API with a given prompt
 */
const callGemini = async (systemInstruction, userPrompt, temperature = 0.2) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const endpoint = `${GEMINI_API_URL}?key=${apiKey.trim()}`

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser Message: "${userPrompt}"` }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: 800,
    },
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn(`[Gemini API] Error status ${response.status}:`, errText)
      return null
    }

    const data = await response.json()
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return candidateText || null
  } catch (err) {
    console.warn('[Gemini API] Request failed:', err.message)
    return null
  }
}

/**
 * Use Gemini to understand complex natural language prompts & extract MongoDB search parameters
 */
export const extractSearchIntentWithGemini = async (userQuery) => {
  if (!isGeminiConfigured()) return null

  const systemInstruction = `
You are a NoSQL Query Intent Parser for the ShopVerse E-Commerce database.
Extract the customer's intent and parameters from their query and return ONLY valid JSON matching this schema:
{
  "intent": "deals" | "filter_products" | "procedure" | "general",
  "budget": number or null,
  "category": "electronics" | "fashion" | "shoes" | "accessories" | "home" | "beauty" | "sports" | null,
  "searchTerm": string,
  "procedureKey": "checkout_procedure" | "order_tracking" | "return_and_refund" | "payment_methods" | "loyalty_rewards" | null
}

Rules:
- If user wants deals, discounts, or offers: intent="deals"
- If user asks how to checkout, buy, order, place order: intent="procedure", procedureKey="checkout_procedure"
- If user asks how to track, where order is, delivery status: intent="procedure", procedureKey="order_tracking"
- If user asks about returns, refund, cancel: intent="procedure", procedureKey="return_and_refund"
- If user asks about payments, cards, UPI, COD: intent="procedure", procedureKey="payment_methods"
- If user mentions budget (e.g. "under 50", "below 1000"), extract as "budget" number.
- Output ONLY pure JSON without markdown code fences or backticks.
`

  try {
    const text = await callGemini(systemInstruction, userQuery, 0.1)
    if (!text) return null

    // Strip any markdown fences if present
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    return JSON.parse(cleanJson)
  } catch (err) {
    console.warn('[Gemini Intent Parsing] Fallback due to parse error:', err.message)
    return null
  }
}

/**
 * Grounded LLM Response Generation (RAG)
 * Combines real MongoDB documents with Gemini natural language generation
 */
export const generateGroundedResponseWithGemini = async (userQuery, mongoProducts = [], procedureGuide = null) => {
  if (!isGeminiConfigured()) return null

  const dataContext = {
    matchedProductsFromMongoDB: mongoProducts.map((p) => ({
      title: p.title,
      brand: p.brand,
      price: p.price,
      oldPrice: p.oldPrice || null,
      rating: p.rating,
      stock: p.stock,
      category: p.category,
    })),
    verifiedProcedureFromMongoDB: procedureGuide
      ? {
          title: procedureGuide.title,
          summary: procedureGuide.summary,
          stepsCount: procedureGuide.steps?.length || 0,
        }
      : null,
  }

  const systemInstruction = `
You are the official ShopVerse AI Shopping Assistant.
Respond concisely (2-4 sentences maximum) and helpfully to the customer's query.

CRITICAL GROUNDING RULES:
1. ONLY refer to the products, prices, and procedures provided in the verified MongoDB context below. NEVER invent products or prices.
2. If products are found, mention 1-2 highlight benefits (e.g. discount or rating) and direct them to the product cards rendered below.
3. If explaining a procedure, give a brief welcoming summary and encourage following the step-by-step procedure card shown below.
4. Keep the tone friendly, modern, and professional.

Verified MongoDB Context:
${JSON.stringify(dataContext, null, 2)}
`

  try {
    const reply = await callGemini(systemInstruction, userQuery, 0.4)
    return reply ? reply.trim() : null
  } catch (err) {
    return null
  }
}

