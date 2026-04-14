from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List

class BulkJobResponse(BaseModel):
    id: str
    filename: str
    total: int  # Frontend expects 'total'
    processed: int  # Frontend expects 'processed'
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    results_summary: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

    class Config:
        from_attributes = True

class BulkJobStatus(BaseModel):
    id: str
    filename: str
    status: str
    progress: float  # 0.0 to 1.0
    processed: int
    total: int
    results_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    error: Optional[str] = None
