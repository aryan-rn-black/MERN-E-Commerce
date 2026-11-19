# 🛍️ ShopVerse — Full-Stack E-Commerce Platform

A production-grade, responsive e-commerce storefront and backend built with **React 18**, **Vite**, **Tailwind CSS**, **Node.js / Express**, **MongoDB (Mongoose)**, and **Google Gemini AI**.

---

## ✨ Highlights

- ⚡ **Vite + React 18** for instant HMR and lightweight production builds
- 🎨 **Tailwind CSS** with a custom design system (`brand`, `accent`, and `ink` palettes)
- 🤖 **Intelligent Shopping & Procedure Bot (`Ask ShopVerse`)**:
  - Live deals discovery using **MongoDB Aggregation Pipelines** (`$match`, `$expr`, `$addFields`, `$sort`).
  - Budget-aware product filtering with faceted analytics (`$facet`).
  - Step-by-step visual procedural workflows (Checkout flow, Order tracking, 14-day Returns policy).
  - Grounded **Google Gemini 1.5 Flash RAG (Retrieval-Augmented Generation)** with zero-dependency native fetch and automatic native fallback.
- 📦 **Rich 49-Product Catalog**:
  - Expanded across 7 realistic departments: *Electronics*, *Fashion*, *Home & Living*, *Beauty & Personal Care*, *Sports & Outdoors*, *Grocery & Gourmet*, and *Toys & Kids*.
- 🧱 Reusable component library: `Drawer`, `Badge`, `Rating`, `ProductCard`, `Button`, `HelpBot`
- 🛒 **7 Off-Canvas Left Drawers**:
  1. **Categories** — full store taxonomy with sub-pills & dynamic item counts
  2. **Cart** — line items, options stepper, subtotal, and checkout CTA
  3. **Wishlist** — quick save and direct "Add to Cart"
  4. **User / Account** — profile, VIP tier stats, loyalty points, and sign out
  5. **Search** — live search with full-text query matching and keyboard shortcut (`⌘K` / `Ctrl+K`)
  6. **Notifications** — unread indicators, mark-as-read, and alert cards
  7. **Filters** — price sliders, brand checklist, rating filter, and mobile-responsive drawer
- 🔐 **Full-Stack Authentication & Orders**:
  - Bcrypt password hashing, signed JWT Bearer tokens, and role-based permissions (`user` / `admin`).
  - Point-in-time order snapshots (Extended Reference Pattern) with automated loyalty rewards.
- 💾 Persistent state (cart, wishlist, user session) with graceful offline fallback.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Install frontend packages
npm install

# Install backend packages
cd server
npm install
cd ..
```

### 2. Configure Environment (`server/.env`)
Ensure your `server/.env` file is set up:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shopverse
JWT_SECRET=shopverse_super_secret_jwt_key_2025
NODE_ENV=development

# Optional: Add Google Gemini API key for conversational AI grounding
GEMINI_API_KEY=
```

### 3. Seed Database & Run
```bash
# Seed initial categories, products, and procedural guides into MongoDB
npm run seed

# Run both frontend and backend concurrently
npm run dev:all
```
Open **http://localhost:5173** in your browser.

---

## ⚡ Available NPM Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev:all` | Runs Vite (`:5173`) and Express (`:5000`) concurrently. |
| `npm run dev` | Runs the React Vite frontend dev server. |
| `npm run server:dev` | Runs the Express backend with auto-reload (`node --watch`). |
| `npm run seed` | Seeds/syncs all 49 products, categories, users, and help guides into MongoDB. |
| `npm run seed:destroy` | Clears all MongoDB collections. |
| `npm run build` | Compiles the production bundle with Vite. |

---

## 🗂️ Project Structure

```text
e-commerce/
├── server/
│   ├── config/db.js              # MongoDB Mongoose connection & health monitor
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profiles
│   │   ├── botController.js      # AI Assistant, MongoDB aggregations & procedures
│   │   ├── categoryController.js # Category listings & counts
│   │   ├── orderController.js    # Order processing & loyalty rewards
│   │   └── productController.js  # Catalog filtering, search, and admin CRUD
│   ├── data/                     # Seed datasets (products, categories, help guides)
│   ├── middleware/               # Auth protection & centralized error handling
│   ├── models/                   # Mongoose schemas (User, Product, Category, Order, HelpGuide)
│   ├── routes/                   # Express routes (/auth, /products, /categories, /orders, /bot)
│   ├── services/
│   │   └── geminiService.js      # Google Gemini 1.5 Flash RAG service (native fetch)
│   ├── index.js                  # Main server entrypoint
│   └── seeder.js                 # Idempotent database seeder
├── src/
│   ├── components/
│   │   ├── bot/HelpBot.jsx       # Floating AI Assistant widget with reactive UI cards
│   │   ├── drawers/              # 7 off-canvas drawers
│   │   ├── home/                 # Hero carousel, Deals banner, Category grid
│   │   ├── layout/               # Header, Footer
│   │   └── product/              # ProductCard and badge components
│   ├── context/AppContext.jsx    # Global state management
│   ├── data/                     # Synchronized offline client fallback data
│   ├── services/api.js           # API client service
│   ├── App.jsx                   # Main layout and router
│   └── main.jsx
├── NoSQL_UNderstanding.md        # Comprehensive Senior Developer NoSQL reference guide
├── architecture_and_data_flow_diagrams.md # Visual system & sequence diagrams
├── intro.md                      # Codebase architecture & schema walkthrough
└── walkthrough.md                # Full-stack developer guide
```
