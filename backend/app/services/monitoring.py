from sqlalchemy.orm import Session
import datetime
import asyncio
from typing import List, Dict, Any

from ..models.models import MonitoredEntity, MonitoringAlert
from ..schemas.screening import ScreeningRequest, IndividualScreenRequest, EntityScreenRequest, Algorithm, ScreeningType
from ..services.screening import perform_screening

async def check_monitored_entities(db: Session) -> Dict[str, int]:
    """
    Retrieves all active monitored entities, re-screens them, and creates alerts if risk changes.
    """
    entities = db.query(MonitoredEntity).filter(MonitoredEntity.status == "active").all()
    stats = {"total_checked": 0, "alerts_generated": 0, "errors": 0}

    for entity in entities:
        try:
            # Reconstruct the screening request from stored JSON
            q_details = entity.query_details
            
            if q_details.get("type", "individual") == "entity":
                req_data = ScreeningRequest(
                    entity=EntityScreenRequest(**q_details.get("details", {})),
                    customer_ref=entity.customer_ref,
                    screening_reason="ongoing_monitoring"
                )
            else:
                req_data = ScreeningRequest(
                    individual=IndividualScreenRequest(**q_details.get("details", {})),
                    customer_ref=entity.customer_ref,
                    screening_reason="ongoing_monitoring"
                )

            # Override config if present
            config = q_details.get("config", {})
            if "algorithm" in config:
                req_data.algorithm = Algorithm(config["algorithm"])
            if "threshold" in config:
                req_data.threshold = config["threshold"]

            # Perform the screening as the system/original user
            res = await perform_screening(db, entity.user_id or "system", req_data)
            
            new_risk = res.risk_level.value
            old_risk = entity.last_risk_level

            # If the risk level has worsened, create an alert
            if new_risk != old_risk:
                # Basic check: only alert if going UP in risk (e.g., LOW -> HIGH), 
                # but for an enterprise system, any change is worth logging.
                
                alert = MonitoringAlert(
                    monitored_entity_id=entity.id,
                    previous_risk=old_risk,
                    new_risk=new_risk,
                    change_type="risk_escalation" if _risk_weight(new_risk) > _risk_weight(old_risk) else "risk_deescalation",
                    details={
                        "top_score": res.top_score,
                        "match_count": res.match_count,
                        "matches": [m.model_dump() for m in res.matches[:3]]
                    }
                )
                db.add(alert)
                stats["alerts_generated"] += 1

            # Update the monitored entity state
            entity.last_risk_level = new_risk
            entity.last_screened_at = datetime.datetime.utcnow()
            db.commit()

            stats["total_checked"] += 1

        except Exception as e:
            print(f"Error checking monitored entity {entity.id}: {e}")
            stats["errors"] += 1
            # Continue checking other entities
            continue

    return stats

def _risk_weight(risk: str) -> int:
    weights = {"low": 1, "medium": 2, "high": 3}
    return weights.get((risk or "").lower(), 0)
