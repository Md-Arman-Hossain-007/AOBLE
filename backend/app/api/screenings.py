from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any, Dict


from ..db.session import get_db
from ..models import models
from ..schemas import screening as schemas
from ..schemas.screening import ScreeningListEntry
from ..services.screening import screening_service
from ..services.report import report_service
from ..api.auth import get_current_active_user
from sqlalchemy import or_, and_
from fastapi.responses import StreamingResponse
import csv
import io
import json
import uuid
import datetime
from itertools import islice

from ..schemas import notifications as notification_schemas
from ..services import notification_service

router = APIRouter()

@router.post("", response_model=dict)
@router.post("/", response_model=dict)
async def screen_entity(
    request: schemas.ScreenRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query_name = ""
    if request.screening_type == "individual":
        query_name = f"{request.first_name or ''} {request.last_name or ''}".strip()
    else:
        query_name = request.company_name or ""
    
    if not query_name:
        raise HTTPException(status_code=400, detail="Name is required for screening")
    
    result = await screening_service.screen(
        db=db,
        user_id=current_user.username,
        name=query_name,
        entity_type=request.screening_type,
        country=request.country,
        birth_date=request.date_of_birth,
        threshold=request.threshold
    )
    
    # Convert to expected frontend format
    is_clear = result.match_count == 0
    status_str = "Clear" if is_clear else "Review"
    screning_id_str = str(result.screening_id)
    
    # Trigger Notification
    try:
        notification_service.create_notification(
            db=db,
            notification=notification_schemas.NotificationCreate(
                user_id=current_user.username,
                title="Screening Complete",
                message=f"Screening for '{query_name}' completed with status: {status_str}. Matches found: {result.match_count}.",
                type="screening",
                priority="high" if result.match_count > 0 else "normal",
                link=f"/screenings/{screning_id_str}",
                metadata_json={"screening_id": screning_id_str, "match_count": result.match_count}
            )
        )
    except Exception as e:
        print(f"Error creating notification: {e}")
    
    return {
        "screening_id": screning_id_str,
        "overall_status": status_str,
        "summary": {
            "total_matches": result.match_count,
            "max_score": result.top_score * 100 if result.top_score else 0.0
        },
        "matches": [m.model_dump() for m in result.matches]
    }

@router.get("/entities/{entity_id:path}/report")
async def get_entity_report(
    entity_id: str, 
    screening_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        print(f"DEBUG: Generating report for entity_id: {entity_id} with screening: {screening_id}")
        # Fetch full entity details
        details = await screening_service.get_entity_details(entity_id, db=db)
        
        # Merge screening metadata if screening_id is provided
        if screening_id:
            try:
                uuid_val = uuid.UUID(screening_id)
                v2 = db.query(models.ScreeningResult).filter(models.ScreeningResult.id == uuid_val).first()
                if v2:
                    details["screening_metadata"] = {
                        "id": str(v2.id),
                        "status": v2.status,
                        "auto_decision": v2.auto_decision,
                        "final_decision": v2.final_decision,
                        "notes": v2.notes,
                        "risk_level": v2.risk_level,
                        "screened_at": v2.screened_at.isoformat() if v2.screened_at else None,
                        "reviewed_by": v2.reviewed_by,
                        "match_count": v2.match_count
                    }
                    details["query"] = v2.query_payload
            except Exception as e:
                print(f"DEBUG: Error merging screening details: {e}")

        print(f"DEBUG: Fetched details for {details.get('caption', 'Unknown')}")
        
        # Generate PDF report
        pdf_bytes = report_service.generate_entity_report(details)
        print(f"DEBUG: Successfully generated PDF ({len(pdf_bytes)} bytes)")
        
        # Return as streaming response
        caption = details.get("caption", "Entity")
        schema = details.get("schema", "Entity").capitalize()
        
        # Sanitize name for filename (remove non-ASCII, special chars, replace spaces with underscores)
        import re
        safe_name = re.sub(r'[^\x00-\x7F]+', '', caption) # Remove non-ASCII
        safe_name = re.sub(r'[^\w\s-]', '', safe_name).strip()
        safe_name = re.sub(r'[\s-]+', '_', safe_name)
        if not safe_name: safe_name = "Entity"
        
        date_str = datetime.datetime.now().strftime('%Y%m%d')
        filename = f"{schema}_{safe_name}_AML_Report_{date_str}.pdf"

        # Explicitly set headers with quotes to avoid issues with some proxies/browsers
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during report generation")

@router.get("/entities/{entity_id:path}", response_model=dict)
async def get_entity_details(entity_id: str, current_user: models.User = Depends(get_current_active_user)):
    try:
        details: Dict[str, Any] = await screening_service.get_entity_details(entity_id)
        
        # Ensure name consistency with screening results
        # Match list uses props.get("name", [None])[0] or props.get("caption")
        if "properties" in details:
            props = details["properties"]
            name = props.get("name", [None])[0]
            if name:
                details["caption"] = name
        
        return details
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error fetching entity details: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching entity details")

@router.get("/{screening_id}", response_model=schemas.ScreenResponse)
async def get_screening(screening_id: str, db: Session = Depends(get_db)):
    # Try legacy model first
    db_screening = db.query(models.Screening).filter(models.Screening.id == screening_id).first()
    if db_screening:
        return {
            "screening_id": db_screening.id,
            "query": {
                "first_name": db_screening.first_name,
                "last_name": db_screening.last_name,
                "company_name": db_screening.company_name,
                "date_of_birth": db_screening.date_of_birth
            },
            "timestamp": db_screening.timestamp,
            "overall_status": db_screening.status,
            "matches": db_screening.results if isinstance(db_screening.results, list) else [],
            "summary": {
                "total_matches": db_screening.match_count,
                "max_score": max((m.get("match_score", 0) for m in db_screening.results), default=0) if isinstance(db_screening.results, list) else 0
            }
        }
    
    # Try V2 model (ScreeningResult)
    try:
        # Check if it's a valid UUID (V2 IDs are UUIDs)
        uuid_val = uuid.UUID(screening_id)
        v2_screening = db.query(models.ScreeningResult).filter(models.ScreeningResult.id == uuid_val).first()
        if v2_screening:
            # Map legacy MatchResult to new format for compatibility
            legacy_matches = []
            for m in (v2_screening.all_matches or []):
                if "caption" in m or "score" in m:
                    # It's a modern V2 MatchResult — pass through ALL rich fields
                    legacy_matches.append({
                        "name": m.get("caption", "Unknown"),
                        "match_score": (m.get("score") or 0) * 100,
                        "match_type": f"Risk: {m.get('risk_level', 'LOW')}",
                        "url": m.get("opensanctions_url"),
                        # --- FIX: Persist per-match analyst decision status ---
                        "status": m.get("status", "potential"),
                        "entity_id": m.get("entity_id"),
                        # Rich identification fields
                        "aliases": m.get("aliases", []),
                        "birth_dates": m.get("birth_dates", []),
                        "nationalities": m.get("nationalities", []),
                        "countries": m.get("countries", []),
                        "id_numbers": m.get("id_numbers", []),
                        "positions": m.get("positions", []),
                        "gender": m.get("gender", []),
                        # Nested structured data
                        "sources": m.get("sources", []),
                        "family": m.get("family", []),
                        "ownership": m.get("ownership", []),
                        "passports": m.get("passports", []),
                        "addresses": m.get("addresses", []),
                        # Risk/compliance classification
                        "details": {
                            "source": ", ".join(m.get("datasets", [])),
                            "entity_id": m.get("entity_id"),
                            "entity_type": m.get("schema_type"),
                            "datasets": m.get("datasets", []),
                            "topics": m.get("topics", []),
                            "sanctions": m.get("sanctions", []),
                            "risk_level": m.get("risk_level"),
                            "primary_topic": m.get("primary_topic"),
                            "match_features": m.get("match_features"),
                        },
                    })
                else:
                    # It's already the legacy format (older V2 entries)
                    legacy_matches.append({
                        "name": m.get("name", "Unknown"),
                        "match_score": m.get("match_score", 0),
                        "match_type": m.get("match_type", "Unknown"),
                        "status": m.get("status", "potential"),
                        "entity_id": m.get("entity_id") or m.get("details", {}).get("entity_id"),
                        "details": m.get("details", {}),
                        "url": m.get("url")
                    })
                    
            payload = v2_screening.query_payload or {}
            query_name = payload.get("name")
            if not query_name and "details" in payload:
                query_name = payload.get("details", {}).get("name")
            if not query_name and "individual" in payload:
                query_name = (payload.get("individual") or {}).get("name")
            if not query_name and "entity" in payload:
                query_name = (payload.get("entity") or {}).get("name")
            
            dob = payload.get("birth_date")
            if not dob and "individual" in payload:
                dob = (payload.get("individual") or {}).get("birth_date")
            
            # Check if monitoring is enabled for this entity
            monitored = db.query(models.MonitoredEntity).filter(
                models.MonitoredEntity.customer_ref == str(v2_screening.id),
                models.MonitoredEntity.status == "active"
            ).first()

            return {
                "screening_id": str(v2_screening.id),
                "query": {
                    "first_name": query_name if v2_screening.schema_type == 'Person' else None,
                    "last_name": "",
                    "company_name": query_name if v2_screening.schema_type != 'Person' else None,
                    "date_of_birth": dob
                },
                "timestamp": v2_screening.screened_at,
                "overall_status": v2_screening.status.capitalize(),
                "monitoring_enabled": monitored is not None,
                "decision": v2_screening.final_decision,
                "notes": v2_screening.notes,
                "matches": legacy_matches,
                "summary": {
                    "total_matches": int(v2_screening.match_count or len(legacy_matches)),
                    "max_score": max([m["match_score"] for m in legacy_matches]) if legacy_matches else ((v2_screening.top_score or 0) * 100)
                }
            }
    except (ValueError, AttributeError):
        pass

    raise HTTPException(status_code=404, detail="Screening result not found")

@router.get("", response_model=List[ScreeningListEntry])
@router.get("/", response_model=List[ScreeningListEntry])
async def list_screenings(
    db: Session = Depends(get_db), 
    limit: int = 20, 
    offset: int = 0,
    type: Optional[str] = None,
    batch_id: Optional[str] = None,
    query: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user)
) -> List[ScreeningListEntry]:
    legacy_list = []
    if not batch_id:
        # Fetch legacy screenings - filter by organization
        query_legacy = db.query(models.Screening).join(
            models.User, models.User.username == models.Screening.user_id
        ).filter(models.User.org_id == current_user.org_id)
        
        if type == "individual":
            query_legacy = query_legacy.filter(or_(models.Screening.company_name == None, models.Screening.company_name == ""))
        elif type == "entity":
            query_legacy = query_legacy.filter(and_(models.Screening.company_name != None, models.Screening.company_name != ""))
        
        if query:
            query_legacy = query_legacy.filter(or_(
                models.Screening.first_name.ilike(f"%{query}%"),
                models.Screening.last_name.ilike(f"%{query}%"),
                models.Screening.company_name.ilike(f"%{query}%")
            ))
            
        legacy_list = query_legacy.order_by(models.Screening.timestamp.desc()).offset(offset).limit(limit).all()
    
    # Fetch V2 screenings
    if batch_id:
        # When filtering by batch_id, skip the org JOIN to avoid losing results
        # where screened_by may not match exactly (e.g. bulk worker jobs)
        query_v2 = db.query(models.ScreeningResult).filter(
            models.ScreeningResult.batch_id == batch_id
        )
    else:
        query_v2 = db.query(models.ScreeningResult).join(
            models.User, models.User.username == models.ScreeningResult.screened_by
        ).filter(models.User.org_id == current_user.org_id)
    
    if type == "individual":
        query_v2 = query_v2.filter(models.ScreeningResult.schema_type == 'Person')
    elif type == "entity":
        query_v2 = query_v2.filter(models.ScreeningResult.schema_type != 'Person')
        
    if query:
        query_v2 = query_v2.filter(models.ScreeningResult.customer_name.ilike(f"%{query}%"))
    
    v2_list = query_v2.order_by(models.ScreeningResult.screened_at.desc()).offset(offset).limit(limit).all()
    
    # Map both to ScreeningListEntry
    all_results: List[ScreeningListEntry] = []
    
    # Pre-fetch all active monitored entity IDs for these screenings to avoid N+1 queries
    all_screening_ids = [str(s.id) for s in legacy_list] + [str(s.id) for s in v2_list]
    monitored_ids = set()
    if all_screening_ids:
        monitored_results = db.query(models.MonitoredEntity.customer_ref).filter(
            models.MonitoredEntity.customer_ref.in_(all_screening_ids),
            models.MonitoredEntity.status == "active"
        ).all()
        monitored_ids = {r[0] for r in monitored_results}

    for s in legacy_list:
        entry = schemas.ScreeningListEntry(
            id=str(s.id),
            first_name=s.first_name,
            last_name=s.last_name,
            company_name=s.company_name,
            timestamp=s.timestamp,
            status=str(s.status),
            monitoring_enabled=str(s.id) in monitored_ids,
            match_count=int(s.match_count or 0)
        )
        all_results.append(entry)
        
    for s in v2_list:
        payload = s.query_payload or {}
        
        # Robustly extract query name depending on how it was saved
        name = payload.get("name")
        if not name and "details" in payload:
            name = payload.get("details", {}).get("name")
        if not name and "individual" in payload:
            name = (payload.get("individual") or {}).get("name")
        if not name and "entity" in payload:
            name = (payload.get("entity") or {}).get("name")
            
        entry = ScreeningListEntry(
            id=str(s.id),
            first_name=name if s.schema_type == 'Person' else None,
            last_name="",
            company_name=name if s.schema_type != 'Person' else None,
            date_of_birth=payload.get("birth_date") or (payload.get("individual") or {}).get("birth_date"),
            timestamp=s.screened_at,
            status=s.status.capitalize(),
            monitoring_enabled=str(s.id) in monitored_ids,
            match_count=int(s.match_count or 0),
            top_match_id=s.top_match_id,
            top_match_name=s.top_match_caption
        )
        all_results.append(entry)
    
    # Re-sort by timestamp and limit
    all_results.sort(key=lambda x: x.timestamp.replace(tzinfo=None) if x.timestamp else datetime.datetime.min, reverse=True)
    
    return list(islice(all_results, limit))

@router.post("/export")
async def export_screenings(
    request: schemas.ExportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    from sqlalchemy import func
    
    query = db.query(models.ScreeningResult).join(
        models.User, models.User.username == models.ScreeningResult.screened_by
    ).filter(models.User.org_id == current_user.org_id)
    
    if request.start_date:
        query = query.filter(models.ScreeningResult.screened_at >= request.start_date)
    if request.end_date:
        query = query.filter(models.ScreeningResult.screened_at <= request.end_date)
    
    if request.risk_level:
        query = query.filter(func.upper(models.ScreeningResult.risk_level) == request.risk_level.upper())
            
    screenings = query.order_by(models.ScreeningResult.screened_at.desc()).all()
    
    if request.format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Reference ID", "Subject Name", "Type", "Screened At", 
            "Risk Level", "Match Count", "Top Score", "Hit Topics", 
            "Hit Datasets", "Review Status", "Final Decision", 
            "Analyst Notes", "Screened By", "Reviewed By", "Batch ID"
        ])
        
        for s in screenings:
            topics_str = ", ".join(s.top_match_topics) if s.top_match_topics else "None"
            datasets_str = ", ".join(s.top_match_datasets) if s.top_match_datasets else "None"
            ts_str = s.screened_at.strftime("%Y-%m-%d %H:%M:%S") if s.screened_at else "N/A"
            score_str = f"{s.top_score:.2%}" if isinstance(s.top_score, (float, int)) else "N/A"
            
            writer.writerow([
                s.customer_ref or s.id,
                s.customer_name or "Unknown",
                s.schema_type or "Unknown",
                ts_str,
                (s.risk_level or "LOW").upper(),
                s.match_count if s.match_count is not None else 0,
                score_str,
                topics_str,
                datasets_str,
                s.status or "pending",
                s.final_decision or "N/A",
                s.notes or "",
                s.screened_by or "N/A",
                s.reviewed_by or "N/A",
                s.batch_id or "N/A"
            ])
        
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=aml_export_{datetime.datetime.now().strftime('%Y%m%d')}.csv"}
        )
    
    elif request.format == "json":
        data = []
        for s in screenings:
            data.append({
                "system_id": str(s.id),
                "customer_ref": s.customer_ref,
                "customer_name": s.customer_name,
                "schema_type": s.schema_type,
                "screened_at": s.screened_at.isoformat() if s.screened_at else None,
                "risk_level": (s.risk_level or "LOW").upper(),
                "match_count": s.match_count if s.match_count is not None else 0,
                "top_score": s.top_score,
                "top_match_topics": s.top_match_topics or [],
                "top_match_datasets": s.top_match_datasets or [],
                "status": s.status,
                "final_decision": s.final_decision,
                "notes": s.notes,
                "screened_by": s.screened_by,
                "reviewed_by": s.reviewed_by,
                "batch_id": s.batch_id,
                "duration_ms": s.duration_ms
            })
        
        json_str = json.dumps(data, indent=2)
        return StreamingResponse(
            io.BytesIO(json_str.encode("utf-8")),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=aml_export_{datetime.datetime.now().strftime('%Y%m%d')}.json"}
        )
    
    raise HTTPException(status_code=400, detail="Unsupported export format")


