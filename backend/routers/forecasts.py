from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db, Product, SaleRecord, Forecast
from models.schemas import ForecastRequest, ForecastOut
from ml.forecasting import generate_forecast, get_ai_insight

router = APIRouter(prefix="/api/forecasts", tags=["Forecasting"])


@router.post("/generate", response_model=ForecastOut)
async def generate_product_forecast(
    payload: ForecastRequest,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    sales = (
        db.query(SaleRecord)
        .filter(SaleRecord.product_id == payload.product_id)
        .order_by(SaleRecord.sale_date.asc())
        .all()
    )

    if len(sales) < 5:
        raise HTTPException(
            status_code=422,
            detail="Not enough sales history to generate a forecast (minimum 5 records required).",
        )

    result = generate_forecast(sales, periods=payload.periods, freq=payload.frequency)

    # Persist forecasts to DB
    db.query(Forecast).filter(Forecast.product_id == payload.product_id).delete()
    for point in result["points"]:
        from datetime import datetime
        db.add(Forecast(
            product_id=payload.product_id,
            period_start=datetime.fromisoformat(point["date"]),
            period_end=datetime.fromisoformat(point["date"]),
            predicted_qty=point["predicted"],
            lower_bound=point["lower"],
            upper_bound=point["upper"],
            confidence=result.get("accuracy_score") or 0.80,
            model_used=result["model_used"],
        ))
    db.commit()

    stock = product.inventory.current_stock if product.inventory else 0
    ai_insight = await get_ai_insight(product.name, result, stock)

    return ForecastOut(
        product_id=payload.product_id,
        product_name=product.name,
        model_used=result["model_used"],
        forecast=[
            {"date": p["date"], "predicted": p["predicted"],
             "lower": p["lower"], "upper": p["upper"]}
            for p in result["points"]
        ],
        accuracy_score=result.get("accuracy_score"),
        ai_insight=ai_insight,
    )


@router.get("/{product_id}/latest")
def get_latest_forecast(
    product_id: int,
    db: Session = Depends(get_db),
):
    forecasts = (
        db.query(Forecast)
        .filter(Forecast.product_id == product_id)
        .order_by(Forecast.period_start.asc())
        .all()
    )
    return [
        {
            "date": f.period_start.strftime("%Y-%m-%d"),
            "predicted": f.predicted_qty,
            "lower": f.lower_bound,
            "upper": f.upper_bound,
        }
        for f in forecasts
    ]
