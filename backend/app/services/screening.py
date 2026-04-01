from sqlalchemy.orm import Session
from fastapi import HTTPException
import httpx
import time
import uuid
from datetime import datetime
from typing import Optional, Any, Union

from ..models.models import (
    OSEntity, OSEntityName, OSProfile, OSSource, ScreeningResult, User,
    WhitelistedEntity, ScreeningAuditLog
)
from ..schemas.screening import (
    ScreeningRequest, ScreeningResponse, MatchResult, SourceDetail,
    SanctionDetail, PassportDetail, AddressDetail, FamilyDetail, OwnershipDetail,
    RiskLevel, Algorithm, ScreeningType
)
from ..services.integrations import IntegrationManager, WebhookEventType
from ..services import notification_service
from ..schemas import notifications as notification_schemas
from ..core.config import settings

YENTE_URL = settings.YENTE_URL

# constants
SCREENING_TYPE_TO_SCHEMAS: dict[ScreeningType, list[str]] = {
    ScreeningType.individual: ["Person"],
    ScreeningType.entity:     ["Company", "LegalEntity", "Organization",
                                "Vessel", "Aircraft"],
}

RISK_THRESHOLDS = {
    RiskLevel.HIGH:   0.90,
    RiskLevel.MEDIUM: 0.70,
    RiskLevel.LOW:    0.0,
}

TOPIC_RISK_WEIGHTS = {
    "sanction":        1.0,
    "sanction.linked": 0.8,
    "crime":           0.8,
    "reg.action":      0.7,
    "role.pep":        0.6,
    "role.rca":        0.5,
    "poi":             0.4,
}

# Helpers
def compute_risk_level(score: float) -> RiskLevel:
    if score >= RISK_THRESHOLDS[RiskLevel.HIGH]:
        return RiskLevel.HIGH
    elif score >= RISK_THRESHOLDS[RiskLevel.MEDIUM]:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW

def compute_topic_risk_boost(topics: list[str]) -> float:
    if not topics:
        return 0.0
    return max(TOPIC_RISK_WEIGHTS.get(t, 0.0) for t in topics)

def _get_primary_topic(topics: list[str]) -> Optional[str]:
    best = None
    best_weight = 0.0
    for t in topics:
        w = TOPIC_RISK_WEIGHTS.get(t, 0.0)
        if w > best_weight:
            best_weight = w
            best = t
    return best

def _calculate_weighted_score(hit: dict[str, Any]) -> float:
    """
    Implements Section 8: Match Scoring System
    Name match: 60%, DOB match: 25%, Nationality match: 10%, Address match: 5%
    """
    total_score = hit.get("score", 0.0)
    features = hit.get("features", {})
    
    # Weights
    W_NAME = 0.60
    W_DOB  = 0.25
    W_NAT  = 0.10
    W_ADDR = 0.05
    
    # Extract feature scores (typical yente feature names)
    # Name score is normally the base score if no specific feature found
    s_name = features.get("name_levy_dist") or features.get("name_score") or total_score
    s_dob = features.get("birth_date") or features.get("birth_date_dist") or 0.0
    s_nat = features.get("nationality") or features.get("country") or 0.0
    s_addr = features.get("address") or 0.0
    
    # If Yente didn't provide specific features, we fallback to the overall score 
    # but still apply weights if any feature exists.
    if not features:
        return round(total_score, 4)
        
    weighted = (s_name * W_NAME) + (s_dob * W_DOB) + (s_nat * W_NAT) + (s_addr * W_ADDR)
    
    # Ensure it's not radically lower than yente's core score
    return round(max(weighted, total_score * 0.8), 4)

def _resolve_sources(dataset_ids: list[str], db: Session) -> list[SourceDetail]:
    if not dataset_ids:
        return []
    sources = db.query(OSSource).filter(
        OSSource.identifier.in_(dataset_ids)
    ).all()
    return [
        SourceDetail(
            identifier        = s.identifier,
            title             = s.title,
            publisher         = s.publisher,
            publisher_country = s.publisher_country,
            source_url        = s.source_url,
            frequency         = s.frequency,
        )
        for s in sources
    ]

