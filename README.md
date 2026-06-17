# AI-Driven Supply Chain & Demand Forecasting System

A full-stack supply chain application for inventory monitoring, demand forecasting, alerts, sales tracking, and subscription management.

## Features

- **Dashboard** with KPIs, stock summaries, sales charts, and forecast accuracy
- **Inventory management** with product details, safety stock, reorder point, and warehouse tracking
- **Sales recording** with stock deduction and monthly summaries
- **Demand forecasting** powered by Prophet, with a regression fallback and optional AI insights
- **Alerts** for stockout risk, reorder recommendations, and overstock conditions
- **AI Chatbot Assistant** powered by **Ollama (Nemotron-3 Super)** to analyze uploaded datasets, answer inventory sales questions, and provide deep data insights
- **Data import** from CSV or Excel to refresh the dataset
- **Authentication** using JWT tokens and protected frontend routes
- **Subscription plans** — weekly, monthly, yearly — with free trial management
- **PostgreSQL backend** for production-ready storage

## Tech Stack

- **Frontend**: React 18.3.1, Next.js 14.2.3, Tailwind CSS 3.4.1, Axios 1.7.2, Recharts 2.12.7
- **Backend**: Python 3.10+, FastAPI 0.111.0, SQLAlchemy 2.0.30, PostgreSQL (with SQLite fallback for development), Pydantic 2.7.1
- **Data/ML**: Pandas 2.2.2, Prophet 1.1.5, Scikit-learn 1.4.2, NumPy 1.26.4
- **Auth**: JWT tokens with bcrypt password hashing (using python-jose and passlib[bcrypt])
- **Optional AI**: OpenAI GPT for forecast insights, Ollama (Nemotron-3 Super) for AI Chatbot Assistant
- **Additional**: Python-dotenv for environment variables, Python-multipart for file uploads, OpenPyXL for Excel support

## Repository Structure

```
supply-chain/
├── backend/                  # Python FastAPI backend
│   ├── main.py               # App entry point, CORS, demo data seeding
│   ├── routers/              # API route handlers (auth, products, sales, etc.)
│   ├── models/               # SQLAlchemy models + Pydantic schemas
│   │   ├── database.py       # Engine, models, table init
│   │   └── schemas.py        # Request/response validation
│   ├── services/             # Business logic (auth, alerts)
│   ├── ml/                   # Forecasting engine (Prophet + fallback regression)
│   ├── import_data.py        # CSV/Excel data import
│   └── requirements.txt
├── frontend/                 # React + Next.js frontend
│   ├── src/
│   │   ├── pages/            # UI pages (dashboard, login, signup, subscribe, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # React hooks (useAuth)
│   │   ├── utils/            # API client, Supabase helpers
│   │   └── middleware.ts     # Next.js route protection
│   ├── package.json
│   └── tailwind.config.js
└── data/
    └── sample_dataset_500.csv  # Example dataset
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (for production) or SQLite (for local development)

### Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```powershell
   cd backend
   ```
2. Create and activate the Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\activate
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Create `backend/.env` from `.env.example` and configure the database:

   ```env
   # For PostgreSQL (production):
   DATABASE_URL=postgresql://<db_user>:<db_password>@<db_host>:5432/<db_name>

   # For SQLite (local development):
   # DATABASE_URL=sqlite:///./supply_chain.db

   SECRET_KEY=your-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   OPENAI_API_KEY=your-openai-api-key
   ```

5. Start the backend:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
   The server will initialize database tables and seed demo data on first startup.

### Frontend Setup

1. Open a terminal and navigate to the frontend folder:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Configure frontend runtime variables in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the frontend:
   ```powershell
   npm run dev
   ```
5. Open the application in the browser:
   - `http://localhost:3000`
   - or `http://localhost:3001` if `3000` is already taken

### Default Demo User

- Email: `admin@demo.com`
- Password: `password123`

## Backend Details

### Key Files

| File                         | Purpose                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `backend/main.py`            | App assembly, CORS configuration, lifespan event (init db + seed data), router registration                              |
| `backend/models/database.py` | SQLAlchemy engine configuration (auto-detects SQLite vs PostgreSQL), all ORM models, `init_db()`                         |
| `backend/models/schemas.py`  | Pydantic request/response models for all API endpoints                                                                   |
| `backend/services/auth.py`   | `hash_password()`, `verify_password()`, `create_access_token()`, `get_current_user()` dependency, `require_role()` guard |
| `backend/services/alerts.py` | Alert evaluation logic — stockout risk, reorder recommendations, overstock detection                                     |
| `backend/ml/forecasting.py`  | Forecasting engine using Prophet with linear regression fallback; optional OpenAI insight generation                     |
| `backend/import_data.py`     | Generic CSV/Excel import with flexible column name normalization                                                         |

### Database Models

- **`User`** — system users, hashed password, role, subscription plan/status/expiry, trial end date
- **`Product`** — product catalog, SKU, pricing, safety stock, reorder point, lead time
- **`Inventory`** — 1:1 with product, current stock level, warehouse location, last restocked date
- **`SaleRecord`** — sales transactions, quantity, price, channel (online/retail/wholesale), sale date
- **`Forecast`** — predicted demand with period, lower/upper bounds, confidence, model metadata
- **`Alert`** — alerts for stockouts, reorder needs, and overstock with severity and resolution status

