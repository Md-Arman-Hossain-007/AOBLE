from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets

from ..db.session import get_db
from ..models import models
from ..schemas import user as schemas
from ..core.security import get_password_hash, verify_password

router = APIRouter()

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    api_key = f"amltab_{secrets.token_urlsafe(32)}"
    hashed_password = get_password_hash(user.password)
    
    # Check if this is the first user being created
    user_count = db.query(models.User).count()
    assigned_role = "Admin" if user_count == 0 else user.role
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=assigned_role,
        api_key=api_key,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

from .auth import get_current_active_user
from ..core.security import RoleChecker

@router.get("/me", response_model=schemas.UserResponse)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # For initial setup: promote the user to Admin if no Admins exist yet
    if current_user.role != "Admin":
        admin_exists = db.query(models.User).filter(models.User.role == "Admin").first()
        if not admin_exists:
            current_user.role = "Admin"
            db.add(current_user)
            db.commit()
            db.refresh(current_user)
            
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    obj_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    if obj_in.full_name is not None:
        current_user.full_name = obj_in.full_name
    if obj_in.email is not None:
        current_user.email = obj_in.email
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/change-password")
def change_password_me(
    obj_in: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    if not verify_password(obj_in.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password_hash = get_password_hash(obj_in.new_password)
    db.add(current_user)
    db.commit()
    return {"detail": "Password updated successfully"}

# --- Admin Endpoints ---

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Admin"]))
):
    users = db.query(models.User).filter(models.User.is_deleted == False).all()
    return users

@router.patch("/{username}/role", response_model=schemas.UserResponse)
def update_user_role(
    username: str,
    obj_in: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Admin"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = obj_in.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{username}/status", response_model=schemas.UserResponse)
def update_user_status(
    username: str,
    obj_in: schemas.UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Admin"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = obj_in.is_active
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{username}")
def delete_user(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Admin"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.username == current_user.username:
        raise HTTPException(status_code=400, detail="Admins cannot delete themselves")
        
    user.is_deleted = True
    user.is_active = False # Deactivate on soft delete
    db.add(user)
    db.commit()
    return {"detail": "User deleted successfully"}