def _extract_nested(profile_data: dict[str, Any]) -> tuple:
    props = profile_data.get("properties", {})
    sanctions = []
    for s in props.get("sanctions", []):
        sp = s.get("properties", {})
        sanctions.append(SanctionDetail(
            authority    = sp.get("authority"),
            program      = sp.get("program"),
            start_date   = sp.get("startDate"),
            end_date     = sp.get("endDate"),
            listing_date = sp.get("listingDate"),
            reason       = sp.get("reason"),
            source_url   = sp.get("sourceUrl"),
        ))
    passports = []
    for p in props.get("passports", []):
        pp = p.get("properties", {})
        passports.append(PassportDetail(
            number      = pp.get("number"),
            country     = pp.get("country"),
            expiry_date = pp.get("expiryDate"),
            issue_date  = pp.get("issueDate"),
        ))
    addresses = []
    for a in props.get("addresses", []):
        ap = a.get("properties", {})
        addresses.append(AddressDetail(
            full        = ap.get("full"),
            city        = ap.get("city"),
            country     = ap.get("country"),
            postal_code = ap.get("postalCode"),
        ))
    family = []
    for fam in props.get("family", []):
        fp = fam.get("properties", {})
        rel_entity = fam.get("relative", {})
        family.append(FamilyDetail(
            name         = rel_entity.get("caption") if rel_entity else None,
            entity_id    = rel_entity.get("id") if rel_entity else None,
            relationship = fp.get("relationship"),
        ))
    ownership = []
    for own in props.get("ownership", []):
        op = own.get("properties", {})
        asset_entity = own.get("asset", {})
        ownership.append(OwnershipDetail(
            name       = asset_entity.get("caption") if asset_entity else None,
            entity_id  = asset_entity.get("id") if asset_entity else None,
            percentage = op.get("percentage"),
            start_date = op.get("startDate"),
        ))
    return sanctions, passports, addresses, family, ownership

async def _call_yente(
    queries: dict[str, Any],
    algorithm: str,
    threshold: float,
    limit: int,
    topics: Optional[list[str]],
    include_datasets: Optional[list[str]],
    exclude_datasets: Optional[list[str]],
) -> dict[str, Any]:
    params = {
        "algorithm": algorithm,
        "threshold": threshold,
        "limit":     limit,
        "nested":    "true",
    }
    if topics:
        params["topics"] = ",".join(topics)
    if include_datasets:
        params["include_dataset"] = include_datasets
    if exclude_datasets:
        params["exclude_dataset"] = exclude_datasets

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{YENTE_URL}/match/default",
            json={"queries": queries},
            params=params,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
    return data

def _build_match_result(hit: dict[str, Any], db: Session) -> MatchResult:
    entity_id  = hit.get("id", "")
    props      = hit.get("properties", {})
    score      = _calculate_weighted_score(hit)
    datasets   = hit.get("datasets", [])
    topics     = props.get("topics", [])
    aliases    = props.get("name", [])

    risk_level   = compute_risk_level(score)
    topic_risk   = compute_topic_risk_boost(topics)
    primary_topic = _get_primary_topic(topics)
    sources      = _resolve_sources(datasets, db)

    profile = db.query(OSProfile).filter(OSProfile.id == entity_id).first()
    sanctions, passports, addresses, family, ownership = [], [], [], [], []

    # If we have a cached local profile with full data, use its rich extractions
    if profile and profile.full_profile:
        sanctions, passports, addresses, family, ownership = _extract_nested(profile.full_profile)
        birth_dates   = profile.birth_dates   or props.get("birthDate", [])
        nationalities = profile.nationalities or props.get("nationality", [])
        countries     = profile.countries     or props.get("country", [])
        id_numbers    = profile.id_numbers    or props.get("idNumber", [])
        positions     = profile.positions     or props.get("position", [])
    else:
        # If no profile, we attempt to extract from the Yente hit directly 
        # (needs nested=true enabled in _call_yente).
        sanctions, passports, addresses, family, ownership = _extract_nested(hit)
        birth_dates   = props.get("birthDate", [])
        nationalities = props.get("nationality", [])
        countries     = props.get("country", [])
        id_numbers    = props.get("idNumber", [])
        positions     = props.get("position", [])

    res = MatchResult(
        entity_id          = entity_id,
        schema_type        = hit.get("schema", ""),
        caption            = hit.get("caption", ""),
        aliases            = aliases,
        score              = score,
        risk_level         = risk_level,
        topic_risk         = topic_risk,
        primary_topic      = primary_topic,
        match_features     = hit.get("features"),
        topics             = topics,
        datasets           = datasets,
        sources            = [],
        birth_dates        = birth_dates,
        nationalities      = nationalities,
        countries          = countries,
        id_numbers         = id_numbers,
        positions          = positions,
        sanctions          = sanctions,
        passports          = passports,
        addresses          = addresses,
        family             = family,
        ownership          = ownership
    )

    # Resolve human-readable source details if available
    from ..schemas.screening import SourceDetail
    if datasets:
        from ..models.models import OSSource
        source_objs = db.query(OSSource).filter(OSSource.identifier.in_(datasets)).all()
        res.sources = [
            SourceDetail(
                identifier=s.identifier,
                title=s.title,
                publisher=s.publisher,
                source_url=s.source_url
            ) for s in source_objs
        ] if source_objs else [SourceDetail(identifier=d, title=d) for d in datasets]
    else:
        res.sources = []

    res.opensanctions_url = f"https://www.opensanctions.org/entities/{entity_id}/"
    return res

