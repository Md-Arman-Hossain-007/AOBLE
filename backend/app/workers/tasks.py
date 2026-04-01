import pandas as pd
import io
import os
import uuid
import datetime
import asyncio
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from ..core.celery_app import celery_app
from ..db.session import SessionLocal
from ..models.models import BulkJob, User
from ..services.screening import perform_screening
from ..schemas.screening import (
    ScreeningRequest, IndividualScreenRequest, EntityScreenRequest,
    Algorithm, ScreeningType
)
from ..services.monitoring import check_monitored_entities
from ..services import notification_service
from ..schemas import notifications as notification_schemas

@celery_app.task(name="app.workers.process_ongoing_monitoring")
def process_ongoing_monitoring():
    """
    Background task to process all active monitored entities for changes in risk profile.
    """
    db: Session = SessionLocal()
    try:
        loop = asyncio.get_event_loop()
        stats = loop.run_until_complete(check_monitored_entities(db))
        print(f"Ongoing monitoring completed. {stats}")
        return stats
    except Exception as e:
        print(f"Ongoing monitoring failed: {e}")
        return {"error": str(e)}
    finally:
        db.close()

@celery_app.task(name="app.workers.process_bulk_screening")
def process_bulk_screening(job_id: str, file_path: str, user_id: str):
    """
    Background task to process a CSV/Excel file for bulk screening.
    """
    db: Session = SessionLocal()
    job = db.query(BulkJob).filter(BulkJob.id == job_id).first()
    if not job:
        print(f"Bulk job {job_id} not found")
        db.close()
        return

    try:
        job.status = "processing"
        db.commit()

        # Load file
        if file_path.endswith('.csv'):
            try:
                # Use engine='python' and sep=None to auto-detect delimiters (comma, semicolon, tab)
                df = pd.read_csv(file_path, encoding='utf-8', sep=None, engine='python', on_bad_lines='warn')
            except Exception:
                print("UTF-8 auto-sep failed, trying ISO-8859-1 with auto-sep")
                try:
                    df = pd.read_csv(file_path, encoding='iso-8859-1', sep=None, engine='python', on_bad_lines='skip')
                except Exception as e:
                    raise ValueError(f"Failed to parse CSV: {str(e)}")
        elif file_path.endswith(('.xls', '.xlsx')):
            try:
                # 1. Try modern engine (standard for .xlsx)
                df = pd.read_excel(file_path, engine='openpyxl')
            except Exception:
                try:
                    # 2. Try legacy engine (required for .xls)
                    df = pd.read_excel(file_path, engine='xlrd')
                except Exception:
                    # 3. Final fallback: Let pandas auto-detect
                    df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")

        job.total_rows = len(df)
        db.commit()

        # Process rows
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Results summary
        results_summary = {
            "high_risk": 0,
            "medium_risk": 0,
            "low_risk": 0,
            "errors": 0
        }

        # Map dataframe columns to screening request
        cols = {str(c).lower().strip(): c for c in df.columns}
        
        for index, row in df.iterrows():
            try:
                name_col = cols.get('name') or cols.get('full name') or cols.get('entity name')
                if not name_col:
                    continue
                
                name = str(row[name_col]) if pd.notnull(row[name_col]) else None
                if not name or name.lower() == 'nan':
                    continue

                type_col = cols.get('type') or cols.get('entity type')
                entity_type = str(row[type_col]).lower() if type_col and pd.notnull(row[type_col]) else "individual"
                
                cust_ref_col = cols.get('customer_ref') or cols.get('external_id') or cols.get('id')
                customer_ref = str(row[cust_ref_col]) if cust_ref_col and pd.notnull(row[cust_ref_col]) else f"{job_id}-{index}"
                
                country_col = cols.get('country') or cols.get('nationality') or cols.get('jurisdiction')
                dob_col = cols.get('dob') or cols.get('date of birth') or cols.get('birth_date')

                # Build request
                if "entity" in entity_type:
                    req_data = ScreeningRequest(
                        entity = EntityScreenRequest(
                            name = name,
                            country = str(row[country_col]) if country_col and pd.notnull(row[country_col]) else None
                        ),
                        customer_ref = customer_ref,
                        screening_reason = "bulk_batch",
                        batch_id = job_id
                    )
                else:
                    req_data = ScreeningRequest(
                        individual = IndividualScreenRequest(
                            name = name,
                            birth_date = str(row[dob_col]) if dob_col and pd.notnull(row[dob_col]) else None,
                            nationality = str(row[country_col]) if country_col and pd.notnull(row[country_col]) else None
                        ),
                        customer_ref = customer_ref,
                        screening_reason = "bulk_batch",
                        batch_id = job_id
                    )

                # Run screening
                res = loop.run_until_complete(perform_screening(db, user_id, req_data))
                
                # Update counters
                risk = str(res.risk_level.value).lower()
                summary_key = f"{risk}_risk"
                if summary_key in results_summary:
                    results_summary[summary_key] += 1
                else:
                    # Fallback if somehow it's just 'high'
                    results_summary[f"{risk if 'risk' not in risk else risk.split('_')[0]}_risk"] += 1

            except Exception as e:
                print(f"Error processing row {index}: {str(e)}")
                results_summary["errors"] += 1

            # Update progress
            job.processed_rows = index + 1
            if index % 5 == 0:
                db.commit()

        job.status = "completed"
        job.completed_at = datetime.datetime.utcnow()
        job.results_summary = results_summary
        db.commit()
        
        # Emit notification for bulk completion
        try:
            total_matches = results_summary.get("high_risk", 0) + results_summary.get("medium_risk", 0) + results_summary.get("low_risk", 0)
            notification_service.create_notification(
                db=db,
                notification=notification_schemas.NotificationCreate(
                    user_id=user_id,
                    title="Bulk Screening Complete",
                    message=f"Bulk screening '{job.filename}' processed {job.processed_rows} rows. {total_matches} matches found.",
                    type="screening",
                    priority="high" if results_summary.get("high_risk", 0) > 0 else "normal",
                    link=f"/bulk",
                    metadata_json={"batch_id": job.id, "matches": total_matches}
                )
            )
        except Exception as e:
            print(f"Failed to create notification for bulk job {job.id}: {e}")
            
        loop.close()

    except Exception as e:
        job.status = "failed"
        job.error = str(e)
        db.commit()
    finally:
        db.close()
        # Optionally delete temp file
        if os.path.exists(file_path):
            os.remove(file_path)
