# MoneyWise — Personal Expense Tracker

A fullstack MERN (MongoDB, Express.js, React, Node.js) web application designed for recording daily income and expenses, categorizing them, and analyzing financial cashflow through server-side aggregations and interactive analytics.

Developed as a college mini-project for fullstack evaluation (Modules 1 through 6).

---

## 1. Problem Statement

Managing personal finances is challenging without clear categorization, dynamic calculations, and intuitive visual trends. Spreadsheets often require tedious manual calculation, while many commercial tools are overly complex. **MoneyWise** solves this problem by providing a streamlined, responsive personal finance dashboard that computes live balances, summarizes monthly inflows and outflows directly from a database, and generates visual spending breakdowns.

---

## 2. Objectives

- **Transaction Management**: Provide a complete CRUD interface to add, view, edit, and delete income and expense transactions.
- **Server-Side Aggregations**: Leverage MongoDB native aggregation pipelines (`$match`, `$group`, `$sum`, `$cond`) to compute accurate balances and category totals on the database engine.
- **Visual Spending Analytics**: Visualize category-wise expense distributions (Donut Chart) and multi-month cashflow trends (Bar Chart) using Recharts.
- **Data Integrity & Validation**: Validate records on both client and server layers to reject invalid or negative values.
- **Accessibility & Customization**: Support instant Light and Dark mode switching, data export (CSV/JSON), and full responsiveness across devices.

---

## 3. Implemented Features

- **Dynamic Financial Summary Cards**: Real-time display of *Current Balance*, *Total Income*, *Total Expenses*, and *Total Transactions* for the selected calendar month.
- **Complete REST CRUD Operations**:
  - Modal form for creating and updating transactions.
  - Delete modal with explicit user confirmation.
  - Sorting transactions chronologically (newest first).
- **Interactive Calendar Month Filtering**: Seamlessly jump to any calendar month; cards, tables, and charts update in real time.
- **Visual Analytics Page**:
  - **Expenses by Category**: Donut chart displaying percentage and INR amount per category.
  - **6-Month Cashflow Trend**: Bar chart comparing historical monthly income vs expenses.
  - **Textual Insights**: Factual natural-language summary generated from database values.
- **Zero-State Handling**: Clear guidance and contextual banners when viewing months with no transactions.
- **Dark / Light Theme Toggle**: Seamless switch between light and dark themes with persistent storage in `localStorage`.
- **Data Backup & Export**: One-click download of transactions in both CSV and JSON formats from the Settings tab.
- **System Health Diagnostics**: Live API health and MongoDB connectivity status monitor in the Settings tab.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18** (Vite) | Declarative component-based user interface with rapid HMR |
| **Styling** | **Plain CSS** (CSS Variables) | Lightweight, clean styling with token-based dark mode support |
| **Icons** | **Lucide React** | Clean, accessible SVG iconography |
| **Visualizations** | **Recharts** | Responsive SVG charts (Donut Chart and Bar Chart) |
| **Backend Server**| **Node.js + Express.js** | Modular REST API server with JSON middleware and CORS |
| **Database** | **MongoDB + Mongoose** | NoSQL document database with schema validation and aggregation pipelines |
| **Communication** | **Fetch API** | Standardized asynchronous HTTP requests with unified error handling |

---

## 5. System Architecture & Data Flow

```
+-------------------------------------------------------------+
|                      React 18 Frontend                      |
| (Dashboard / RecentTransactions / Analytics / Settings)    |
+-------------------------------------------------------------+
                              |
               HTTP REST Requests (JSON)
               via Fetch API (api.js)
                              |
                              v
+-------------------------------------------------------------+
|                    Express.js REST API                      |
|                      (Port 5000)                            |
|  - CORS & JSON Body Parser Middleware                       |
|  - Controller Validation & Error Handling                   |
+-------------------------------------------------------------+
                              |
                     Mongoose ODM
                              |
                              v
+-------------------------------------------------------------+
|                   MongoDB Database Engine                   |
|                   (MoneyWise_db : 27017)                    |
|  - Native Aggregation Pipelines ($match, $group, $sum)      |
|  - Timestamped Documents Collection (transactions)          |
+-------------------------------------------------------------+
```

---

## 6. Project Folder Structure