@router.get("/{screening_id}/report")
async def get_screening_report(
    screening_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Generate a PDF report for a specific screening ID.
    Finds the top match and generates the entity report.
    """
    try:
        # Try V2 first
        uuid_val = None
        try:
            uuid_val = uuid.UUID(screening_id)
        except (ValueError, AttributeError):
            pass

        if uuid_val:
            v2 = db.query(models.ScreeningResult).filter(models.ScreeningResult.id == uuid_val).first()
            if v2:
                # If there are matches, try the top one
                if v2.all_matches and len(v2.all_matches) > 0:
                    top_match = v2.all_matches[0]
                    entity_id = top_match.get("entity_id")
                    if entity_id:
                        return await get_entity_report(entity_id=entity_id, screening_id=screening_id, db=db, current_user=current_user)
                
                # If no matches OR no entity_id, generate a "Clear" report
                clear_data = {
                    "id": screening_id,
                    "caption": v2.customer_name or "Unknown Subject",
                    "schema": v2.schema_type or "Person",
                    "properties": v2.query_payload,
                    "is_clear": True,
                    "screening_metadata": {
                        "id": str(v2.id),
                        "status": v2.status,
                        "auto_decision": v2.auto_decision,
                        "final_decision": v2.final_decision,
                        "notes": v2.notes,
                        "risk_level": v2.risk_level,
                        "screened_at": v2.screened_at.isoformat() if v2.screened_at else None,
                        "reviewed_by": v2.reviewed_by,
                        "match_count": v2.match_count
                    }
                }
                pdf_bytes = report_service.generate_entity_report(clear_data)
                
                filename = f"Clearance_Report_{clear_data['caption'].replace(' ', '_')}.pdf"
                return StreamingResponse(
                    io.BytesIO(pdf_bytes),
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f'attachment; filename="{filename}"',
                        "Access-Control-Expose-Headers": "Content-Disposition"
                    }
                )

        # Try legacy Screening
        s = db.query(models.Screening).filter(models.Screening.id == screening_id).first()
        if s:
            results = s.results if isinstance(s.results, list) else []
            if results:
                # Find the top result with an entity_id
                for res in results:
                    entity_id = res.get("details", {}).get("entity_id")
                    if entity_id:
                        return await get_entity_report(entity_id=entity_id, screening_id=screening_id, db=db, current_user=current_user)

            # If it's a legacy screening but no matches found with entity_id
            # Fallback to generating a clear report if we have info
            clear_name = s.company_name or f"{s.first_name or ''} {s.last_name or ''}".strip()
            clear_data = {
                "id": screening_id,
                "caption": clear_name or "Unknown Subject",
                "schema": "Entity" if s.company_name else "Person",
                "properties": {
                    "name": [clear_name],
                    "birthDate": [s.date_of_birth] if s.date_of_birth else []
                },
                "is_clear": True,
                "screened_at": s.timestamp.isoformat() if s.timestamp else None,
                "status": s.status,
                "risk_level": "LOW" if s.status == "Clear" else "MEDIUM"
            }
            pdf_bytes = report_service.generate_entity_report(clear_data)
            filename = f"Clearance_Report_{clear_data['caption'].replace(' ', '_')}.pdf"
            return StreamingResponse(
                io.BytesIO(pdf_bytes),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )

        raise HTTPException(status_code=404, detail="No screening record found for report generation")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Screening report error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

@router.post("/{screening_id}/monitor")
async def toggle_monitoring(
    screening_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Toggles active monitoring for the specific screening query profile.
    """
    existing = db.query(models.MonitoredEntity).filter(
        models.MonitoredEntity.customer_ref == screening_id,
        models.MonitoredEntity.status == "active"
    ).first()
    
    if existing:
        existing.status = "inactive"
        enabled = False
    else:
        inactive = db.query(models.MonitoredEntity).filter(
            models.MonitoredEntity.customer_ref == screening_id,
        ).first()
        
        if inactive:
            inactive.status = "active"
            enabled = True
        else:
            screening = await get_screening(screening_id, db)
            query = screening.get("query", {})
            query_name = query.get("company_name") or f"{query.get('first_name', '')} {query.get('last_name', '')}".strip()
            
            new_entity = models.MonitoredEntity(
                user_id=current_user.username,
                customer_ref=screening_id,
                entity_id="none",
                query_name=query_name or "Unknown Subject",
                query_details=query,
                last_risk_level=screening.get("overall_status", "LOW").upper()
            )
            db.add(new_entity)
            enabled = True

    db.commit()
    return {"message": "Monitoring status updated successfully", "monitoring_enabled": enabled}

@router.post("/{screening_id}/review", response_model=dict)
async def review_screening(
    screening_id: str,
    request: schemas.ReviewRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Submit an analyst review for a screening result.
    """
    # Try V2 model (ScreeningResult) first
    try:
        uuid_val = uuid.UUID(screening_id)
        result = db.query(models.ScreeningResult).filter(models.ScreeningResult.id == uuid_val).first()
        if not result:
            # Fallback to legacy Screening model
            result = db.query(models.Screening).filter(models.Screening.id == screening_id).first()
            
        if not result:
            raise HTTPException(status_code=404, detail="Screening result not found")
            
        # Update individual match status if provided
        if request.match_status and (request.match_id is not None or request.match_idx is not None):
            matches = result.all_matches or []
            updated = False
            match_caption = "Unknown"
            
            # Prefer index-based targeting (prevents entity_id collision bug)
            if request.match_idx is not None and 0 <= request.match_idx < len(matches):
                m = matches[request.match_idx]
                m["status"] = request.match_status
                match_caption = m.get("caption") or m.get("name") or "Match"
                updated = True
            elif request.match_id:
                # Fallback: find by entity_id (legacy)
                for m in matches:
                    mid = m.get("entity_id") or m.get("id")
                    if mid == request.match_id:
                        m["status"] = request.match_status
                        match_caption = m.get("caption") or m.get("name") or "Match"
                        updated = True
                        break
            if updated:
                from sqlalchemy.orm.attributes import flag_modified
                result.all_matches = matches
                flag_modified(result, "all_matches")
                
                # Audit individual match decision
                audit = models.AuditLog(
                    user_id=current_user.username,
                    action="MATCH_DECISION",
                    resource=f"screening:{screening_id}",
                    success=True,
                    details={
                        "match_id": request.match_id,
                        "match_name": match_caption,
                        "new_status": request.match_status,
                        "message": f"Marked match '{match_caption}' as {request.match_status.replace('_', ' ')}"
                    }
                )
                db.add(audit)
                
                # Rule: If even ONE match is confirmed, the overall risk is HIGH
                if request.match_status == "matched":
                    result.risk_level = "HIGH"

        # Update overall review fields
        if request.decision:
            # Rule: Cannot clear a record if there's a confirmed "matched" hit
            if request.decision == "cleared":
                matches = result.all_matches or []
                confirmed_hits = [m for m in matches if m.get("status") == "matched"]
                if confirmed_hits:
                    hit_names = ", ".join([h.get("name") or h.get("caption") or "Unknown" for h in confirmed_hits[:2]])
                    if len(confirmed_hits) > 2: hit_names += "..."
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Decision Consistency Error: Cannot 'Clear' this subject while matches ({hit_names}) are marked as 'Matched'. Please dismiss them or Reject the case."
                    )
            
            old_status = result.status
            result.status = request.decision
            if request.decision in ["cleared", "rejected"]:
                result.final_decision = request.decision
            
            # Audit status change
            audit = models.AuditLog(
                user_id=current_user.username,
                action="STATUS_CHANGE",
                resource=f"screening:{screening_id}",
                success=True,
                details={
                    "old_status": old_status,
                    "new_status": request.decision,
                    "notes": request.notes,
                    "message": f"Changed screening status to {request.decision.replace('_', ' ')}"
                }
            )
            db.add(audit)
            
        if request.notes and not request.decision:
            result.notes = request.notes
            # Audit note addition
            audit = models.AuditLog(
                user_id=current_user.username,
                action="NOTE_ADDED",
                resource=f"screening:{screening_id}",
                success=True,
                details={"notes": request.notes, "message": "Added investigation notes"}
            )
            db.add(audit)
            
        result.reviewed_by = current_user.username
        result.reviewed_at = datetime.datetime.utcnow()
        
        db.commit()
        db.refresh(result)
        
        return {
            "message": "Review updated successfully", 
            "status": result.status,
            "match_id": request.match_id,
            "match_status": request.match_status
        }
        
    except ValueError:
        # If not a valid UUID, try legacy Screening model directly
        result = db.query(models.Screening).filter(models.Screening.id == screening_id).first()
        if not result:
            raise HTTPException(status_code=404, detail="Screening result not found")
            
        result.status = request.decision
        result.notes = request.notes
        # Legacy model might not have reviewed_by/at, check if they exist
        if hasattr(result, 'reviewed_by'): result.reviewed_by = current_user.username
        if hasattr(result, 'reviewed_at'): result.reviewed_at = datetime.datetime.utcnow()
        
        db.commit()
        return {"message": "Review submitted successfully", "status": result.status}

@router.get("/{screening_id}/history", response_model=List[dict])
async def get_screening_history(
    screening_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get audit trail/history for a specific screening.
    """
    # Join with User table to get role and email
    history = db.query(
        models.AuditLog, 
        models.User.role, 
        models.User.email
    ).join(
        models.User, models.User.username == models.AuditLog.user_id
    ).filter(
        models.AuditLog.resource == f"screening:{screening_id}"
    ).order_by(models.AuditLog.timestamp.desc()).all()
    
    return [
        {
            "id": h.AuditLog.id,
            "user_id": h.AuditLog.user_id,
            "role": h.role,
            "email": h.email,
            "action": h.AuditLog.action,
            "details": h.AuditLog.details,
            "timestamp": h.AuditLog.timestamp.isoformat()
        } for h in history
    ]

class MatchDecisionRequest(BaseModel):
    status: str
    note: Optional[str] = None

@router.post("/{screening_id}/matches/{entity_id}/decision")
async def update_match_decision(
    screening_id: str,
    entity_id: str,
    req: MatchDecisionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        from sqlalchemy.orm.attributes import flag_modified
        import hashlib
        import uuid as uuid_module

        db_screening = db.query(models.ScreeningResult).filter(models.ScreeningResult.id == screening_id).first()
        
        # If not found, try to find by Screening.id (string) and get the ScreeningResult
        if not db_screening:
            screening = db.query(models.Screening).filter(models.Screening.id == screening_id).first()
            if screening:
                # Get all ScreeningResults for this screening and find one with matching entity
                results = db.query(models.ScreeningResult).filter(
                    models.ScreeningResult.screening_id == screening_id
                ).all()
                
                # Find the result that contains this entity_id in its matches
                for result in results:
                    matches = result.all_matches or []
                    for m in matches:
                        if m.get('entity_id') == entity_id:
                            db_screening = result
                            break
                    if db_screening:
                        break
            
            if not db_screening:
                raise HTTPException(status_code=404, detail="Screening or match not found")

        matches = db_screening.all_matches or []
        found = False
        target_caption = entity_id

        # First try to match by entity_id
        for m in matches:
            if m.get('entity_id') == entity_id:
                m['decision'] = req.status
                m['decision_note'] = req.note
                m['decision_author'] = current_user.username
                m['decision_date'] = datetime.datetime.utcnow().isoformat()
                target_caption = m.get('caption', entity_id)
                found = True
                break

        # Fallback: If not found by entity_id, try to match by caption/name
        # This handles cases where entity_id was empty or generated from caption
        if not found:
            for m in matches:
                caption = m.get('caption', '')
                # Check if entity_id matches the caption-based ID or is the caption itself
                if caption and (entity_id == caption or entity_id == f"match-{hashlib.md5(caption.encode()).hexdigest()[:12]}"):
                    # Ensure entity_id is set
                    if not m.get('entity_id'):
                        m['entity_id'] = f"match-{hashlib.md5(caption.encode()).hexdigest()[:12]}"
                    
                    m['decision'] = req.status
                    m['decision_note'] = req.note
                    m['decision_author'] = current_user.username
                    m['decision_date'] = datetime.datetime.utcnow().isoformat()
                    target_caption = caption
                    entity_id = m['entity_id']
                    found = True
                    break

        # Final fallback: If still not found and entity_id looks like a caption (not a UUID or match- ID)
        if not found and not entity_id.startswith('match-') and not entity_id.startswith('Q') and '-' not in entity_id:
            # Treat entity_id as a caption/name
            for m in matches:
                if m.get('caption') == entity_id or m.get('name') == entity_id:
                    # Generate entity_id if missing
                    if not m.get('entity_id'):
                        caption = m.get('caption', entity_id)
                        m['entity_id'] = f"match-{hashlib.md5(caption.encode()).hexdigest()[:12]}"
                    
                    m['decision'] = req.status
                    m['decision_note'] = req.note
                    m['decision_author'] = current_user.username
                    m['decision_date'] = datetime.datetime.utcnow().isoformat()
                    target_caption = m.get('caption', entity_id)
                    entity_id = m['entity_id']
                    found = True
                    break

        if not found:
            raise HTTPException(status_code=404, detail="Match not found in screening")

        db_screening.all_matches = matches
        flag_modified(db_screening, "all_matches")
        
        # User Action Audit Log
        log = models.AuditLog(
            user_id=current_user.username,
            action="match_decision_updated",
            resource=f"screening:{screening_id}",
            success=True,
            details={
                "entity_id": entity_id,
                "caption": target_caption,
                "new_status": req.status,
                "note": req.note
            }
        )
        db.add(log)
        
        # Auto-Cascade Overall Status
        has_true_match = any(m.get('decision') == 'True Match' for m in matches)
        all_false_positives = all(m.get('decision') == 'False Positive' for m in matches)
        
        new_status = db_screening.status
        old_status = db_screening.status
        
        if has_true_match:
            new_status = "Rejected"
            db_screening.risk_level = "HIGH"
        elif all_false_positives and len(matches) > 0:
            new_status = "Clear"
            db_screening.risk_level = "LOW"
        else:
            new_status = "Review"

        if new_status != old_status:
            db_screening.status = new_status
            db_screening.final_decision = new_status
            auto_log = models.AuditLog(
                user_id=current_user.username,
                action="status_auto_resolved",
                resource=f"screening:{screening_id}",
                success=True,
                details={
                    "previous_status": old_status,
                    "new_status": new_status,
                    "reason": f"Cascaded automatically (Has True Match: {has_true_match}, All False Positives: {all_false_positives})"
                }
            )
            db.add(auto_log)
            
        db.commit()
        return {"status": "success", "new_overall_status": new_status}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{screening_id}/summary-report")
async def get_screening_summary_report(
    screening_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Generate an Executive Summary report for a specific screening session.
    Summarizes all potential matches in a single PDF document.
    """
    try:
        # Fetch the screening data (V2 or Legacy)
        screening_data = await get_screening(screening_id, db)
        
        # Add ID for report context
        if isinstance(screening_data, dict):
            screening_data["screening_id"] = screening_id
        
        # Generate summary PDF
        pdf_bytes = report_service.generate_screening_summary_report(screening_data)
        
        # Setup filename
        query = screening_data.get("query", {})
        subject = query.get("company_name") or f"{query.get('first_name', '')}_{query.get('last_name', '')}".strip()
        subject = subject.replace(" ", "_") or "Screening"
        
        date_str = datetime.datetime.now().strftime('%Y%m%d')
        filename = f"Executive_Summary_{subject}_{date_str}.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Summary report error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary report: {str(e)}")
