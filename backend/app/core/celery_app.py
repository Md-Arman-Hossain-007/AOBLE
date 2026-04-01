from celery import Celery
from ..core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.task_routes = {
    "app.etl.*": "main-queue",
    "app.workers.*": "batch-queue",
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "nightly-full-sync": {
            "task": "app.etl.run_full_sync",
            "schedule": 86400.0,  # 24 hours
        },
        "trigger-yente-update-every-6-hours": {
            "task": "app.etl.trigger_yente_update",
            "schedule": 21600.0,  # 6 hours
        },
        "ongoing-monitoring-every-24-hours": {
            "task": "app.workers.process_ongoing_monitoring",
            "schedule": 86400.0,  # 24 hours
        },
    },
)

# Autodiscover tasks in the specified modules
celery_app.autodiscover_tasks(["app.etl", "app.workers"], force=True)

# Explicitly import tasks to ensure they are registered
import app.etl.tasks
try:
    import app.workers.tasks
except ImportError:
    pass
