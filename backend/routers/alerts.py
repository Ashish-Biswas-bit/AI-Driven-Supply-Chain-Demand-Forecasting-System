from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from models.database import get_db, Alert, Product
from models.schemas import AlertOut
from services.alerts import run_all_alerts

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


def _enrich(alert: Alert) -> dict:
    return {
        "id": alert.id,
        "product_id": alert.product_id,
        "product_name": alert.product.name if alert.product else "Unknown",
        "alert_type": alert.alert_type.value if alert.alert_type else "unknown",
        "severity": alert.severity.value if alert.severity else "info",
        "message": alert.message,
        "is_resolved": alert.is_resolved,
        "created_at": alert.created_at,
    }


@router.get("/", response_model=List[AlertOut])
def list_alerts(
    resolved: bool = False,
    severity: str = None,
    db: Session = Depends(get_db),
):
    q = (
        db.query(Alert)
        .options(joinedload(Alert.product))
        .filter(Alert.is_resolved == resolved)
    )
    if severity:
        q = q.filter(Alert.severity == severity)
    alerts = q.order_by(Alert.created_at.desc()).all()
    return [_enrich(a) for a in alerts]


@router.post("/run-check")
def trigger_alert_check(
    db: Session = Depends(get_db),
):
    count = run_all_alerts(db)
    return {"new_alerts_created": count}


@router.put("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return {"detail": "Alert resolved"}
