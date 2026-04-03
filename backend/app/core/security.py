from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import secrets
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..models.models import User, Organization, Subscription
from ..core.config import settings

# Use passlib's bcrypt implementation instead of direct bcrypt import
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(user_id: str) -> str:
    expires_delta = timedelta(days=30)  # Refresh tokens last 30 days
    expire = datetime.utcnow() + expires_delta
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": expire,
        "jti": secrets.token_urlsafe(32)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

from sqlalchemy import or_, func

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate a user with username or email (case-insensitive) and password"""
    # Standardize login identifier to lowercase
    login_id = username.lower()
    
    user = db.query(User).filter(
        or_(
            func.lower(User.username) == login_id,
            func.lower(User.email) == login_id
        )
    ).first()
    
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(credentials.credentials)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Export the function for use in other modules
__all__ = [
    "verify_password",
    "get_password_hash", 
    "create_access_token",
    "create_refresh_token",
    "authenticate_user",
    "verify_token",
    "get_current_user",
    "get_current_active_user",
    "RoleChecker",
    "check_permission",
    "check_tenant_access",
    "SSOProvider",
    "encrypt_data",
    "decrypt_data",
    "rate_limit",
    "audit_log",
    "PasswordPolicy",
    "SessionManager",
    "session_manager",
    "audit_logger"
]

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)):
        if current_user.role not in self.allowed_roles and current_user.role != "Admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role {current_user.role} is not authorized to access this resource. Allowed roles: {self.allowed_roles}"
            )
        return current_user

# RBAC System
class Permission:
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"
    SCREEN = "screen"
    MANAGE_USERS = "manage_users"
    VIEW_REPORTS = "view_reports"
    MANAGE_COMPLIANCE = "manage_compliance"

class Role:
    VIEWER = ["read"]
    ANALYST = ["read", "write", "screen"]
    SUPERVISOR = ["read", "write", "delete", "screen", "view_reports"]
    ADMIN = ["read", "write", "delete", "admin", "screen", "manage_users", "view_reports", "manage_compliance"]

def check_permission(required_permission: str):
    def permission_checker(current_user: User = Depends(get_current_active_user)):
        # Get user's role permissions
        user_permissions = Role.__dict__.get(current_user.role.upper(), [])
        
        # Admin users have all permissions
        if "admin" in user_permissions:
            return current_user
            
        # Check if user has required permission
        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        return current_user
    return permission_checker

def check_tenant_access(current_user: User, resource_tenant_id: str):
    """Check if user has access to the specified tenant's resources"""
    if current_user.org_id != resource_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Resource belongs to different organization"
        )
    return True

# SAML/OIDC Integration
class SSOProvider:
    def __init__(self, provider_type: str, config: Dict[str, Any]):
        self.provider_type = provider_type
        self.config = config
    
    async def authenticate(self, token: str) -> Dict[str, Any]:
        """Authenticate user via SSO provider"""
        if self.provider_type == "oidc":
            return await self._authenticate_oidc(token)
        elif self.provider_type == "saml":
            return await self._authenticate_saml(token)
        else:
            raise ValueError(f"Unsupported SSO provider: {self.provider_type}")
    
    async def _authenticate_oidc(self, token: str) -> Dict[str, Any]:
        """Authenticate via OpenID Connect"""
        # Implementation would integrate with actual OIDC provider
        # This is a placeholder for the actual implementation
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                # Verify token with OIDC provider
                response = await client.get(
                    f"{self.config['issuer']}/userinfo",
                    headers={"Authorization": f"Bearer {token}"}
                )
                user_info = response.json()
                
                return {
                    "email": user_info.get("email"),
                    "name": user_info.get("name"),
                    "sub": user_info.get("sub"),
                    "groups": user_info.get("groups", [])
                }
        except Exception as e:
            raise HTTPException(
                status_code=401,
                detail=f"OIDC authentication failed: {str(e)}"
            )
    
    async def _authenticate_saml(self, token: str) -> Dict[str, Any]:
        """Authenticate via SAML"""
        # Implementation would integrate with actual SAML provider
        # This is a placeholder for the actual implementation
        raise NotImplementedError("SAML authentication not yet implemented")

