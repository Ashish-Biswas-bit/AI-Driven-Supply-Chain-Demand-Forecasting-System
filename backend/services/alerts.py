from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from models.database import Product, Inventory, Forecast, Alert, AlertType, AlertSeverity


def check_and_generate_alerts(db: Session, product_id: int) -> List[Alert]:
    """
    Evaluate current stock vs. latest forecast and safety stock.
    Creates new alerts and returns them.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or not product.inventory:
        return []

    stock = product.inventory.current_stock
    safety = product.safety_stock
    reorder = product.reorder_point

    # Get latest 30-day forecast total
    forecasts = (
        db.query(Forecast)
        .filter(Forecast.product_id == product_id)
        .order_by(Forecast.created_at.desc())
        .limit(30)
        .all()
    )
    forecast_total = sum(f.predicted_qty for f in forecasts) if forecasts else 0

    new_alerts: List[Alert] = []

    # Resolve existing open alerts for this product
    db.query(Alert).filter(
        Alert.product_id == product_id,
        Alert.is_resolved == False,
    ).update({"is_resolved": True, "resolved_at": datetime.utcnow()})

    # --- Stockout risk ---
    if stock <= safety:
        severity = AlertSeverity.critical if stock < safety // 2 else AlertSeverity.warning
        msg = (
            f"{product.name}: Stock ({stock} units) is at or below safety stock ({safety}). "
            f"Forecasted demand: {int(forecast_total)} units over 30 days. "
            f"Lead time: {product.lead_time_days} days. Reorder immediately."
        )
        alert = Alert(
            product_id=product_id,
            alert_type=AlertType.stockout,
            severity=severity,
            message=msg,
        )
        db.add(alert)
        new_alerts.append(alert)

    # --- Reorder point ---
    elif stock <= reorder:
        msg = (
            f"{product.name}: Stock ({stock} units) has reached reorder point ({reorder}). "
            f"Place order to avoid stockout within {product.lead_time_days} days."
        )
        alert = Alert(
            product_id=product_id,
            alert_type=AlertType.reorder,
            severity=AlertSeverity.warning,
            message=msg,
        )
        db.add(alert)
        new_alerts.append(alert)

    # --- Overstock ---
    if forecast_total > 0 and stock > forecast_total * 2.5:
        msg = (
            f"{product.name}: Possible overstock. Current stock ({stock}) exceeds "
            f"2.5x forecasted 30-day demand ({int(forecast_total)}). "
            "Consider promotions or pausing replenishment."
        )
        alert = Alert(
            product_id=product_id,
            alert_type=AlertType.overstock,
            severity=AlertSeverity.info,
            message=msg,
        )
        db.add(alert)
        new_alerts.append(alert)

    db.commit()
    return new_alerts


def run_all_alerts(db: Session) -> int:
    """Run alert check across all products. Returns count of new alerts created."""
    products = db.query(Product).all()
    total = 0
    for product in products:
        alerts = check_and_generate_alerts(db, product.id)
        total += len(alerts)
    return total
