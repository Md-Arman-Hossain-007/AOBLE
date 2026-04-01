from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from datetime import datetime
from typing import List

from ..db.session import get_db
from ..models.models import BulkJob, User
from ..api.auth import get_current_active_user
from ..schemas import bulk as schemas
from ..workers.tasks import process_bulk_screening

from ..core.config import settings

router = APIRouter(prefix="/api/v1/bulk", tags=["Bulk Screening"])

# Upload directory in shared volume
UPLOAD_DIR = os.path.join(settings.DATA_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.BulkJobResponse)
async def upload_bulk_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a CSV or Excel file for background screening.
    """
    if not file.filename.endswith(('.csv', '.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or Excel.")

    # Generate job ID and save file
    job_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create job record
    job = BulkJob(
        id = job_id,
        user_id = current_user.username,
        filename = file.filename,
        status = "pending",
        created_at = datetime.utcnow()
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Start Celery task
    process_bulk_screening.delay(job_id, file_path, current_user.username)

    return job

@router.get("/status/{job_id}", response_model=schemas.BulkJobStatus)
def get_job_status(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    job = db.query(BulkJob).filter(BulkJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Bulk job not found")

    progress = 0.0
    if job.total_rows > 0:
        progress = job.processed_rows / job.total_rows

    return schemas.BulkJobStatus(
        id = job.id,
        filename = job.filename,
        status = job.status,
        progress = progress,
        processed = job.processed_rows,
        total = job.total_rows,
        results_summary = job.results_summary,
        created_at = job.created_at,
        error = job.error
    )

@router.delete("/{job_id}")
def delete_bulk_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    job = db.query(BulkJob).filter(BulkJob.id == job_id, BulkJob.user_id == current_user.username).first()
    if not job:
        raise HTTPException(status_code=404, detail="Bulk job not found or unauthorized")

    # Try to delete associated files
    try:
        # We don't store the exact extension in DB other than in filename, 
        # so we check common ones or list the dir
        for ext in ['.csv', '.xls', '.xlsx']:
            file_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file for job {job_id}: {e}")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

@router.get("/history", response_model=List[schemas.BulkJobResponse])
def get_job_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(BulkJob).filter(BulkJob.user_id == current_user.username).order_by(BulkJob.created_at.desc()).all()
