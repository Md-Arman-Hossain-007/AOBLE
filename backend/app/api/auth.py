from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import secrets
import logging
import jwt
import pyotp
import uuid

from ..db.session import get_db
from ..models.models import User, Organization, Subscription
from ..schemas.user import UserCreate, UserResponse, Token, PasswordResetRequest, PasswordResetConfirm, Enable2FA, Verify2FA
from ..schemas.organization import OrganizationUpdate
from ..core.security import (
    authenticate_user, create_access_token, create_refresh_token, 
    verify_password, get_password_hash, check_permission, audit_log,
    SSOProvider, PasswordPolicy, session_manager, audit_logger,
    get_current_user, get_current_active_user, RoleChecker
)
from ..core.config import settings
from ..services.email import send_password_reset_email, send_welcome_email

router = APIRouter()

# Configure logging
logger = logging.getLogger(__name__)

@router.post("/token", response_model=Token, summary="Get access token")
@audit_log("login", "authentication")
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        audit_logger.log_action(
            "system", "failed_login", "authentication", 
            {"username": form_data.username, "reason": "invalid_credentials"}, 
            False
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Capture client metadata
    ip_address = request.client.host if request.client else "Unknown"
    user_agent = request.headers.get("user-agent", "Unknown")

    # Create temporary session for tracking
    session_id = session_manager.create_session(user.username, {
        "ip_address": ip_address,
        "user_agent": user_agent
    })

    # Check 2FA
    if user.is_2fa_enabled:
        audit_logger.log_action(
            user.username, "login_attempt", "authentication", 
            {"session_id": session_id, "2fa_required": True}, 
            True
        )
        return Token(
            twofa_required=True,
            username=user.username
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(user.username)
    
    audit_logger.log_action(
        user.username, "login", "authentication", 
        {"session_id": session_id}, 
        True
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserResponse.from_orm(user)
    }

@router.post("/login/verify-2fa", response_model=Token, summary="Verify 2FA login")
async def verify_login_2fa(
    request: Request,
    username: str,
    data: Verify2FA,
    db: Session = Depends(get_db)
):
    """
    Verify 2FA code during login and return tokens.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    if not user.is_2fa_enabled or not user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled for this user"
        )
    
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(data.code):
        audit_logger.log_action(
            user.username, "failed_2fa_login", "authentication", 
            {"reason": "invalid_code"}, 
            False
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 2FA code"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(user.username)
    
    # Capture client metadata
    ip_address = request.client.host if request.client else "Unknown"
    user_agent = request.headers.get("user-agent", "Unknown")

    # Create logic session
    session_id = session_manager.create_session(user.username, {
        "ip_address": ip_address,
        "user_agent": user_agent
    })
    
    audit_logger.log_action(
        user.username, "login_2fa", "authentication", 
        {"session_id": session_id}, 
        True
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserResponse.from_orm(user)
    }

@router.post("/refresh", response_model=Token, summary="Refresh access token")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh an access token using a refresh token
    """
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token type"
            )
        
        username = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user = db.query(User).filter(User.username == username).first()
        if user is None or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
        )
        new_refresh_token = create_refresh_token(user.username)
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse.from_orm(user)
        }
        
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token"
        )