# Encryption utilities
from cryptography.fernet import Fernet
import base64

def generate_encryption_key() -> bytes:
    """Generate a new encryption key"""
    return Fernet.generate_key()

def get_fernet() -> Fernet:
    """Get Fernet instance for encryption/decryption"""
    # In production, this should be stored securely
    key = settings.SECRET_KEY.encode()
    # Pad the key to 32 bytes for Fernet
    key = key.ljust(32, b'0')[:32]
    # Encode to base64 as Fernet requires
    fernet_key = base64.urlsafe_b64encode(key)
    return Fernet(fernet_key)

def encrypt_data(data: str) -> str:
    """Encrypt sensitive data"""
    fernet = get_fernet()
    encrypted_data = fernet.encrypt(data.encode())
    return base64.b64encode(encrypted_data).decode('utf-8')

def decrypt_data(encrypted_data: str) -> str:
    """Decrypt sensitive data"""
    fernet = get_fernet()
    encrypted_bytes = base64.b64decode(encrypted_data.encode('utf-8'))
    decrypted_data = fernet.decrypt(encrypted_bytes)
    return decrypted_data.decode('utf-8')

# Rate limiting
from functools import wraps
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed based on rate limiting"""
        now = time.time()
        minute_ago = now - 60
        
        # Remove old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier] 
            if req_time > minute_ago
        ]
        
        # Check if under limit
        if len(self.requests[identifier]) >= self.requests_per_minute:
            return False
        
        # Add current request
        self.requests[identifier].append(now)
        return True

rate_limiter = RateLimiter()

def rate_limit(requests_per_minute: int = 60):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get client IP or user identifier
            # This would need to be adapted based on your FastAPI setup
            identifier = "client_ip_or_user_id"  # Replace with actual identifier
            
            if not rate_limiter.is_allowed(identifier):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Audit logging
import logging
from datetime import datetime

class AuditLogger:
    def __init__(self):
        self.logger = logging.getLogger("audit")
        handler = logging.FileHandler("audit.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_action(self, user_id: str, action: str, resource: str, 
                   details: Dict[str, Any] = None, success: bool = True):
        """Log user actions for audit purposes"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "success": success,
            "details": details or {}
        }
        
        if success:
            self.logger.info(f"AUDIT: {log_data}")
        else:
            self.logger.warning(f"AUDIT: {log_data}")

audit_logger = AuditLogger()

def audit_log(action: str, resource: str):
    """Decorator to automatically log function calls"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user_id = "unknown"  # Extract from request context
            details = {"args": str(args), "kwargs": str(kwargs)}
            
            try:
                result = await func(*args, **kwargs)
                audit_logger.log_action(user_id, action, resource, details, True)
                return result
            except Exception as e:
                audit_logger.log_action(user_id, action, resource, details, False)
                raise
        return wrapper
    return decorator

# Password policies
class PasswordPolicy:
    @staticmethod
    def validate_password(password: str) -> List[str]:
        """Validate password against policy requirements"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Password must contain at least one special character")
        
        return errors

# Session management
class SessionManager:
    def __init__(self):
        self.active_sessions = {}
    
    def create_session(self, user_id: str, session_data: Dict[str, Any]) -> str:
        """Create a new session for a user"""
        session_id = secrets.token_urlsafe(32)
        self.active_sessions[session_id] = {
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "data": session_data
        }
        return session_id
    
    def validate_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Validate and update session activity"""
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        # Check if session expired (24 hours)
        if datetime.utcnow() - session["created_at"] > timedelta(hours=24):
            del self.active_sessions[session_id]
            return None
        
        # Update last activity
        session["last_activity"] = datetime.utcnow()
        return session
    
    def invalidate_session(self, session_id: str):
        """Invalidate a session"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]

session_manager = SessionManager()