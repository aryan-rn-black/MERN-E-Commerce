Detailed breakdown of the **ShopVerse** e-commerce application codebase, covering the system architecture, backend server, database schemas, middleware, controllers, routes, and frontend API integration.

---

### 1. High-Level Architecture Overview

```
 ┌─────────────────────────────────────────────────────────┐
 │                   React + Vite Frontend                 │
 │             (Components, Contexts, Hooks, Pages)        │
 └────────────────────────────┬────────────────────────────┘
                              │ HTTP Requests (Fetch API with JWT Bearer Token)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │               Express.js REST API Server                │
 │                     (Port 5000)                         │
 ├─────────────────────────────────────────────────────────┤
 │ 1. Global Middleware (CORS, Morgan, JSON parser)         │
 │ 2. Route Handling (/api/auth, /products, /orders, etc.)  │
 │ 3. Auth Middleware (JWT Token verification & User lookup)│
 │ 4. Controllers (Business Logic & Queries)               │
 │ 5. Centralized Error Handler Middleware                 │
 └────────────────────────────┬────────────────────────────┘
                              │ Mongoose ODM Queries
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                    MongoDB Database                     │
 │              Collections: users, products,              │
 │                  categories, orders                     │
 └─────────────────────────────────────────────────────────┘
```

---

### 2. Database Architecture & Schemas (MongoDB + Mongoose)

The backend uses **MongoDB** managed via **Mongoose ORM** located in `server/models/`.

