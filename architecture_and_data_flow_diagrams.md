# ShopVerse — Visual Architecture & Data Flow Diagrams

This document presents interactive Mermaid diagrams illustrating each component, database relationship, and data flow pipeline across the ShopVerse application.

---

## 1. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Frontend (React + Vite)"]
        UI["React Pages & UI Components"]
        Ctx["React Context / State (AuthContext, CartContext)"]
        API["ApiService (src/services/api.js)"]
        Storage[("Browser LocalStorage (JWT Token)")]
    end

    subgraph Server ["Backend (Node.js + Express)"]
        ServerEntry["Express App (server/index.js)"]
        MW_Global["Global Middleware (Cors, Morgan, BodyParser)"]
        MW_Auth["Auth Middleware (protect / optionalAuth)"]
        MW_Err["ErrorHandler Middleware (errorHandler.js)"]
        
        subgraph Routers ["API Route Handlers"]
            R_Auth["/api/auth"]
            R_Prod["/api/products"]
            R_Cat["/api/categories"]
            R_Ord["/api/orders"]
            R_Bot["/api/bot"]
        end

        subgraph Controllers ["Business Logic Controllers"]
            C_Auth["authController.js"]
            C_Prod["productController.js"]
            C_Cat["categoryController.js"]
            C_Ord["orderController.js"]
            C_Bot["botController.js"]
        end

        subgraph Services ["External & AI Services"]
            S_Gemini["geminiService.js (Gemini 1.5 Flash RAG)"]
        end

        subgraph Models ["Mongoose Models"]
            M_User["User.js"]
            M_Prod["Product.js"]
            M_Cat["Category.js"]
            M_Ord["Order.js"]
            M_HelpGuide["HelpGuide.js"]
        end
    end

    subgraph ExternalAI ["External AI Services"]
        GeminiAPI[("Google Gemini 1.5 Flash API")]
    end

    subgraph Database ["Database"]
        MongoDB[("MongoDB Database ('shopverse')")]
    end

    %% Client Internal Flow
    UI -->|Triggers Actions / Chat| Ctx
    Ctx -->|Calls| API
    API <-->|Reads / Writes Token| Storage

    %% HTTP Connection
    API -->|HTTP Requests with Bearer Token| ServerEntry
    ServerEntry --> MW_Global
    MW_Global --> Routers

    %% Route to Middleware & Controllers
    R_Auth -->|protect/getMe, updateProfile| MW_Auth
    R_Ord -->|optionalAuth/createOrder| MW_Auth
    MW_Auth --> C_Auth
    MW_Auth --> C_Ord

    R_Auth --> C_Auth
    R_Prod --> C_Prod
    R_Cat --> C_Cat
    R_Ord --> C_Ord
    R_Bot --> C_Bot

    %% Controllers to Services & Models
    C_Auth -->|Bcrypt, JWT, Queries| M_User
    C_Prod -->|Search, Filter, Sort| M_Prod
    C_Cat -->|Aggregate Count| M_Cat
    C_Cat -->|Aggregation Query| M_Prod
    C_Ord -->|Create Order, Loyalty Points| M_Ord
    C_Ord -->|Update User Points| M_User
    C_Bot -->|Aggregation Pipelines / $facet| M_Prod
    C_Bot -->|$text Search / Guides| M_HelpGuide
    C_Bot <-->|RAG Grounding & Intent| S_Gemini
    S_Gemini <-->|REST API Fetch| GeminiAPI

    %% Models to Database
    M_User <--> MongoDB
    M_Prod <--> MongoDB
    M_Cat <--> MongoDB
    M_Ord <--> MongoDB
    M_HelpGuide <--> MongoDB

    %% Error Handling
    Controllers -.->|next(err)| MW_Err
```

---

## 2. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String avatar
        String role
        Number points
        String tier
        String phone
        String bio
        String birthday
        Date createdAt
        Date updatedAt
    }

    PRODUCT {
        ObjectId _id PK
        String id UK
        String title
        String brand
        String category FK
        Number price
        Number oldPrice
        Number rating
        Number reviews
        String badge
        String image
        Array images
        String description
        Array colors
        Array sizes
        Number stock
        Boolean isFeatured
        Date createdAt
    }

    CATEGORY {
        ObjectId _id PK
        String key UK
        String name
        Number count
        String icon
        String color
        Array sub
        String image
        String description
    }

    ORDER {
        ObjectId _id PK
        String id UK
        ObjectId user FK "Nullable for Guests"
        Object customer
        Array items
        Number totalItems
        Number subtotal
        Number shippingFee
        Number tax
        Number total
        String status
        String paymentMethod
        Boolean isPaid
        Date paidAt
        Date createdAt
    }

    HELP_GUIDE {
        ObjectId _id PK
        String key UK
        String title
        String category
        String summary
        Array steps
        Array tags
        Array relatedIntents
        Date createdAt
    }

    USER ||--o{ ORDER : "places"
    CATEGORY ||--o{ PRODUCT : "contains"
    ORDER ||--|{ PRODUCT : "includes items from"
```

