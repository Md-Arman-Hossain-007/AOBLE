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
    Algorithm, ScreeningType, RiskLevel
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
def process_bulk_screening(job_id, file_path, user_id):
    """
    Background task to process a CSV/Excel file for bulk screening.
    """
    db = SessionLocal()
    try:
        print(f"[DEBUG] Starting bulk screening job {job_id} for user {user_id}")
        print(f"[DEBUG] File path: {file_path}")
        
        job = db.query(BulkJob).filter(BulkJob.id == job_id).first()
        if not job:
            print(f"[DEBUG] Job {job_id} not found in database")
            return

        job.status = "processing"
        db.commit()
        print(f"[DEBUG] Job status set to 'processing'")

        # Load file safely
        try:
            print(f"[DEBUG] Loading file: {file_path}")
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path, encoding='utf-8', sep=None, engine='python', on_bad_lines='warn')
            elif file_path.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file_path, engine='openpyxl')
            else:
                raise ValueError("Unsupported file format")
            print(f"[DEBUG] File loaded successfully. Total rows: {len(df)}")
        except Exception as load_err:
            print(f"[DEBUG] File loading error: {type(load_err).__name__}: {load_err}")
            import traceback
            error_msg = "File loading error: " + str(load_err) + "\n\n" + traceback.format_exc()
            job.status = "failed"
            job.error = error_msg
            db.commit()
            return

        total_rows = len(df)
        job.total_rows = total_rows
        db.commit()
        print(f"[DEBUG] Total rows set to {total_rows}")

        # Results tracking
        results = {"high_risk": 0, "medium_risk": 0, "low_risk": 0, "errors": 0}

        # Column mapping
        cols = {str(c).lower().strip(): c for c in df.columns}
        name_col = cols.get('name') or cols.get('full name') or cols.get('entity name')
        type_col = cols.get('type') or cols.get('entity type')
        ref_col = cols.get('customer_ref') or cols.get('external_id') or cols.get('id')
        country_col = cols.get('country') or cols.get('nationality')
        dob_col = cols.get('dob') or cols.get('date of birth')
        
        print(f"[DEBUG] Column mapping: name={name_col}, type={type_col}, ref={ref_col}")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Process each row
        print(f"[DEBUG] Starting row processing loop")
        for idx in range(total_rows):
            try:
                print(f"[DEBUG] Processing row {idx}")
                row = df.iloc[idx]

                # Extract name safely
                if name_col is None or pd.isnull(row.get(name_col)):
                    print(f"[DEBUG] Row {idx}: No name found, skipping")
                    results["errors"] += 1
                    continue

                name = str(row[name_col]).strip()
                if not name or name.lower() in ['nan', 'none', '']:
                    print(f"[DEBUG] Row {idx}: Name is empty/None, skipping")
                    results["errors"] += 1
                    continue

                print(f"[DEBUG] Row {idx}: Processing name='{name}'")

                # Extract type safely
                entity_type = "individual"
                if type_col and not pd.isnull(row.get(type_col)):
                    entity_type = str(row[type_col]).lower().strip()

                # Extract customer ref safely - CRITICAL: use str() on job_id and idx
                print(f"[DEBUG] Row {idx}: Building customer_ref with job_id type={type(job_id)}, idx type={type(idx)}")
                customer_ref = str(job_id) + "-" + str(idx)
                if ref_col and not pd.isnull(row.get(ref_col)):
                    print(f"[DEBUG] Row {idx}: Using ref_col value: {row[ref_col]}")
                    customer_ref = str(row[ref_col]).strip()
                
                print(f"[DEBUG] Row {idx}: customer_ref = '{customer_ref}'")

                # Extract country and dob safely
                country = None
                if country_col and not pd.isnull(row.get(country_col)):
                    val = str(row[country_col]).strip()
                    if val.lower() not in ['nan', 'none', '']:
                        country = val

                dob = None
                if dob_col and not pd.isnull(row.get(dob_col)):
                    val = str(row[dob_col]).strip()
                    if val.lower() not in ['nan', 'none', '']:
                        dob = val

                # Build screening request
                print(f"[DEBUG] Row {idx}: Building screening request for entity_type='{entity_type}'")
                if "entity" in entity_type:
                    req = ScreeningRequest(
                        entity=EntityScreenRequest(name=name, country=country),
                        customer_ref=customer_ref,
                        screening_reason="bulk_batch",
                        batch_id=str(job_id)
                    )
                else:
                    req = ScreeningRequest(
                        individual=IndividualScreenRequest(
                            name=name,
                            birth_date=dob,
                            nationality=country
                        ),
                        customer_ref=customer_ref,
                        screening_reason="bulk_batch",
                        batch_id=str(job_id)
                    )

                # Execute screening
                print(f"[DEBUG] Row {idx}: Calling perform_screening")
                res = loop.run_until_complete(perform_screening(db, user_id, req))
                print(f"[DEBUG] Row {idx}: Screening completed. risk_level={res.risk_level}")
                print(f"[DEBUG] Row {idx}: ScreeningResult should now be saved in DB with batch_id={req.batch_id}")

                # Update counters - safely extract risk level
                try:
                    # RiskLevel is a str Enum, so .value gives us the string value
                    raw_risk = res.risk_level
                    print(f"[DEBUG] Row {idx}: raw_risk type={type(raw_risk)}, value={raw_risk}")
                    risk_str = raw_risk.value if hasattr(raw_risk, 'value') else str(raw_risk)
                    risk = risk_str.lower()
                    key = risk + "_risk"
                    print(f"[DEBUG] Row {idx}: risk='{risk}', key='{key}'")
                    results[key] = results.get(key, 0) + 1
                    print(f"[DEBUG] Row {idx}: Counter updated. results={results}")
                except Exception as risk_err:
                    print(f"[DEBUG] Row {idx}: Error processing risk level: {type(risk_err).__name__}: {risk_err}")
                    import traceback
                    print(f"[DEBUG] Row {idx}: Risk error traceback: {traceback.format_exc()}")
                    results["errors"] += 1

            except Exception as row_err:
                print(f"[DEBUG] Row {idx}: Row processing error: {type(row_err).__name__}: {row_err}")
                import traceback
                print(f"[DEBUG] Row {idx}: Row error traceback: {traceback.format_exc()}")
                results["errors"] = results["errors"] + 1

            # Update progress
            job.processed_rows = idx + 1
            if (idx + 1) % 10 == 0:
                db.commit()

        # Mark complete
        print(f"[DEBUG] All rows processed. Verifying saved records...")
        
        # Verify how many records were actually saved
        from ..models.models import ScreeningResult
        saved_count = db.query(ScreeningResult).filter(ScreeningResult.batch_id == str(job_id)).count()
        print(f"[DEBUG] Verification: Found {saved_count} ScreeningResult records in DB for batch_id={job_id}")
        print(f"[DEBUG] Expected {total_rows} records based on processed rows")
        
        job.status = "completed"
        job.completed_at = datetime.datetime.utcnow()
        job.results_summary = results
        db.commit()
        loop.close()
        print(f"[DEBUG] Job completed successfully")

    except Exception as e:
        print(f"[DEBUG] Top-level exception: {type(e).__name__}: {e}")
        import traceback
        error_detail = str(e) + "\n\n" + traceback.format_exc()
        print(f"[DEBUG] Full error: {error_detail}")
        job.status = "failed"
        job.error = error_detail
        db.commit()
    finally:
        db.close()
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