@router.post("/sso/login", summary="SSO Login (OIDC/SAML)")
async def sso_login(
    provider: str,
    token: str,
    db: Session = Depends(get_db)
):
    """
    Authenticate user via SSO provider (OIDC or SAML)
    """
    try:
        # Initialize SSO provider
        if provider == "oidc":
            sso_config = {
                "issuer": settings.OIDC_ISSUER,
                "client_id": settings.OIDC_CLIENT_ID,
                "client_secret": settings.OIDC_CLIENT_SECRET
            }
        elif provider == "saml":
            sso_config = {
                "idp_metadata_url": settings.SAML_IDP_METADATA_URL,
                "entity_id": settings.SAML_ENTITY_ID
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported SSO provider: {provider}"
            )
        
        sso_provider = SSOProvider(provider, sso_config)
        
        # Authenticate via SSO
        user_info = await sso_provider.authenticate(token)
        
        # Find or create user
        user = db.query(User).filter(User.email == user_info["email"]).first()
        
        if not user:
            # Create new user from SSO
            user = User(
                username=user_info["sub"],
                email=user_info["email"],
                full_name=user_info["name"],
                is_active=True,
                role="Analyst",  # Default role for SSO users
                api_key=secrets.token_urlsafe(32)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Send welcome email
            await send_welcome_email(user.email, user.full_name)
        
        # Generate tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(user.username)
        
        audit_logger.log_action(
            user.username, "sso_login", "authentication", 
            {"provider": provider, "sso_id": user_info["sub"]}, 
            True
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse.from_orm(user)
        }
        
    except Exception as e:
        logger.error(f"SSO authentication failed: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"SSO authentication failed: {str(e)}"
        )

@router.post("/logout", summary="Logout user")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout user and invalidate session
    """
    # In a real implementation, you would maintain a token blacklist
    # For now, we'll just log the logout
    audit_logger.log_action(
        current_user.username, "logout", "authentication", 
        {}, 
        True
    )
    
    return {"message": "Successfully logged out"}

@router.post("/register", response_model=UserResponse, summary="Register new user")
@audit_log("register", "user_management")
async def register_user(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Register a new user with email verification
    """
    # Validate password policy
    password_errors = PasswordPolicy.validate_password(user_data.password)
    if password_errors:
        raise HTTPException(
            status_code=400,
            detail=f"Password policy violations: {'; '.join(password_errors)}"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Check if organization with same name exists
    existing_org = db.query(Organization).filter(Organization.name == user_data.organization_name).first()
    if existing_org:
        raise HTTPException(
            status_code=400,
            detail=f"Organization '{user_data.organization_name}' is already registered."
        )

    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hashed_password,
        api_key=secrets.token_urlsafe(32),
        role="Admin"  # User who registers a company is always the Admin
    )
    
    db.add(user)
    db.flush() 
    
    # Create the organization
    org = Organization(
        id=str(uuid.uuid4()),
        name=user_data.organization_name,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(org)
    db.flush()
    
    # Link user to organization
    user.org_id = org.id
    
    db.commit()
    db.refresh(user)
    
    # Send welcome email
    background_tasks.add_task(send_welcome_email, user.email, user.full_name)
    
    audit_logger.log_action(
        user.username, "register", "user_management", 
        {"email": user.email, "role": user.role}, 
        True
    )
    
    return UserResponse.from_orm(user)

@router.post("/password-reset/request", summary="Request password reset")
async def request_password_reset(
    reset_request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Request a password reset email
    """
    user = db.query(User).filter(User.email == reset_request.email).first()
    
    if user:
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        
        # Send reset email
        background_tasks.add_task(
            send_password_reset_email, 
            user.email, 
            user.full_name, 
            reset_token
        )
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/password-reset/confirm", summary="Confirm password reset")
async def confirm_password_reset(
    reset_confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Confirm password reset with token
    """
    user = db.query(User).filter(User.reset_token == reset_confirm.token).first()
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid reset token"
        )
    
    if user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Reset token has expired"
        )
    
    # Validate new password
    password_errors = PasswordPolicy.validate_password(reset_confirm.new_password)
    if password_errors:
        raise HTTPException(
            status_code=400,
            detail=f"Password policy violations: {'; '.join(password_errors)}"
        )
    
    # Update password
    user.password_hash = get_password_hash(reset_confirm.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    audit_logger.log_action(
        user.username, "password_reset", "user_management", 
        {}, 
        True
    )
    
    return {"message": "Password has been reset successfully"}

@router.get("/me", response_model=UserResponse, summary="Get current user info")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information
    """
    return UserResponse.from_orm(current_user)

@router.put("/me", response_model=UserResponse, summary="Update current user info")
@audit_log("update_profile", "user_management")
async def update_current_user(
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user information
    """
    if full_name:
        current_user.full_name = full_name
    if email:
        # Check if email is already taken
        existing_user = db.query(User).filter(
            User.email == email, User.username != current_user.username
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already in use"
            )
        
        current_user.email = email
    
    db.commit()
    db.refresh(current_user)
    
    audit_logger.log_action(
        current_user.username, "update_profile", "user_management", 
        {"full_name": full_name, "email": email}, 
        True
    )
    
    return UserResponse.from_orm(current_user)

@router.put("/me/password", summary="Change current user password")
@audit_log("change_password", "user_management")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user password
    """
    # Verify current password
    if not verify_password(current_password, current_user.password_hash):
        audit_logger.log_action(
            current_user.username, "change_password", "user_management", 
            {"success": False, "reason": "invalid_current_password"}, 
            False
        )
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    password_errors = PasswordPolicy.validate_password(new_password)
    if password_errors:
        raise HTTPException(
            status_code=400,
            detail=f"Password policy violations: {'; '.join(password_errors)}"
        )
    
    # Update password
    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    
    audit_logger.log_action(
        current_user.username, "change_password", "user_management", 
        {"success": True}, 
        True
    )
    
    return {"message": "Password has been changed successfully"}

@router.get("/organizations", summary="Get user's organization")
@router.get("/organizations/", include_in_schema=False)
async def get_user_organization(
    current_user: User = Depends(check_permission("read")),
    db: Session = Depends(get_db)
):
    """
    Get current user's organization information
    """
    if not current_user.org_id:
        raise HTTPException(
            status_code=404,
            detail="User is not associated with any organization"
        )
    
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )
    
    subscription = db.query(Subscription).filter(Subscription.org_id == org.id).first()
    
    return {
        "organization": org,
        "subscription": subscription,
        "user_role": current_user.role
    }

@router.put("/organizations", summary="Update organization info")
@router.put("/organizations/", include_in_schema=False)
async def update_organization(
    data: OrganizationUpdate,
    current_user: User = Depends(RoleChecker(["Admin", "Compliance Officer"])),
    db: Session = Depends(get_db)
):
    """
    Update details for the current user's organization.
    """
    if not current_user.org_id:
        raise HTTPException(
            status_code=404,
            detail="User is not associated with any organization"
        )
    
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )
    
    if data.name is not None:
        org.name = data.name
    if data.is_active is not None:
        org.is_active = data.is_active
    
    db.add(org)
    db.commit()
    db.refresh(org)
    
    audit_logger.log_action(
        current_user.username, "update_organization", "organization_management", 
        {"org_id": org.id, "updates": data.dict(exclude_none=True)}, 
        True
    )
    
    return org

@router.post("/2fa/generate", summary="Generate 2FA Secret")
async def generate_2fa(
    current_user: User = Depends(get_current_user)
):
    """
    Generate a new 2FA secret and provisioning URI (QR code data).
    Dos NOT enable 2FA until verified.
    """
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="AMLtab"
    )
    
    return {
        "secret": secret,
        "provisioning_uri": provisioning_uri
    }

@router.post("/2fa/enable", summary="Verify and Enable 2FA")
async def enable_2fa(
    data: Enable2FA,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify the provided 2FA code and enable 2FA for the user if correct.
    """
    totp = pyotp.TOTP(data.secret)
    
    if not totp.verify(data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid authentication code"
        )
    
    current_user.totp_secret = data.secret
    current_user.is_2fa_enabled = True
    db.commit()
    
    audit_logger.log_action(
        current_user.username, "enable_2fa", "security", 
        {"success": True}, 
        True
    )
    
    return {"message": "2FA has been enabled and verified successfully"}

@router.post("/2fa/disable", summary="Disable 2FA")
async def disable_2fa(
    data: Verify2FA,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disable two-factor authentication for the user after verifying a code.
    """
    if not current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled"
        )
    
    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid authentication code"
        )
    
    current_user.totp_secret = None
    current_user.is_2fa_enabled = False
    db.commit()
    
    audit_logger.log_action(
        current_user.username, "disable_2fa", "security", 
        {"success": True}, 
        True
    )
    
    return {"message": "2FA has been disabled successfully"}

@router.get("/sessions/active", summary="Get active sessions")
async def get_active_sessions(
    current_user: User = Depends(get_current_user)
):
    """
    Get list of active sessions for the current user
    """
    sessions = []
    for session_id, session_data in session_manager.active_sessions.items():
        if session_data["user_id"] == current_user.username:
            sessions.append({
                "session_id": session_id,
                "created_at": session_data["created_at"],
                "last_activity": session_data["last_activity"],
                "ip_address": session_data["data"].get("ip_address", "Unknown"),
                "user_agent": session_data["data"].get("user_agent", "Unknown")
            })

    return {"sessions": sessions}

@router.delete("/sessions/{session_id}", summary="Invalidate session")
async def invalidate_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Invalidate a specific session
    """
    session = session_manager.validate_session(session_id)
    if not session or session["user_id"] != current_user.username:
        raise HTTPException(
            status_code=404,
            detail="Session not found or access denied"
        )
    
    session_manager.invalidate_session(session_id)
    
    audit_logger.log_action(
        current_user.username, "invalidate_session", "session_management", 
        {"session_id": session_id}, 
        True
    )
    
    return {"message": "Session has been invalidated"}