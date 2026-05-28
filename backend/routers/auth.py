from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

from models.database import get_db, User, SubscriptionPlan, SubscriptionStatus
from models.schemas import UserCreate, UserOut, Token, LoginRequest, SubscriptionPlan as SubPlanEnum
from services.auth import (
    hash_password, verify_password,
    create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _compute_subscription_dates(plan: SubscriptionPlan):
    """Return (subscription_expires_at, trial_ends_at) based on plan."""
    now = datetime.utcnow()
    if plan == SubscriptionPlan.free_trial:
        # Free trial lasts 14 days; no paid subscription yet
        return None, now + timedelta(days=14)
    elif plan == SubscriptionPlan.weekly:
        return now + timedelta(weeks=1), None
    elif plan == SubscriptionPlan.monthly:
        return now + timedelta(days=30), None
    elif plan == SubscriptionPlan.yearly:
        return now + timedelta(days=365), None
    return None, None


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    sub_expires, trial_ends = _compute_subscription_dates(payload.subscription_plan)

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        subscription_plan=payload.subscription_plan,
        subscription_status=SubscriptionStatus.active,
        subscription_expires_at=sub_expires,
        trial_ends_at=trial_ends,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    # Update subscription status if expired
    now = datetime.utcnow()
    if user.subscription_status == SubscriptionStatus.active:
        if user.subscription_expires_at and user.subscription_expires_at < now:
            user.subscription_status = SubscriptionStatus.expired
            db.commit()

    token = create_access_token(
        {"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/subscription", response_model=UserOut)
def update_subscription(
    plan: SubPlanEnum,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the user's subscription plan."""
    sub_expires, trial_ends = _compute_subscription_dates(plan)
    current_user.subscription_plan = plan
    current_user.subscription_status = SubscriptionStatus.active
    current_user.subscription_expires_at = sub_expires
    current_user.trial_ends_at = trial_ends
    db.commit()
    db.refresh(current_user)
    return current_user