### API Endpoints

#### Authentication

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login and receive JWT
- `GET /api/auth/me` — current user profile
- `PUT /api/auth/subscription?plan=` — update subscription plan

#### Products

- `GET /api/products` — list products
- `POST /api/products` — create product
- `GET /api/products/{product_id}` — fetch product
- `PUT /api/products/{product_id}` — update product
- `DELETE /api/products/{product_id}` — delete product
- `GET /api/products/{product_id}/inventory` — get inventory
- `PUT /api/products/{product_id}/inventory` — update inventory

#### Sales

- `GET /api/sales` — list recent sales
- `POST /api/sales` — record sale and deduct stock
- `GET /api/sales/summary/monthly` — monthly sales aggregation

#### Forecasting

- `POST /api/forecasts/generate` — generate demand forecast for a product
- `GET /api/forecasts/{product_id}/latest` — latest stored forecast

#### Alerts

- `GET /api/alerts` — list alerts
- `POST /api/alerts/run-check` — run alert evaluation for all products
- `PUT /api/alerts/{alert_id}/resolve` — mark alert resolved

#### Dashboard

- `GET /api/dashboard/stats` — summary KPIs for the dashboard

#### Data Import

- `POST /api/import-data` — upload CSV/Excel dataset (replaces existing data)

## Environment Variables

### Backend (`backend/.env`)

- `DATABASE_URL` — PostgreSQL connection URL (e.g., Supabase connection string)
- `SECRET_KEY` — JWT signing key (generate a strong random key for production)
- `ALGORITHM` — JWT algorithm (`HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES` — token expiry window (default: 60)
- `OPENAI_API_KEY` — optional OpenAI key for AI-generated forecast insights

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL` — backend base URL (default: `http://localhost:8000`)
- `NEXT_PUBLIC_SUPABASE_URL` — optional Supabase project URL (for Supabase client features)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — optional Supabase anon key

## Frontend Details

### Key Files

| File                             | Purpose                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `frontend/src/utils/api.ts`      | Axios client, JWT token attachment, auto-redirect on 401, API wrapper functions                                  |
| `frontend/src/hooks/useAuth.tsx` | Auth context provider, login/logout, token validation via `/api/auth/me`                                         |
| `frontend/src/middleware.ts`     | Next.js middleware — allows public pages (`/`, `/login`, `/signup`, `/subscribe`), protects authenticated routes |

### Pages

- **`/`** — Splash/Landing page
- **`/login`** — User login
- **`/signup`** — User registration with subscription plan selection
- **`/subscribe`** — Subscription plan picker (weekly/monthly/yearly)
- **`/dashboard`** — Main dashboard with KPIs and charts
- **`/products`** — Product management
- **`/sales`** — Sales recording and history
- **`/forecast`** — Demand forecasting
- **`/alerts`** — Alert management
- **`/import-data`** — Data import (CSV/Excel)

### Auth Flow

1. User registers at `/signup` with name, email, password, and selected subscription plan
2. Backend creates user with subscription plan, trial period, and returns JWT
3. Frontend stores JWT in `localStorage` and a cookie (`sc_access_token`)
4. `/api/auth/me` validates the token on page load via `useAuth` hook
5. `middleware.ts` checks for the auth cookie on protected routes

## Forecasting

The forecasting engine (`backend/ml/forecasting.py`):

1. Converts sale records into a daily time series (fills missing dates with zeros)
2. Attempts Prophet forecasting first
3. Falls back to linear regression when Prophet or sufficient data is unavailable
4. If `OPENAI_API_KEY` is configured, generates a short AI-generated insight for each forecast

## Data Import Notes

- Supports `.csv`, `.xls`, and `.xlsx` uploads
- Normalizes column names (accepts flexible field names for product, quantity, price, date, channel)
- Existing products, inventory, sales, forecasts, and alerts are **replaced** during import
- Creates or updates products and inventory records; imports sales rows attached to a demo admin user

## Troubleshooting

### Backend fails to start

- Ensure `DATABASE_URL` is set in `backend/.env` with valid credentials
- The backend rejects placeholder URLs (e.g., `user:password@localhost`)
- For Supabase: use the full connection string from Project Settings → Database → URI

### Frontend `ERR_CONNECTION_REFUSED`

- Verify the backend is running and healthy at `http://localhost:8000`
- Check `frontend/.env.local` has the correct `NEXT_PUBLIC_API_URL`
- Ensure the backend process isn't failing on startup (check terminal output)

### Missing dependencies

- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

## Notes

- The application supports both PostgreSQL (for production) and SQLite (for local development). Set `DATABASE_URL` in `backend/.env` accordingly:
  - PostgreSQL: `postgresql://<user>:<password>@<host>:5432/<database>`
  - SQLite: `sqlite:///./supply_chain.db`
- For Supabase: use the full Pooler connection string from Project Settings → Database → URI (not the anon public key).
- The current data import process replaces all existing product, inventory, sales, forecast, and alert data.