#### A. User Schema — [`server/models/User.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/models/User.js)
- **Fields**: `name`, `email` (unique, regex validated), `password` (`select: false` so it's not exposed in queries), `avatar`, `role` (`'user'` or `'admin'`), `points` (loyalty program, default 100), `tier` (`'Bronze'`, `'Silver'`, `'Gold'`, `'Platinum'`), `phone`, `bio`, `birthday`.
- **Pre-save Hook**: Automatically hashes passwords using **BcryptJS** (`salt` factor 10) whenever the password field is created or modified.
- **Methods**:
  - `matchPassword(enteredPassword)`: Compares candidate password with stored hash.
  - `getSignedJwtToken()`: Signs a JWT token containing `{ id, email, role }` valid for 30 days using `JWT_SECRET`.

#### B. Product Schema — [`server/models/Product.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/models/Product.js)
- **Fields**: `id` (custom unique identifier like `'p1'`), `title`, `brand`, `category` (indexed, lowercase), `price`, `oldPrice` (discounted items), `rating` (0 to 5), `reviews` count, `badge` (e.g. `'Best Seller'`), `image`, `images` array, `description`, `colors`, `sizes`, `stock`, `isFeatured`.
- **Indexes**: Compound text index on `title`, `brand`, `description`, and `category` enabling full-text search capability.

#### C. Category Schema — [`server/models/Category.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/models/Category.js)
- **Fields**: `key` (unique key, e.g. `'electronics'`), `name`, `count` (item count), `icon`, `color` (Tailwind gradient string), `sub` (array of sub-category names), `image`, `description`.

#### D. Order Schema — [`server/models/Order.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/models/Order.js)
- **Embedded Schema**: `orderItemSchema` (`product` ID, `title`, `price`, `image`, `qty`, `color`, `size`).
- **Fields**:
  - `id`: Custom order identifier (e.g., `'ORD-48291'`).
  - `user`: References `User` model `ObjectId` (nullable for guest checkout).
  - `customer`: Embedded object with `name`, `email`, `address`, `city`, `zip`, `country`.
  - `items`: Array of embedded `orderItemSchema`.
  - Financials: `subtotal`, `shippingFee`, `tax`, `total`.
  - Status & Metadata: `status` (`'Processing'`, `'Shipped'`, `'Delivered'`, `'Cancelled'`), `paymentMethod`, `isPaid`, `paidAt`.

#### E. HelpGuide Schema — [`server/models/HelpGuide.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/models/HelpGuide.js)
- **Embedded Schema**: `stepSchema` (`stepNumber`, `title`, `description`, `icon`, `actionUrl`, `actionLabel`).
- **Fields**:
  - `key`: Unique identifier (e.g. `'checkout_procedure'`, `'order_tracking'`, `'return_and_refund'`).
  - `title`: Human-readable procedure name.
  - `category`: Classification (`'procedure'`, `'policy'`, `'guide'`, `'faq'`).
  - `summary`: High-level explanation of the procedure.
  - `steps`: Array of numbered actionable step objects.
  - `tags` & `relatedIntents`: Indexed keywords for fast semantic search.
- **Indexes**: Compound `$text` full-text search index across `title`, `summary`, `tags`, and `relatedIntents`.

---

### 3. Server Configuration & Database Connection

#### A. Database Connection — [`server/config/db.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/config/db.js)
- Connects to MongoDB via `process.env.MONGODB_URI` (or defaults to `mongodb://127.0.0.1:27017/shopverse`).
- Includes a 5-second connection timeout flag (`serverSelectionTimeoutMS: 5000`).
- Provides `getDBStatus()` helper for monitoring connection state (`disconnected`, `connected`, `connecting`).

#### B. Main Entry Point — [`server/index.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/index.js)
- Initializes Express and configures middleware (`cors` with credentials enabled, `express.json()`, and `morgan` HTTP logger in development).
- **Health Check (`GET /api/health`)**: Returns API online status along with live MongoDB connection state.
- **Auto-Seeder (`seeder.js`)**: Upon server launch, checks if database collections exist and seeds initial product, category, and user records if empty.
- **Route Mounting**:
  - `/api/products` → [`productRoutes.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/routes/productRoutes.js)
  - `/api/categories` → [`categoryRoutes.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/routes/categoryRoutes.js)
  - `/api/auth` → [`authRoutes.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/routes/authRoutes.js)
  - `/api/orders` → [`orderRoutes.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/routes/orderRoutes.js)
  - `/api/bot` → [`botRoutes.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/routes/botRoutes.js)

---

### 4. Middleware Layer

#### A. Authentication & Authorization — [`server/middleware/auth.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/middleware/auth.js)
- `protect`: Extracts JWT from `Authorization: Bearer <token>` header, verifies signature using `jsonwebtoken`, looks up user by `id`, and attaches `req.user`. Returns `401 Unauthorized` if missing/invalid.
- `optionalAuth`: Checks for JWT if provided and populates `req.user`, but allows execution to continue for guest users.

#### B. Centralized Error Handler — [`server/middleware/errorHandler.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/middleware/errorHandler.js)
Catches async/sync errors passed via `next(err)` and formats standardized JSON error responses:
- `CastError`: Returns `404 Not Found` for invalid MongoDB ObjectIds.
- `11000 Duplicate Key Error`: Returns `400 Bad Request` with field name when violating unique indexes (e.g., duplicate email).
- `ValidationError`: Returns `400 Bad Request` listing all schema validation error messages.

---

### 5. API Routes & Controller Logic

#### A. Auth Controller — [`server/controllers/authController.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/controllers/authController.js)
- `POST /api/auth/register`: Validates input, verifies unique email, creates new user with 250 welcome loyalty points, signs JWT, and returns user data + token.
- `POST /api/auth/login`: Checks user existence (`.select('+password')`), verifies password hash, signs JWT, and returns user payload.
- `GET /api/auth/me`: `protect` route returning profile details of current user.
- `PUT /api/auth/profile`: `protect` route allowing updates to name, email, phone, bio, and birthday.

#### B. Product Controller — [`server/controllers/productController.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/controllers/productController.js)
- `GET /api/products`: Supports extensive query parameters:
  - `category`: Filter by category key.
  - `badge`: Filter by badge (e.g. `'Sale'`).
  - `minPrice`/`maxPrice`: Range filtering.
  - `rating`: Minimum rating threshold.
  - `q`: Regex multi-field search (`title`, `brand`, `description`, `category`).
  - `sort`: Ordering options (`price-asc`, `price-desc`, `rating`, `trending`, `newest`).
- `GET /api/products/featured`: Returns featured products (`isFeatured: true`).
- `GET /api/products/deals`: Returns items where `oldPrice > price`.
- `GET /api/products/:id`: Fetches product by custom string `id` or Mongo `_id` and includes up to 4 related category items.
- `POST`, `PUT`, `DELETE` routes for product management.

#### C. Category Controller — [`server/controllers/categoryController.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/controllers/categoryController.js)
- `GET /api/categories`: Fetches all categories and runs a MongoDB `$group` aggregation pipeline on the `Product` collection to dynamically calculate exact real-time product counts per category.

#### D. Order Controller — [`server/controllers/orderController.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/controllers/orderController.js)
- `POST /api/orders`: `optionalAuth` enabled. Creates an order with custom ID format (`ORD-XXXXX`), records customer information and items. If the order is placed by an authenticated user, automatically awards loyalty points (10% of total order value).
- `GET /api/orders`: Returns orders for the authenticated user or queries by guest email.
- `PUT /api/orders/:id/status`: Updates fulfillment status (`Processing` ➔ `Shipped` ➔ `Delivered`).

#### E. AI Assistant & Bot Controller — [`server/controllers/botController.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/server/controllers/botController.js)
- `POST /api/bot/query`: Conversational AI endpoint supporting deals discovery via MongoDB Aggregations (`$expr`, `$addFields`, `$sort`), budget filtering via `$facet`, and procedural guidance via `$text` search on the `HelpGuide` collection. Powered by Google Gemini 1.5 Flash Grounded RAG with automatic native database fallback.
- `GET /api/bot/guides`: Returns all verified procedural knowledge documents.

---

### 6. Frontend Integration Layer — [`src/services/api.js`](file:///c:/Users/Lenovo/Desktop/ICON/W3_React/e-commerce/src/services/api.js)

The client uses an `ApiService` class wrapping the standard `fetch` API:
- **Token Management**: Persists and reads JWT tokens in `localStorage` under key `'shopverse_token'`.
- **Automatic Headers**: Automatically attaches `Authorization: Bearer <token>` to requests when logged in.
- **Base Endpoint**: Connects to `/api` (or custom `VITE_API_URL`).
- Exports helper methods mapping 1-to-1 with backend API endpoints (`getProducts()`, `login()`, `register()`, `createOrder()`, `getMe()`, etc.).