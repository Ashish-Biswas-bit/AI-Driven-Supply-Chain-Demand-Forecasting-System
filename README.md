# AI-Driven Supply Chain & Demand Forecasting System

A full-stack web application for intelligent inventory management and demand forecasting using AI/ML. Features automated alerts, sales tracking, data import, and AI-powered demand predictions.

## Features

- **Dashboard** - Real-time KPIs, monthly sales charts, inventory overview
- **Inventory Management** - Product tracking with safety stock and reorder points
- **Sales Tracking** - Record sales with automatic stock deduction
- **AI Forecasting** - Facebook Prophet/Linear regression demand predictions
- **Automated Alerts** - Stockout, overstock, and reorder notifications
- **Data Import** - CSV/Excel upload with full data replacement
- **Multi-database** - SQLite for local dev, Supabase PostgreSQL for production

## Project Structure

```
supply-chain/
├── backend/              # Python FastAPI backend
│   ├── main.py           # App entry point
│   ├── routers/          # API route handlers
│   ├── models/           # Pydantic & DB models
│   ├── services/         # Business logic & auth
│   ├── ml/               # AI forecasting engine
│   ├── import_data.py    # CSV/Excel data importer
│   └── requirements.txt
├── frontend/             # React + Next.js frontend
│   ├── src/
│   │   ├── pages/        # Next.js pages (dashboard, sales, alerts, forecast)
│   │   ├── components/   # Reusable UI components
│   │   ├── utils/        # API client & Supabase helpers
│   │   └── utils/supabase/  # SSR auth middleware
│   ├── package.json
│   └── tailwind.config.js
└── data/
    └── sample_dataset_500.csv  # 500-row test dataset
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3001 (Next.js will use 3001 if 3000 is taken)

### Default Login
- Email: `admin@demo.com`
- Password: `password123`

## API Docs
Once backend is running: http://localhost:8000/docs

## Database Setup (Supabase)

To persist data across reloads and enable multi-user access, use **Supabase PostgreSQL**:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and choose your organization
3. Enter a project name and secure database password
4. Wait for the project to be created (~2 minutes)

### 2. Get Connection Details
1. In your Supabase dashboard, go to **Settings > Database**
2. Find "Connection string" and select **URI** tab
3. Copy the connection string (format: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

### 3. Configure Backend
1. Open `backend/.env`
2. Replace `DATABASE_URL` with your Supabase connection string:
   ```
   DATABASE_URL=postgresql://postgres:your-password@db.xxxxxxxxx.supabase.co:5432/postgres
   ```
3. (Optional) Add Supabase credentials:
   ```
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

### 4. Initialize Database
The tables will be created automatically when you start the backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Switching Back to SQLite
For local development without internet, use SQLite:
```
DATABASE_URL=sqlite:///./supply_chain.db
```

## Data Import

Upload CSV or Excel files via the Import Data page. The import will:
- **Delete all existing data** (products, inventory, sales, forecasts, alerts)
- Create new products from the import
- Record sales transactions
- Set inventory levels

### CSV Format
```csv
product_id,product_name,category,sku,unit_price,quantity,total,date,channel,current_stock,safety_stock,reorder_point,lead_time_days,warehouse_location
1001,Wireless Mouse,Electronics,WM-001,29.99,5,149.95,2025-09-01,online,150,20,50,7,Warehouse-A-12
```

### Sample Dataset
A 500-row test dataset is included at `data/sample_dataset_500.csv`:
- **50 products** across 5 categories (Electronics, Sports, Furniture, Appliances, Apparel)
- **Date range**: September 2025 - May 2026 (~8 months)
- **Sales channels**: online, retail, wholesale

## Tech Stack
- **Frontend**: React 18, Next.js 14, Tailwind CSS, Recharts, Lucide icons
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Pandas
- **AI/ML**: Facebook Prophet, Scikit-learn (linear regression fallback)
- **Database**: SQLite (local dev) / Supabase PostgreSQL (production)
- **Auth**: JWT tokens with cookie-based sessions
- **Deploy**: Vercel (frontend), Railway/Render (backend)