def _save_screening_result(
    db: Session, screening_id: str, req: ScreeningRequest, screening_type: str,
    query_name: str, query_details: dict[str, Any], matches: list[MatchResult],
    top_score: float, risk_level: RiskLevel, auto_decision: str,
    duration_ms: int, is_whitelisted: bool = False, batch_id: Optional[str] = None
):
    top_match = matches[0] if matches else None
    
    # If whitelisted, we force status to cleared and add a note
    final_status = "cleared" if (is_whitelisted or auto_decision == "clear") else "pending"
    if is_whitelisted:
        auto_decision = "clear (whitelisted)"

    result = ScreeningResult(
        id                 = screening_id,
        customer_ref       = req.customer_ref,
        customer_name      = query_name,
        schema_type        = screening_type,
        query_payload      = {
            "type":    screening_type,
            "details": query_details,
            "config": {
                "algorithm":        req.algorithm,
                "threshold":        req.threshold,
                "match_limit":      req.match_limit,
                "topics":           req.topics,
                "include_datasets": req.include_datasets,
                "exclude_datasets": req.exclude_datasets,
            }
        },
        match_count        = len(matches),
        top_score          = top_score,
        top_match_id       = top_match.entity_id       if top_match else None,
        top_match_caption  = top_match.caption         if top_match else None,
        all_matches        = [m.model_dump() for m in matches],
        risk_level         = risk_level.value,
        auto_decision      = auto_decision,
        status             = final_status,
        screening_reason   = req.screening_reason,
        screened_by        = req.screened_by,
        batch_id           = batch_id if batch_id is not None else req.batch_id,
        duration_ms        = duration_ms,
    )
    db.add(result)
    db.commit()

