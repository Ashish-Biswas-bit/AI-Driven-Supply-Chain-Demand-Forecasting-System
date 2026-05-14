"""
AI-Driven Supply Chain & Demand Forecasting System
FastAPI Backend — main.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import random

from models.database import init_db, SessionLocal, Product, Inventory, SaleRecord
from routers import products, sales, forecasts, alerts, dashboard, data_import


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    _seed_demo_data()
    yield


def _seed_demo_data():
    """Populate DB with realistic demo data on first run."""
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            return  # Already seeded

        # Demo products
        product_data = [
            ("Laptop Pro X1", "LAP-001", "Electronics", 899.99, 20, 40),
            ("Wireless Earbuds", "EAR-002", "Electronics", 49.99, 40, 80),
            ("Summer Jacket", "JAC-003", "Apparel", 79.99, 15, 30),
            ("Running Shoes", "SHO-004", "Apparel", 129.99, 30, 60),
            ("Garden Hose Set", "GAR-005", "Home & Garden", 34.99, 10, 25),
            ("Smart Thermostat", "THM-006", "Electronics", 199.99, 25, 50),
            ("Bluetooth Speaker", "SPK-007", "Electronics", 59.99, 20, 40),
            ("Yoga Mat", "YOG-008", "Sports", 29.99, 15, 30),
        ]

        products = []
        for name, sku, cat, price, safety, reorder in product_data:
            p = Product(
                name=name, sku=sku, category=cat,
                unit_price=price, safety_stock=safety,
                reorder_point=reorder, lead_time_days=14,
            )
            db.add(p)
            db.flush()

            stock_qty = random.choice([3, 8, 42, 88, 135, 210, 340])
            inv = Inventory(
                product_id=p.id,
                current_stock=stock_qty,
                warehouse_location=f"Warehouse-{random.choice(['A','B','C'])}-{random.randint(1,20)}",
                last_restocked=datetime.utcnow() - timedelta(days=random.randint(5, 30)),
            )
            db.add(inv)
            products.append(p)

        db.flush()

        # Generate 18 months of sales history
        random.seed(42)
        for p in products:
            base_demand = random.randint(3, 15)
            for day_offset in range(540):
                date = datetime.utcnow() - timedelta(days=540 - day_offset)
                # Seasonality: more in summer (June-Aug) and holidays (Nov-Dec)
                month = date.month
                seasonal = 1.0
                if month in (6, 7, 8):
                    seasonal = 1.4
                elif month in (11, 12):
                    seasonal = 1.6
                elif month in (1, 2):
                    seasonal = 0.7

                # Random daily sales (not every day)
                if random.random() < 0.65:
                    qty = max(1, int(random.gauss(base_demand * seasonal, 2)))
                    sale = SaleRecord(
                        product_id=p.id,
                        quantity=qty,
                        unit_price=p.unit_price,
                        total_amount=p.unit_price * qty,
                        sale_date=date,
                        channel=random.choice(["online", "retail", "wholesale"]),
                    )
                    db.add(sale)

        db.commit()
        print("Demo data seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seeding skipped or failed: {e}")
    finally:
        db.close()


app = FastAPI(
    title="AI Supply Chain & Demand Forecasting API",
    description="Intelligent inventory management with AI-powered demand forecasting.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(sales.router)
app.include_router(forecasts.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)
app.include_router(data_import.router)


@app.get("/")
def root():
    return {
        "project": "AI-Driven Supply Chain & Demand Forecasting System",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
