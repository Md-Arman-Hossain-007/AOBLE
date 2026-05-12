from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from .api import screening_v2, screenings, users, monitoring, auth, stats, admin, compliance, billing, notifications, bulk, transactions, case_management, case_management_v2, integrations, analytics, utils, history_audit, external_search
from .db.session import engine, Base
from .core.config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AML Screening Tool for PEP, Sanctions, and Watchlists."
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

# Include routers
# V1 legacy screening endpoint disabled
app.include_router(screening_v2.router)
app.include_router(screenings.router, prefix=f"{settings.API_V1_STR}/screen", tags=["Screening"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(monitoring.router, prefix=f"{settings.API_V1_STR}/monitoring", tags=["Monitoring"])
app.include_router(stats.router, prefix=f"{settings.API_V1_STR}/stats", tags=["Stats"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin"])
app.include_router(compliance.router, prefix=f"{settings.API_V1_STR}/compliance", tags=["Compliance"])
app.include_router(case_management_v2.router, tags=["Case Management"])  # Enhanced v2 routes
app.include_router(bulk.router)
app.include_router(billing.router, prefix=f"{settings.API_V1_STR}/billing", tags=["Billing"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
app.include_router(transactions.router)
app.include_router(integrations.router, prefix=f"{settings.API_V1_STR}/integrations", tags=["Integrations"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(utils.router, prefix=f"{settings.API_V1_STR}/utils", tags=["Utils"])
app.include_router(history_audit.router, tags=["History & Audit"])
app.include_router(external_search.router, prefix=f"{settings.API_V1_STR}/external-search", tags=["External Search"])

@app.on_event("startup")
async def startup_event():
    # Load screening data into memory
    pass

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # If it's an HTTPException, let FastAPI handle it normally
    from fastapi import HTTPException as FastAPIHTTPException
    from starlette.exceptions import HTTPException as StarletteHTTPException
    
    if isinstance(exc, (FastAPIHTTPException, StarletteHTTPException)):
        from fastapi.exception_handlers import http_exception_handler
        return await http_exception_handler(request, exc)
        
    print(f"GLOBAL ERROR CAUGHT: {str(exc)}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.VERSION}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