---

## 3. User Authentication & JWT Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client App
    participant API as ApiService (Frontend)
    participant AuthRoute as /api/auth Router
    participant AuthCtrl as authController.js
    participant UserModel as User Model (Mongoose)
    participant DB as MongoDB

    %% Login Sequence
    rect rgb(240, 248, 255)
        note right of User: Login Flow
        User->>API: login(email, password)
        API->>AuthRoute: POST /api/auth/login
        AuthRoute->>AuthCtrl: login(req, res)
        AuthCtrl->>UserModel: findOne({ email }).select('+password')
        UserModel->>DB: Query User Document
        DB-->>UserModel: Return User Data with Hashed Password
        AuthCtrl->>UserModel: user.matchPassword(enteredPassword)
        alt Password Match
            AuthCtrl->>UserModel: user.getSignedJwtToken()
            UserModel-->>AuthCtrl: Returns Signed JWT Token
            AuthCtrl-->>API: 200 OK { success: true, token, user }
            API->>API: Store Token in LocalStorage
            API-->>User: Auth Success & User Session Active
        else Password Mismatch / User Not Found
            AuthCtrl-->>API: 401 Unauthorized { success: false, message }
            API-->>User: Display Error Message
        end
    end

    %% Protected Route Request
    rect rgb(245, 255, 250)
        note right of User: Protected Access Flow (e.g. GET /api/auth/me)
        User->>API: getMe()
        API->>AuthRoute: GET /api/auth/me [Header: Bearer <Token>]
        AuthRoute->>AuthRoute: Middleware protect(req, res, next)
        AuthRoute->>AuthRoute: Verify JWT signature & expiration
        AuthRoute->>UserModel: findById(decoded.id)
        UserModel-->>AuthRoute: Attach user object to req.user
        AuthRoute->>AuthCtrl: getMe(req, res)
        AuthCtrl-->>API: 200 OK { success: true, user }
        API-->>User: Profile Data Rendered
    end
```

---

## 4. Product Browsing, Filtering & Aggregation Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend Client
    participant ProdRoute as /api/products Route
    participant CatRoute as /api/categories Route
    participant ProdCtrl as productController.js
    participant CatCtrl as categoryController.js
    participant ProdModel as Product Model
    participant CatModel as Category Model

    %% Search & Filtering Pipeline
    rect rgb(255, 250, 240)
        note right of Client: Search & Filter Request
        Client->>ProdRoute: GET /api/products?category=electronics&q=phone&sort=price-asc
        ProdRoute->>ProdCtrl: getProducts(req, res)
        ProdCtrl->>ProdCtrl: Build MongoDB Query Object:<br/>{ category: 'electronics', $or: [title regex, description regex], price range }
        ProdCtrl->>ProdCtrl: Apply Sort Strategy (.sort({ price: 1 }))
        ProdCtrl->>ProdModel: Product.find(query).sort(...)
        ProdModel-->>ProdCtrl: Array of Matched Products
        ProdCtrl-->>Client: 200 OK { success: true, count, data: products }
    end

    %% Category Aggregation Pipeline
    rect rgb(240, 255, 240)
        note right of Client: Category List with Real-Time Product Count
        Client->>CatRoute: GET /api/categories
        CatRoute->>CatCtrl: getCategories(req, res)
        CatCtrl->>CatModel: Category.find().sort(...)
        CatModel-->>CatCtrl: List of Categories
        CatCtrl->>ProdModel: Product.aggregate([ { $group: { _id: '$category', count: { $sum: 1 } } } ])
        ProdModel-->>CatCtrl: Real-time Category Counts Array
        CatCtrl->>CatCtrl: Enrich Category Objects with Live Product Counts
        CatCtrl-->>Client: 200 OK { success: true, count, data: enrichedCategories }
    end
```

---

## 5. Order Creation & Loyalty Points Checkout Flow