async def perform_screening(
    db: Session,
    requesting_user_username: str,
    req: ScreeningRequest
) -> ScreeningResponse:
    start_ms = time.time()
    req.screened_by = requesting_user_username

    if req.individual:
        screening_type = ScreeningType.individual
        schema         = "Person"
        query_name     = req.individual.name
        query_details  = req.individual.model_dump(exclude_none=True)
        properties     = {"name": [req.individual.name]}
        # simple manual prop mapping to avoid complex loop
        ind = req.individual
        if ind.birth_date: properties["birthDate"] = [ind.birth_date]
        if ind.nationality: properties["nationality"] = [ind.nationality]
        if ind.id_number: properties["idNumber"] = [ind.id_number]
        # ... add more as needed
    else:
        screening_type = ScreeningType.entity
        schema         = "LegalEntity"
        query_name     = req.entity.name
        query_details  = req.entity.model_dump(exclude_none=True)
        properties     = {"name": [req.entity.name]}
        ent = req.entity
        if ent.country: properties["country"] = [ent.country]
        if ent.registration_number: properties["registrationNumber"] = [ent.registration_number]

    yente_query = {req.customer_ref: {"schema": schema, "properties": properties}}
    
    yente_response = await _call_yente(
        queries          = yente_query,
        algorithm        = req.algorithm.value,
        threshold        = req.threshold,
        limit            = req.match_limit,
        topics           = req.topics,
        include_datasets = req.include_datasets,
        exclude_datasets = req.exclude_datasets,
    )
    
    raw_matches = yente_response.get("responses", {}).get(req.customer_ref, {}).get("results", [])
    matches = [_build_match_result(hit, db) for hit in raw_matches]
    
    top_score    = matches[0].score if matches else 0.0
    risk_level   = compute_risk_level(top_score)
    auto_decision = "alert" if risk_level == RiskLevel.HIGH else "review" if risk_level == RiskLevel.MEDIUM else "clear"
    
    duration_ms  = int((time.time() - start_ms) * 1000)
    screening_id = str(uuid.uuid4())

    is_whitelisted = False
    if matches:
        top_match_id = matches[0].entity_id
        whitelist_entry = db.query(WhitelistedEntity).filter(
            WhitelistedEntity.customer_ref == req.customer_ref,
            WhitelistedEntity.entity_id == top_match_id
        ).first()
        if whitelist_entry:
            is_whitelisted = True
            auto_decision = "clear"
            risk_level = RiskLevel.LOW

    _save_screening_result(
        db, screening_id, req, schema, query_name, query_details,
        matches, top_score, risk_level, auto_decision, duration_ms,
        is_whitelisted=is_whitelisted, batch_id=req.batch_id
    )

    audit_log = ScreeningAuditLog(
        user_id         = requesting_user_username,
        query_name      = query_name,
        query_params    = query_details,
        match_count     = len(matches),
        results_summary = [{"id": m.entity_id, "score": m.score} for m in matches[:3]],
        dataset_version = "Yente/OpenSanctions",
        search_context  = f"Reason: {req.screening_reason}",
        timestamp       = datetime.utcnow()
    )
    db.add(audit_log)
    db.commit()

    # Trigger Webhook Integration
    try:
        user_obj = db.query(User).filter(User.username == requesting_user_username).first()
        org_id = user_obj.org_id if user_obj else "default"
        
        integration_manager = IntegrationManager(db)
        webhook_payload = {
            "screening_id": screening_id,
            "customer_ref": req.customer_ref,
            "customer_name": query_name,
            "risk_level": risk_level.value,
            "match_count": len(matches),
            "status": auto_decision,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # We fire and forget or await depending on requirements. 
        # Given it's async already, we await.
        await integration_manager.send_webhook_event(
            org_id, 
            WebhookEventType.SCREENING_COMPLETED.value, 
            webhook_payload
        )
    except Exception as e:
        # Don't fail the screening if webhook fails, just log it
        print(f"Error triggering webhook: {e}")

    # Emit notification if this is not part of a batch. 
    # Batch jobs will emit a single notification when the entire job completes.
    if not req.batch_id:
        try:
            notification_service.create_notification(
                db=db,
                notification=notification_schemas.NotificationCreate(
                    user_id=requesting_user_username,
                    title="Screening Complete",
                    message=f"Screening for '{query_name}' completed with status: {auto_decision}. Matches found: {len(matches)}.",
                    type="screening",
                    priority="high" if len(matches) > 0 else "normal",
                    link=f"/screenings/{screening_id}",
                    metadata_json={"screening_id": screening_id, "match_count": len(matches)}
                )
            )
        except Exception as e:
            print(f"Error creating notification: {e}")


    return ScreeningResponse(
        screening_id     = screening_id,
        screened_at      = datetime.utcnow().isoformat(),
        customer_ref     = req.customer_ref,
        screening_type   = screening_type.value,
        screening_reason = req.screening_reason,
        algorithm        = req.algorithm.value,
        duration_ms      = duration_ms,
        query_name       = query_name,
        query_details    = query_details,
        match_count      = len(matches),
        top_score        = top_score,
        risk_level       = risk_level,
        auto_decision    = auto_decision,
        matches          = matches,
        batch_id         = req.batch_id
    )

class ScreeningService:
    async def screen(self, db, user_id, name, entity_type, country=None, birth_date=None, threshold=0.65):
        from ..schemas.screening import ScreeningRequest, IndividualScreenRequest, EntityScreenRequest, Algorithm
        
        if entity_type == "individual":
            req = ScreeningRequest(
                individual=IndividualScreenRequest(name=name, birth_date=birth_date, nationality=country),
                customer_ref=str(uuid.uuid4()),
                threshold=threshold,
                algorithm=Algorithm.logic_v2
            )
        else:
            req = ScreeningRequest(
                entity=EntityScreenRequest(name=name, country=country),
                customer_ref=str(uuid.uuid4()),
                threshold=threshold,
                algorithm=Algorithm.logic_v2
            )
        
        return await perform_screening(db, user_id, req)

    async def get_entity_details(self, entity_id, db=None):
        # Implementation from yente or internal DB
        # For now, just call yente
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(f"{YENTE_URL}/entities/{entity_id}")
            if resp.status_code == 404:
                raise ValueError("Entity not found")
            resp.raise_for_status()
            return resp.json()

screening_service = ScreeningService()