```
Fullstack_Review2/
├── .env                     # Frontend environment variables
├── .env.example             # Frontend environment template
├── .gitignore               # Excludes node_modules and .env files
├── index.html               # Main HTML entry point
├── package.json             # Frontend dependencies & scripts
├── vite.config.js           # Vite build configuration
├── backend/
│   ├── .env                 # Backend database & port configuration
│   ├── .env.example         # Backend environment template
│   ├── package.json         # Backend dependencies & scripts
│   ├── server.js            # Express application entry point
│   ├── config/
│   │   └── db.js            # Mongoose connection handler
│   ├── controllers/
│   │   └── transactionController.js  # CRUD & aggregation business logic
│   ├── models/
│   │   └── Transaction.js   # Mongoose document schema & constraints
│   └── routes/
│       └── transactionRoutes.js      # REST API route declarations
└── src/
    ├── App.css              # Main layout & notification banner styles
    ├── App.jsx              # Root component & central state management
    ├── index.css            # Base typography & CSS design tokens
    ├── main.jsx             # React DOM root render
    ├── components/
    │   ├── Analytics.css    # Analytics layout & chart card styles
    │   ├── Analytics.jsx    # Category donut & 6-month bar charts
    │   ├── Header.css       # Header, month selector & theme toggle styles
    │   ├── Header.jsx       # Top navigation header
    │   ├── RecentTransactions.css # Table & delete dialog styles
    │   ├── RecentTransactions.jsx # Transaction table with edit/delete actions
    │   ├── Settings.css     # Settings layout & backup box styles
    │   ├── Settings.jsx     # Profile, theme, export & health diagnostics
    │   ├── Sidebar.css      # Sidebar drawer & brand styles
    │   ├── Sidebar.jsx      # Primary sidebar navigation
    │   ├── SummaryCards.css # Financial metric card styles
    │   ├── SummaryCards.jsx # 4 dynamic monthly metric cards
    │   ├── TransactionModal.css # Add/edit transaction form styles
    │   └── TransactionModal.jsx # Controlled form modal with validation
    └── services/
        └── api.js           # Centralized Fetch API client helper
```

---

## 7. MongoDB Configuration

The application is configured to connect to a local MongoDB instance by default, but can easily point to MongoDB Atlas.

In `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/MoneyWise_db
CLIENT_URL=http://localhost:5173
```

To use **MongoDB Atlas**, update `MONGO_URI`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/MoneyWise_db?retryWrites=true&w=majority
```

---

## 8. Installation & Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB running locally or a MongoDB Atlas connection string

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Start the Backend Server
```bash
cd backend
npm run dev
# Or: node server.js
```
The backend API starts on **`http://localhost:5000`**.

### Step 3: Start the Frontend Application
Open a new terminal window:
```bash
npm run dev
```
The React application starts on **`http://localhost:5173`**.

---

## 9. REST API Endpoints

| Endpoint | Method | Description | Request Query / Body |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and server status | None |
| `/api/transactions` | `GET` | Retrieve transactions filtered by month | `?month=YYYY-MM&limit=N` |
| `/api/transactions` | `POST` | Create a new transaction | JSON transaction payload |
| `/api/transactions/:id`| `PUT` | Update an existing transaction | JSON transaction payload |
| `/api/transactions/:id`| `DELETE` | Delete a transaction | None (requires valid ID param) |
| `/api/transactions/summary` | `GET` | Monthly totals via MongoDB aggregation | `?month=YYYY-MM` |
| `/api/transactions/analytics` | `GET` | Category breakdown & 6-month trend | `?month=YYYY-MM` |

---

## 10. Example JSON Request

### POST /api/transactions
```json
{
  "title": "Monthly Groceries & Supplies",
  "amount": 4200.50,
  "type": "expense",
  "category": "Groceries",
  "date": "2026-10-15",
  "paymentMethod": "UPI",
  "note": "Supermarket purchases"
}
```

### Response (HTTP 201 Created)
```json
{
  "_id": "670e87d890abcdef12345678",
  "title": "Monthly Groceries & Supplies",
  "amount": 4200.5,
  "type": "expense",
  "category": "Groceries",
  "date": "2026-10-15T00:00:00.000Z",
  "paymentMethod": "UPI",
  "note": "Supermarket purchases",
  "createdAt": "2026-10-15T11:50:00.000Z",
  "updatedAt": "2026-10-15T11:50:00.000Z"
}
```

---

## 11. Testing Instructions

### Automated Integration Test Suite
An automated verification test script tests all endpoints, Mongoose schema validations, aggregation pipelines, and CRUD flows:

```bash
node "scratch/run_full_verification.cjs"
```
Output:
```
=====================================================
 RESULTS: 36 PASSED, 0 FAILED
=====================================================
```

### Manual Verification Checklist
1. Open `http://localhost:5173/`.
2. Click **Add Transaction** and enter an income transaction (e.g. Salary ₹30,000). Confirm it appears in the table.
3. Add an expense (e.g. Groceries ₹3,500). Verify the **Current Balance** card updates to `₹26,500.00`.
4. Click the **Edit** icon on a transaction, change the amount, and confirm the updated value in the table and summary cards.
5. Click the **Delete** icon, confirm the prompt, and verify the transaction is removed.
6. Toggle between **Light Mode** and **Dark Mode** via the Sun/Moon button in the header.
7. Navigate to **Analytics** and inspect the Category Donut chart and 6-Month Cashflow trend.
8. Navigate to **Settings** and test the **Export CSV** and **Export JSON** backup buttons.

---

## 12. Current Limitations & Future Enhancements

- **Single-User Scope**: Current version is designed for single-user expense tracking without multi-user authentication. (Future enhancement: JWT authentication & user accounts).
- **Manual Recurring Entries**: Fixed recurring bills (e.g. monthly subscriptions) must currently be entered each month. (Future enhancement: automated recurring transactions cron).
- **Receipt Attachment**: Transactions currently store notes; image receipt uploads can be added via Cloudinary or AWS S3.
