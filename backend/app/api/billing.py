from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime

from ..db.session import get_db
from ..models.models import Subscription, User, PLAN_LIMITS
from ..schemas import billing as schemas
from .users import get_current_active_user

router = APIRouter()

def check_admin(user: User) -> None:
    """Check if user is an admin. Raises HTTPException if not."""
    if user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )

def _get_or_create_subscription(db: Session, org_id: str) -> Subscription:
    """Fetch or seed a default Starter subscription for the org."""
    sub = db.query(Subscription).filter(Subscription.org_id == org_id).first()
    if not sub:
        limits = PLAN_LIMITS["starter"]
        sub = Subscription(
            org_id=org_id,
            plan="starter",
            status="trialing",
            billing_cycle="monthly",
            seats_limit=limits["seats"],
            screenings_limit=limits["screenings"],
            next_billing_date=datetime.datetime.utcnow() + datetime.timedelta(days=14),
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


@router.get("/", response_model=schemas.SubscriptionResponse)
def get_billing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get the current organization's subscription. Admin only."""
    check_admin(current_user)

    # Count real seat usage from active users in the org
    seats_used = db.query(User).filter(
        User.org_id == current_user.org_id,
        User.is_active == True,
        User.is_deleted == False,
    ).count()

    sub = _get_or_create_subscription(db, current_user.org_id)
    sub.seats_used = seats_used
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.put("/plan", response_model=schemas.SubscriptionResponse)
def update_plan(
    obj_in: schemas.SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Switch the organization's plan. Admin only."""
    check_admin(current_user)
    sub = _get_or_create_subscription(db, current_user.org_id)

    if obj_in.plan and obj_in.plan in PLAN_LIMITS:
        limits = PLAN_LIMITS[obj_in.plan]
        sub.plan = obj_in.plan
        sub.seats_limit = limits["seats"]
        sub.screenings_limit = limits["screenings"]
        sub.status = "active"

    if obj_in.billing_cycle:
        sub.billing_cycle = obj_in.billing_cycle

    # Recalculate next billing date
    days = 365 if sub.billing_cycle == "annual" else 30
    sub.next_billing_date = datetime.datetime.utcnow() + datetime.timedelta(days=days)

    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/usage", response_model=schemas.UsageResponse)
def get_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Real-time usage stats for the organization. Admin only."""
    check_admin(current_user)
    sub = _get_or_create_subscription(db, current_user.org_id)
    return sub
