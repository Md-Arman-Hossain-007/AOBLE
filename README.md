# AMLtab - AML Screening Tool

A self-hosted AML screening solution for PEP, Sanctions, and Watchlist checks.

## Features

- **Single & Batch Screening**: Screen individuals via API or web interface
- **Fuzzy Matching**: Intelligent name matching with confidence scores
- **Multi-Source Data**: OpenSanctions (PEPs, Sanctions, Watchlists)
- **Report Generation**: PDF/CSV export of screening results
- **Manual Review Interface**: Web UI for analysts

## Data Sources

- OpenSanctions (default collection): ~3M names
- Sanctions lists: ~266k names
- Updated daily via OpenSanctions

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/screen` | POST | Single name screening |
| `/screen/batch` | POST | Batch screening (CSV upload) |
| `/screen/:id` | GET | Get screening result |
| `/reports` | GET | List screening reports |
| `/reports/:id/download` | GET | Download report (PDF/CSV) |

## Quick Start

```bash
cd /root/.openclaw/workspace/Projects/AMLtab
pip install -r requirements.txt
python src/import_data.py  # Import OpenSanctions data
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

Access web interface at: http://localhost:8000
