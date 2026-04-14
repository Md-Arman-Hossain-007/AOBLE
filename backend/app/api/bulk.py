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

    # Return response with correct field names for frontend
    return {
        "id": job.id,
        "filename": job.filename,
        "total": job.total_rows,
        "processed": job.processed_rows,
        "status": job.status,
        "created_at": job.created_at,
        "completed_at": job.completed_at,
        "results_summary": job.results_summary,
        "error": job.error
    }

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
    jobs = db.query(BulkJob).filter(BulkJob.user_id == current_user.username).order_by(BulkJob.created_at.desc()).all()
    
    # Transform to match frontend expectations (total_rows -> total, processed_rows -> processed)
    return [
        {
            "id": job.id,
            "filename": job.filename,
            "total": job.total_rows,
            "processed": job.processed_rows,
            "status": job.status,
            "created_at": job.created_at,
            "completed_at": job.completed_at,
            "results_summary": job.results_summary,
            "error": job.error
        }
        for job in jobs
    ]

@router.get("/{job_id}/results")
def get_job_results(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed screening results for a bulk job"""
    from ..models.models import ScreeningResult

    job = db.query(BulkJob).filter(BulkJob.id == job_id, BulkJob.user_id == current_user.username).first()
    if not job:
        raise HTTPException(status_code=404, detail="Bulk job not found")

    # Fetch all screening results for this batch
    print(f"[DEBUG API] Fetching results for job {job_id}")
    print(f"[DEBUG API] Job total_rows: {job.total_rows}, processed_rows: {job.processed_rows}")
    print(f"[DEBUG API] Job results_summary: {job.results_summary}")
    
    results = db.query(ScreeningResult).filter(
        ScreeningResult.batch_id == job_id
    ).all()
    
    print(f"[DEBUG API] Found {len(results)} ScreeningResult records in database")
    for i, r in enumerate(results):
        print(f"[DEBUG API] Result {i+1}: id={r.id}, name={r.customer_name}, risk={r.risk_level}, batch_id={r.batch_id}")

    # Transform results for frontend
    formatted_results = []
    for r in results:
        formatted_results.append({
            "id": str(r.id),
            "name": r.customer_name,
            "type": "Entity" if r.schema_type != "Person" else "Individual",
            "match_count": r.match_count or 0,
            "risk_level": r.risk_level or "LOW",
            "status": r.final_decision or r.auto_decision or "pending",
            "screened_at": r.screened_at.isoformat() if r.screened_at else None
        })

    print(f"[DEBUG API] Returning {len(formatted_results)} formatted results")

    return {
        "job_id": job_id,
        "total": job.total_rows,
        "processed": job.processed_rows,
        "results_summary": job.results_summary,
        "results": formatted_results
    }
