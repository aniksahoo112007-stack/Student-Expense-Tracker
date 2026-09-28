# 💸 SpendWise — Smart Teen Expense Tracker

A modern, full-stack personal finance management application designed for teenagers and students. Built with React, Node.js, Express, and Supabase PostgreSQL.

![SpendWise](https://img.shields.io/badge/SpendWise-v1.0-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square)

---

## ✨ Features

### Core
- 📊 **Financial Dashboard** — Real-time overview of income, expenses, savings, and trends
- 💳 **Expense Management** — Full CRUD with search, filter, sort, and pagination
- 📈 **Interactive Analytics** — 6 chart types (line, bar, donut, area, pie) powered by Recharts
- 💰 **Budget Management** — Per-category monthly budgets with progress tracking and alerts
- 🎯 **Savings Goals** — Track progress toward financial targets
- 💡 **Smart Insights** — Data-driven financial advice based on actual spending patterns
- 📅 **Spending Calendar** — Visual calendar showing daily expense intensity
- 📋 **Monthly Reports** — Detailed monthly financial summaries
- 🧮 **Savings Simulator** — "What If I Save?" calculator

### Technical
- 🔐 **JWT Authentication** — Secure login/register with bcrypt password hashing
- 🌓 **Dark/Light/System Theme** — Persisted theme preference
- 📱 **Fully Responsive** — Desktop sidebar + mobile bottom nav
- 🎨 **Premium Fintech UI** — Gradients, glassmorphism, micro-animations
- ⚡ **Lazy Loading** — Code-split pages for fast initial load
- 🛡️ **Security** — Helmet, CORS, rate limiting, input validation/sanitization
- 🏗️ **MVC Architecture** — Clean separation of concerns

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Recharts, Tailwind CSS v4, Lucide Icons |
| Backend | Node.js, Express.js, REST API |
| Database | Supabase (PostgreSQL) |
| Auth | bcrypt + JWT |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
expense-tracker/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers (Auth, Theme, Toast)
│   │   ├── constants/      # Categories, payment methods, colors
│   │   ├── layouts/        # MainLayout with sidebar + mobile nav
│   │   ├── pages/          # Route-level page components
│   │   ├── services/       # API service layer (Axios)
│   │   ├── utils/          # Formatters, validators
│   │   ├── App.jsx         # Routes + guards
│   │   └── main.jsx        # Entry point
│   ├── .env.example
│   └── vite.config.js
│
└── backend/                # Express API server
    ├── config/             # Supabase client
    ├── controllers/        # Route handlers (auth, expense, budget, etc.)
    ├── middleware/          # Auth, error, validation middleware
    ├── models/             # Data access layer (Supabase queries)
    ├── routes/             # Express route definitions
    ├── utils/              # Helper functions
    ├── schema.sql          # Database schema
    ├── app.js              # Express app configuration
    ├── server.js           # Server entry point
    └── .env.example
```

---

## 🗃️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with hashed passwords |
| `expenses` | Individual expense records |
| `budgets` | Monthly category budgets |
| `saving_goals` | Savings targets with progress |

### Key Design Decisions
- UUID primary keys for security
- Foreign key constraints with `ON DELETE CASCADE`
- Composite unique index on `budgets(user_id, category, month, year)`
- Row Level Security enabled
- All queries filter by `user_id` to prevent cross-user access

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase account ([supabase.com](https://supabase.com))

### 1. Supabase Setup

1. Create a new Supabase project
2. Go to **SQL Editor**
3. Run the contents of `backend/schema.sql`
4. Go to **Settings → API** and copy:
   - Project URL
   - Service Role Key (⚠️ keep secret!)

### 2. Backend Setup

```bash
cd expense-tracker/backend

# Copy env template
cp .env.example .env

# Fill in your Supabase credentials and JWT secret
# Edit .env with your values

# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd expense-tracker/frontend

# Copy env template (optional - defaults work with proxy)
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

**Backend `.env`:**
```
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_random_secure_secret_minimum_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend `.env`:**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List (with filter/sort/search/pagination) |
| GET | `/api/expenses/:id` | Get single expense |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/date/:date` | Get by date |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Dashboard overview |
| GET | `/api/dashboard/category-breakdown` | Category chart data |
| GET | `/api/dashboard/monthly-trend` | Monthly line chart data |
| GET | `/api/dashboard/weekly-spending` | Weekly bar chart data |
| GET | `/api/dashboard/needs-vs-wants` | Needs vs wants split |
| GET | `/api/dashboard/calendar/:year/:month` | Calendar view data |
| GET | `/api/dashboard/monthly-report` | Monthly report |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List with spending data |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

### Savings Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List all goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

### Insights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights` | Smart insights + health score |

---

## 🔒 Security

- **Passwords**: Hashed with bcrypt (12 salt rounds)
- **Authentication**: JWT tokens with expiration
- **Authorization**: All data queries filtered by authenticated user's ID from JWT
- **Validation**: Frontend + backend input validation
- **Sanitization**: HTML/XSS prevention on text inputs
- **Rate Limiting**: 200 req/15min (general), 20 req/15min (auth)
- **Security Headers**: Helmet.js
- **CORS**: Configured to allow only frontend origin
- **Environment**: All secrets in env variables, never committed

---

## 🎨 Design System

- **Font**: Inter (Google Fonts)
- **Colors**: Indigo primary (#6366f1), with green/red/amber semantic colors
- **Gradients**: 4 gradient themes (primary, success, warning, danger)
- **Dark Mode**: CSS custom properties with `data-theme` attribute
- **Components**: Card, Modal, Toast, Skeleton, Badge, Progress Bar, Category Tag
- **Responsive**: Desktop sidebar → Mobile bottom nav at 1024px breakpoint

---

## 📦 Deployment

### Backend (e.g., Railway, Render)
```bash
cd backend
npm start
```

### Frontend (e.g., Vercel, Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

Set `VITE_API_BASE_URL` to your deployed backend URL.

---

## ✅ Testing Checklist

- [x] Register with valid/invalid data
- [x] Login with correct/wrong credentials
- [x] Protected route redirect
- [x] Add/edit/delete expenses
- [x] Search and filter expenses
- [x] Dashboard data accuracy
- [x] Charts rendering with data
- [x] Budget creation and alerts
- [x] Savings goal progress
- [x] Insights generation
- [x] Calendar visualization
- [x] Monthly report
- [x] Theme persistence
- [x] Mobile responsiveness
- [x] User data isolation

---

## 📄 License

MIT License

---

Built with ❤️ as a modern fintech experience for the next generation of savers.
