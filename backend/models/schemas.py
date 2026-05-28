from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    viewer = "viewer"


class SubscriptionPlan(str, Enum):
    free_trial = "free_trial"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class SubscriptionStatus(str, Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"


class AlertType(str, Enum):
    stockout = "stockout"
    overstock = "overstock"
    reorder = "reorder"


class AlertSeverity(str, Enum):
    critical = "critical"
    warning = "warning"
    info = "info"


# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.viewer
    subscription_plan: SubscriptionPlan = SubscriptionPlan.free_trial


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    subscription_plan: SubscriptionPlan
    subscription_status: SubscriptionStatus
    subscription_expires_at: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Product ───────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    unit_price: float
    safety_stock: int = 10
    reorder_point: int = 20
    lead_time_days: int = 7


class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    category: str
    unit_price: float
    safety_stock: int
    reorder_point: int
    lead_time_days: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Inventory ─────────────────────────────────────────
class InventoryUpdate(BaseModel):
    current_stock: int
    warehouse_location: Optional[str] = None


class InventoryOut(BaseModel):
    id: int
    product_id: int
    current_stock: int
    warehouse_location: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Sales ─────────────────────────────────────────────
class SaleCreate(BaseModel):
    product_id: int
    quantity: int
    sale_date: Optional[datetime] = None
    channel: str = "online"


class SaleOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_amount: float
    sale_date: datetime
    channel: str

    class Config:
        from_attributes = True


# ── Forecast ──────────────────────────────────────────
class ForecastRequest(BaseModel):
    product_id: int
    periods: int = 30
    frequency: str = "D"


class ForecastPoint(BaseModel):
    date: str
    predicted: float
    lower: float
    upper: float


class ForecastOut(BaseModel):
    product_id: int
    product_name: str
    model_used: str
    forecast: List[ForecastPoint]
    accuracy_score: Optional[float]
    ai_insight: Optional[str]


# ── Alert ─────────────────────────────────────────────
class AlertOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    alert_type: AlertType
    severity: AlertSeverity
    message: str
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────
class DashboardStats(BaseModel):
    total_products: int
    total_stock_value: float
    active_alerts: int
    critical_alerts: int
    forecast_accuracy: float
    revenue_last_30d: float
    top_categories: List[dict]
    monthly_sales: List[dict]
