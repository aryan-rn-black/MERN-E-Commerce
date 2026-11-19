# ShopVerse Full-Stack Backend & MongoDB Integration

This document outlines the full-stack **Node.js + Express.js** backend, **MongoDB (Mongoose)** database architecture, **Google Gemini RAG Assistant**, and how to inspect everything using MongoDB Compass.

---

## 🚀 How to View Database in MongoDB Compass

You can connect **MongoDB Compass** directly to inspect your data, products, orders, users, and procedure guides:

1. Open **MongoDB Compass**.
2. In the **New Connection** / **URI** box, enter:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. You will see the database named **`shopverse`** containing:
   - **`products`**: 49 catalog items across 7 departments with prices, discount comparisons, ratings, stock, colors, and sizes.
   - **`categories`**: Store departments (*Electronics*, *Fashion*, *Home*, *Beauty*, *Sports*, *Grocery*, *Toys*) with subcategory taxonomy and color themes.
   - **`users`**: Profiles with hashed passwords (`bcryptjs`), JWT tokens, reward points, and VIP tier statuses.
   - **`orders`**: Customer orders with point-in-time item snapshots, shipping addresses, totals, and delivery progress.
   - **`helpguides`**: Procedural knowledge base documents for step-by-step guides (Checkout, Tracking, Returns, Payments, Loyalty) with text search indexes.

---

## 🛠️ Architecture Summary

```text
e-commerce/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection & health monitor
│   ├── controllers/
│   │   ├── authController.js     # User registration, JWT login, profile updates
│   │   ├── botController.js      # AI Assistant, MongoDB aggregations & procedures
│   │   ├── categoryController.js # Category listings & dynamic counts
│   │   ├── orderController.js    # Order creation, history, and status updates
│   │   └── productController.js  # Product querying, search, filters & CRUD
│   ├── data/
│   │   ├── categories.js         # Category initial seeds
│   │   ├── helpGuides.js         # Step-by-step procedural guides
│   │   └── products.js           # 40 core product initial seeds
│   ├── middleware/
│   │   ├── auth.js               # JWT Bearer token protection & optionalAuth
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── Category.js           # Category schema
│   │   ├── HelpGuide.js          # Procedural guide schema with full-text search
│   │   ├── Order.js              # Order schema (Extended Reference Pattern)
│   │   ├── Product.js            # Product schema with compound text search index
│   │   └── User.js               # User schema with bcrypt password hashing
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── botRoutes.js          # /api/bot routes (queries & procedures)
│   │   ├── categoryRoutes.js     # /api/categories routes
│   │   ├── orderRoutes.js        # /api/orders routes
│   │   └── productRoutes.js      # /api/products routes
│   ├── services/
│   │   └── geminiService.js      # Google Gemini 1.5 Flash RAG Service (native fetch)
│   ├── .env                      # Server configuration (PORT, MONGODB_URI, JWT_SECRET, GEMINI_API_KEY)
│   ├── index.js                  # Main Express server entrypoint
│   ├── package.json              # Backend dependencies
│   └── seeder.js                 # Idempotent database seeder & CLI migration tool
└── src/
    ├── components/
    │   └── bot/
    │       └── HelpBot.jsx       # Floating Assistant widget with live product cards & timeline
    ├── services/
    │   └── api.js                # Frontend API client service (Products, Orders, Bot)
    └── context/
        └── AppContext.jsx        # React Context connected to live Express/MongoDB API
```

---

## ⚡ Available NPM Scripts

Run these from the project root:

| Command | Description |
| :--- | :--- |
| `npm run dev:all` | Runs **both** the React Vite frontend (`http://localhost:5173`) and Express backend (`http://localhost:5000`) concurrently. |
| `npm run server` | Starts the Express + MongoDB backend server on port `5000`. |
| `npm run server:dev`| Starts the backend with auto-reload (`node --watch`). |
| `npm run seed` | Seeds and syncs all products, categories, demo users, sample orders, and help guides to MongoDB. |
| `npm run seed:destroy`| Clears all collections in the MongoDB database. |
| `npm run dev` | Starts the React Vite frontend dev server on port `5173`. |
| `npm run build` | Builds the production React bundle with Vite. |

---

## 📡 Complete API Endpoints

### 1. Products (`/api/products`)
- `GET /api/products`: Filter by `category`, `q` (search), `sort` (`price-asc`, `price-desc`, `rating`, `trending`, `newest`), `badge`, `minPrice`, `maxPrice`.
- `GET /api/products/featured`: Featured products.
- `GET /api/products/deals`: Products with active discount markdowns (`oldPrice > price`).
- `GET /api/products/:id`: Single product details + related category items.
- `POST /api/products`: Create a new product *(Protected)*.
- `PUT /api/products/:id`: Update an existing product *(Protected)*.
- `DELETE /api/products/:id`: Delete a product *(Protected)*.

### 2. Categories (`/api/categories`)
- `GET /api/categories`: Fetch all categories with live item counts.
- `POST /api/categories`: Create category *(Protected)*.

### 3. Authentication & Users (`/api/auth`)
- `POST /api/auth/register`: Create a new account with email & password (awards 250 welcome points).
- `POST /api/auth/login`: Authenticate with email & password and receive JWT.
- `GET /api/auth/me`: Get current authenticated user profile *(Protected)*.
- `PUT /api/auth/profile`: Update user profile details *(Protected)*.

### 4. Orders (`/api/orders`)
- `POST /api/orders`: Create an order with point-in-time item snapshots; awards 10% loyalty points. Supports both guest and logged-in checkout.
- `GET /api/orders`: Retrieve user orders or orders by email.
- `GET /api/orders/:id`: Single order lookup by order ID.
- `PUT /api/orders/:id/status`: Update order fulfillment status (`Processing`, `Shipped`, `Delivered`, `Cancelled`).

### 5. AI Assistant & Procedures (`/api/bot`)
- `POST /api/bot/query`: Conversational AI endpoint.
  - **Deals Intent**: Runs a live MongoDB aggregation pipeline calculating dynamic discount percentages.
  - **Budget Filter Intent**: Runs a `$facet` aggregation matching price ranges and returning summary statistics.
  - **Procedure Intent**: Queries the `HelpGuide` collection using `$text` search to retrieve step-by-step verified store workflows.
  - **Google Gemini Grounding**: If `GEMINI_API_KEY` is present, passes retrieved BSON documents to Gemini 1.5 Flash to synthesize conversational responses without hallucination.
- `GET /api/bot/guides`: Fetch all available procedural guides.
