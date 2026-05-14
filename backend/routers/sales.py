from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from models.database import get_db, SaleRecord, Product, Inventory
from models.schemas import SaleCreate, SaleOut
from services.alerts import check_and_generate_alerts

router = APIRouter(prefix="/api/sales", tags=["Sales"])


@router.get("/", response_model=List[SaleOut])
def list_sales(
    product_id: int = None,
    days: int = 90,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    q = db.query(SaleRecord).filter(SaleRecord.sale_date >= cutoff)
    if product_id:
        q = q.filter(SaleRecord.product_id == product_id)
    return q.order_by(SaleRecord.sale_date.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=SaleOut, status_code=201)
def record_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Deduct stock
    inv = db.query(Inventory).filter(Inventory.product_id == payload.product_id).first()
    if inv:
        if inv.current_stock < payload.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        inv.current_stock -= payload.quantity

    sale = SaleRecord(
        product_id=payload.product_id,
        quantity=payload.quantity,
        unit_price=product.unit_price,
        total_amount=product.unit_price * payload.quantity,
        sale_date=payload.sale_date or datetime.utcnow(),
        channel=payload.channel,
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)

    # Trigger alert check after sale
    check_and_generate_alerts(db, payload.product_id)

    return sale


@router.get("/summary/monthly")
def monthly_summary(
    months: int = 12,
    db: Session = Depends(get_db),
):
    """Aggregate sales by month for the dashboard chart."""
    cutoff = datetime.utcnow() - timedelta(days=months * 30)
    records = (
        db.query(SaleRecord)
        .filter(SaleRecord.sale_date >= cutoff)
        .order_by(SaleRecord.sale_date.desc())
        .limit(5000)
        .all()
    )
    monthly: dict = {}
    for s in records:
        key = s.sale_date.strftime("%Y-%m")
        if key not in monthly:
            monthly[key] = {"month": key, "units": 0, "revenue": 0.0}
        monthly[key]["units"] += s.quantity
        monthly[key]["revenue"] += s.total_amount

    return sorted(monthly.values(), key=lambda x: x["month"])
