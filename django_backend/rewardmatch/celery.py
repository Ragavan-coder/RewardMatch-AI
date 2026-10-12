import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module for celery
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rewardmatch.settings")

app = Celery("rewardmatch")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat Scheduled Tasks
app.conf.beat_schedule = {
    "scheduled-merchant-offer-monitoring": {
        "task": "apps.monitoring.tasks.monitor_merchant_offers_task",
        "schedule": 3600 * 6,  # Run every 6 hours
    },
    "weekly-savings-report-generation": {
        "task": "apps.reports.tasks.generate_weekly_savings_reports_task",
        "schedule": crontab(day_of_week="sunday", hour=8, minute=0),  # Every Sunday 8:00 AM
    },
}
