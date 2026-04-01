import sys
import os
from io import BytesIO

# Add the backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.services.report import ReportService

def test_clear_report():
    service = ReportService()
    
    # "Clear" entity data (no matches)
    entity_data = {
        "id": "clear-screening-123",
        "caption": "John Doe",
        "schema": "Person",
        "properties": {
            "name": ["John Doe"],
            "birthDate": ["1980-01-01"],
            "nationality": ["US"],
            "country": ["United States"]
        },
        "is_clear": True,
        "screened_at": "2026-03-31T15:45:00Z",
        "status": "Clear",
        "auto_decision": "PASS",
        "final_decision": "CLEARED BY ANALYST",
        "notes": "Subject cross-referenced with internal database. No adverse information found.",
        "risk_level": "LOW",
        "reviewed_by": "Compliance Manager",
        "reviewed_at": "2026-03-31T15:50:00Z",
        "datasets": []
    }
    
    print("Testing CLEAR report generation...")
    try:
        pdf_bytes = service.generate_entity_report(entity_data)
        print(f"Success! Generated {len(pdf_bytes)} bytes.")
        
        with open("test_clear_report.pdf", "wb") as f:
            f.write(pdf_bytes)
        print("Report saved to test_clear_report.pdf")
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_clear_report()
