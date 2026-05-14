from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from models.database import get_db, Product, Inventory, SaleRecord, Alert, Forecast

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
):
    total_products = db.query(Product).count()

    # Stock value
    inv_rows = (
        db.query(Inventory.current_stock, Product.unit_price)
        .join(Product, Product.id == Inventory.product_id)
        .all()
    )
    total_stock_value = sum(row.current_stock * row.unit_price for row in inv_rows)

    # Alerts
    active_alerts = db.query(Alert).filter(Alert.is_resolved == False).count()
    critical_alerts = (
        db.query(Alert)
        .filter(Alert.is_resolved == False, Alert.severity == "critical")
        .count()
    )

    # Revenue last 30 days
    cutoff_30 = datetime.utcnow() - timedelta(days=30)
    revenue_30 = (
        db.query(func.sum(SaleRecord.total_amount))
        .filter(SaleRecord.sale_date >= cutoff_30)
        .scalar()
        or 0.0
    )

    # Forecast accuracy (avg confidence)
    avg_accuracy = (
        db.query(func.avg(Forecast.confidence)).scalar() or 0.0
    )

    # Monthly sales for chart (all available history)
    monthly_rows = (
        db.query(SaleRecord)
        .order_by(SaleRecord.sale_date.desc())
        .limit(5000)
        .all()
    )
    monthly: dict = {}
    for s in monthly_rows:
        key = s.sale_date.strftime("%Y-%m")
        if key not in monthly:
            monthly[key] = {"month": key, "units": 0, "revenue": 0.0}
        monthly[key]["units"] += s.quantity
        monthly[key]["revenue"] += round(s.total_amount, 2)
    monthly_sales = sorted(monthly.values(), key=lambda x: x["month"])

    # Category breakdown
    cat_rows = (
        db.query(Product.category, func.count(Product.id).label("count"))
        .group_by(Product.category)
        .all()
    )
    categories = [{"category": r.category, "count": r.count} for r in cat_rows]

    # Low stock products
    low_stock = (
        db.query(Product, Inventory)
        .join(Inventory, Inventory.product_id == Product.id)
        .filter(Inventory.current_stock <= Product.safety_stock)
        .all()
    )
    low_stock_list = [
        {
            "product_id": p.id,
            "name": p.name,
            "sku": p.sku,
            "current_stock": inv.current_stock,
            "safety_stock": p.safety_stock,
        }
        for p, inv in low_stock
    ]

    return {
        "total_products": total_products,
        "total_stock_value": round(total_stock_value, 2),
        "active_alerts": active_alerts,
        "critical_alerts": critical_alerts,
        "forecast_accuracy": round(avg_accuracy * 100, 1),
        "revenue_last_30d": round(revenue_30, 2),
        "top_categories": categories,
        "monthly_sales": monthly_sales,
        "low_stock_products": low_stock_list,
    }
