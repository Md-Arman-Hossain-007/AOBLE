from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Optional
from functools import wraps

from ..db.session import get_db
from ..models.models import User, Organization, Subscription
from ..core.security import get_current_active_user

class TenantMiddleware:
    """
    Middleware to handle multi-tenant isolation
    """
    
    @staticmethod
    def get_user_tenant_id(user: User) -> Optional[str]:
        """Get the tenant ID for a user"""
        return user.org_id
    
    @staticmethod
    def validate_tenant_access(user: User, resource_tenant_id: str) -> bool:
        """Validate if user has access to the specified tenant"""
        if not user.org_id:
            return False
        return user.org_id == resource_tenant_id
    
    @staticmethod
    def get_user_subscription(user: User, db: Session) -> Optional[Subscription]:
        """Get user's organization subscription"""
        if not user.org_id:
            return None
        
        org = db.query(Organization).filter(Organization.id == user.org_id).first()
        if not org:
            return None
        
        return db.query(Subscription).filter(Subscription.org_id == org.id).first()

def require_tenant_access(func):
    """
    Decorator to ensure tenant isolation for database operations
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Extract user from kwargs if present
        user = kwargs.get('current_user')
        if not user:
            # Try to get user from first argument if it's a user object
            if args and hasattr(args[0], 'org_id'):
                user = args[0]
        
        if user and hasattr(user, 'org_id') and user.org_id:
            # Add tenant filter to kwargs
            kwargs['_tenant_id'] = user.org_id
        
        return await func(*args, **kwargs)
    return wrapper

class TenantManager:
    """Manager for tenant operations"""
    
    @staticmethod
    def create_organization(db: Session, name: str, created_by: str) -> Organization:
        """Create a new organization (tenant)"""
        from uuid import uuid4
        
        org = Organization(
            id=str(uuid4()),
            name=name,
            created_at=datetime.utcnow()
        )
        db.add(org)
        db.commit()
        db.refresh(org)
        
        # Create default subscription
        subscription = Subscription(
            org_id=org.id,
            plan="starter",
            status="trialing",
            billing_cycle="monthly",
            seats_used=1,
            seats_limit=3,
            screenings_used=0,
            screenings_limit=500,
            next_billing_date=datetime.utcnow() + timedelta(days=30)
        )
        db.add(subscription)
        db.commit()
        
        return org
    
    @staticmethod
    def assign_user_to_organization(db: Session, user: User, org_id: str) -> bool:
        """Assign user to an organization"""
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            return False
        
        user.org_id = org_id
        db.commit()
        return True
    
    @staticmethod
    def check_resource_quota(db: Session, org_id: str, resource_type: str, amount: int = 1) -> bool:
        """Check if organization has quota for the requested resource"""
        subscription = db.query(Subscription).filter(Subscription.org_id == org_id).first()
        if not subscription:
            return False
        
        if resource_type == "seats":
            return subscription.seats_used + amount <= subscription.seats_limit
        elif resource_type == "screenings":
            return subscription.screenings_used + amount <= subscription.screenings_limit
        
        return True
    
    @staticmethod
    def increment_usage(db: Session, org_id: str, resource_type: str, amount: int = 1):
        """Increment resource usage for organization"""
        subscription = db.query(Subscription).filter(Subscription.org_id == org_id).first()
        if not subscription:
            return
        
        if resource_type == "seats":
            subscription.seats_used += amount
        elif resource_type == "screenings":
            subscription.screenings_used += amount
        
        db.commit()

def get_current_tenant_id(current_user: User = Depends(get_current_active_user)) -> str:
    """Get current user's tenant ID"""
    if not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not associated with any organization"
        )
    return current_user.org_id

def check_tenant_quota(resource_type: str, amount: int = 1):
    """Decorator to check tenant quota before executing function"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get database session
            db = kwargs.get('db')
            if not db:
                # Try to get db from first argument
                if args and hasattr(args[0], 'query'):
                    db = args[0]
            
            if db:
                # Get current user (would need to be passed in context)
                current_user = kwargs.get('current_user')
                if current_user and current_user.org_id:
                    has_quota = TenantManager.check_resource_quota(
                        db, current_user.org_id, resource_type, amount
                    )
                    if not has_quota:
                        raise HTTPException(
                            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail=f"Organization quota exceeded for {resource_type}"
                        )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Tenant-aware database query builder
class TenantQuery:
    """Helper class for building tenant-aware queries"""
    
    @staticmethod
    def filter_by_tenant(query, model_class, tenant_id: str):
        """Add tenant filter to query"""
        if hasattr(model_class, 'org_id'):
            return query.filter(model_class.org_id == tenant_id)
        elif hasattr(model_class, 'user_id'):
            # For models that reference users, join with users table
            from ..models.models import User
            return query.join(User, model_class.user_id == User.username).filter(User.org_id == tenant_id)
        else:
            # For models without direct tenant association, return as-is
            return query

# Usage examples in API endpoints:
"""
@router.get("/screenings")
@require_tenant_access
async def get_screenings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Query will be automatically filtered by tenant
    screenings = db.query(ScreeningResult).filter(
        ScreeningResult.screened_by == current_user.username
    ).all()
    return screenings

@router.post("/screenings")
@check_tenant_quota("screenings", 1)
async def create_screening(
    screening_data: ScreeningRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check quota and create screening
    # ...
    pass
"""

# Organization management endpoints
from fastapi import APIRouter
from ..schemas.user import OrganizationCreate, OrganizationResponse
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/organizations", response_model=OrganizationResponse)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new organization"""
    # Check if user already has an organization
    if current_user.org_id:
        raise HTTPException(
            status_code=400,
            detail="User is already associated with an organization"
        )
    
    # Create organization
    org = TenantManager.create_organization(db, org_data.name, current_user.username)
    
    # Assign user to organization
    TenantManager.assign_user_to_organization(db, current_user, org.id)
    
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        created_at=org.created_at,
        is_active=org.is_active
    )

@router.get("/organizations/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get organization details"""
    if current_user.org_id != org_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Not member of this organization"
        )
    
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        created_at=org.created_at,
        is_active=org.is_active
    )

@router.get("/organizations/{org_id}/subscription")
async def get_subscription(
    org_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get organization subscription details"""
    if current_user.org_id != org_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Not member of this organization"
        )
    
    subscription = TenantManager.get_user_subscription(current_user, db)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    return {
        "plan": subscription.plan,
        "status": subscription.status,
        "billing_cycle": subscription.billing_cycle,
        "seats_used": subscription.seats_used,
        "seats_limit": subscription.seats_limit,
        "screenings_used": subscription.screenings_used,
        "screenings_limit": subscription.screenings_limit,
        "next_billing_date": subscription.next_billing_date
    }