```mermaid
flowchart TD
    Start(["User Clicks Checkout"]) --> BuildPayload["Construct Order Payload (items, customer details, totals)"]
    BuildPayload --> TokenCheck{"Is JWT Token present?"}

    TokenCheck -- Yes --> SetAuthHeader["Attach Authorization Header: Bearer <Token>"]
    TokenCheck -- No --> GuestCheckout["Proceed as Guest User"]

    SetAuthHeader --> SendReq["POST /api/orders"]
    GuestCheckout --> SendReq

    SendReq --> ExpressMW["optionalAuth Middleware"]
    ExpressMW --> VerifyToken{"Token valid?"}
    
    VerifyToken -- Yes --> AttachUser["Set req.user = Authenticated User"]
    VerifyToken -- No / Guest --> SetNullUser["Set req.user = null"]

    AttachUser --> CreateOrderCtrl["orderController.createOrder()"]
    SetNullUser --> CreateOrderCtrl

    CreateOrderCtrl --> GenID["Generate Unique Order ID ('ORD-XXXXX')"]
    GenID --> SaveOrder["Save Order Document to MongoDB"]

    SaveOrder --> CheckAuthUser{"Was req.user attached?"}
    CheckAuthUser -- Yes --> AwardPoints["Calculate Loyalty Points (10% of total order)<br/>Update req.user.points in DB"]
    CheckAuthUser -- No --> SkipPoints["Skip Loyalty Points update"]

    AwardPoints --> Response["Return 201 Created { success: true, data: order }"]
    SkipPoints --> Response

    Response --> UIUpdate["Frontend: Clear Shopping Cart & Navigate to Order Confirmation Page"]
```

---

## 6. Centralized Error Handling Pipeline

```mermaid
flowchart LR
    Request["Incoming Request"] --> Controller["Controller Execution"]
    Controller --> ErrorOccurred{"Error Occurs?"}
    
    ErrorOccurred -- No --> SuccessRes["Send Success Response (200/201)"]
    ErrorOccurred -- Yes --> NextErr["next(err) Passed to Express"]
    
    NextErr --> ErrMW["errorHandler Middleware"]
    
    ErrMW --> Case1{"err.name === 'CastError'?"}
    Case1 -- Yes --> Res1["404 Not Found: Resource not found"]
    Case1 -- No --> Case2{"err.code === 11000?"}
    
    Case2 -- Yes --> Res2["400 Bad Request: Duplicate value entered"]
    Case2 -- No --> Case3{"err.name === 'ValidationError'?"}
    
    Case3 -- Yes --> Res3["400 Bad Request: Schema validation messages"]
    Case3 -- No --> Res4["500 Internal Server Error: Default fallback"]
```

---

## 7. AI Assistant & Google Gemini RAG / Aggregation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer
    participant BotUI as HelpBot (React UI)
    participant BotRoute as /api/bot/query
    participant BotCtrl as botController.js
    participant GeminiSvc as geminiService.js
    participant GeminiAPI as Google Gemini 1.5 Flash
    participant DB as MongoDB (Products & HelpGuides)

    User->>BotUI: Enter Prompt (e.g. "Show deals under 50" or "How to checkout")
    BotUI->>BotRoute: POST /api/bot/query { query }
    BotRoute->>BotCtrl: handleBotQuery(req, res)

    alt Gemini API Key Available
        BotCtrl->>GeminiSvc: extractSearchIntentWithGemini(query)
        GeminiSvc->>GeminiAPI: Prompt: Parse intent, budget, category, procedure key
        GeminiAPI-->>GeminiSvc: Return JSON: { intent, budget, category, searchTerm, procedureKey }
        GeminiSvc-->>BotCtrl: Structured Parameters
    else Native Fallback Mode
        BotCtrl->>BotCtrl: Regex Intent & Parameter Extraction
    end

    alt Intent: Deals
        BotCtrl->>DB: Product.aggregate([ $match, $expr, $addFields (discountPercent), $sort ])
        DB-->>BotCtrl: Highest-discount live product BSON documents
    else Intent: Filter Products
        BotCtrl->>DB: Product.aggregate([ $match (price/category), $facet (results + summaryStats) ])
        DB-->>BotCtrl: Filtered products + price statistics
    else Intent: Procedure / Guide
        BotCtrl->>DB: HelpGuide.findOne({ key }) or $text search
        DB-->>BotCtrl: Step-by-step procedural guide document
    end

    alt Gemini API Key Available (Grounding / RAG)
        BotCtrl->>GeminiSvc: generateGroundedResponseWithGemini(query, products, guide)
        GeminiSvc->>GeminiAPI: Synthesize response using ONLY verified MongoDB BSON context
        GeminiAPI-->>GeminiSvc: Grounded conversational reply
        GeminiSvc-->>BotCtrl: Natural text response
    else Native Response Generation
        BotCtrl->>BotCtrl: Construct template response with dynamic database metrics
    end

    BotCtrl-->>BotUI: 200 OK { success: true, reply, products, guide, suggestedActions, aiProvider }
    BotUI-->>User: Renders personalized response + Interactive Product Cards + Action Buttons
```
